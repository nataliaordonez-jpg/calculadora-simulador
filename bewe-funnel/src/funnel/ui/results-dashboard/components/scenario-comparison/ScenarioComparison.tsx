import { Card, Chip } from '@beweco/aurora-ui'
import type { IScenario } from '@funnel/domain/interfaces/roi-result.interface'

interface ScenarioComparisonProps {
  scenarios: IScenario[]
}

export function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  return (
    <Card shadow="none" radius="lg" padding="lg" className="border border-primary-100">
      <h2 className="text-h2 text-base-dark mb-6 text-center">
        Proyección por Escenarios
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const isBase = scenario.type === 'base'
          return (
            <div
              key={scenario.type}
              className={`relative rounded-xl p-6 transition-all duration-200 ${
                isBase
                  ? 'bg-primary-400 text-white shadow-xl scale-105 z-10'
                  : 'bg-primary-100/30 text-base-dark border border-primary-100'
              }`}
            >
              {isBase && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Chip color="success" variant="solid" size="sm">
                    Recomendado
                  </Chip>
                </div>
              )}

              <p className={`text-small mb-4 font-medium ${isBase ? 'text-white/70' : 'text-base-dark/50'}`}>
                {scenario.label}
              </p>

              <p className={`text-h1 mb-1 ${isBase ? 'text-white' : 'text-base-dark'}`}>
                ${scenario.monthlyBenefit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className={`text-small mb-4 ${isBase ? 'text-white/60' : 'text-base-dark/40'}`}>
                USD/mes
              </p>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-small ${isBase ? 'text-white/70' : 'text-base-dark/50'}`}>ROI</span>
                  <span className={`text-small font-semibold ${isBase ? 'text-white' : 'text-primary-500'}`}>
                    {scenario.roiPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-small ${isBase ? 'text-white/70' : 'text-base-dark/50'}`}>Ingresos</span>
                  <span className={`text-small font-semibold ${isBase ? 'text-white' : 'text-secondary-500'}`}>
                    +${scenario.revenueIncrease.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-small ${isBase ? 'text-white/70' : 'text-base-dark/50'}`}>Ahorro</span>
                  <span className={`text-small font-semibold ${isBase ? 'text-white' : 'text-primary-500'}`}>
                    +${scenario.costSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
