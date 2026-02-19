import { IconComponent } from '@beweco/aurora-ui'
import type { IBeweScore } from '@funnel/domain/interfaces/bewe-score.interface'

interface TeaserPreviewProps {
  beweScore: IBeweScore | null
  businessName: string
  totalLoss?: number
  currency?: string
}

export function TeaserPreview({ beweScore, businessName, totalLoss, currency = 'USD' }: TeaserPreviewProps) {
  const formatAmount = (amount: number) => {
    const symbol = currency === 'COP' ? '$' : currency === 'EUR' ? '€' : '$'
    return `${symbol}${amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
  }
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #0A2540 0%, #1B4F8A 40%, #2E8B7A 75%, #34D399 100%)',
        height: '220px',
      }}
    >
      {/* ── Simulación de la primera sección de results (detrás del blur) ── */}
      <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
        {/* Big red number — igual al hero de results */}
        <p
          className="font-black leading-none"
          style={{ fontSize: '3.5rem', color: '#F87171' }}
        >
          {totalLoss != null && totalLoss > 0
            ? `-${formatAmount(totalLoss)}`
            : beweScore != null
            ? `-${formatAmount(Math.max(beweScore.score, 10) * 280)}`
            : '-$0,000'}
        </p>
        {/* Título hero */}
        <p
          className="font-bold"
          style={{ fontSize: '1rem', color: '#ffffff', lineHeight: '140%', maxWidth: '340px' }}
        >
          Esto es lo que <strong style={{ color: '#67E8F9' }}>{businessName || 'tu negocio'}</strong> está dejando de ganar cada mes
        </p>
        {/* Hint score */}
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
          Bewe Score · {beweScore?.label ?? '...'}
        </p>
      </div>

      {/* ── Blur overlay oscuro ── */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-6"
        style={{ backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', background: 'rgba(10,37,64,0.35)' }}
      >
        <p className="text-small font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'Inter, sans-serif' }}>
          Desbloquea tu resultado completo
        </p>
        <p className="text-small text-center px-6 mb-3" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
          Completa los datos para acceder a tu diagnóstico
        </p>
        <span className="animate-bell-swing" style={{ marginBottom: '16px' }}>
          <IconComponent icon="solar:lock-keyhole-bold-duotone" size="lg" color="#60A5FA" />
        </span>
      </div>
    </div>
  )
}
