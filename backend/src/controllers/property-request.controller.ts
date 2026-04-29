import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";
import { propertyRequestPayloadSchema, rejectRequestSchema } from "../utils/schemas.js";

const requestInclude = {
  images: true,
  brokerProfile: { include: { user: true } },
  realEstate: true,
  property: true
};

export async function createPropertyRequest(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = propertyRequestPayloadSchema.parse(request.body);
    const brokerProfile = await prisma.brokerProfile.findUnique({ where: { userId: request.user.sub } });
    if (!brokerProfile) throw new AppError("Perfil de corretor não encontrado", 404);

    const propertyRequest = await prisma.propertyRequest.create({
      data: {
        ...withoutImages(data),
        brokerProfileId: brokerProfile.id,
        realEstateId: brokerProfile.realEstateId,
        images: { create: data.images.map((url) => ({ url })) }
      },
      include: requestInclude
    });

    return reply.status(201).send(formatRequest(propertyRequest));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function listPropertyRequests(request: FastifyRequest, reply: FastifyReply) {
  const where =
    request.user.role === "CORRETOR"
      ? { brokerProfile: { userId: request.user.sub } }
      : { realEstateId: request.user.realEstateId ?? undefined };

  const requests = await prisma.propertyRequest.findMany({
    where,
    include: requestInclude,
    orderBy: { createdAt: "desc" }
  });
  return reply.send(requests.map(formatRequest));
}

export async function getPropertyRequest(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const propertyRequest = await prisma.propertyRequest.findUnique({
    where: { id: request.params.id },
    include: requestInclude
  });
  if (!propertyRequest) return reply.status(404).send({ message: "Pedido não encontrado" });
  if (!canAccessRequest(request, propertyRequest)) {
    return reply.status(403).send({ message: "Acesso não autorizado" });
  }
  return reply.send(formatRequest(propertyRequest));
}

export async function updatePropertyRequest(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const data = propertyRequestPayloadSchema.partial().parse(request.body);
    const current = await prisma.propertyRequest.findUnique({
      where: { id: request.params.id },
      include: { brokerProfile: true }
    });
    if (!current) throw new AppError("Pedido não encontrado", 404);
    if (current.status !== "PENDENTE") throw new AppError("Apenas pedidos pendentes podem ser editados");
    if (current.brokerProfile.userId !== request.user.sub) throw new AppError("Você só pode editar seus próprios pedidos", 403);

    const propertyRequest = await prisma.propertyRequest.update({
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
      include: requestInclude
    });
    return reply.send(formatRequest(propertyRequest));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function approvePropertyRequest(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const current = await prisma.propertyRequest.findUnique({
      where: { id: request.params.id },
      include: { images: true, brokerProfile: true }
    });
    if (!current) throw new AppError("Pedido não encontrado", 404);
    if (current.status !== "PENDENTE") throw new AppError("Apenas pedidos pendentes podem ser aprovados");
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Você só pode aprovar pedidos da sua imobiliária", 403);
    }

    const approved = await prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          title: current.title,
          description: current.description,
          type: current.type,
          purpose: current.purpose,
          status: "DISPONIVEL",
          price: current.price,
          commissionPrice: current.commissionPrice,
          city: current.city,
          neighborhood: current.neighborhood,
          address: current.address,
          mapUrl: current.mapUrl,
          areaM2: current.areaM2,
          bedrooms: current.bedrooms,
          bathrooms: current.bathrooms,
          parkingSpaces: current.parkingSpaces,
          availableUnits: current.availableUnits,
          acceptsFinancing: current.acceptsFinancing,
          featured: current.featured,
          realEstateId: current.realEstateId,
          brokerId: current.brokerProfile.userId,
          sourceRequestId: current.id,
          units: { create: current.availableUnits.map((label) => ({ label })) },
          images: { create: current.images.map((image) => ({ url: image.url })) }
        }
      });

      const propertyRequest = await tx.propertyRequest.update({
        where: { id: current.id },
        data: { status: "APROVADO", rejectionReason: null },
        include: requestInclude
      });

      return { property, propertyRequest };
    });

    return reply.send({ property: approved.property, request: formatRequest(approved.propertyRequest) });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function rejectPropertyRequest(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const { reason } = rejectRequestSchema.parse(request.body);
    const current = await prisma.propertyRequest.findUnique({ where: { id: request.params.id } });
    if (!current) throw new AppError("Pedido não encontrado", 404);
    if (current.status !== "PENDENTE") throw new AppError("Apenas pedidos pendentes podem ser recusados");
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Você só pode recusar pedidos da sua imobiliária", 403);
    }

    const propertyRequest = await prisma.propertyRequest.update({
      where: { id: request.params.id },
      data: { status: "RECUSADO", rejectionReason: reason },
      include: requestInclude
    });
    return reply.send(formatRequest(propertyRequest));
  } catch (error) {
    return handleError(error, reply);
  }
}

function canAccessRequest(request: FastifyRequest, propertyRequest: any) {
  if (request.user.role === "ADMIN_IMOBILIARIA") return propertyRequest.realEstateId === request.user.realEstateId;
  return propertyRequest.brokerProfile.userId === request.user.sub;
}

function withoutImages<T extends { images?: string[] }>(data: T) {
  const { images: _images, ...rest } = data;
  return normalizeRequestData(rest);
}

function normalizeRequestData(data: any) {
  const normalized = { ...data };
  if (normalized.mapUrl === "") normalized.mapUrl = null;
  if (Array.isArray(normalized.availableUnits)) {
    normalized.availableUnits = normalized.availableUnits.map((unit: string) => unit.trim()).filter(Boolean);
  }
  return normalized;
}

function formatRequest(propertyRequest: any) {
  return {
    ...propertyRequest,
    price: Number(propertyRequest.price),
    commissionPrice: Number(propertyRequest.commissionPrice ?? 0),
    areaM2: Number(propertyRequest.areaM2),
    brokerProfile: propertyRequest.brokerProfile
      ? {
          ...propertyRequest.brokerProfile,
          user: sanitizeUser(propertyRequest.brokerProfile.user)
        }
      : null
  };
}

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
