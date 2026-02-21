import { FastifyReply, FastifyRequest } from "fastify";
import { success, z } from "zod";
import { AppointmentService } from "../services/appointment.service";

const appointmentService = new AppointmentService();

const createAppointmentSchema = z.object({
  barberId: z.string().uuid({ message: "ID do barbeiro inválido" }),
  serviceId: z.string().uuid({ message: "ID do serviço inválido" }),
  // O frontend deve enviar data em formato ISO (ex: 2023-12-25T14:00:00.000Z)
  date: z.string().datetime({ message: "Data inválida ou formato incorreto" }),
});

const listQuerySchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  customerId: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
});

const updateDateSchema = z.object({
  date: z.string().datetime(), // Espera ISO String
});

export class AppointmentController {
  async create(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { barberId, serviceId, date } = createAppointmentSchema.parse(
        req.body,
      );

      const userId = req.user.userId;

      const appointment = await appointmentService.create({
        userId,
        barberId,
        serviceId,
        date: new Date(date),
      });

      return reply.status(201).send({
        success: true,
        message: "Agendamento realizado com sucesso",
        date: appointment,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: "Erro de validação",
          errors: error.errors,
        });
      }
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          message: error.message,
        });
      }
      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async list(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { start, end, customerId } = listQuerySchema.parse(req.query);

      const { userId, role } = req.user;

      const startDate = start ? new Date(start) : undefined;
      const endDate = end ? new Date(end) : undefined;

      const appointments = await appointmentService.list({
        userId,
        role,
        startDate,
        endDate,
        customerId,
      });

      return reply.status(200).send({
        success: true,
        data: appointments,
      });
    } catch (error) {
      console.error(error); // Bom para debugar
      return reply.status(500).send({
        success: false,
        message: "Erro ao listar agendamentos",
      });
    }
  }

  async cancel(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };

      const { userId, role } = req.user;

      await appointmentService.cancel(id, userId, role);

      return reply.status(200).send({
        success: true,
        message: "Agendamento cancelado com sucesso",
      });
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          success: false,
          message: error.message,
        });
      }
      return reply.status(500).send({
        success: false,
        message: "Erro ao cancelar agendamento",
      });
    }
  }

  async approve(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const { userId } = req.user;
      await appointmentService.approve(id, userId);
      return reply.status(200).send({
        success: true,
        message: "Agendamento confirmado com sucesso! Notificações enviadas.",
      });
    } catch (error) {
      if (error instanceof Error) {
        return reply
          .status(400)
          .send({ success: false, message: error.message });
      }
      return reply
        .status(500)
        .send({ success: false, message: "Erro interno" });
    }
  }

  async updateStatus(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const { status } = updateStatusSchema.parse(req.body);
      await appointmentService.updateStatus(id, status as any);
      return reply.send({ success: true, message: "Status atualizado!" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Dados inválidos", errors: error.errors });
      }
      return reply
        .status(400)
        .send({ message: error.message || "Erro ao atualizar status" });
    }
  }

  async update(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as { id: string };
      const { date } = updateDateSchema.parse(req.body);
      await appointmentService.updateDate(id, new Date(date));
      return reply.send({ success: true, message: "Reagendado com sucesso!" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ message: "Data inválida", errors: error.errors });
      }
      return reply
        .status(400)
        .send({ message: error.message || "Erro ao reagendar" });
    }
  }

  async checkAvailability(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { barberId, date } = req.query as {
        barberId: string;
        date: string;
      };

      if (!barberId || !date) {
        return reply.status(400).send({
          success: false,
          message: "barberId e date são obrigatórios",
        });
      }

      const bookedSlots = await appointmentService.checkAvailability(
        barberId,
        date,
      );

      return reply.send({
        success: true,
        data: bookedSlots,
      });
    } catch (error) {
      console.error(error);
      return reply
        .status(500)
        .send({ success: false, message: "Erro ao verificar disponibilidade" });
    }
  }
}
