import crypto from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";

const createInviteSchema = z.object({
  expiresInDays: z.coerce.number().int().min(1).max(30).default(7)
});

const acceptInviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().trim().min(8),
  creci: z.string().trim().optional(),
  avatarUrl: z.string().url().optional().or(z.literal(""))
});

export async function createBrokerInvite(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { expiresInDays } = createInviteSchema.parse(request.body ?? {});
    const realEstateId = request.user.realEstateId;
    if (!realEstateId) throw new AppError("Admin sem imobiliária vinculada", 403);

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const invite = await prisma.brokerInvite.create({
      data: {
        token,
        realEstateId,
        createdById: request.user.sub,
        expiresAt
      },
      include: { realEstate: true }
    });

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    return reply.status(201).send({
      id: invite.id,
      token: invite.token,
      inviteUrl: `${frontendUrl}/invite/${invite.token}`,
      expiresAt: invite.expiresAt,
      realEstate: invite.realEstate
    });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getBrokerInvite(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
  try {
    const invite = await getValidInvite(request.params.token);
    return reply.send({
      token: invite.token,
      expiresAt: invite.expiresAt,
      realEstate: invite.realEstate
    });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function acceptBrokerInviteByToken(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
  try {
    const invite = await getValidInvite(request.params.token);
    const data = acceptInviteSchema.parse(request.body);
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: { brokerProfile: true }
    });

    if (existingUser?.brokerProfile?.realEstateId === invite.realEstateId) {
      throw new AppError("Este corretor já está vinculado a esta imobiliária", 409);
    }

    if (existingUser?.brokerProfile && existingUser.brokerProfile.realEstateId !== invite.realEstateId) {
      throw new AppError("Este corretor já possui vínculo ativo com outra imobiliária", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const savedUser = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              name: data.name,
              passwordHash,
              role: "CORRETOR",
              realEstateId: invite.realEstateId,
              brokerProfile: {
                create: {
                  realEstateId: invite.realEstateId,
                  phone: data.phone,
                  creci: data.creci || null,
                  avatarUrl: data.avatarUrl || null
                }
              }
            },
            include: { brokerProfile: true, realEstate: true }
          })
        : await tx.user.create({
            data: {
              name: data.name,
              email: data.email,
              passwordHash,
              role: "CORRETOR",
              realEstateId: invite.realEstateId,
              brokerProfile: {
                create: {
                  realEstateId: invite.realEstateId,
                  phone: data.phone,
                  creci: data.creci || null,
                  avatarUrl: data.avatarUrl || null
                }
              }
            },
            include: { brokerProfile: true, realEstate: true }
          });

      await tx.brokerInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() }
      });

      return savedUser;
    });

    const token = await reply.jwtSign({
      sub: user.id,
      role: user.role,
      realEstateId: user.realEstateId
    });

    return reply.status(201).send({ token, user: sanitizeUser(user) });
  } catch (error) {
    return handleError(error, reply);
  }
}

async function getValidInvite(token: string) {
  const invite = await prisma.brokerInvite.findUnique({
    where: { token },
    include: { realEstate: true }
  });

  if (!invite) throw new AppError("Convite não encontrado", 404);
  if (invite.usedAt) throw new AppError("Convite já utilizado", 409);
  if (invite.expiresAt < new Date()) throw new AppError("Convite expirado", 410);

  return invite;
}

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
