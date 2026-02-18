import { Card } from '@beweco/aurora-ui'
import type { IQuestionOption } from '@funnel/domain/interfaces/questionnaire.interface'

interface OptionRadioGroupProps {
  options: IQuestionOption[]
  value: string
  onChange: (optionId: string) => void
}

export function OptionRadioGroup({ options, value, onChange }: OptionRadioGroupProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <Card
          key={option.id}
          shadow="none"
          radius="lg"
          padding="md"
          isPressable
          onPress={() => onChange(option.id)}
          className={`w-full cursor-pointer transition-all duration-200 text-left ${
            value === option.id
              ? 'border-2 border-primary-400 bg-primary-100/50 shadow-md'
              : 'border border-primary-100 hover:border-primary-300 hover:bg-primary-100/20 hover:scale-[1.02] hover:shadow-md'
          }`}
        >
          <span className="text-body text-base-dark">{option.label}</span>
        </Card>
      ))}
    </div>
  )
}
