import prisma from "../config/prisma";
import { RegisterDto, LoginDto } from "../types/auth.types";
import { hashPassword, comparePassword } from "../utils/hash.util";
import { generateToken } from "../utils/jwt.util";

// SERVIÇO DE AUTENTICAÇÃO - Lógica de Negócio

/**
 * Registrar novo usuário
 */
export const registerUser = async (data: RegisterDto) => {
  // 1. Verificar se email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email já cadastrado");
  }

  // 2. Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // 3. Criar usuário no banco
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: data.role || "CLIENTE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
    },
  });

  // 4. Gerar token JWT
  // Certifique-se que seu generateToken no jwt.util.ts está configurado para '7d'
  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    user,
  };
};

/**
 * Fazer Login
 */
export const loginUser = async (data: LoginDto) => {
  // 1. Buscar usuário por email
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    console.log("❌ [AUTH] Usuário não encontrado no banco.");
    throw new Error("Email ou senha inválido");
  }

  // 2. Verificar se usuário está ativo
  if (!user.active) {
    throw new Error("Usuário inativo. Entre em contato com o administrador.");
  }

  // 3. Verificar senha
  const isPasswordValid = await comparePassword(data.password, user.password);

  console.log(`❓ [AUTH] Senha válida? ${isPasswordValid}`);

  if (!isPasswordValid) {
    console.log("❌ [AUTH] Senha incorreta.");
    throw new Error("Email ou senha inválido");
  }

  // 4. Gerar token JWT (Validade de 7 dias deve estar no jwt.util ou passada aqui)
  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  console.log("✅ [AUTH] Login bem-sucedido. Token gerado.");

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
};

/**
 * Buscar usuário autenticado
 */
export const getAuthenticatedUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  return user;
};
