import { Card, IconComponent } from '@beweco/aurora-ui'
import type { IBeweScore } from '@funnel/domain/interfaces/bewe-score.interface'

interface TeaserPreviewProps {
  beweScore: IBeweScore | null
  businessName: string
}

export function TeaserPreview({ beweScore, businessName }: TeaserPreviewProps) {
  const score = beweScore?.score ?? 0

  const scoreColor = score >= 66
    ? 'text-secondary-400'
    : score >= 41
    ? 'text-primary-400'
    : 'text-warning'

  return (
    <Card
      shadow="none"
      radius="lg"
      padding="lg"
      className="relative overflow-hidden border border-primary-200 bg-gradient-to-br from-primary-100/50 via-white to-secondary-100/30"
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-end pb-8">
        <p className="text-small text-base-dark/80 font-medium mb-1">Desbloquea tu resultado completo</p>
        <p className="text-small text-base-dark/50 mb-3">Completa los datos para acceder a tu diagnóstico personalizado</p>
        <span className="animate-bell-swing">
          <IconComponent icon="solar:lock-keyhole-bold-duotone" size="xl" color="var(--color-primary-400)" />
        </span>
      </div>

      {/* Content behind blur */}
      <div className="relative z-0">
        <div className="text-center mb-6">
          <p className="text-small text-base-dark/50 mb-1">Tu Bewe Score</p>
          <p className={`text-[4rem] font-bold leading-none ${scoreColor}`}>
            {score}
          </p>
          <p className="text-h3 text-base-dark mt-2">{beweScore?.label ?? '...'}</p>
        </div>

        <div className="text-center">
          <p className="text-body text-base-dark/60">
            <strong>{businessName}</strong> tiene un potencial de {beweScore?.label?.toLowerCase()} con IA
          </p>
        </div>
      </div>
    </Card>
  )
}
