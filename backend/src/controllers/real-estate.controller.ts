import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma/client.js";
import { handleError } from "../utils/errors.js";
import { realEstateSchema } from "../utils/schemas.js";

export async function createRealEstate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = realEstateSchema.parse(request.body);
    const realEstate = await prisma.realEstate.create({ data });
    return reply.status(201).send(realEstate);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function listRealEstates(_request: FastifyRequest, reply: FastifyReply) {
  const realEstates = await prisma.realEstate.findMany({ orderBy: { createdAt: "desc" } });
  return reply.send(realEstates);
}

export async function getRealEstate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const realEstate = await prisma.realEstate.findUnique({
    where: { id: request.params.id },
    include: { brokers: { include: { user: true } }, properties: true }
  });
  return realEstate ? reply.send(realEstate) : reply.status(404).send({ message: "Imobiliária não encontrada" });
}

export async function updateRealEstate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const data = realEstateSchema.partial().parse(request.body);
    const realEstate = await prisma.realEstate.update({ where: { id: request.params.id }, data });
    return reply.send(realEstate);
  } catch (error) {
    return handleError(error, reply);
  }
}
