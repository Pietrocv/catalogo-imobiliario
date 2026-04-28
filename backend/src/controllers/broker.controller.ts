import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";

const linkBrokerSchema = z.object({
  userId: z.string().uuid(),
  realEstateId: z.string().uuid(),
  creci: z.string().trim().optional(),
  phone: z.string().trim().min(8),
  avatarUrl: z.string().url().optional().or(z.literal(""))
});

const acceptInviteSchema = linkBrokerSchema.omit({ userId: true });

export async function listBrokers(request: FastifyRequest, reply: FastifyReply) {
  const realEstateId = request.user.realEstateId;
  const where = realEstateId ? { realEstateId } : {};
  const brokers = await prisma.brokerProfile.findMany({
    where,
    include: { user: true, realEstate: true, requests: true },
    orderBy: { createdAt: "desc" }
  });
  return reply.send(brokers.map(({ user, ...broker }) => ({ ...broker, user: sanitizeUser(user) })));
}

export async function listRealEstateBrokers(request: FastifyRequest, reply: FastifyReply) {
  const realEstateId = request.user.realEstateId;
  if (!realEstateId) throw new AppError("Admin sem imobiliária vinculada", 403);

  const brokers = await prisma.brokerProfile.findMany({
    where: { realEstateId },
    include: {
      user: {
        include: {
          _count: {
            select: { properties: true }
          }
        }
      },
      _count: {
        select: { requests: true }
      }
    },
    orderBy: { linkedAt: "desc" }
  });

  return reply.send(
    brokers.map((broker) => ({
      id: broker.id,
      userId: broker.userId,
      name: broker.user.name,
      email: broker.user.email,
      phone: broker.phone,
      avatarUrl: broker.avatarUrl,
      creci: broker.creci,
      linkedAt: broker.linkedAt,
      propertiesCount: broker.user._count.properties,
      requestsCount: broker._count.requests
    }))
  );
}

export async function linkBroker(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = linkBrokerSchema.parse(request.body);
    if (request.user.realEstateId && request.user.realEstateId !== data.realEstateId) {
      throw new AppError("Você só pode vincular corretores à sua imobiliária", 403);
    }

    const existingProfile = await prisma.brokerProfile.findUnique({ where: { userId: data.userId } });
    if (existingProfile && existingProfile.realEstateId !== data.realEstateId) {
      throw new AppError("Este corretor já possui vínculo ativo com outra imobiliária", 409);
    }

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: {
        role: "CORRETOR",
        realEstateId: data.realEstateId,
        brokerProfile: {
          upsert: {
            create: {
              realEstateId: data.realEstateId,
              creci: data.creci || null,
              phone: data.phone,
              avatarUrl: data.avatarUrl || null
            },
            update: {
              creci: data.creci || null,
              phone: data.phone,
              avatarUrl: data.avatarUrl || null
            }
          }
        }
      },
      include: { brokerProfile: true }
    });

    return reply.send({ user: sanitizeUser(user) });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function acceptBrokerInvite(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = acceptInviteSchema.parse(request.body);
    const existingProfile = await prisma.brokerProfile.findUnique({ where: { userId: request.user.sub } });

    if (existingProfile?.realEstateId === data.realEstateId) {
      const broker = await prisma.brokerProfile.findUnique({
        where: { userId: request.user.sub },
        include: { user: true, realEstate: true }
      });
      return reply.send(broker ? { ...broker, user: sanitizeUser(broker.user) } : null);
    }

    if (existingProfile && existingProfile.realEstateId !== data.realEstateId) {
      throw new AppError("Você já possui vínculo ativo com outra imobiliária", 409);
    }

    const user = await prisma.user.update({
      where: { id: request.user.sub },
      data: {
        role: "CORRETOR",
        realEstateId: data.realEstateId,
        brokerProfile: {
          create: {
            realEstateId: data.realEstateId,
            creci: data.creci || null,
            phone: data.phone,
            avatarUrl: data.avatarUrl || null
          }
        }
      },
      include: { brokerProfile: true }
    });

    return reply.send({ user: sanitizeUser(user) });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function brokerMe(request: FastifyRequest, reply: FastifyReply) {
  const broker = await prisma.brokerProfile.findUnique({
    where: { userId: request.user.sub },
    include: { user: true, realEstate: true }
  });
  return broker ? reply.send({ ...broker, user: sanitizeUser(broker.user) }) : reply.status(404).send({ message: "Perfil de corretor não encontrado" });
}

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
