import { FastifyInstance } from "fastify";
import {
  list,
  getById,
  create,
  update,
  remove,
  setSchedule,
  getSchedule,
} from "../controllers/barber.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

/**
 * ROTAS DE BARBEIROS
 */
export const barberRoutes = async (app: FastifyInstance) => {
  // Listar barbeiros (todos autenticados podem ver)
  app.get(
    "/",
    {
      preHandler: [authenticate],
    },
    list
  );

  // Buscar barbeiro por ID (todos autenticados)
  app.get(
    "/:id",
    {
      preHandler: [authenticate],
    },
    getById
  );

  // Criar barbeiro (apenas outros barbeiros podem criar)
  app.post(
    "/",
    {
      preHandler: [authenticate, authorize(Role.BARBEIRO)],
    },
    create
  );

  // Atualizar barbeiro (apenas barbeiros)
  app.put(
    "/:id",
    {
      preHandler: [authenticate, authorize(Role.BARBEIRO)],
    },
    update
  );

  // Deletar barbeiro (apenas barbeiros)
  app.delete(
    "/:id",
    {
      preHandler: [authenticate, authorize(Role.BARBEIRO)],
    },
    remove
  );

  // Definir/Atualizar horários (apenas barbeiros)
  app.post(
    "/:id/schedule",
    {
      preHandler: [authenticate, authorize(Role.BARBEIRO)],
    },
    setSchedule
  );

  app.put(
    "/:id/schedule",
    {
      preHandler: [authenticate, authorize(Role.BARBEIRO)],
    },
    setSchedule
  );

  // Buscar horários (todos autenticados)
  app.get(
    "/:id/schedule",
    {
      preHandler: [authenticate],
    },
    getSchedule
  );
};
