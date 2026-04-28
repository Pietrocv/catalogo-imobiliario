import type { FastifyInstance } from "fastify";
import { brokerMe, linkBroker, listBrokers } from "../controllers/broker.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

export async function brokerRoutes(app: FastifyInstance) {
  app.get("/brokers", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, listBrokers);
  app.post("/brokers/link", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, linkBroker);
  app.get("/brokers/me", { preHandler: [authenticate, authorize(["CORRETOR"])] }, brokerMe);
}
