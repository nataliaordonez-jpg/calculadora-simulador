import { Card, IconComponent } from '@beweco/aurora-ui'
import type { IPillarResult } from '@funnel/domain/interfaces/roi-result.interface'

interface RoiPillarCardProps {
  pillar: IPillarResult
  index: number
}

const PILLAR_ICONS = [
  'solar:shield-check-linear',
  'solar:wallet-money-linear',
  'solar:bolt-circle-linear',
  'solar:rocket-2-linear',
]

const PILLAR_ICON_COLORS = [
  'var(--color-primary-400)',
  'var(--color-secondary-400)',
  '#FBBF24',
  '#38BDF8',
]

const PILLAR_BG_COLORS = [
  'bg-primary-100',
  'bg-secondary-100',
  'bg-[#FEF3C7]',
  'bg-[#DFEDFE]',
]

const PILLAR_BORDER_COLORS = [
  'border-l-primary-400',
  'border-l-secondary-400',
  'border-l-[#FBBF24]',
  'border-l-[#38BDF8]',
]

export function RoiPillarCard({ pillar, index }: RoiPillarCardProps) {
  return (
    <Card
      shadow="none"
      radius="lg"
      padding="lg"
      className={`border border-primary-100 border-l-4 ${PILLAR_BORDER_COLORS[index]} hover:shadow-md hover:scale-[1.01] transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${PILLAR_BG_COLORS[index]} flex items-center justify-center`}>
            <IconComponent icon={PILLAR_ICONS[index]} size="md" color={PILLAR_ICON_COLORS[index]} />
          </div>
          <h3 className="text-h3 text-base-dark">{pillar.pillarName}</h3>
        </div>
        <span className="text-h3 text-secondary-500 font-bold">
          ${pillar.monthlyAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
      </div>
      <p className="text-small text-base-dark/60 mb-3">{pillar.description}</p>
      <div className="bg-primary-100/30 rounded-lg p-3">
        <p className="text-small text-primary-600 font-mono">{pillar.formula}</p>
      </div>
    </Card>
  )
}
