import type { UserRole } from "@prisma/client";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      role: UserRole;
      realEstateId: string | null;
    };
    user: {
      sub: string;
      role: UserRole;
      realEstateId: string | null;
    };
  }
}
