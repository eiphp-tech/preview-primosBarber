import { Role } from "@prisma/client";
import { email, z } from "zod";

// Schema de registro
export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),

  email: z.string().email("email inválido").toLowerCase().trim(),

  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(50, "Senha deve ter no mínimo 6 caracteres"),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+\d{8,15}$/.test(val),
      "Telefone inválido. O formato deve ser internacional (ex: +5511999999999)"
    ),

  role: z.nativeEnum(Role).optional().default(Role.CLIENTE),
});

//Schema de login
export const loginSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase().trim(),

  password: z.string().min(1, "Senha é Obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
