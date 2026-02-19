import { Button } from '@beweco/aurora-ui'
import { FunnelLayout } from '../../_shared/components/funnel-layout/FunnelLayout'
import { HeroSection } from '../components/hero-section/HeroSection'
import { FeatureHighlights } from '../components/feature-highlights/FeatureHighlights'
import { SuccessStories } from '../components/success-stories/SuccessStories'
import { FaqAccordion } from '../components/faq-accordion/FaqAccordion'
import { StickyCta } from '../components/sticky-cta/StickyCta'
import { useFunnelNavigation } from '../../_shared/hooks/use-funnel-navigation'
import { FunnelStep } from '@funnel/domain/enums/funnel-step.enum'

export function LandingPage() {
  const { goToStep } = useFunnelNavigation()

  const handleStart = () => {
    goToStep(FunnelStep.ONBOARDING)
  }

  return (
    <FunnelLayout showHeader={false}>
      <HeroSection onStart={handleStart} />
      <FeatureHighlights />
      <SuccessStories />
      <FaqAccordion />
      <StickyCta onStart={handleStart} />

      {/* Footer CTA */}
      <section className="text-white text-center" style={{ paddingTop: '80px', paddingBottom: '80px', background: 'linear-gradient(90deg, #0A2540 0%, #355B8A 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h2 className="text-h2 text-white mb-8 !mb-12 md:!mb-6">
            ¿Listo para descubrir tu potencial?
          </h2>
          <p className="text-body text-white/70 mb-16 !mb-12 md:!mb-8">
            Miles de negocios ya conocen su Bewe Score. Es tu turno.
          </p>
          <Button
            color="primary"
            size="lg"
            radius="full"
            onPress={handleStart}
            className="px-8 py-4 animate-pulse-glow shadow-lg hover:shadow-xl"
          >
            Comenzar mi diagnóstico
          </Button>
        </div>
      </section>
    </FunnelLayout>
  )
}
