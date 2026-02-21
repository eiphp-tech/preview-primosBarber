import { FastifyInstance } from "fastify";
import {
  list,
  getById,
  create,
  update,
  remove,
  toggle,
} from "../controllers/service.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

export const serviceRoutes = async (app: FastifyInstance) => {
  // Listar serviços (todos os usuários autenticados podem ver)
  app.get(
    "/",
    {
      preHandler: [authenticate],
    },
    list
  );

  // Buscar serviço por ID (todos os usuários autenticados)
  app.get(
    "/:id",
    {
      preHandler: [authenticate],
    },
    getById
  );

  // Criar serviço (apenas BARBEIRO)
  app.post(
    "/",
    {
      preHandler: [authenticate, authorize(Role.BARBEIRO)],
    },
    create
  );

  // Atualizar serviço (apenas BARBEIRO)
  app.put(
    "/:id",
    {
      preHandler: [authenticate, authorize(Role.BARBEIRO)],
    },
    update
  );

  // Deletar serviço (apenas BARBEIRO)
  app.delete(
    "/:id",
    {
      preHandler: [authenticate, authorize(Role.BARBEIRO)],
    },
    remove
  );

  // Ativar/Desativar serviço (apenas BARBEIRO)
  app.patch(
    "/:id/toggle",
    {
      preHandler: [authenticate, authorize(Role.BARBEIRO)],
    },
    toggle
  );
};
