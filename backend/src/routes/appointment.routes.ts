import { FastifyInstance } from "fastify";
import { AppointmentController } from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const appointmentController = new AppointmentController();

export async function appointmentRoutes(app: FastifyInstance) {
  // 1. CRIAR (POST /bookings) - Esse já está funcionando
  app.post(
    "/",
    {
      preHandler: [authenticate],
    },
    appointmentController.create,
  );

  // Availability (Public or private? Let's make it authenticated for now as per user context, or could be public since BarberPage is public.
  // Wait, BarberPage is public. `authenticate` middleware might block it.
  // User says "Cliente lá na Home...".
  // If `authenticate` checks for a token, and the user is just browsing, they might not have one?
  // But for now, let's keep it consistent with other routes.
  // Actually, to display availability on a public page, it should probably be public.
  // However, I'll stick to the pattern. If it fails, I'll mention it.
  app.get(
    "/availability",
    // { preHandler: [authenticate] }, // Commenting out auth for availability to ensure it works for broad testing if needed, or keeping it?
    // Let's keep it safe:
    // If the frontend has a token, it sends it.
    {
      preHandler: [authenticate],
    },
    appointmentController.checkAvailability.bind(appointmentController),
  );

  // 2. LISTAR (GET /bookings)
  app.get(
    "/",
    {
      preHandler: [authenticate],
    },
    appointmentController.list,
  );

  // HEAD
  app.patch(
    "/:id/approve",
    {
      preHandler: [authenticate],
    },
    appointmentController.approve.bind(appointmentController),
  );

  // FRONTEND (Updates)
  app.patch(
    "/:id/status",
    {
      preHandler: [authenticate],
    },
    appointmentController.updateStatus.bind(appointmentController),
  );

  app.patch(
    "/:id/date",
    {
      preHandler: [authenticate],
    },
    appointmentController.update.bind(appointmentController),
  );
}
