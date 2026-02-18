import { Card } from '@beweco/aurora-ui'
import type { IBeweScore } from '@funnel/domain/interfaces/bewe-score.interface'

interface BeweScoreGaugeProps {
  beweScore: IBeweScore
}

export function BeweScoreGauge({ beweScore }: BeweScoreGaugeProps) {
  const { score, label, description, level } = beweScore

  const colorMap: Record<string, string> = {
    critical: 'text-error',
    low: 'text-warning',
    medium: 'text-primary-400',
    high: 'text-secondary-400',
    excellent: 'text-secondary-500',
  }

  const bgColorMap: Record<string, string> = {
    critical: 'stroke-error',
    low: 'stroke-warning',
    medium: 'stroke-primary-400',
    high: 'stroke-secondary-400',
    excellent: 'stroke-secondary-500',
  }

  const circumference = 2 * Math.PI * 60
  const dashOffset = circumference * (1 - score / 100)

  return (
    <Card shadow="sm" radius="lg" padding="lg" className="flex flex-col items-center border border-primary-100">
      <p className="text-small text-base-dark/50 mb-4 font-medium uppercase tracking-wider">
        Tu Bewe Score
      </p>

      <div className="relative w-40 h-40 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70" cy="70" r="60"
            fill="none"
            className="stroke-primary-100"
            strokeWidth="10"
          />
          <circle
            cx="70" cy="70" r="60"
            fill="none"
            className={`${bgColorMap[level]} transition-all duration-1000 ease-out`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[3rem] font-bold leading-none ${colorMap[level]}`}>
            {score}
          </span>
          <span className="text-small text-base-dark/60">/100</span>
        </div>
      </div>

      <p className={`text-h3 ${colorMap[level]} mb-2`}>{label}</p>
      <p className="text-small text-base-dark/60 text-center max-w-xs">{description}</p>
    </Card>
  )
}
