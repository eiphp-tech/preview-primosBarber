import cron from "node-cron";
import prisma from "../config/prisma";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export const startReminderJob = () => {
  // Configurado para rodar todo dia às 09:00 da manhã
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ [Cron] Verificando agendamentos para amanhã...");

    // Calcular o intervalo de "Amanhã"
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Buscar agendamentos confirmados para amanhã
    const bookingsTomorrow = await prisma.booking.findMany({
      where: {
        date: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
        status: "CONFIRMED",
      },
      include: {
        client: true,
      },
    });

    console.log(
      `🔎 [Cron] Encontrados ${bookingsTomorrow.length} agendamentos.`
    );

    // Enviar e-mails
    for (const booking of bookingsTomorrow) {
      if (booking.client.email) {
        await notificationService.sendReminder(
          booking.client.name,
          booking.client.email,
          booking.date
        );
      }
    }
  });
};
