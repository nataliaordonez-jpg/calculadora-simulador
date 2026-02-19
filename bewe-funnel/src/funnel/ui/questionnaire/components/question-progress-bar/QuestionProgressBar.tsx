interface QuestionProgressBarProps {
  current: number
  total: number
}

export function QuestionProgressBar({ current, total }: QuestionProgressBarProps) {
  const completedPercent = Math.round(((current + 1) / total) * 100)
  const progressWidth = ((current + 1) / total) * 100

  return (
    <div>
      {/* Textos arriba de la barra */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-small text-base-dark/50">
          Pregunta {current + 1} de {total}
        </span>
        <span className="text-small font-semibold text-primary-400">
          {completedPercent}% completado
        </span>
      </div>

      {/* Barra de progreso con degradé */}
      <div className="w-full h-2 rounded-full bg-primary-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progressWidth}%`,
            background: 'linear-gradient(90deg, #355B8A 0%, #60A5FA 50%, #B0D2FC 100%)',
          }}
        />
      </div>
    </div>
  )
}
