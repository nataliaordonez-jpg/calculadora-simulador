interface AnalysisLoaderProps {
  progress: number // 0-100
}

export function AnalysisLoader({ progress }: AnalysisLoaderProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Animated circle */}
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="var(--color-primary-100)"
            strokeWidth="6"
          />
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="var(--color-primary-400)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-h2 text-primary-400">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}
