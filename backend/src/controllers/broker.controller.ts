import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";

const linkBrokerSchema = z.object({
  userId: z.string().uuid(),
  realEstateId: z.string().uuid(),
  creci: z.string().optional(),
  phone: z.string().optional()
});

export async function listBrokers(request: FastifyRequest, reply: FastifyReply) {
  const realEstateId = request.user.realEstateId;
  const where = realEstateId ? { realEstateId } : {};
  const brokers = await prisma.brokerProfile.findMany({
    where,
    include: { user: true, realEstate: true },
    orderBy: { createdAt: "desc" }
  });
  return reply.send(brokers.map(({ user, ...broker }) => ({ ...broker, user: sanitizeUser(user) })));
}

export async function linkBroker(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = linkBrokerSchema.parse(request.body);
    if (request.user.realEstateId && request.user.realEstateId !== data.realEstateId) {
      throw new AppError("Você só pode vincular corretores à sua imobiliária", 403);
    }

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: {
        role: "CORRETOR",
        realEstateId: data.realEstateId,
        brokerProfile: {
          upsert: {
            create: { realEstateId: data.realEstateId, creci: data.creci, phone: data.phone },
            update: { realEstateId: data.realEstateId, creci: data.creci, phone: data.phone }
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
