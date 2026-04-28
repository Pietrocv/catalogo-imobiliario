import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "@prisma/client";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ message: "Token inválido ou ausente" });
  }
}

export async function optionalAuthenticate(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  if (!authorization) return;
  await request.jwtVerify();
}

export function authorize(roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({ message: "Acesso não autorizado" });
    }
  };
}
