import { FastifyRequest, FastifyReply } from "fastify";
import {
  createServiceSchema,
  updateServiceSchema,
  listServicesQuerySchema,
} from "../schemas/service.schema";
import {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "../services/service.service";

//Listar serviços
export const list = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Validar query params
    const query = listServicesQuerySchema.parse(request.query);

    // Se usuário for CLIENT, mostrar apenas ativos
    if (request.user?.role === "CLIENTE") {
      query.active = true;
    }

    // Chamar service
    const result = await listServices(query);

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
      message: "Erro ao listar serviços",
    });
  }
};

//Buscar serviço por ID

export const getById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };

    const service = await getServiceById(id);

    return reply.status(200).send({
      success: true,
      data: service,
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
      message: "Erro ao buscar serviço",
    });
  }
};

//Criar serviço

export const create = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Validar dados
    const data = createServiceSchema.parse(request.body);

    // Chamar service
    const service = await createService(data);

    return reply.status(201).send({
      success: true,
      message: "Serviço criado com sucesso!",
      data: service,
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
      message: "Erro ao criar serviço",
    });
  }
};

//Atualizar serviço

export const update = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const data = updateServiceSchema.parse(request.body);

    const service = await updateService(id, data);

    return reply.status(200).send({
      success: true,
      message: "Serviço atualizado com sucesso!",
      data: service,
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
      message: "Erro ao atualizar serviço",
    });
  }
};

//Deletar serviço

export const remove = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };

    const result = await deleteService(id);

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
      message: "Erro ao deletar serviço",
    });
  }
};

//Ativar/Desativar serviço

export const toggle = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };

    const service = await toggleServiceStatus(id);

    return reply.status(200).send({
      success: true,
      message: `Serviço ${
        service.active ? "ativado" : "desativado"
      } com sucesso!`,
      data: service,
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
      message: "Erro ao alterar status do serviço",
    });
  }
};
