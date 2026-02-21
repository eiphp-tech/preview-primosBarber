import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../utils/jwt.util";
import { Role } from "@prisma/client";
import { request } from "http";
import { email, success } from "zod";
import { ECDH } from "crypto";
import { required } from "zod/v4/core/util.cjs";

/**
 * MIDDLEWARE DE AUTENTICAÇÃO
 * Verifica se o usuário está autenticado
 */
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    //buscar token no header autrorization
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        success: false,
        message: "Token não fornecido",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return reply.status(401).send({
        success: false,
        message: "Formato de token inválido. Use: Bearer <token>",
      });
    }

    const token = parts[1];

    const decoded = verifyToken(token);

    request.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(401).send({
        success: false,
        message: error.message,
      });
    }

    return reply.status(401).send({
      success: false,
      message: "Token inválido",
    });
  }
};

/**
 * MIDDLEWARE DE AUTORIZAÇÃO POR ROLE
 * Verifica se o usuário tem permissão para acessar a rota
 */

export const authorize = (...allowedRoles: Role[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    //Usuário precisa estar autenticado primeiro
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: "Não autenticado",
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        message:
          "acesso negado. Você não tem permissão para acessar este recurso",
        requiredRoles: allowedRoles,
        yourRole: request.user.role,
      });
    }
  };
};

