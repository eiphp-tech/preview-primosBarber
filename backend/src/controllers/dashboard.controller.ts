import { FastifyRequest, FastifyReply } from "fastify";
import { DashboardService } from "../services/dashboard.service"; // <--- Importe a Classe

// 1. Crie a instância fora da classe do controller
const dashboardService = new DashboardService();

export class DashboardController {
  async getMetrics(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = req.user as { userId: string };
      const { date } = req.query as { date?: string };

      // 2. Chame o método ATRAVÉS da instância (dashboardService.metodo)
      const data = await dashboardService.getDashboardMetrics(userId, date);

      return reply.send({ success: true, data });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: "Erro ao carregar dashboard" });
    }
  }
}
