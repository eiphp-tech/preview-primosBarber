import { FastifyRequest, FastifyReply } from "fastify";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import {
  registerUser,
  loginUser,
  getAuthenticatedUser,
} from "../services/auth.service";

/**
 * Registrar novo usuário
 * POST /auth/register
 */

export const register = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    // Validar dados de entrada com Zod
    const data = registerSchema.parse(request.body);

    // Chamar service
    const result = await registerUser(data);

    return reply.status(201).send({
      success: true,
      message: "Usuário cadastrado com sucesso!",
      data: result,
    });
  } catch (error) {
    // Erro de validação do Zod
    if (error instanceof Error && error.name === "ZodError") {
      return reply.status(400).send({
        success: false,
        message: "Dados inválidos",
        errors: error,
      });
    }

    // Erro de negócio (email já existe, etc)
    if (error instanceof Error) {
      return reply.status(400).send({
        success: false,
        message: error.message,
      });
    }

    // Erro desconhecido
    return reply.status(500).send({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Fazer login
 * POST /auth/login
 */
export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Validar dados de entrada com Zod
    const data = loginSchema.parse(request.body);

    // Chamar service
    const result = await loginUser(data);

    return reply.status(200).send({
      success: true,
      message: "Login realizado com sucesso!",
      data: result,
    });
  } catch (error) {
    // Erro de validação do Zod
    if (error instanceof Error && error.name === "ZodError") {
      return reply.status(400).send({
        success: false,
        message: "Dados inválidos",
        errors: error,
      });
    }

    // Erro de negócio (credenciais inválidas, etc)
    if (error instanceof Error) {
      return reply.status(401).send({
        success: false,
        message: error.message,
      });
    }

    // Erro desconhecido
    return reply.status(500).send({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

/**
 * Buscar dados do usuário autenticado
 * GET /auth/me
 */
export const me = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // user foi injetado pelo middleware de autenticação
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: "Não autenticado",
      });
    }

    // Buscar dados completos do usuário
    const user = await getAuthenticatedUser(request.user.userId);

    return reply.status(200).send({
      success: true,
      data: user,
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
      message: "Erro interno do servidor",
    });
  }
};
