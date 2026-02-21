import { FastifyInstance } from "fastify";
import { Role } from "@prisma/client";
import { listUsers } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

export const userRoutes = async (app: FastifyInstance) => {
  app.get<{ Querystring: { role?: Role } }>(
    "/",
    {
      preHandler: [authenticate],
    },
    listUsers
  );
};
