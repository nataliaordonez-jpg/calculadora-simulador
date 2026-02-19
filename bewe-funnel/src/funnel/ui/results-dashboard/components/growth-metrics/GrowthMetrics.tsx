import { Card, IconComponent } from '@beweco/aurora-ui'
import type { IGrowthDiagnostic, IGrowthMetric } from '@funnel/domain/interfaces/growth-diagnostic.interface'

interface GrowthMetricsProps {
  diagnostic: IGrowthDiagnostic
  facturacionMensual: number
}

const METRIC_ICONS: Record<string, string> = {
  churn_reduction: 'solar:users-group-rounded-linear',
  acquisition: 'solar:user-plus-linear',
  no_show: 'solar:calendar-minimalistic-linear',
  adherence: 'solar:heart-pulse-linear',
  upsells: 'solar:tag-price-linear',
}

const METRIC_COLORS: Record<string, string> = {
  churn_reduction: 'var(--color-secondary-400)',
  acquisition: 'var(--color-primary-400)',
  no_show: '#FBBF24',
  adherence: '#F87171',
  upsells: '#38BDF8',
}

export function GrowthMetrics({ diagnostic, facturacionMensual }: GrowthMetricsProps) {
  const porcentajeCrecimiento = facturacionMensual > 0
    ? ((diagnostic.totalMonthlyGrowthGain / facturacionMensual) * 100).toFixed(1)
    : '0'

  return (
    <Card shadow="none" radius="lg" padding="lg" className="border border-primary-100">
      <h2 className="text-h2 text-base-dark mb-2">
        Diagnóstico de Crecimiento
      </h2>
      <p className="text-small text-base-dark/50 mb-6">
        Basado en el análisis de tu sector y respuestas
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-secondary-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <IconComponent icon="solar:graph-up-linear" size="sm" color="var(--color-secondary-600)" />
            <p className="text-small text-secondary-600">Ganancia Mensual Proyectada</p>
          </div>
          <p className="text-h2 text-secondary-600">
            +${diagnostic.totalMonthlyGrowthGain.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-primary-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <IconComponent icon="solar:chart-2-linear" size="sm" color="var(--color-primary-600)" />
            <p className="text-small text-primary-600">Crecimiento Estimado</p>
          </div>
          <p className="text-h2 text-primary-600">
            +{porcentajeCrecimiento}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {diagnostic.metrics.map((metric: IGrowthMetric) => (
          <Card key={metric.metricKey} shadow="none" radius="lg" padding="md" className="border border-primary-100 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <IconComponent
                  icon={METRIC_ICONS[metric.metricKey] ?? 'solar:graph-linear'}
                  size="md"
                  color={METRIC_COLORS[metric.metricKey] ?? 'var(--color-primary-400)'}
                />
                <h3 className="text-h3 text-base-dark">{metric.label}</h3>
              </div>
              {metric.monthlyGain > 0 && (
                <span className="text-small bg-secondary-100 text-secondary-600 px-3 py-1 rounded-full font-semibold">
                  +${metric.monthlyGain.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mes
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-small text-base-dark/50 mb-1">
                  <span>Actual</span>
                  <span>Proyectado</span>
                </div>
                <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, (metric.projectedValue / (metric.currentValue || 1)) * 50)}%` }}
                  />
                </div>
                <div className="flex justify-between text-small mt-1">
                  <span className="text-base-dark/70">
                    {metric.unit === 'percentage' ? `${metric.currentValue.toFixed(1)}%` :
                     metric.unit === 'currency' ? `$${metric.currentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` :
                     metric.currentValue.toFixed(1)}
                  </span>
                  <span className="text-secondary-500 font-semibold">
                    {metric.unit === 'percentage' ? `${metric.projectedValue.toFixed(1)}%` :
                     metric.unit === 'currency' ? `$${metric.projectedValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` :
                     metric.projectedValue.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="text-center min-w-[60px]">
                <span className="text-small font-bold text-primary-500">
                  +{metric.improvement.toFixed(0)}%
                </span>
                <p className="text-small text-base-dark/40">mejora</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
