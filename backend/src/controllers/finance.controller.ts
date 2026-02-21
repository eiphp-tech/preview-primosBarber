import { FastifyRequest, FastifyReply } from "fastify";
import { FinanceService } from "../services/finance.service"; // <--- Importe FinanceService

// Instancie com o nome correto
const financeService = new FinanceService();

export class FinanceController {
  async getData(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = req.user as { userId: string };
      const { date } = req.query as { date?: string };

      // Chame o método da instância correta
      const data = await financeService.getFinancialData(userId, date);

      return reply.send({ success: true, data });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: "Erro ao carregar financeiro" });
    }
  }
}
