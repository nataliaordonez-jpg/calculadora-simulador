import { Currency } from '../../../../domain/enums/currency.enum'
import { formatCurrency } from '../../../../domain/helpers/currency.helper'

interface CurrencyDisplayProps {
  amount: number
  currency: Currency
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSign?: boolean
  className?: string
}

export function CurrencyDisplay({
  amount,
  currency,
  size = 'md',
  showSign = false,
  className = '',
}: CurrencyDisplayProps) {
  const sizeClasses = {
    sm: 'text-small',
    md: 'text-body',
    lg: 'text-h3',
    xl: 'text-h1',
  }

  const formatted = formatCurrency(amount, currency)
  const sign = showSign && amount > 0 ? '+' : ''

  return (
    <span className={`font-semibold ${sizeClasses[size]} ${className}`}>
      {sign}{formatted}
    </span>
  )
}
