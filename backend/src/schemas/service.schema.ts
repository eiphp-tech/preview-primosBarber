import { z } from "zod";

//Schema para criar serviço

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),

  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .trim()
    .optional(),

  price: z
    .number()
    .positive("Preço deve ser maior que zero")
    .max(10000, "Preço máximo: R$ 10.000")
    .multipleOf(0.01, "Preço deve ter no máximo 2 casas decimais"),

  duration: z
    .number()
    .int("Duração deve ser um número inteiro")
    .positive("Duração deve ser maior que zero")
    .min(5, "Duração mínima: 5 minutos")
    .max(480, "Duração máxima: 8 horas (480 minutos)"),

  imageUrl: z.string().url("URL inválida").optional(),
});

//Schema para atualizar serviço
export const updateServiceSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim()
    .optional(),

  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .trim()
    .optional()
    .nullable(),

  price: z
    .number()
    .positive("Preço deve ser maior que zero")
    .max(10000, "Preço máximo: R$ 10.000")
    .multipleOf(0.01, "Preço deve ter no máximo 2 casas decimais")
    .optional(),

  duration: z
    .number()
    .int("Duração deve ser um número inteiro")
    .positive("Duração deve ser maior que zero")
    .min(5, "Duração mínima: 5 minutos")
    .max(480, "Duração máxima: 8 horas (480 minutos)")
    .optional(),

  imageUrl: z.string().url("URL inválida").optional().nullable(),

  active: z.boolean().optional(),
});

//Schema para query params de listagem

export const listServicesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1))
    .refine((val) => val > 0, "Página deve ser maior que zero"),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10))
    .refine((val) => val > 0 && val <= 100, "Limite deve estar entre 1 e 100"),

  active: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),

  search: z.string().optional(),

  sortBy: z.enum(["name", "price", "duration", "createdAt"]).optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Tipos inferidos
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;
