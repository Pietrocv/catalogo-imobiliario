import type { FastifyInstance } from "fastify";
import { authenticate, authorize, optionalAuthenticate } from "../middlewares/auth.js";
import { createProperty, deleteProperty, getProperty, listProperties, sellPropertyUnit, updateProperty } from "../controllers/property.controller.js";

export async function propertyRoutes(app: FastifyInstance) {
  app.get("/properties", { preHandler: [optionalAuthenticate] }, listProperties);
  app.get<{ Params: { id: string } }>("/properties/:id", getProperty);
  app.post("/properties", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, createProperty);
  app.patch<{ Params: { id: string } }>("/properties/:id", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, updateProperty);
  app.patch<{ Params: { id: string; unitId: string } }>(
    "/properties/:id/units/:unitId/sell",
    { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] },
    sellPropertyUnit
  );
  app.delete<{ Params: { id: string } }>("/properties/:id", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, deleteProperty);
}
