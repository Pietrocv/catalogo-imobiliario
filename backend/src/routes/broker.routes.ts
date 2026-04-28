import type { FastifyInstance } from "fastify";
import { acceptBrokerInvite, brokerMe, linkBroker, listBrokers, listRealEstateBrokers } from "../controllers/broker.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

export async function brokerRoutes(app: FastifyInstance) {
  app.get("/brokers", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, listBrokers);
  app.get("/real-estates/brokers", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, listRealEstateBrokers);
  app.post("/brokers/link", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, linkBroker);
  app.post("/brokers/accept-invite", { preHandler: [authenticate, authorize(["CORRETOR"])] }, acceptBrokerInvite);
  app.get("/brokers/me", { preHandler: [authenticate, authorize(["CORRETOR"])] }, brokerMe);
}
