import { z } from "zod";

/**
 * Schema para criar barbeiro
 */
export const createBarberSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),

  email: z.string().email("Email inválido").toLowerCase().trim(),

  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(50, "Senha deve ter no máximo 50 caracteres"),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(val),
      "Telefone inválido. Use formato: (11) 98765-4321"
    ),

  avatar: z.string().url("URL inválida").optional(),
});

/**
 * Schema para atualizar barbeiro
 */
export const updateBarberSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim()
    .optional(),

  email: z.string().email("Email inválido").toLowerCase().trim().optional(),

  phone: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(val),
      "Telefone inválido"
    ),

  avatar: z.string().url("URL inválida").optional().nullable(),

  active: z.boolean().optional(),
});

/**
 * Schema para horários (formato HH:MM)
 */
const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    "Formato inválido. Use HH:MM (ex: 09:00)"
  )
  .optional()
  .nullable();

/**
 * Schema para definir horários do barbeiro
 */
export const barberScheduleSchema = z
  .object({
    mondayStart: timeSchema,
    mondayEnd: timeSchema,
    tuesdayStart: timeSchema,
    tuesdayEnd: timeSchema,
    wednesdayStart: timeSchema,
    wednesdayEnd: timeSchema,
    thursdayStart: timeSchema,
    thursdayEnd: timeSchema,
    fridayStart: timeSchema,
    fridayEnd: timeSchema,
    saturdayStart: timeSchema,
    saturdayEnd: timeSchema,
    sundayStart: timeSchema,
    sundayEnd: timeSchema,
  })
  .refine(
    (data) => {
      // Validar se quando há start, tem end correspondente
      const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      for (const day of days) {
        const start = data[`${day}Start` as keyof typeof data];
        const end = data[`${day}End` as keyof typeof data];

        if ((start && !end) || (!start && end)) {
          return false;
        }

        // Se ambos existem, verificar se end > start
        if (start && end && start >= end) {
          return false;
        }
      }

      return true;
    },
    {
      message:
        "Horários inválidos. Cada dia deve ter início E fim, e o fim deve ser após o início.",
    }
  );

/**
 * Schema para query params de listagem
 */
export const listBarbersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),

  active: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),

  search: z.string().optional(),

  hasSchedule: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
});

// Tipos inferidos
export type CreateBarberInput = z.infer<typeof createBarberSchema>;
export type UpdateBarberInput = z.infer<typeof updateBarberSchema>;
export type BarberScheduleInput = z.infer<typeof barberScheduleSchema>;
export type ListBarbersQuery = z.infer<typeof listBarbersQuerySchema>;
