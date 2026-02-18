import { Currency } from '../enums/currency.enum'

/* ─── Tasas de conversión a USD ─── */
export const CURRENCY_TO_USD: Record<Currency, number> = {
  [Currency.USD]: 1,
  [Currency.EUR]: 1.08,   // 1 EUR ≈ 1.08 USD
  [Currency.COP]: 0.00025, // 1 COP ≈ 0.00025 USD
  [Currency.MXN]: 0.058,   // 1 MXN ≈ 0.058 USD
}

/* ─── Facturación Mensual: Opciones por Moneda (P2) ─── */
export interface ICurrencyOption {
  label: string
  value: number // punto medio
}

export const BILLING_OPTIONS: Record<Currency, ICurrencyOption[]> = {
  [Currency.USD]: [
    { label: 'Hasta $2,000', value: 1000 },
    { label: '$2,001 - $6,000', value: 4000 },
    { label: '$6,001 - $12,000', value: 9000 },
    { label: 'Más de $12,001', value: 15000 },
  ],
  [Currency.EUR]: [
    { label: 'Hasta 2,000', value: 1000 },
    { label: '2,001 - 6,000', value: 4000 },
    { label: '6,001 - 12,000', value: 9000 },
    { label: 'Más de 12,000', value: 15000 },
  ],
  [Currency.COP]: [
    { label: 'Hasta $7.000.000', value: 3500000 },
    { label: '$7.000.001 - $14.000.000', value: 10500000 },
    { label: '$14.000.001 - $30.000.000', value: 22000000 },
    { label: 'Más de $30.000.000', value: 45000000 },
  ],
  [Currency.MXN]: [
    { label: 'Hasta $35,000', value: 17500 },
    { label: '$35,001 - $75,000', value: 55000 },
    { label: '$75,001 - $140,000', value: 107500 },
    { label: 'Más de $140,000', value: 160000 },
  ],
}
