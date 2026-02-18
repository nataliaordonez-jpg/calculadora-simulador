import type { Sector } from '../enums/sector.enum'

export interface IQuestionOption {
  id: string
  label: string
  value: string
  numericValue: number // Punto medio parseado del rango
}

export interface IQuestion {
  id: string
  number: number // P1-P11
  text: string
  helpText: string
  impactLevel: 'maximo' | 'muy_alto' | 'alto' | 'medio' | 'config'
  options: IQuestionOption[]
  isDynamic: boolean // true si cambia según sector
  dynamicBySector?: Partial<Record<Sector, {
    text: string
    options: IQuestionOption[]
  }>>
  category: 'calculator' | 'diagnostic' // ROI calculator vs Growth diagnostic
}

export interface IQuestionnaireAnswer {
  questionId: string
  questionNumber: number
  selectedOptionId: string
  numericValue: number
}

export interface IQuestionnaireState {
  currentQuestionIndex: number
  answers: IQuestionnaireAnswer[]
  isComplete: boolean
  startedAt: string
  completedAt?: string
}
