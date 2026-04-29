import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";

const favoritePropertyInclude = {
  property: {
    include: {
      images: true,
      realEstate: true,
      broker: { include: { brokerProfile: true } },
      soldBy: { include: { brokerProfile: true } },
      units: {
        include: {
          soldBy: { include: { brokerProfile: true } }
        },
        orderBy: { label: "asc" as const }
      }
    }
  }
};

export async function listFavorites(request: FastifyRequest, reply: FastifyReply) {
  try {
    const favorites = await prisma.favoriteProperty.findMany({
      where: { userId: request.user.sub },
      include: favoritePropertyInclude,
      orderBy: { createdAt: "desc" }
    });

    return reply.send(favorites.map((favorite) => formatProperty(favorite.property)));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function favoriteProperty(request: FastifyRequest<{ Params: { propertyId: string } }>, reply: FastifyReply) {
  try {
    const property = await prisma.property.findUnique({ where: { id: request.params.propertyId } });
    if (!property || property.status !== "DISPONIVEL") throw new AppError("Imovel nao encontrado", 404);

    await prisma.favoriteProperty.upsert({
      where: { userId_propertyId: { userId: request.user.sub, propertyId: property.id } },
      update: {},
      create: { userId: request.user.sub, propertyId: property.id }
    });

    return reply.status(201).send({ favorited: true });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function unfavoriteProperty(request: FastifyRequest<{ Params: { propertyId: string } }>, reply: FastifyReply) {
  try {
    await prisma.favoriteProperty.deleteMany({
      where: { userId: request.user.sub, propertyId: request.params.propertyId }
    });

    return reply.send({ favorited: false });
  } catch (error) {
    return handleError(error, reply);
  }
}

function formatProperty(property: any) {
  return {
    ...property,
    price: Number(property.price),
    areaM2: Number(property.areaM2),
    broker: property.broker ? sanitizeUser(property.broker) : null,
    soldBy: property.soldBy ? sanitizeUser(property.soldBy) : null,
    availableUnits: property.units?.filter((unit: any) => unit.status === "DISPONIVEL").map((unit: any) => unit.label) ?? property.availableUnits,
    units: property.units?.map((unit: any) => ({
      ...unit,
      soldBy: unit.soldBy ? sanitizeUser(unit.soldBy) : null
    })) ?? []
  };
}

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
