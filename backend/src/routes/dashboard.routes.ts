import { FastifyInstance } from "fastify";
import { DashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";

// 1. Instancia o controller
const dashboardController = new DashboardController();

export async function dashboardRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [authenticate],
    },
    // 2. Passa o método CORRETO aqui 👇
    dashboardController.getMetrics,
  );
}
