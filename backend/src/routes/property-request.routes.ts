import type { FastifyInstance } from "fastify";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  approvePropertyRequest,
  createPropertyRequest,
  getPropertyRequest,
  listPropertyRequests,
  rejectPropertyRequest,
  updatePropertyRequest
} from "../controllers/property-request.controller.js";

export async function propertyRequestRoutes(app: FastifyInstance) {
  app.post("/property-requests", { preHandler: [authenticate, authorize(["CORRETOR"])] }, createPropertyRequest);
  app.get("/property-requests", { preHandler: [authenticate] }, listPropertyRequests);
  app.get<{ Params: { id: string } }>("/property-requests/:id", { preHandler: [authenticate] }, getPropertyRequest);
  app.patch<{ Params: { id: string } }>("/property-requests/:id", { preHandler: [authenticate, authorize(["CORRETOR"])] }, updatePropertyRequest);
  app.post<{ Params: { id: string } }>("/property-requests/:id/approve", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, approvePropertyRequest);
  app.post<{ Params: { id: string } }>("/property-requests/:id/reject", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, rejectPropertyRequest);
}
