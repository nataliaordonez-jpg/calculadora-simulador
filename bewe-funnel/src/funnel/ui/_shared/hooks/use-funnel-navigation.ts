import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFunnelContext } from '../context/funnel-context'
import { FunnelStep, FUNNEL_STEP_ORDER } from '../../../domain/enums/funnel-step.enum'

const STEP_ROUTES: Record<FunnelStep, string> = {
  [FunnelStep.LANDING]: '/',
  [FunnelStep.ONBOARDING]: '/onboarding',
  [FunnelStep.QUESTIONNAIRE]: '/questionnaire',
  [FunnelStep.PROCESSING]: '/processing',
  [FunnelStep.LEAD_CAPTURE]: '/lead-capture',
  [FunnelStep.RESULTS]: '/results',
  [FunnelStep.SHARE]: '/share',
}

export function useFunnelNavigation() {
  const { state, dispatch } = useFunnelContext()
  const navigate = useNavigate()

  const goToStep = useCallback((step: FunnelStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
    navigate(STEP_ROUTES[step])
  }, [dispatch, navigate])

  const goToNext = useCallback(() => {
    const currentIndex = FUNNEL_STEP_ORDER.indexOf(state.currentStep)
    if (currentIndex < FUNNEL_STEP_ORDER.length - 1) {
      const nextStep = FUNNEL_STEP_ORDER[currentIndex + 1]
      goToStep(nextStep)
    }
  }, [state.currentStep, goToStep])

  const goToPrevious = useCallback(() => {
    const currentIndex = FUNNEL_STEP_ORDER.indexOf(state.currentStep)
    if (currentIndex > 0) {
      const prevStep = FUNNEL_STEP_ORDER[currentIndex - 1]
      goToStep(prevStep)
    }
  }, [state.currentStep, goToStep])

  const progress = FUNNEL_STEP_ORDER.indexOf(state.currentStep) / (FUNNEL_STEP_ORDER.length - 1)

  return { goToStep, goToNext, goToPrevious, currentStep: state.currentStep, progress }
}
