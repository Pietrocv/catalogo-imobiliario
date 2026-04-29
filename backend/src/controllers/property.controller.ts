import type { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";
import { propertyFiltersSchema, propertyPayloadSchema, sellPropertyUnitSchema } from "../utils/schemas.js";

const propertyInclude = {
  images: true,
  realEstate: true,
  broker: {
    include: {
      brokerProfile: true
    }
  },
  soldBy: {
    include: {
      brokerProfile: true
    }
  },
  units: {
    include: {
      soldBy: {
        include: {
          brokerProfile: true
        }
      }
    },
    orderBy: { label: "asc" as const }
  }
};

export async function listProperties(request: FastifyRequest, reply: FastifyReply) {
  try {
    const filters = propertyFiltersSchema.parse(request.query);
    const where: Prisma.PropertyWhereInput = {
      status: request.user?.role === "ADMIN_IMOBILIARIA" || request.user?.role === "CORRETOR" ? { not: "INATIVO" } : "DISPONIVEL",
      city: filters.city,
      type: filters.type,
      purpose: filters.purpose,
      bedrooms: filters.minBedrooms ? { gte: filters.minBedrooms } : undefined,
      bathrooms: filters.minBathrooms ? { gte: filters.minBathrooms } : undefined,
      parkingSpaces: filters.minParkingSpaces ? { gte: filters.minParkingSpaces } : undefined,
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

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { neighborhood: { contains: filters.search, mode: "insensitive" } },
        { address: { contains: filters.search, mode: "insensitive" } },
        { mapUrl: { contains: filters.search, mode: "insensitive" } },
        { availableUnits: { has: filters.search } }
      ];
    }

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
  if (!property || property.status === "INATIVO") return reply.status(404).send({ message: "Imovel nao encontrado" });
  return reply.send(formatProperty(property));
}

export async function createProperty(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = propertyPayloadSchema.parse(request.body);
    const realEstateId = request.user.realEstateId ?? data.realEstateId;
    if (!realEstateId) throw new AppError("Informe a imobiliaria responsavel");
    await ensureSellerBelongsToRealEstate(data.soldById, realEstateId);
    const propertyData = normalizePropertyData(withoutImages(data));

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        realEstateId,
        brokerId: data.brokerId,
        units: { create: propertyData.availableUnits.map((label: string) => ({ label })) },
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
    if (!current) throw new AppError("Imovel nao encontrado", 404);
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Voce nao pode editar imoveis de outra imobiliaria", 403);
    }
    await ensureSellerBelongsToRealEstate(data.soldById, current.realEstateId);
    const propertyData = normalizePropertyData(withoutImages(data), current.soldAt);

    await syncPropertyUnits(current.id, propertyData.availableUnits);
    await ensureCanMarkPropertySold(current.id, propertyData.status);

    const property = await prisma.property.update({
      where: { id: request.params.id },
      data: {
        ...propertyData,
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

export async function sellPropertyUnit(request: FastifyRequest<{ Params: { id: string; unitId: string } }>, reply: FastifyReply) {
  try {
    const data = sellPropertyUnitSchema.parse(request.body);
    const current = await prisma.property.findUnique({
      where: { id: request.params.id },
      include: { units: true }
    });
    if (!current) throw new AppError("Imovel nao encontrado", 404);
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Voce nao pode editar imoveis de outra imobiliaria", 403);
    }

    const unit = current.units.find((item) => item.id === request.params.unitId);
    if (!unit) throw new AppError("Unidade nao encontrada", 404);
    if (unit.status === "VENDIDO") throw new AppError("Esta unidade ja foi vendida");

    const unitData =
      data.soldById === "EXTERNAL_PARTNER"
        ? { status: "VENDIDO" as const, soldById: null, soldByExternalName: "Parceiro de fora", soldAt: new Date() }
        : { status: "VENDIDO" as const, soldById: data.soldById, soldByExternalName: null, soldAt: new Date() };

    if (data.soldById !== "EXTERNAL_PARTNER") {
      await ensureSellerBelongsToRealEstate(data.soldById, current.realEstateId);
    }

    await prisma.propertyUnit.update({
      where: { id: request.params.unitId },
      data: unitData
    });

    const property = await prisma.property.findUnique({
      where: { id: current.id },
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
    if (!current) throw new AppError("Imovel nao encontrado", 404);
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Voce nao pode remover imoveis de outra imobiliaria", 403);
    }

    const property = await prisma.property.update({
      where: { id: request.params.id },
      data: { status: "INATIVO", soldById: null, soldAt: null },
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

function normalizePropertyData(data: any, currentSoldAt?: Date | null) {
  const normalized = { ...data };
  if (normalized.soldById === "") normalized.soldById = null;
  if (normalized.mapUrl === "") normalized.mapUrl = null;
  if (Array.isArray(normalized.availableUnits)) {
    normalized.availableUnits = normalized.availableUnits.map((unit: string) => unit.trim()).filter(Boolean);
  }

  if (normalized.status && normalized.status !== "VENDIDO") {
    normalized.soldById = null;
    normalized.soldAt = null;
  }

  if (normalized.status === "VENDIDO" && normalized.soldById && !currentSoldAt) {
    normalized.soldAt = new Date();
  }

  return normalized;
}

async function ensureSellerBelongsToRealEstate(soldById: string | undefined, realEstateId: string) {
  if (!soldById) return;
  const seller = await prisma.user.findFirst({
    where: {
      id: soldById,
      role: "CORRETOR",
      realEstateId
    }
  });
  if (!seller) throw new AppError("Informe um corretor vinculado a imobiliaria para registrar a venda", 400);
}

async function ensureCanMarkPropertySold(propertyId: string, status: string | undefined) {
  if (status !== "VENDIDO") return;
  const availableUnits = await prisma.propertyUnit.count({
    where: { propertyId, status: "DISPONIVEL" }
  });
  if (availableUnits > 0) {
    throw new AppError("Venda as unidades disponiveis antes de marcar o imovel como vendido");
  }
}

async function syncPropertyUnits(propertyId: string, labels: string[] | undefined) {
  if (!labels) return;
  const normalizedLabels = labels.map((label) => label.trim()).filter(Boolean);
  await prisma.propertyUnit.deleteMany({
    where: {
      propertyId,
      status: "DISPONIVEL",
      label: { notIn: normalizedLabels }
    }
  });

  await Promise.all(
    normalizedLabels.map((label) =>
      prisma.propertyUnit.upsert({
        where: { propertyId_label: { propertyId, label } },
        update: {},
        create: { propertyId, label }
      })
    )
  );
}

function formatProperty(property: any) {
  return {
    ...property,
    price: Number(property.price),
    areaM2: Number(property.areaM2),
    broker: property.broker ? sanitizeUser(property.broker) : null,
    soldBy: property.soldBy ? sanitizeUser(property.soldBy) : null,
    availableUnits: property.units?.filter((unit: any) => unit.status === "DISPONIVEL").map((unit: any) => unit.label) ?? property.availableUnits,
    commissionPrice: Number(property.commissionPrice ?? 0),
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
