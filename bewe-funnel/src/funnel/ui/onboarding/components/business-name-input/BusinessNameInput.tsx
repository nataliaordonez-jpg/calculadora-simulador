import { useState } from 'react'

interface BusinessNameInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function BusinessNameInput({ value, onChange, error }: BusinessNameInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const borderClass = error
    ? 'border-error'
    : isFocused
      ? 'border-primary-300 shadow-sm'
      : 'border-primary-100 hover:border-primary-200'

  return (
    <div className="space-y-3">
      <label className="text-body font-medium text-base-dark">
        ¿Cómo se llama tu negocio?
      </label>
      <div className={`rounded-2xl border-2 bg-white transition-all duration-300 ${borderClass}`}>
        <input
          type="text"
          placeholder="Ej: Salón Glamour, FitLife Gym..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-6 py-4 text-body text-base-dark bg-transparent outline-none rounded-2xl placeholder:text-base-dark/40"
        />
      </div>
      {error && <p className="text-small text-error">{error}</p>}
    </div>
  )
}
