import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { createCloudinarySignature } from "../utils/cloudinary.js";
import { AppError, handleError } from "../utils/errors.js";

const uploadFolderSchema = z.object({
  folder: z.enum(["properties", "property-requests", "brokers", "agios"]).default("properties")
});

export async function createUploadSignature(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { folder } = uploadFolderSchema.parse(request.body ?? {});
    return reply.send(createCloudinarySignature({ folder: `catalogo-imobiliario/${folder}` }));
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function createInviteAvatarUploadSignature(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
  try {
    const invite = await prisma.brokerInvite.findUnique({ where: { token: request.params.token } });
    if (!invite) throw new AppError("Convite não encontrado", 404);
    if (invite.usedAt) throw new AppError("Convite já utilizado", 409);
    if (invite.expiresAt < new Date()) throw new AppError("Convite expirado", 410);

    return reply.send(createCloudinarySignature({ folder: "catalogo-imobiliario/brokers" }));
  } catch (error) {
    return handleError(error, reply);
  }
}
