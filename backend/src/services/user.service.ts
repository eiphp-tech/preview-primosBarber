import prisma from "../config/prisma";

import { Role } from "@prisma/client";

// Buscar todos os usuários (Opcionalmente filtrando por Role)
export const findAllUsers = async (role?: Role) => {
  const users = await prisma.user.findMany({
    where: role
      ? {
          role: role,
        }
      : {}, // Se não passar role, busca todos
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      active: true,
      createdAt: true,
      // IMPORTANTE: Não selecionamos 'password' aqui por segurança
    },
    orderBy: {
      createdAt: "desc", // Ordena do mais recente para o mais antigo
    },
  });

  return users;
};
