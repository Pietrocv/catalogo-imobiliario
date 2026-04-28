import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import fastify from "fastify";
import { authRoutes } from "./routes/auth.routes.js";
import { brokerRoutes } from "./routes/broker.routes.js";
import { propertyRequestRoutes } from "./routes/property-request.routes.js";
import { propertyRoutes } from "./routes/property.routes.js";
import { realEstateRoutes } from "./routes/real-estate.routes.js";

export async function buildApp() {
  const app = fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? true,
    credentials: true
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? "catalogo-imobiliario-secret"
  });

  app.get("/", async () => ({
    name: "Catálogo Imobiliário API",
    status: "ok"
  }));

  await app.register(authRoutes);
  await app.register(realEstateRoutes);
  await app.register(brokerRoutes);
  await app.register(propertyRoutes);
  await app.register(propertyRequestRoutes);

  return app;
}
