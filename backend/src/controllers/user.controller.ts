import { FastifyRequest, FastifyReply } from "fastify";
import { Role } from "@prisma/client";
import { findAllUsers } from "../services/user.service";

export const listUsers = async (
  request: FastifyRequest<{ Querystring: { role?: Role } }>,
  reply: FastifyReply
) => {
  try {
    const { role } = request.query;
    const users = await findAllUsers(role);

    return reply.status(200).send({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      success: false,
      message: "Erro ao buscar lista de usuários",
    });
  }
};
