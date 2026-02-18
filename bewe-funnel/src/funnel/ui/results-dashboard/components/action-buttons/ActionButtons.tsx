import { Button, IconComponent } from '@beweco/aurora-ui'

interface ActionButtonsProps {
  onShare: () => void
  onScheduleDemo: () => void
}

export function ActionButtons({ onShare, onScheduleDemo }: ActionButtonsProps) {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{
        background: 'linear-gradient(135deg, #487CBB 0%, #60A5FA 40%, #88BCFB 100%)',
      }}
    >
      <h2 className="text-h2 text-white mb-3">
        ¿Quieres activar este potencial?
      </h2>
      <p className="text-body text-white/70 mb-8 max-w-lg mx-auto">
        Agenda una demo personalizada con nuestro equipo y descubre cómo Bewe puede transformar tu negocio
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          color="secondary"
          size="lg"
          radius="full"
          onPress={onScheduleDemo}
          className="px-8 shadow-lg animate-heartbeat"
          startContent={
            <IconComponent icon="solar:calendar-mark-linear" size="sm" color="#fff" />
          }
        >
          Agendar demo gratuita
        </Button>
        <Button
          variant="bordered"
          size="lg"
          radius="full"
          onPress={onShare}
          className="px-8 border-white text-white hover:bg-white/10"
          startContent={
            <IconComponent icon="solar:share-linear" size="sm" color="#fff" />
          }
        >
          Compartir mi resultado
        </Button>
      </div>
    </div>
  )
}
