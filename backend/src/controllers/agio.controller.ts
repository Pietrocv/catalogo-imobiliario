import type { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";
import { agioFiltersSchema, agioPayloadSchema } from "../utils/schemas.js";

const agioInclude = {
  images: true,
  realEstate: true,
  broker: {
    include: {
      brokerProfile: true
    }
  }
};

export async function listAgios(request: FastifyRequest, reply: FastifyReply) {
  try {
    const filters = agioFiltersSchema.parse(request.query);
    const where: Prisma.AgioWhereInput = {
      status: request.user?.role === "ADMIN_IMOBILIARIA" || request.user?.role === "CORRETOR" ? { not: "INATIVO" } : "DISPONIVEL",
      city: filters.city,
      price:
        filters.minPrice || filters.maxPrice
          ? {
              gte: filters.minPrice,
              lte: filters.maxPrice
            }
          : undefined
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { roomInfo: { contains: filters.search, mode: "insensitive" } },
        { condominiumName: { contains: filters.search, mode: "insensitive" } },
        { neighborhood: { contains: filters.search, mode: "insensitive" } },
        { address: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    if (request.user?.role === "ADMIN_IMOBILIARIA" || request.user?.role === "CORRETOR") {
      where.realEstateId = request.user.realEstateId ?? undefined;
    }

    const agios = await prisma.agio.findMany({
      where,
      include: agioInclude,
      orderBy: { createdAt: "desc" }
    });

    return reply.send(agios.map(formatAgio));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getAgio(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const agio = await prisma.agio.findUnique({
    where: { id: request.params.id },
    include: agioInclude
  });
  if (!agio || agio.status === "INATIVO") return reply.status(404).send({ message: "Agio nao encontrado" });
  return reply.send(formatAgio(agio));
}

export async function createAgio(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = agioPayloadSchema.parse(request.body);
    const realEstateId = request.user.realEstateId ?? data.realEstateId;
    if (!realEstateId) throw new AppError("Informe a imobiliaria responsavel");
    await ensureBrokerBelongsToRealEstate(data.brokerId, realEstateId);
    const agioData = normalizeAgioData(withoutImages(data));

    const agio = await prisma.agio.create({
      data: {
        ...agioData,
        realEstateId,
        images: { create: data.images.map((url) => ({ url })) }
      },
      include: agioInclude
    });

    return reply.status(201).send(formatAgio(agio));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateAgio(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const data = agioPayloadSchema.partial().parse(request.body);
    const current = await prisma.agio.findUnique({ where: { id: request.params.id } });
    if (!current) throw new AppError("Agio nao encontrado", 404);
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Voce nao pode editar agios de outra imobiliaria", 403);
    }
    await ensureBrokerBelongsToRealEstate(data.brokerId, current.realEstateId);
    const agioData = normalizeAgioData(withoutImages(data));

    const agio = await prisma.agio.update({
      where: { id: request.params.id },
      data: {
        ...agioData,
        images: data.images
          ? {
              deleteMany: {},
              create: data.images.map((url) => ({ url }))
            }
          : undefined
      },
      include: agioInclude
    });

    return reply.send(formatAgio(agio));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function deleteAgio(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const current = await prisma.agio.findUnique({ where: { id: request.params.id } });
    if (!current) throw new AppError("Agio nao encontrado", 404);
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Voce nao pode remover agios de outra imobiliaria", 403);
    }

    const agio = await prisma.agio.update({
      where: { id: request.params.id },
      data: { status: "INATIVO" },
      include: agioInclude
    });
    return reply.send(formatAgio(agio));
  } catch (error) {
    return handleError(error, reply);
  }
}

function withoutImages<T extends { images?: string[] }>(data: T) {
  const { images: _images, ...rest } = data;
  return rest;
}

function normalizeAgioData(data: any) {
  const normalized = { ...data };
  if (normalized.mapUrl === "") normalized.mapUrl = null;
  if (normalized.debtNotes === "") normalized.debtNotes = null;
  if (normalized.brokerId === "") normalized.brokerId = null;
  return normalized;
}

async function ensureBrokerBelongsToRealEstate(brokerId: string | undefined, realEstateId: string) {
  if (!brokerId) return;
  const broker = await prisma.user.findFirst({
    where: {
      id: brokerId,
      role: "CORRETOR",
      realEstateId
    }
  });
  if (!broker) throw new AppError("Informe um corretor vinculado a imobiliaria", 400);
}

function formatAgio(agio: any) {
  return {
    ...agio,
    price: Number(agio.price),
    commissionPrice: Number(agio.commissionPrice),
    installmentAmount: Number(agio.installmentAmount),
    outstandingBalance: Number(agio.outstandingBalance),
    areaM2: Number(agio.areaM2),
    broker: agio.broker ? sanitizeUser(agio.broker) : null
  };
}

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
