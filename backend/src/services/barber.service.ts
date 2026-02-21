import prisma from "../config/prisma";
import { Prisma, Role } from "@prisma/client";
import { hashPassword } from "../utils/hash.util";

/**
 * SERVICE DE BARBEIROS
 * Gerencia barbeiros e seus horários
 */

/**
 * Listar barbeiros
 */
export const listBarbers = async (options: {
  page?: number;
  limit?: number;
  active?: boolean;
  search?: string;
  hasSchedule?: boolean;
}) => {
  const { page = 1, limit = 10, active, search, hasSchedule } = options;

  const skip = (page - 1) * limit;

  // Construir filtros
  const where: Prisma.UserWhereInput = {
    role: Role.BARBEIRO, // Apenas barbeiros
  };

  if (active !== undefined) {
    where.active = active;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (hasSchedule !== undefined) {
    if (hasSchedule) {
      where.barberSchedule = { isNot: null };
    } else {
      where.barberSchedule = { is: null };
    }
  }

  // Buscar barbeiros
  const [barbers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        active: true,
        createdAt: true,
        barberSchedule: true,
        _count: {
          select: {
            bookingsAsBarber: true,
            receivedReviews: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Calcular média de avaliações de cada barbeiro
  const barbersWithRatings = await Promise.all(
    barbers.map(async (barber) => {
      const avgRating = await prisma.review.aggregate({
        where: { barberId: barber.id },
        _avg: { rating: true },
      });

      return {
        ...barber,
        averageRating: avgRating._avg.rating || 0,
        totalBookings: barber._count.bookingsAsBarber,
        totalReviews: barber._count.receivedReviews,
      };
    })
  );

  const totalPages = Math.ceil(total / limit);

  return {
    data: barbersWithRatings,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Buscar barbeiro por ID
 */
export const getBarberById = async (id: string) => {
  const barber = await prisma.user.findFirst({
    where: {
      id,
      role: Role.BARBEIRO,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      active: true,
      createdAt: true,
      barberSchedule: true,
      _count: {
        select: {
          bookingsAsBarber: true,
          receivedReviews: true,
        },
      },
    },
  });

  if (!barber) {
    throw new Error("Barbeiro não encontrado");
  }

  // Calcular estatísticas
  const [avgRating, totalEarnings] = await Promise.all([
    prisma.review.aggregate({
      where: { barberId: id },
      _avg: { rating: true },
    }),
    prisma.transaction.aggregate({
      where: { barberId: id, status: "PAID" },
      _sum: { barberAmount: true },
    }),
  ]);

  return {
    ...barber,
    averageRating: avgRating._avg.rating || 0,
    totalBookings: barber._count.bookingsAsBarber,
    totalReviews: barber._count.receivedReviews,
    totalEarnings: totalEarnings._sum.barberAmount || 0,
  };
};

/**
 * Criar barbeiro
 */
export const createBarber = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
}) => {
  // Verificar se email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email já cadastrado");
  }

  // Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // Criar barbeiro
  const barber = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      avatar: data.avatar,
      role: Role.BARBEIRO,
      active: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return barber;
};

/**
 * Atualizar barbeiro
 */
export const updateBarber = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    active?: boolean;
  }
) => {
  // Verificar se barbeiro existe
  const barber = await prisma.user.findFirst({
    where: { id, role: Role.BARBEIRO },
  });

  if (!barber) {
    throw new Error("Barbeiro não encontrado");
  }

  // Se está alterando email, verificar duplicação
  if (data.email && data.email !== barber.email) {
    const duplicate = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (duplicate) {
      throw new Error("Email já cadastrado");
    }
  }

  // Atualizar barbeiro
  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      active: true,
      updatedAt: true,
    },
  });

  return updated;
};

/**
 * Deletar barbeiro (soft delete)
 */
export const deleteBarber = async (id: string) => {
  const barber = await prisma.user.findFirst({
    where: { id, role: Role.BARBEIRO },
    include: {
      _count: {
        select: {
          bookingsAsBarber: true,
        },
      },
    },
  });

  if (!barber) {
    throw new Error("Barbeiro não encontrado");
  }

  // Se tem agendamentos, apenas desativar
  if (barber._count.bookingsAsBarber > 0) {
    await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return {
      message: `Barbeiro desativado. Existem ${barber._count.bookingsAsBarber} agendamento(s) relacionado(s).`,
    };
  }

  // Se não tem agendamentos, pode deletar
  await prisma.user.delete({ where: { id } });

  return {
    message: "Barbeiro deletado permanentemente.",
  };
};

/**
 * Definir/Atualizar horários do barbeiro
 */
export const setBarberSchedule = async (
  barberId: string,
  schedule: {
    mondayStart?: string | null;
    mondayEnd?: string | null;
    tuesdayStart?: string | null;
    tuesdayEnd?: string | null;
    wednesdayStart?: string | null;
    wednesdayEnd?: string | null;
    thursdayStart?: string | null;
    thursdayEnd?: string | null;
    fridayStart?: string | null;
    fridayEnd?: string | null;
    saturdayStart?: string | null;
    saturdayEnd?: string | null;
    sundayStart?: string | null;
    sundayEnd?: string | null;
  }
) => {
  // Verificar se barbeiro existe
  const barber = await prisma.user.findFirst({
    where: { id: barberId, role: Role.BARBEIRO },
  });

  if (!barber) {
    throw new Error("Barbeiro não encontrado");
  }

  // Verificar se já tem schedule
  const existingSchedule = await prisma.barberSchedule.findUnique({
    where: { barberId },
  });

  if (existingSchedule) {
    // Atualizar schedule existente
    const updated = await prisma.barberSchedule.update({
      where: { barberId },
      data: schedule,
    });
    return updated;
  } else {
    // Criar novo schedule
    const created = await prisma.barberSchedule.create({
      data: {
        barberId,
        ...schedule,
      },
    });
    return created;
  }
};

/**
 * Buscar horários do barbeiro
 */
export const getBarberSchedule = async (barberId: string) => {
  const schedule = await prisma.barberSchedule.findUnique({
    where: { barberId },
  });

  if (!schedule) {
    throw new Error("Barbeiro não possui horários definidos");
  }

  return schedule;
};

