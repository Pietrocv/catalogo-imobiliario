import type { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";
import { propertyFiltersSchema, propertyPayloadSchema } from "../utils/schemas.js";

const propertyInclude = {
  images: true,
  realEstate: true,
  broker: true
};

export async function listProperties(request: FastifyRequest, reply: FastifyReply) {
  try {
    const filters = propertyFiltersSchema.parse(request.query);
    const where: Prisma.PropertyWhereInput = {
      status: request.user?.role ? undefined : "DISPONIVEL",
      city: filters.city,
      type: filters.type,
      purpose: filters.purpose,
      bedrooms: filters.minBedrooms ? { gte: filters.minBedrooms } : undefined,
      acceptsFinancing: filters.acceptsFinancing,
      featured: filters.featured,
      price:
        filters.minPrice || filters.maxPrice
          ? {
              gte: filters.minPrice,
              lte: filters.maxPrice
            }
          : undefined
    };

    if (request.user?.role === "ADMIN_IMOBILIARIA" || request.user?.role === "CORRETOR") {
      where.realEstateId = request.user.realEstateId ?? undefined;
    }

    const properties = await prisma.property.findMany({
      where,
      include: propertyInclude,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
    });

    return reply.send(properties.map(formatProperty));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getProperty(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const property = await prisma.property.findUnique({
    where: { id: request.params.id },
    include: propertyInclude
  });
  if (!property || property.status === "INATIVO") return reply.status(404).send({ message: "Imóvel não encontrado" });
  return reply.send(formatProperty(property));
}

export async function createProperty(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = propertyPayloadSchema.parse(request.body);
    const realEstateId = request.user.realEstateId ?? data.realEstateId;
    if (!realEstateId) throw new AppError("Informe a imobiliária responsável");

    const property = await prisma.property.create({
      data: {
        ...withoutImages(data),
        realEstateId,
        brokerId: data.brokerId,
        images: { create: data.images.map((url) => ({ url })) }
      },
      include: propertyInclude
    });

    return reply.status(201).send(formatProperty(property));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateProperty(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const data = propertyPayloadSchema.partial().parse(request.body);
    const current = await prisma.property.findUnique({ where: { id: request.params.id } });
    if (!current) throw new AppError("Imóvel não encontrado", 404);
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Você não pode editar imóveis de outra imobiliária", 403);
    }

    const property = await prisma.property.update({
      where: { id: request.params.id },
      data: {
        ...withoutImages(data),
        images: data.images
          ? {
              deleteMany: {},
              create: data.images.map((url) => ({ url }))
            }
          : undefined
      },
      include: propertyInclude
    });

    return reply.send(formatProperty(property));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function deleteProperty(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const current = await prisma.property.findUnique({ where: { id: request.params.id } });
    if (!current) throw new AppError("Imóvel não encontrado", 404);
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Você não pode remover imóveis de outra imobiliária", 403);
    }

    const property = await prisma.property.update({
      where: { id: request.params.id },
      data: { status: "INATIVO" },
      include: propertyInclude
    });
    return reply.send(formatProperty(property));
  } catch (error) {
    return handleError(error, reply);
  }
}

function withoutImages<T extends { images?: string[] }>(data: T) {
  const { images: _images, ...rest } = data;
  return rest;
}

function formatProperty(property: any) {
  return {
    ...property,
    price: Number(property.price),
    areaM2: Number(property.areaM2),
    broker: property.broker ? sanitizeUser(property.broker) : null
  };
}

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
