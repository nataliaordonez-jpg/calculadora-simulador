import { Card, IconComponent } from '@beweco/aurora-ui'
import type { IROIResult, IScenario } from '@funnel/domain/interfaces/roi-result.interface'
import type { IBeweScore } from '@funnel/domain/interfaces/bewe-score.interface'
import { LindaBadge } from '../../../_shared/components/linda-badge/LindaBadge'

interface ExecutiveSummaryProps {
  businessName: string
  roi: IROIResult
  beweScore: IBeweScore
}

export function ExecutiveSummary({ businessName, roi, beweScore }: ExecutiveSummaryProps) {
  const baseScenario = roi.scenarios.find((s: IScenario) => s.type === 'base')

  return (
    <Card shadow="md" radius="lg" padding="lg" className="bg-gradient-to-br from-base-dark to-surface-deep text-white">
      <div className="flex items-start justify-between mb-6">
        <div>
          <LindaBadge text="Diagnóstico por Linda IA" variant="accent" />
          <h1 className="text-h1 text-white mt-4">
            {businessName}
          </h1>
          <p className="text-body text-white/60 mt-2">
            Tu diagnóstico personalizado está listo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <IconComponent icon="solar:wallet-money-linear" size="sm" color="#34D399" />
            <p className="text-small text-white/50">Beneficio Mensual</p>
          </div>
          <p className="text-h2 text-secondary-300">
            ${baseScenario?.monthlyBenefit.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '0'}
          </p>
          <p className="text-small text-white/40 mt-1">USD/mes estimado</p>
        </div>

        <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <IconComponent icon="solar:chart-2-linear" size="sm" color="#88BCFB" />
            <p className="text-small text-white/50">ROI Proyectado</p>
          </div>
          <p className="text-h2 text-primary-300">
            {baseScenario?.roiPercentage.toFixed(0) ?? '0'}%
          </p>
          <p className="text-small text-white/40 mt-1">escenario base</p>
        </div>

        <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <IconComponent icon="solar:diploma-verified-linear" size="sm" color="#FAD19E" />
            <p className="text-small text-white/50">Bewe Score</p>
          </div>
          <p className="text-h2 text-accent">
            {beweScore.score}/100
          </p>
          <p className="text-small text-white/40 mt-1">{beweScore.label}</p>
        </div>
      </div>
    </Card>
  )
}
