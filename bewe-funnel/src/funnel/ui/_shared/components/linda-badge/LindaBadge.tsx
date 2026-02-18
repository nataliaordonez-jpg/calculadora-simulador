import { Chip } from '@beweco/aurora-ui'
import type { ReactNode } from 'react'

interface LindaBadgeProps {
  text?: string
  icon?: ReactNode
  variant?: 'default' | 'accent' | 'hero'
}

export function LindaBadge({ text = 'Powered by Linda IA', icon, variant = 'default' }: LindaBadgeProps) {
  /* ── Variante "hero": píldora grande estilo landing ── */
  if (variant === 'hero') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-6 py-3 shadow-sm">
        {icon && <span className="text-xl animate-float">{icon}</span>}
        <span className="text-button font-semibold text-primary-600 tracking-wide">
          {text}
        </span>
      </span>
    )
  }

  /* ── Variante accent: fondo verde suave + punto verde (Linda) ── */
  if (variant === 'accent') {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 shadow-sm"
        style={{ backgroundColor: '#D6F6EB' }}
      >
        {icon ?? (
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: '#34D399' }}
          />
        )}
        <span className="text-linda font-medium" style={{ color: '#0A2540' }}>
          {text}
        </span>
      </span>
    )
  }

  /* ── Variante default usando Chip de Aurora ── */
  return (
    <Chip
      color="primary"
      variant="flat"
      size="sm"
      startContent={
        icon ?? <span className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse" />
      }
      classNames={{
        content: 'text-linda font-medium',
      }}
    >
      {text}
    </Chip>
  )
}
