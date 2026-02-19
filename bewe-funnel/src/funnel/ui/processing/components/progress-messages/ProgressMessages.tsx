import { IconComponent } from '@beweco/aurora-ui'
import { LindaBadge } from '../../../_shared/components/linda-badge/LindaBadge'

const MESSAGES = [
  'Analizando datos de tu sector...',
  'Calculando ROI con IA...',
  'Evaluando potencial de crecimiento...',
  'Comparando con benchmarks del mercado...',
  'Generando tu Bewe Score...',
  'Preparando tu diagnóstico personalizado...',
]

interface ProgressMessagesProps {
  activeIndex: number
}

export function ProgressMessages({ activeIndex }: ProgressMessagesProps) {
  return (
    <div className="space-y-4 text-center">
      <LindaBadge text="Linda está analizando tu negocio" variant="accent" />

      <div className="mt-6 space-y-3">
        {MESSAGES.map((msg, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 justify-center transition-all duration-500 ${
              i < activeIndex
                ? 'opacity-40'
                : i === activeIndex
                ? 'opacity-100 scale-105'
                : 'opacity-20'
            }`}
          >
            {i < activeIndex && (
              <IconComponent icon="solar:check-circle-bold" size="md" color="var(--color-secondary-400)" />
            )}
            {i === activeIndex && (
              <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            )}
            {i > activeIndex && (
              <div className="w-5 h-5 rounded-full border border-primary-200" />
            )}
            <span className={`text-body ${i === activeIndex ? 'text-base-dark font-medium' : 'text-base-dark/60'}`}>
              {msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
