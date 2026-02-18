export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  COP = 'COP',
  MXN = 'MXN',
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.COP]: '$',
  [Currency.MXN]: '$',
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  [Currency.USD]: '$USD',
  [Currency.EUR]: '€EUR',
  [Currency.COP]: '$COP',
  [Currency.MXN]: '$MXN',
}
