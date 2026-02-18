import { Currency } from '../enums/currency.enum'
import { CURRENCY_TO_USD } from '../constants/currency-rates.constant'

export function convertToUSD(amount: number, currency: Currency): number {
  return amount * CURRENCY_TO_USD[currency]
}

export function convertFromUSD(amountUSD: number, currency: Currency): number {
  return amountUSD / CURRENCY_TO_USD[currency]
}

export function formatCurrency(amount: number, currency: Currency): string {
  const locales: Record<Currency, string> = {
    [Currency.USD]: 'en-US',
    [Currency.EUR]: 'de-DE',
    [Currency.COP]: 'es-CO',
    [Currency.MXN]: 'es-MX',
  }

  return new Intl.NumberFormat(locales[currency], {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
