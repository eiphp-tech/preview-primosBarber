import { FastifyRequest, FastifyReply } from "fastify";
import {
  createBarberSchema,
  updateBarberSchema,
  barberScheduleSchema,
  listBarbersQuerySchema,
} from "../schemas/barber.schema";
import {
  listBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
  setBarberSchedule,
  getBarberSchedule,
} from "../services/barber.service";

/**
 * CONTROLLER DE BARBEIROS
 */

/**
 * Listar barbeiros
 * GET /barbers
 */
export const list = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = listBarbersQuerySchema.parse(request.query);
    const result = await listBarbers(query);

    return reply.status(200).send({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return reply.status(400).send({
        success: false,
        message: "Parâmetros inválidos",
        errors: error,
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Erro ao listar barbeiros",
    });
  }
};

/**
 * Buscar barbeiro por ID
 * GET /barbers/:id
 */
export const getById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const barber = await getBarberById(id);

    return reply.status(200).send({
      success: true,
      data: barber,
    });
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(404).send({
        success: false,
        message: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Erro ao buscar barbeiro",
    });
  }
};

/**
 * Criar barbeiro
 * POST /barbers
 */
export const create = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = createBarberSchema.parse(request.body);
    const barber = await createBarber(data);

    return reply.status(201).send({
      success: true,
      message: "Barbeiro criado com sucesso!",
      data: barber,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return reply.status(400).send({
        success: false,
        message: "Dados inválidos",
        errors: error,
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
      message: "Erro ao criar barbeiro",
    });
  }
};

/**
 * Atualizar barbeiro
 * PUT /barbers/:id
 */
export const update = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const data = updateBarberSchema.parse(request.body);

    const barber = await updateBarber(id, data);

    return reply.status(200).send({
      success: true,
      message: "Barbeiro atualizado com sucesso!",
      data: barber,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return reply.status(400).send({
        success: false,
        message: "Dados inválidos",
        errors: error,
      });
    }

    if (error instanceof Error) {
      return reply.status(404).send({
        success: false,
        message: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Erro ao atualizar barbeiro",
    });
  }
};

/**
 * Deletar barbeiro
 * DELETE /barbers/:id
 */
export const remove = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const result = await deleteBarber(id);

    return reply.status(200).send({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(404).send({
        success: false,
        message: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Erro ao deletar barbeiro",
    });
  }
};

/**
 * Definir/Atualizar horários do barbeiro
 * POST /barbers/:id/schedule
 * PUT /barbers/:id/schedule
 */
export const setSchedule = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const data = barberScheduleSchema.parse(request.body);

    const schedule = await setBarberSchedule(id, data);

    return reply.status(200).send({
      success: true,
      message: "Horários definidos com sucesso!",
      data: schedule,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return reply.status(400).send({
        success: false,
        message: "Horários inválidos",
        errors: error,
      });
    }

    if (error instanceof Error) {
      return reply.status(404).send({
        success: false,
        message: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Erro ao definir horários",
    });
  }
};

/**
 * Buscar horários do barbeiro
 * GET /barbers/:id/schedule
 */
export const getSchedule = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const schedule = await getBarberSchedule(id);

    return reply.status(200).send({
      success: true,
      data: schedule,
    });
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(404).send({
        success: false,
        message: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Erro ao buscar horários",
    });
  }
};
