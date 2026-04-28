import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.js";
import { login, me, register } from "../controllers/auth.controller.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", register);
  app.post("/login", login);
  app.get("/me", { preHandler: [authenticate] }, me);
}
