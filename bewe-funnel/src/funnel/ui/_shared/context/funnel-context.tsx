import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { IBusinessConfig } from '../../../domain/interfaces/business-config.interface'
import type { IQuestionnaireAnswer, IQuestionnaireState } from '../../../domain/interfaces/questionnaire.interface'
import type { IROIResult } from '../../../domain/interfaces/roi-result.interface'
import type { IGrowthDiagnostic } from '../../../domain/interfaces/growth-diagnostic.interface'
import type { IBeweScore } from '../../../domain/interfaces/bewe-score.interface'
import type { ILead } from '../../../domain/interfaces/lead.interface'
import { FunnelStep } from '../../../domain/enums/funnel-step.enum'
import { Sector } from '../../../domain/enums/sector.enum'
import { Currency } from '../../../domain/enums/currency.enum'

/* ─── State ─── */
export interface FunnelState {
  currentStep: FunnelStep
  businessConfig: IBusinessConfig
  questionnaire: IQuestionnaireState
  roiResult: IROIResult | null
  growthDiagnostic: IGrowthDiagnostic | null
  beweScore: IBeweScore | null
  lead: ILead | null
  isProcessing: boolean
  /** UUID de bf_diagnostic_results — usado para construir la URL pública /r/:shareId */
  shareId: string | null
}

const initialState: FunnelState = {
  currentStep: FunnelStep.LANDING,
  businessConfig: {
    businessName: '',
    sector: Sector.BELLEZA,
    currency: Currency.USD,
  },
  questionnaire: {
    currentQuestionIndex: 0,
    answers: [],
    isComplete: false,
    startedAt: new Date().toISOString(),
  },
  roiResult: null,
  growthDiagnostic: null,
  beweScore: null,
  lead: null,
  isProcessing: false,
  shareId: null,
}

/* ─── Actions ─── */
type FunnelAction =
  | { type: 'SET_STEP'; payload: FunnelStep }
  | { type: 'SET_BUSINESS_CONFIG'; payload: IBusinessConfig }
  | { type: 'ANSWER_QUESTION'; payload: IQuestionnaireAnswer }
  | { type: 'SET_QUESTION_INDEX'; payload: number }
  | { type: 'COMPLETE_QUESTIONNAIRE' }
  | { type: 'SET_RESULTS'; payload: { roi: IROIResult; growth: IGrowthDiagnostic; beweScore: IBeweScore } }
  | { type: 'SET_LEAD'; payload: ILead }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_SHARE_ID'; payload: string }
  | { type: 'RESET' }

function funnelReducer(state: FunnelState, action: FunnelAction): FunnelState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }

    case 'SET_BUSINESS_CONFIG':
      return { ...state, businessConfig: action.payload }

    case 'ANSWER_QUESTION': {
      const existingIndex = state.questionnaire.answers.findIndex(
        a => a.questionId === action.payload.questionId
      )
      const newAnswers = [...state.questionnaire.answers]
      if (existingIndex >= 0) {
        newAnswers[existingIndex] = action.payload
      } else {
        newAnswers.push(action.payload)
      }
      return {
        ...state,
        questionnaire: {
          ...state.questionnaire,
          answers: newAnswers,
        },
      }
    }

    case 'SET_QUESTION_INDEX':
      return {
        ...state,
        questionnaire: {
          ...state.questionnaire,
          currentQuestionIndex: action.payload,
        },
      }

    case 'COMPLETE_QUESTIONNAIRE':
      return {
        ...state,
        questionnaire: {
          ...state.questionnaire,
          isComplete: true,
          completedAt: new Date().toISOString(),
        },
      }

    case 'SET_RESULTS':
      return {
        ...state,
        roiResult: action.payload.roi,
        growthDiagnostic: action.payload.growth,
        beweScore: action.payload.beweScore,
        isProcessing: false,
      }

    case 'SET_LEAD':
      return { ...state, lead: action.payload }

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }

    case 'SET_SHARE_ID':
      return { ...state, shareId: action.payload }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

/* ─── Context ─── */
interface FunnelContextValue {
  state: FunnelState
  dispatch: React.Dispatch<FunnelAction>
}

const FunnelContext = createContext<FunnelContextValue | null>(null)

export function FunnelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(funnelReducer, initialState)

  return (
    <FunnelContext.Provider value={{ state, dispatch }}>
      {children}
    </FunnelContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFunnelContext(): FunnelContextValue {
  const ctx = useContext(FunnelContext)
  if (!ctx) {
    throw new Error('useFunnelContext must be used within a FunnelProvider')
  }
  return ctx
}
