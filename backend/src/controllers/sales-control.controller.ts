import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma/client.js";
import { AppError, handleError } from "../utils/errors.js";
import { salesControlSchema } from "../utils/schemas.js";

export async function listSalesControls(request: FastifyRequest, reply: FastifyReply) {
  const controls = await prisma.salesControl.findMany({
    where: { realEstateId: request.user.realEstateId ?? undefined },
    orderBy: { saleDate: "desc" }
  });
  return reply.send(controls);
}

export async function createSalesControl(request: FastifyRequest, reply: FastifyReply) {
  try {
    const realEstateId = request.user.realEstateId;
    if (!realEstateId) throw new AppError("Usuario sem imobiliaria vinculada", 403);
    const data = normalizeSalesControl(salesControlSchema.parse(request.body));
    const control = await prisma.salesControl.create({
      data: { ...data, realEstateId }
    });
    return reply.status(201).send(control);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateSalesControl(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const current = await prisma.salesControl.findUnique({ where: { id: request.params.id } });
    if (!current) throw new AppError("Registro de venda nao encontrado", 404);
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Voce nao pode editar vendas de outra imobiliaria", 403);
    }

    const data = normalizeSalesControl(salesControlSchema.partial().parse(request.body));
    const control = await prisma.salesControl.update({
      where: { id: request.params.id },
      data
    });
    return reply.send(control);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function deleteSalesControl(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const current = await prisma.salesControl.findUnique({ where: { id: request.params.id } });
    if (!current) throw new AppError("Registro de venda nao encontrado", 404);
    if (request.user.realEstateId && current.realEstateId !== request.user.realEstateId) {
      throw new AppError("Voce nao pode remover vendas de outra imobiliaria", 403);
    }
    await prisma.salesControl.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  } catch (error) {
    return handleError(error, reply);
  }
}

function normalizeSalesControl(data: any) {
  const normalized = { ...data };
  for (const field of ["builder", "cca", "paymentMethod", "notes"]) {
    if (normalized[field] === "") normalized[field] = null;
  }
  if (normalized.signatureDate === "") normalized.signatureDate = null;
  return normalized;
}
