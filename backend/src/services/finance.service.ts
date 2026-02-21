import prisma from "../config/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ATENÇÃO AQUI: O nome da classe deve ser FinanceService
export class FinanceService {
  async getFinancialData(barberId: string, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // 1. KPI
    const transactionsMonth = await prisma.transaction.findMany({
      where: {
        barberId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        status: "PAID",
      },
    });

    const totalRevenue = transactionsMonth.reduce(
      (acc, t) => acc + Number(t.amount),
      0
    );
    const totalTicket =
      transactionsMonth.length > 0
        ? totalRevenue / transactionsMonth.length
        : 0;

    // 2. GRÁFICO
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const start = startOfDay(d);
      const end = endOfDay(d);

      const dailySum = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          barberId,
          status: "PAID",
          createdAt: { gte: start, lte: end },
        },
      });

      chartData.push({
        name: format(d, "EEE", { locale: ptBR }),
        total: Number(dailySum._sum.amount || 0),
        fullDate: format(d, "dd/MM"),
      });
    }

    // 3. LISTA
    let listWhere: any = { barberId };

    if (dateStr) {
      listWhere.createdAt = {
        gte: startOfDay(date),
        lte: endOfDay(date),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: listWhere,
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            client: { select: { name: true, avatar: true } },
            service: { select: { name: true } },
          },
        },
      },
    });

    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      category: t.booking?.service?.name || "Serviço Avulso",
      status: t.status,
      date: t.createdAt.toISOString(),
      clientName: t.booking?.client?.name || "Cliente não identificado",
      clientAvatar: t.booking?.client?.avatar,
    }));

    return {
      totalRevenue,
      totalTicket,
      chartData,
      transactions: formattedTransactions,
    };
  }
}
