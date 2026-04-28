import type { FastifyInstance } from "fastify";
import { createRealEstate, getRealEstate, listRealEstates, updateRealEstate } from "../controllers/real-estate.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

export async function realEstateRoutes(app: FastifyInstance) {
  app.post("/real-estates", createRealEstate);
  app.get("/real-estates", listRealEstates);
  app.get<{ Params: { id: string } }>("/real-estates/:id", getRealEstate);
  app.patch<{ Params: { id: string } }>("/real-estates/:id", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, updateRealEstate);
}
