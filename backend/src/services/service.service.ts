import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { boolean, number, object, string } from "zod";
import { id, tr } from "zod/v4/locales";

//Lógica de negócio para gerenciar serviços da barbearia

//Listar serviços com pagina e filtros

export const listServices = async (options: {
  page?: number;
  limit?: number;
  active?: boolean;
  search?: string;
  sortBy?: "name" | "price" | "duration" | "createdAt";
  sortOrder?: "asc" | "desc";
}) => {
  const {
    page = 1,
    limit = 10,
    active,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit; // Calcular offset para paginação

  const where: Prisma.ServiceWhereInput = {}; //Criar Filtros

  //Filtrar apenas ativos
  if (active !== undefined) {
    where.active = active;
  }

  //Filtrar por nome ou descrição
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  //Buscar Serviços
  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        imageUrl: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true, // Contar quantos agendamentos usam este serviço
          },
        },
      },
    }),
    prisma.service.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: services,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
};

// Buscar serviço por ID
export const getServiceByID = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  if (!service) {
    throw new Error("Serviço não encontrado");
  }
  return service;
};

//Creat new Service
export const createService = async (data: {
  name: string;
  description?: string;
  price: number;
  duration: number;
  imageUrl: string;
}) => {
  //Verificar se esse serviço já existe com mesmo nome
  const existingService = await prisma.service.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
  });

  if (existingService) {
    throw new Error("Já existe um serviço com este nome");
  }

  //Criar serviço
  const service = await prisma.service.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      imageUrl: data.imageUrl,
      active: true,
    },
  });

  return service;
};

//Atualizar serviços

export const updateService = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    imageUrl?: string;
    active?: boolean;
  }
) => {
  const existingService = await prisma.service.findUnique({
    where: { id },
  });

  if (!existingService) {
    throw new Error("Serviço não encontrado");
  }

  //Se estiver alterando o nome, verificar duplicação
  if (data.name && data.name !== existingService.name) {
    const duplicateName = await prisma.service.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
        id: { not: id },
      },
    });

    if (duplicateName) {
      throw new Error("Já existe um serviço com este nome");
    }
  }

  const service = await prisma.service.update({
    where: { id },
    data,
  });

  return service;
};

export const deleteService = async (id: string) => {
  // Verificar se serviço existe
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  if (!service) {
    throw new Error("Serviço não encontrado");
  }

  // Se tem agendamentos, apenas desativar (soft delete)
  if (service._count.bookings > 0) {
    const updated = await prisma.service.update({
      where: { id },
      data: { active: false },
    });

    return {
      service: updated,
      message: `Serviço desativado. Existem ${service._count.bookings} agendamento(s) relacionado(s).`,
    };
  }

  // Se não tem agendamentos, pode deletar permanentemente
  await prisma.service.delete({
    where: { id },
  });

  return {
    message: "Serviço deletado permanentemente.",
  };
};

//Ativar/Desativar serviço

export const toggleServiceStatus = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    throw new Error("Serviço não encontrado");
  }

  const updated = await prisma.service.update({
    where: { id },
    data: { active: !service.active },
  });

  return updated;
};
