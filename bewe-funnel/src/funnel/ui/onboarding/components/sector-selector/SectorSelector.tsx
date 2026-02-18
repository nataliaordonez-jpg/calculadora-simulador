import { Card, IconComponent } from '@beweco/aurora-ui'
import { Sector, SECTOR_LABELS, SECTOR_DESCRIPTIONS } from '@funnel/domain/enums/sector.enum'

interface SectorSelectorProps {
  value: Sector | null
  onChange: (sector: Sector) => void
  error?: string
}

/* Solar Icon Set — Outline (Lineal) */
const SECTOR_ICONS: Record<Sector, string> = {
  [Sector.BELLEZA]: 'solar:scissors-linear',
  [Sector.BIENESTAR]: 'solar:meditation-round-linear',
  [Sector.FITNESS]: 'solar:running-2-linear',
  [Sector.SALUD]: 'solar:heart-pulse-linear',
}

/* Orden visual: Belleza, Bienestar, Fitness, Salud */
const SECTOR_ORDER: Sector[] = [Sector.BELLEZA, Sector.BIENESTAR, Sector.FITNESS, Sector.SALUD]

export function SectorSelector({ value, onChange, error }: SectorSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-body font-medium text-base-dark">
        ¿A qué sector pertenece tu negocio?
      </label>
      <div className="grid grid-cols-2 gap-4">
        {SECTOR_ORDER.map((sector) => (
          <Card
            key={sector}
            shadow="none"
            radius="lg"
            padding="lg"
            isPressable
            onPress={() => onChange(sector)}
            className={`flex flex-col items-center text-center transition-all duration-300 ease-out cursor-pointer py-8 border-2 hover:scale-[1.03] hover:shadow-md ${
              value === sector
                ? 'border-primary-300 bg-white shadow-sm'
                : 'border-primary-100 bg-white hover:border-primary-200'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-100/30 flex items-center justify-center mb-4">
              <IconComponent
                icon={SECTOR_ICONS[sector]}
                size="lg"
                color={value === sector ? 'var(--color-primary-400)' : '#64748B'}
              />
            </div>
            <span className="text-body font-semibold text-base-dark mb-1">
              {SECTOR_LABELS[sector]}
            </span>
            <span className="text-small text-base-dark/50">
              {SECTOR_DESCRIPTIONS[sector]}
            </span>
          </Card>
        ))}
      </div>
      {error && <p className="text-small text-error">{error}</p>}
    </div>
  )
}
