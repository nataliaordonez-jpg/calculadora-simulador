import type { IBusinessConfig } from '@funnel/domain/interfaces/business-config.interface'
import type { IQuestionnaireAnswer } from '@funnel/domain/interfaces/questionnaire.interface'
import type { IROIResult } from '@funnel/domain/interfaces/roi-result.interface'
import type { IGrowthDiagnostic } from '@funnel/domain/interfaces/growth-diagnostic.interface'
import type { IBeweScore } from '@funnel/domain/interfaces/bewe-score.interface'
import type { ILeadCaptureData } from '@funnel/domain/interfaces/lead.interface'
import { QUESTIONS } from '@funnel/domain/constants/questions.constant'
import { getSessionToken } from './supabase-funnel-session.adapter'

const N8N_WEBHOOK_URL = 'https://tecnologiabewe.app.n8n.cloud/webhook/b2b7878e-0dbc-4603-b244-efc3e05bcf5d'

export interface LeadCaptureWebhookPayload {
  triggeredAt: string
  diagnosticId: string
  sessionToken: string
  businessConfig: IBusinessConfig
  questionnaireAnswers: WebhookQuestionAnswer[]
  roiResult: IROIResult | null
  growthDiagnostic: IGrowthDiagnostic | null
  beweScore: IBeweScore | null
  lead: ILeadCaptureData
  leadCountry: string
  leadPhonePrefix: string
}

interface WebhookQuestionAnswer {
  questionId: string
  questionCode: string
  questionNumber: number
  selectedOptionId: string
  selectedOptionLabel: string
  numericValue: number
}

interface LeadCaptureWebhookInput {
  diagnosticId: string
  businessConfig: IBusinessConfig
  questionnaireAnswers: IQuestionnaireAnswer[]
  roiResult: IROIResult | null
  growthDiagnostic: IGrowthDiagnostic | null
  beweScore: IBeweScore | null
  lead: ILeadCaptureData
  leadCountry?: string
  leadPhonePrefix?: string
}

export async function sendLeadCaptureWebhook(payload: LeadCaptureWebhookPayload): Promise<void> {
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Webhook n8n falló (${response.status}): ${body}`)
  }
}

export function buildLeadCaptureWebhookPayload(input: LeadCaptureWebhookInput): LeadCaptureWebhookPayload {
  const mappedAnswers: WebhookQuestionAnswer[] = input.questionnaireAnswers.map((answer) => {
    const question = QUESTIONS.find((q) => q.id === answer.questionId)
    const dynamicQuestionText = question?.isDynamic
      ? question.dynamicBySector?.[input.businessConfig.sector]?.text
      : undefined
    const questionText = dynamicQuestionText ?? question?.text ?? answer.questionId
    const optionLabel = question?.options.find((opt) => opt.id === answer.selectedOptionId)?.label ?? answer.selectedOptionId

    return {
      questionId: questionText,
      questionCode: answer.questionId,
      questionNumber: answer.questionNumber,
      selectedOptionId: answer.selectedOptionId,
      selectedOptionLabel: optionLabel,
      numericValue: answer.numericValue,
    }
  })

  return {
    ...input,
    questionnaireAnswers: mappedAnswers,
    triggeredAt: new Date().toISOString(),
    sessionToken: getSessionToken(),
    leadCountry: input.leadCountry ?? '',
    leadPhonePrefix: input.leadPhonePrefix ?? '',
  }
}

