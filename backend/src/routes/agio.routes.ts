import type { FastifyInstance } from "fastify";
import { createAgio, deleteAgio, getAgio, listAgios, updateAgio } from "../controllers/agio.controller.js";
import { authenticate, authorize, optionalAuthenticate } from "../middlewares/auth.js";

export async function agioRoutes(app: FastifyInstance) {
  app.get("/agios", { preHandler: [optionalAuthenticate] }, listAgios);
  app.get<{ Params: { id: string } }>("/agios/:id", getAgio);
  app.post("/agios", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, createAgio);
  app.patch<{ Params: { id: string } }>("/agios/:id", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, updateAgio);
  app.delete<{ Params: { id: string } }>("/agios/:id", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, deleteAgio);
}
