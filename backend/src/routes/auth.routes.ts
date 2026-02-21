import { FastifyInstance } from "fastify";
import { register, login, me } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

// Rotas de Autenticação

export const authRoutes = async (app: FastifyInstance) => {
  //Registrar novo Usuário (público)
  app.post("/register", register);

  //Fazer login (público)
  app.post("/login", login);

  // Buscar dados do usuário autenticado (protegido)
  app.get(
    "/me",
    {
      preHandler: [authenticate],
    },
    me
  );
};
