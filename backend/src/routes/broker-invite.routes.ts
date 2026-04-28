import type { FastifyInstance } from "fastify";
import { acceptBrokerInviteByToken, createBrokerInvite, getBrokerInvite } from "../controllers/broker-invite.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

export async function brokerInviteRoutes(app: FastifyInstance) {
  app.post("/broker-invites", { preHandler: [authenticate, authorize(["ADMIN_IMOBILIARIA"])] }, createBrokerInvite);
  app.get<{ Params: { token: string } }>("/broker-invites/:token", getBrokerInvite);
  app.post<{ Params: { token: string } }>("/broker-invites/:token/accept", acceptBrokerInviteByToken);
}
