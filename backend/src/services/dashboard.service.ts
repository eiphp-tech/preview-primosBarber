import prisma from "../config/prisma";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export class DashboardService {
  async getDashboardMetrics(barberId: string, dateStr?: string) {
    let today = new Date();
    if (dateStr) {
      today = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
    }
    // --------------------------------------

    // Datas úteis
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const appointmentsToday = await prisma.booking.count({
      where: {
        barberId,
        date: { gte: startOfToday, lte: endOfToday },
        // REGRA NOVA: Só conta se estiver Pendente ou Confirmado.
        // Finalizados, Cancelados e No-Show são ignorados.
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);

    // 1. FATURAMENTO MENSAL
    const revenueResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        barberId,
        status: "PAID",
        createdAt: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
      },
    });
    const monthlyRevenue = Number(revenueResult._sum.amount || 0);

    // 2. AGENDAMENTOS HOJE (Agora vai pegar o dia certo!)

    // 3. TOTAL DE CLIENTES
    const totalClients = await prisma.user.count({
      where: { role: "CLIENTE" },
    });

    // 4. GRÁFICO ANUAL
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const dateRef = subMonths(new Date(), i);
      const start = startOfMonth(dateRef);
      const end = endOfMonth(dateRef);

      const monthRevenue = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          barberId,
          status: "PAID",
          createdAt: { gte: start, lte: end },
        },
      });

      const monthBookings = await prisma.booking.count({
        where: {
          barberId,
          date: { gte: start, lte: end },
          status: "COMPLETED",
        },
      });

      chartData.push({
        name: format(dateRef, "MMM", { locale: ptBR }),
        faturamento: Number(monthRevenue._sum.amount || 0),
        servicos: monthBookings,
      });
    }

    // 5. LISTA DE RECENTES
    const recentBookings = await prisma.booking.findMany({
      where: { barberId },
      take: 5,
      orderBy: { date: "desc" },
      include: {
        client: { select: { name: true, avatar: true, email: true } },
        service: { select: { name: true } },
      },
    });

    // 6. TOP SERVIÇOS
    const topServicesGroup = await prisma.booking.groupBy({
      by: ["serviceId"],
      where: { barberId, status: "COMPLETED" },
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 3,
    });

    const topServices = await Promise.all(
      topServicesGroup.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
        });
        return {
          name: service?.name || "Desconhecido",
          qtd: item._count.serviceId,
        };
      }),
    );

    return {
      monthlyRevenue,
      appointmentsToday,
      totalClients,
      chartData,
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        client: b.client,
        service: b.service,
        date: b.date.toISOString(),
        status: b.status,
      })),
      topServices,
    };
  }
}
