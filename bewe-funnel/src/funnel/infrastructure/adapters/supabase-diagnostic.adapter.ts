import type { IBusinessConfig } from '@funnel/domain/interfaces/business-config.interface'
import type { IQuestionnaireAnswer } from '@funnel/domain/interfaces/questionnaire.interface'
import type { IROIResult } from '@funnel/domain/interfaces/roi-result.interface'
import type { IGrowthDiagnostic } from '@funnel/domain/interfaces/growth-diagnostic.interface'
import type { IBeweScore } from '@funnel/domain/interfaces/bewe-score.interface'
import { supabase, isSupabaseConfigured } from '@shared/lib/supabase-client'
import { ensureFunnelSession } from './supabase-funnel-session.adapter'

interface SaveDiagnosticSnapshotInput {
  businessConfig: IBusinessConfig
  answers: IQuestionnaireAnswer[]
  roiResult: IROIResult
  growthDiagnostic: IGrowthDiagnostic
  beweScore: IBeweScore
}

export class SupabaseDiagnosticAdapter {
  async saveDiagnosticSnapshot(input: SaveDiagnosticSnapshotInput): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) return

    const sessionId = await ensureFunnelSession()
    if (!sessionId) return

    const baseScenario = input.roiResult.scenarios.find((scenario) => scenario.type === 'base')

    const businessPayload = {
      session_id: sessionId,
      business_name: input.businessConfig.businessName,
      // La constraint actual en SQL espera valores en mayúscula.
      sector: input.businessConfig.sector.toUpperCase(),
      currency: input.businessConfig.currency,
    }

    const businessUpsert = await supabase
      .from('bf_business_profiles')
      .upsert(businessPayload, { onConflict: 'session_id' })

    if (businessUpsert.error) {
      throw new Error(`No se pudo guardar bf_business_profiles: ${businessUpsert.error.message}`)
    }

    const answersPayload = input.answers.map((answer) => ({
      session_id: sessionId,
      question_id: answer.questionId,
      question_number: answer.questionNumber,
      selected_option_id: answer.selectedOptionId,
      numeric_value: answer.numericValue,
      answer_label: null,
    }))

    if (answersPayload.length > 0) {
      const answersUpsert = await supabase
        .from('bf_question_answers')
        .upsert(answersPayload, { onConflict: 'session_id,question_id' })

      if (answersUpsert.error) {
        throw new Error(`No se pudo guardar bf_question_answers: ${answersUpsert.error.message}`)
      }
    }

    const resultPayload = {
      session_id: sessionId,
      bewe_score: input.beweScore.score,
      bewe_level: input.beweScore.level,
      bewe_label: input.beweScore.label,
      roi_total_monthly_benefit: input.roiResult.totalMonthlyBenefit,
      roi_monthly_revenue_increase: input.roiResult.monthlyRevenueIncrease,
      roi_monthly_cost_savings: input.roiResult.monthlyCostSavings,
      growth_total_monthly_gain: input.growthDiagnostic.totalMonthlyGrowthGain,
      growth_total_annual_gain: input.growthDiagnostic.totalAnnualGrowthGain,
      pillars: input.roiResult.pillars,
      scenarios: input.roiResult.scenarios,
      growth_metrics: input.growthDiagnostic.metrics,
      raw_payload: {
        businessConfig: input.businessConfig,
        answers: input.answers,
        roiResult: input.roiResult,
        growthDiagnostic: input.growthDiagnostic,
        beweScore: input.beweScore,
        baseScenario,
      },
    }

    const resultUpsert = await supabase
      .from('bf_diagnostic_results')
      .upsert(resultPayload, { onConflict: 'session_id' })

    if (resultUpsert.error) {
      throw new Error(`No se pudo guardar bf_diagnostic_results: ${resultUpsert.error.message}`)
    }
  }
}
