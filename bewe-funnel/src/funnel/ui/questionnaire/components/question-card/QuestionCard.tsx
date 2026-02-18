import { IconComponent } from '@beweco/aurora-ui'
import type { IQuestion, IQuestionOption } from '@funnel/domain/interfaces/questionnaire.interface'
import { OptionRadioGroup } from '../option-radio-group/OptionRadioGroup'
import type { Sector } from '@funnel/domain/enums/sector.enum'

interface QuestionCardProps {
  question: IQuestion
  sector: Sector
  selectedOptionId: string
  onAnswer: (optionId: string, option: IQuestionOption) => void
  questionIndex: number
  totalQuestions: number
}

/* ── Icono y color por pregunta (Solar Icon Set — Outline/Lineal) ── */
const QUESTION_ICON_MAP: Record<string, { icon: string; bgColor: string; iconColor: string }> = {
  p2:  { icon: 'solar:wallet-money-linear',          bgColor: 'bg-primary-100',     iconColor: '#60A5FA' },   /* Facturación */
  p3:  { icon: 'solar:graph-down-linear',             bgColor: 'bg-warm-yellow/40',  iconColor: '#FBBF24' },   /* Ventas perdidas */
  p4:  { icon: 'solar:clock-circle-linear',           bgColor: 'bg-cyan-light/20',   iconColor: '#67E8F9' },   /* Tiempo respuesta */
  p5:  { icon: 'solar:calendar-mark-linear',          bgColor: 'bg-primary-100',     iconColor: '#487CBB' },   /* No-Show */
  p6:  { icon: 'solar:sun-2-linear',                  bgColor: 'bg-warm-yellow/40',  iconColor: '#FBBF24' },   /* Horas atención */
  p7:  { icon: 'solar:users-group-rounded-linear',    bgColor: 'bg-primary-100',     iconColor: '#60A5FA' },   /* Clientes activos */
  p8:  { icon: 'solar:user-plus-linear',              bgColor: 'bg-warm-yellow/40',  iconColor: '#FBBF24' },   /* Clientes nuevos */
  p9:  { icon: 'solar:user-cross-linear',             bgColor: 'bg-aqua-soft/50',    iconColor: '#75C9C8' },   /* Churn */
  p10: { icon: 'solar:flag-linear',                   bgColor: 'bg-cyan-light/20',   iconColor: '#67E8F9' },   /* Desafío */
  p11: { icon: 'solar:chat-round-dots-linear',        bgColor: 'bg-primary-100',     iconColor: '#60A5FA' },   /* Conversaciones */
  p12: { icon: 'solar:users-group-two-rounded-linear', bgColor: 'bg-primary-100',    iconColor: '#487CBB' },   /* Equipo */
}

export function QuestionCard({
  question,
  sector,
  selectedOptionId,
  onAnswer,
  questionIndex,
  totalQuestions,
}: QuestionCardProps) {
  const dynamicData = question.isDynamic && question.dynamicBySector?.[sector]
  const questionText = dynamicData ? dynamicData.text : question.text
  const questionOptions = dynamicData ? dynamicData.options : question.options

  const handleChange = (optionId: string) => {
    const option = questionOptions.find((o: IQuestionOption) => o.id === optionId)
    if (option) {
      onAnswer(optionId, option)
    }
  }

  const iconData = QUESTION_ICON_MAP[question.id]

  return (
    <div className="animate-[fadeIn_400ms_ease-out]">

      {/* Icono + Título + HelpText de la pregunta */}
      <div className="flex items-start gap-4 mb-8">
        {iconData && (
          <div className={`w-12 h-12 rounded-2xl ${iconData.bgColor} flex items-center justify-center shrink-0`}>
            <IconComponent icon={iconData.icon} size="lg" color={iconData.iconColor} />
          </div>
        )}
        <div>
          <h2 className="text-h2 text-base-dark pt-1">
            {questionText}
          </h2>
          {question.helpText && (
            <p className="text-small text-base-dark/50 mt-2">{question.helpText}</p>
          )}
        </div>
      </div>

      <OptionRadioGroup
        options={questionOptions}
        value={selectedOptionId}
        onChange={handleChange}
      />

    </div>
  )
}
