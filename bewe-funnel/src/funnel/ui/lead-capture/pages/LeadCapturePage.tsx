import { useState } from 'react'
import { FunnelLayout } from '../../_shared/components/funnel-layout/FunnelLayout'
import { TeaserPreview } from '../components/teaser-preview/TeaserPreview'
import { LeadModal } from '../components/lead-modal/LeadModal'
import { useFunnelContext } from '../../_shared/context/funnel-context'
import { useFunnelNavigation } from '../../_shared/hooks/use-funnel-navigation'
import { FunnelStep } from '@funnel/domain/enums/funnel-step.enum'
import { captureLead } from '@funnel/application/capture-lead.usecase'
import { SupabaseLeadAdapter } from '@funnel/infrastructure/adapters/supabase-lead.adapter'
import type { LeadCaptureFormData } from '@funnel/domain/validations/lead.validation'
import {
  buildLeadCaptureWebhookPayload,
  sendLeadCaptureWebhook,
} from '@funnel/infrastructure/adapters/n8n-webhook.adapter'

const leadAdapter = new SupabaseLeadAdapter()

export function LeadCapturePage() {
  const { state, dispatch } = useFunnelContext()
  const { goToStep } = useFunnelNavigation()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: LeadCaptureFormData) => {
    setIsLoading(true)
    try {
      const diagnosticId = `diag_${Date.now()}`
      const normalizedPhone = (data.phone ?? '').replace(/^\++/, '+')
      const leadData = {
        fullName: data.fullName,
        email: data.email,
        phone: normalizedPhone,
      }

      // Disparo no bloqueante del webhook cuando el usuario confirma el formulario.
      const webhookPayload = buildLeadCaptureWebhookPayload({
        diagnosticId,
        businessConfig: state.businessConfig,
        questionnaireAnswers: state.questionnaire.answers,
        roiResult: state.roiResult,
        growthDiagnostic: state.growthDiagnostic,
        beweScore: state.beweScore,
        lead: leadData,
        leadCountry: data.phoneCountry,
        leadPhonePrefix: data.phonePrefix,
      })
      void sendLeadCaptureWebhook(webhookPayload).catch((error: unknown) => {
        console.error('Error enviando webhook de n8n:', error)
      })

      const lead = await captureLead(
        leadData,
        state.businessConfig,
        diagnosticId,
        leadAdapter,
      )
      dispatch({ type: 'SET_LEAD', payload: lead })
      goToStep(FunnelStep.RESULTS)
    } catch (error) {
      console.error('Error capturing lead:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FunnelLayout showHeader={false}>
      <div className="min-h-screen flex items-center justify-center px-6 md:px-12 py-12">
        <div className="max-w-xl w-full space-y-8">
          <TeaserPreview
            beweScore={state.beweScore}
            businessName={state.businessConfig.businessName}
            totalLoss={state.roiResult?.totalMonthlyBenefit}
            currency={state.businessConfig.currency}
          />
          <LeadModal onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </FunnelLayout>
  )
}
