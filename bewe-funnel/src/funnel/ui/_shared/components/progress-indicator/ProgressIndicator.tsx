import { StepIndicator } from '@beweco/aurora-ui'

interface ProgressIndicatorProps {
  current: number
  total: number
  label?: string
}

export function ProgressIndicator({ current, total, label }: ProgressIndicatorProps) {
  return (
    <StepIndicator
      currentStep={current}
      totalSteps={total}
      color="primary"
      showStepText
      stepTextFormatter={label ? () => label : (c, t) => `${c} de ${t}`}
    />
  )
}
