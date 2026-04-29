import type { FastifyInstance } from "fastify";
import { favoriteProperty, listFavorites, unfavoriteProperty } from "../controllers/favorite.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

export async function favoriteRoutes(app: FastifyInstance) {
  app.get("/favorites", { preHandler: [authenticate, authorize(["CLIENTE"])] }, listFavorites);
  app.post<{ Params: { propertyId: string } }>("/favorites/:propertyId", { preHandler: [authenticate, authorize(["CLIENTE"])] }, favoriteProperty);
  app.delete<{ Params: { propertyId: string } }>("/favorites/:propertyId", { preHandler: [authenticate, authorize(["CLIENTE"])] }, unfavoriteProperty);
}
