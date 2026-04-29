import type { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";
import { loginSchema, registerSchema, updateMeSchema } from "../utils/schemas.js";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = registerSchema.parse(request.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError("E-mail já cadastrado", 409);
    if (data.role === "CORRETOR" && !data.realEstateId) {
      throw new AppError("Corretores devem estar vinculados a uma imobiliária");
    }
    if (data.role === "CORRETOR" && !data.phone) {
      throw new AppError("Telefone é obrigatório para corretores");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        realEstateId: data.role === "CLIENTE" ? null : data.realEstateId,
        brokerProfile:
          data.role === "CORRETOR" && data.realEstateId
            ? {
                create: {
                  realEstateId: data.realEstateId,
                  creci: data.creci || null,
                  phone: data.phone,
                  avatarUrl: data.avatarUrl || null
                }
              }
            : undefined
      },
      include: { brokerProfile: true, realEstate: true }
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

export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { brokerProfile: true, realEstate: true }
    });
    if (!user) throw new AppError("Credenciais inválidas", 401);

    const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatches) throw new AppError("Credenciais inválidas", 401);

    const token = await reply.jwtSign({
      sub: user.id,
      role: user.role,
      realEstateId: user.realEstateId
    });

    return reply.send({ token, user: sanitizeUser(user) });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const user = await prisma.user.findUnique({
    where: { id: request.user.sub },
    include: { realEstate: true, brokerProfile: true }
  });
  return reply.send({ user: user ? sanitizeUser(user) : null });
}

export async function updateMe(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = updateMeSchema.parse(request.body);
    const current = await prisma.user.findUnique({
      where: { id: request.user.sub },
      include: { brokerProfile: true }
    });
    if (!current) throw new AppError("Usuário não encontrado", 404);

    const user = await prisma.user.update({
      where: { id: current.id },
      data: {
        name: data.name ?? current.name,
        brokerProfile:
          current.role === "CORRETOR"
            ? {
                upsert: {
                  create: {
                    realEstateId: current.realEstateId!,
                    phone: data.phone ?? "",
                    creci: data.creci || null,
                    avatarUrl: data.avatarUrl || null
                  },
                  update: {
                    phone: data.phone,
                    creci: data.creci === "" ? null : data.creci,
                    avatarUrl: data.avatarUrl === "" ? null : data.avatarUrl
                  }
                }
              }
            : undefined
      },
      include: { realEstate: true, brokerProfile: true }
    });

    return reply.send({ user: sanitizeUser(user) });
  } catch (error) {
    return handleError(error, reply);
  }
}

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
