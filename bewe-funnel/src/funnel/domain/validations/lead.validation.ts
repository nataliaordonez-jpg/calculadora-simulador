import { z } from 'zod'

export const leadCaptureSchema = z.object({
  fullName: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'Solo se permiten letras'),
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email válido')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'El email debe tener un dominio válido'),
  phone: z
    .string()
    .optional(),
  phoneCountry: z
    .string()
    .optional(),
  phonePrefix: z
    .string()
    .optional(),
})

export type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>
