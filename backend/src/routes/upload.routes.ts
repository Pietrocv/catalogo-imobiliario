import type { FastifyInstance } from "fastify";
import { createInviteAvatarUploadSignature, createUploadSignature } from "../controllers/upload.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/uploads/signature", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA", "CORRETOR"])] }, createUploadSignature);
  app.post<{ Params: { token: string } }>("/broker-invites/:token/upload-signature", createInviteAvatarUploadSignature);
}
