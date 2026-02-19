import { Button, IconComponent } from '@beweco/aurora-ui'
import { LindaBadge } from '../../../_shared/components/linda-badge/LindaBadge'

interface HeroSectionProps {
  onStart: () => void
}

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-6 md:px-12 text-center py-12">
        <LindaBadge text="Diagnóstico Gratuito" icon="🚀" variant="hero" />

        <h1 className="font-bold text-base-dark mt-6 mb-6 leading-[1.1] max-w-4xl mx-auto !mb-12 md:!mb-10" style={{ fontSize: '3rem' }}>
          Calculadora de <span className="text-primary-400">Crecimiento</span> e Impacto de{' '}
          <span className="text-linda" style={{ color: '#34D399' }}>IA</span>
        </h1>

        <p className="text-body text-base-dark/70 max-w-xl mx-auto !mb-12 md:!mb-16">
          Responde 11 preguntas en menos de 3 minutos y obtén un diagnóstico personalizado con{' '}
          <strong>proyecciones reales de ROI</strong> y crecimiento para tu negocio.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 !mb-12 md:!mb-10">
          <Button
            color="primary"
            size="lg"
            radius="full"
            onPress={onStart}
            className="px-8 py-4 animate-pulse-glow shadow-lg hover:shadow-xl"
          >
            Comenzar mi diagnóstico
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-24 flex flex-wrap items-center justify-center gap-8 text-small text-base-dark/50 !mb-12 md:!mb-12">
          <div className="flex items-center gap-2">
            <IconComponent icon="solar:check-circle-bold" size="md" color="var(--color-secondary-400)" />
            <span>100% gratuito</span>
          </div>
          <div className="flex items-center gap-2">
            <IconComponent icon="solar:check-circle-bold" size="md" color="var(--color-secondary-400)" />
            <span>Resultados inmediatos</span>
          </div>
          <div className="flex items-center gap-2">
            <IconComponent icon="solar:check-circle-bold" size="md" color="var(--color-secondary-400)" />
            <span>Personalizado para tu sector</span>
          </div>
        </div>
      </div>
    </section>
  )
}
