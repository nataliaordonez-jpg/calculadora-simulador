import { z } from 'zod'
import { Sector } from '../enums/sector.enum'
import { Currency } from '../enums/currency.enum'

export const onboardingSchema = z.object({
  businessName: z
    .string()
    .min(2, 'El nombre del negocio debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  sector: z.enum([Sector.BELLEZA, Sector.SALUD, Sector.FITNESS, Sector.BIENESTAR], {
    error: 'Selecciona un sector',
  }),
  currency: z.enum([Currency.USD, Currency.EUR, Currency.COP, Currency.MXN], {
    error: 'Selecciona una moneda',
  }),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>
