import prisma from "../config/prisma";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

interface CreateAppointmentDTO {
  userId: string;
  barberId: string;
  serviceId: string;
  date: Date;
}

interface ListAppointmentsDTO {
  userId: string;
  role: string;
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
}

export class AppointmentService {
  async create({ userId, barberId, serviceId, date }: CreateAppointmentDTO) {
    if (date < new Date()) {
      throw new Error("Não é possível agendar em uma data passada.");
    }

    const barber = await prisma.user.findFirst({
      where: {
        id: barberId,
        role: "BARBEIRO",
        active: true,
      },
    });
    if (!barber) throw new Error("Barbeiro não encontrado ou inativo.");

    const service = await prisma.service.findUnique({
      where: { id: serviceId, active: true },
    });
    if (!service) throw new Error("Serviço não encontrado ou inativo.");

    const conflict = await prisma.booking.findFirst({
      where: {
        barberId,
        date: date,
        status: { not: "CANCELLED" },
      },
    });
    if (conflict) throw new Error("Horário indisponível para o barbeiro.");

    const booking = await prisma.booking.create({
      data: {
        clientId: userId,
        barberId,
        serviceId,
        date,
        status: "PENDING",
      },
      include: {
        service: true,
        barber: { select: { name: true, email: true } },
        client: { select: { name: true, email: true } },
      },
    });

    if (booking.client.email) {
      notificationService.sendBookingPending(
        booking.client.name,
        booking.client.email,
        booking.date,
      );
    }

    if (booking.barber.email) {
      notificationService.sendNewBookingNotification(
        booking.barber.name,
        booking.barber.email,
        booking.client.name,
        booking.date,
        booking.id,
      );
    }

    return booking;
  }

  async approve(bookingId: string, barberId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true }, // Precisamos do email do cliente
    });

    if (!booking) throw new Error("Agendamento não encontrado.");

    if (booking.barberId !== barberId) {
      throw new Error("Não autorizado.");
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });

    if (booking.client.email) {
      notificationService.sendBookingConfirmation(
        booking.client.name,
        booking.client.email,
        booking.date,
      );
    }

    return updatedBooking;
  }

  async list({
    userId,
    role,
    startDate,
    endDate,
    customerId,
  }: ListAppointmentsDTO) {
    const where: any = {};

    if (role === "BARBEIRO") {
      where.barberId = userId;
      if (customerId) {
        where.clientId = customerId;
      }
    } else {
      where.clientId = userId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const appointments = await prisma.booking.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      include: {
        service: {
          select: { name: true, price: true, duration: true },
        },
        barber: {
          select: { name: true, avatar: true },
        },
        client: {
          select: { name: true, phone: true, avatar: true, email: true },
        },
      },
    });

    return appointments;
  }

  async cancel(bookingId: string, userId: string, role: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Agendamento não encontrado.");

    // ATENÇÃO: Confirme se no seu banco é "CLIENTE" ou "CLIENT"
    // Pelo schema que você mandou antes, era "CLIENTE". Ajustei aqui:
    if (role === "CLIENTE" && booking.clientId !== userId)
      throw new Error("Você não tem permissão para cancelar este agendamento.");

    if (role === "BARBEIRO" && booking.barberId !== userId)
      throw new Error("Você não tem permissão para cancelar este agendamento.");

    if (booking.status === "CANCELLED")
      throw new Error("Este agendamento já foi cancelado.");

    const now = new Date();
    if (booking.date < now)
      throw new Error("Não é possível cancelar um agendamento passado.");

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
    return updatedBooking;
  }

  async updateStatus(
    bookingId: string,
    status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED" | "NO_SHOW",
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true, service: true, barber: true },
    });

    if (!booking) throw new Error("Agendamento não encontrado.");

    // --- LÓGICA FINANCEIRA ---
    if (status === "COMPLETED") {
      const existingTransaction = await prisma.transaction.findUnique({
        where: { bookingId },
      });

      if (!existingTransaction) {
        const price = Number(booking.service.price);

        // CORREÇÃO MATEMÁTICA: .toFixed(2) para garantir 2 casas decimais
        const barberShare = Number((price * 0.4).toFixed(2));
        const shopShare = Number((price * 0.6).toFixed(2));

        await prisma.transaction.create({
          data: {
            amount: price,
            barberAmount: barberShare,
            shopAmount: shopShare,
            paymentMethod: "CASH",
            status: "PAID",
            bookingId: booking.id,
            barberId: booking.barberId,
          },
        });
      }
    }

    // --- LÓGICA DE STATUS ---
    // (Mantenha seu código de email aqui...)

    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }

  async updateDate(bookingId: string, newDate: Date) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new Error("Agendamento não encontrado.");

    if (newDate < new Date())
      throw new Error("Não é possível reagendar para o passado.");

    const conflict = await prisma.booking.findFirst({
      where: {
        barberId: booking.barberId,
        date: newDate,
        status: { not: "CANCELLED" },
        id: { not: bookingId },
      },
    });

    if (conflict) throw new Error("Horário indisponível para este barbeiro.");

    return await prisma.booking.update({
      where: { id: bookingId },
      data: {
        date: newDate,
        status: "PENDING",
      },
    });
  }

  async checkAvailability(barberId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        barberId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        date: true,
      },
    });

    // Return list of booked hours (e.g., ["09:00", "14:30"])
    return bookings.map((b) => {
      // Adjustment for timezone if necessary, but taking the time part directly
      // Assumes UTC storage but we want the "time" representation
      // For simplicity, let's return the ISO string or formatted time
      // using toLocaleString("pt-BR", ...) might be safer if server env matches
      return b.date.toISOString();
    });
  }
}
