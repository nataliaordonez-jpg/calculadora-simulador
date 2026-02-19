import { Button } from '@beweco/aurora-ui'
import { FunnelLayout } from '../../_shared/components/funnel-layout/FunnelLayout'
import { BeweScoreCard } from '../components/bewe-score-card/BeweScoreCard'
import { SocialButtons } from '../components/social-buttons/SocialButtons'
import { useFunnelContext } from '../../_shared/context/funnel-context'
import { useFunnelNavigation } from '../../_shared/hooks/use-funnel-navigation'
import { FunnelStep } from '@funnel/domain/enums/funnel-step.enum'
import type { IScenario } from '@funnel/domain/interfaces/roi-result.interface'

export function SocialSharePage() {
  const { state } = useFunnelContext()
  const { goToStep } = useFunnelNavigation()

  const { beweScore, roiResult, businessConfig } = state
  const baseScenario = roiResult?.scenarios.find((s: IScenario) => s.type === 'base')

  if (!beweScore || !roiResult) {
    return (
      <FunnelLayout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <p className="text-body text-base-dark/60">Cargando...</p>
        </div>
      </FunnelLayout>
    )
  }

  const shareText = `🎯 Mi Bewe Score es ${beweScore.score}/100! Mi negocio "${businessConfig.businessName}" tiene un potencial ${beweScore.label} con IA. Descubre el tuyo:`
  const shareUrl = window.location.origin

  return (
    <FunnelLayout>
      <div className="max-w-lg mx-auto px-6 md:px-12 py-12 space-y-8">
        <div className="text-center">
          <h1 className="text-h1 text-base-dark mb-3">
            ¡Comparte tu resultado!
          </h1>
          <p className="text-body text-base-dark/60">
            Reta a otros dueños de negocio a descubrir su Bewe Score
          </p>
        </div>

        <BeweScoreCard
          beweScore={beweScore}
          businessName={businessConfig.businessName}
          monthlyBenefit={baseScenario?.monthlyBenefit ?? 0}
        />

        <SocialButtons shareUrl={shareUrl} shareText={shareText} />

        <Button
          variant="light"
          color="primary"
          radius="full"
          onPress={() => goToStep(FunnelStep.RESULTS)}
          className="w-full"
        >
          ← Volver a mis resultados
        </Button>
      </div>
    </FunnelLayout>
  )
}
