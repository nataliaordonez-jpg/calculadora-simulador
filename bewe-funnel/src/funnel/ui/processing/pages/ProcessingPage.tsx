import { useState, useEffect, useRef } from 'react'
import { FunnelLayout } from '../../_shared/components/funnel-layout/FunnelLayout'
import { AnalysisLoader } from '../components/analysis-loader/AnalysisLoader'
import { ProgressMessages } from '../components/progress-messages/ProgressMessages'
import { useFunnelContext } from '../../_shared/context/funnel-context'
import { useFunnelNavigation } from '../../_shared/hooks/use-funnel-navigation'
import { FunnelStep } from '@funnel/domain/enums/funnel-step.enum'
import { runDiagnostic } from '@funnel/application/run-diagnostic.usecase'
import { SupabaseDiagnosticAdapter } from '@funnel/infrastructure/adapters/supabase-diagnostic.adapter'

const TOTAL_DURATION = 6000 // 6 seconds
const TOTAL_STEPS = 6
const diagnosticAdapter = new SupabaseDiagnosticAdapter()

export function ProcessingPage() {
  const { state, dispatch } = useFunnelContext()
  const { goToStep } = useFunnelNavigation()
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const calculatedRef = useRef(false)

  // Simulate progressive loading
  useEffect(() => {
    const stepInterval = TOTAL_DURATION / TOTAL_STEPS
    const progressInterval = 50 // Update every 50ms

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (TOTAL_DURATION / progressInterval))
        return Math.min(next, 100)
      })
    }, progressInterval)

    const messageTimer = setInterval(() => {
      setMessageIndex(prev => Math.min(prev + 1, TOTAL_STEPS - 1))
    }, stepInterval)

    return () => {
      clearInterval(progressTimer)
      clearInterval(messageTimer)
    }
  }, [])

  // Execute calculation at 50% progress, navigate at 100%
  useEffect(() => {
    if (progress >= 50 && !calculatedRef.current) {
      calculatedRef.current = true

      const result = runDiagnostic(
        state.questionnaire.answers,
        state.businessConfig,
      )

      dispatch({
        type: 'SET_RESULTS',
        payload: {
          roi: result.roi,
          growth: result.growth,
          beweScore: result.beweScore,
        },
      })

      void diagnosticAdapter.saveDiagnosticSnapshot({
        businessConfig: state.businessConfig,
        answers: state.questionnaire.answers,
        roiResult: result.roi,
        growthDiagnostic: result.growth,
        beweScore: result.beweScore,
      }).catch((error: unknown) => {
        console.error('No se pudo guardar el diagnóstico en Supabase:', error)
      })
    }

    if (progress >= 100) {
      const timeout = setTimeout(() => {
        goToStep(FunnelStep.LEAD_CAPTURE)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [progress, state.questionnaire.answers, state.businessConfig, dispatch, goToStep])

  return (
    <FunnelLayout showHeader={false}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 md:px-12">
        <AnalysisLoader progress={progress} />
        <ProgressMessages activeIndex={messageIndex} />
      </div>
    </FunnelLayout>
  )
}
