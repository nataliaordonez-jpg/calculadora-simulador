import { Card } from '@beweco/aurora-ui'
import { Currency, CURRENCY_SYMBOLS } from '@funnel/domain/enums/currency.enum'

interface CurrencySelectorProps {
  value: Currency
  onChange: (currency: Currency) => void
}

/* Orden visual */
const CURRENCY_ORDER: Currency[] = [Currency.USD, Currency.EUR, Currency.COP, Currency.MXN]

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <div className="space-y-4">
      <label className="text-body font-medium text-base-dark">
        ¿En qué moneda operas?
      </label>
      <div className="grid grid-cols-4 gap-4">
        {CURRENCY_ORDER.map((currency) => (
          <Card
            key={currency}
            shadow="none"
            radius="lg"
            padding="md"
            isPressable
            onPress={() => onChange(currency)}
            className={`flex flex-col items-center text-center transition-all duration-300 ease-out cursor-pointer py-6 border-2 hover:scale-[1.03] hover:shadow-md ${
              value === currency
                ? 'border-primary-400 bg-white shadow-md'
                : 'border-primary-100 bg-white hover:border-primary-300'
            }`}
          >
            <span
              className="text-2xl font-semibold mb-2"
              style={{ color: value === currency ? 'var(--color-primary-400)' : '#64748B' }}
            >
              {CURRENCY_SYMBOLS[currency]}
            </span>
            <span className="text-small font-semibold text-base-dark">
              {currency}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
