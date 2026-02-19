import { Card } from '@beweco/aurora-ui'
import type { IBeweScore } from '@funnel/domain/interfaces/bewe-score.interface'

interface BeweScoreCardProps {
  beweScore: IBeweScore
  businessName: string
  monthlyBenefit: number
}

export function BeweScoreCard({ beweScore, businessName, monthlyBenefit }: BeweScoreCardProps) {
  const colorMap: Record<string, string> = {
    critical: 'from-error/20 to-error/5',
    low: 'from-warning/20 to-warning/5',
    medium: 'from-primary-200 to-primary-100',
    high: 'from-secondary-200 to-secondary-100',
    excellent: 'from-secondary-300 to-secondary-100',
  }

  return (
    <Card
      shadow="md"
      radius="lg"
      padding="lg"
      className={`bg-gradient-to-br ${colorMap[beweScore.level]} text-center border border-primary-200`}
    >
      <p className="text-small text-base-dark/50 uppercase tracking-wider mb-2">Bewe Score</p>

      <div className="w-28 h-28 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center mb-4">
        <span className="text-[2.5rem] font-bold text-primary-400">{beweScore.score}</span>
      </div>

      <h3 className="text-h2 text-base-dark mb-1">{businessName}</h3>
      <p className="text-body text-base-dark/60 mb-4">{beweScore.label}</p>

      <div className="bg-white/80 rounded-xl p-4 inline-block">
        <p className="text-small text-base-dark/50">Potencial mensual estimado</p>
        <p className="text-h2 text-secondary-500">
          +${monthlyBenefit.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
        </p>
      </div>
    </Card>
  )
}
