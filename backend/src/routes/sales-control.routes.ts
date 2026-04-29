import type { FastifyInstance } from "fastify";
import { createSalesControl, deleteSalesControl, listSalesControls, updateSalesControl } from "../controllers/sales-control.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

export async function salesControlRoutes(app: FastifyInstance) {
  app.get("/sales-controls", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, listSalesControls);
  app.post("/sales-controls", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, createSalesControl);
  app.patch<{ Params: { id: string } }>("/sales-controls/:id", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, updateSalesControl);
  app.delete<{ Params: { id: string } }>("/sales-controls/:id", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, deleteSalesControl);
}
