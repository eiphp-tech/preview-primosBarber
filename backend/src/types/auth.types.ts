import { Role } from "@prisma/client";

//Dados armazenados no token JWT
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// Dados de Registro
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}

//Dados de Login
export interface LoginDto {
  email: string;
  password: string;
}

//Resposta de Autenticação
export interface AuthResponde {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string | null;
  };
}

// Estender Request do Fastify para incluir usuário autenticado
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: Role;
    };
  }
}
