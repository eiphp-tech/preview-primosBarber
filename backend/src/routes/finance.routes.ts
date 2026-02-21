import { FastifyInstance } from "fastify";
import { FinanceController } from "../controllers/finance.controller";
import { authenticate } from "../middlewares/auth.middleware";

const financeController = new FinanceController();

export async function financeRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [authenticate],
    },
    financeController.getData
  );
}
