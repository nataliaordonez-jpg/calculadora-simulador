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

export interface SharedDiagnosticPayload {
  businessConfig: IBusinessConfig
  answers: IQuestionnaireAnswer[]
  roiResult: IROIResult
  growthDiagnostic: IGrowthDiagnostic
  beweScore: IBeweScore
}

export class SupabaseDiagnosticAdapter {
  /**
   * Guarda el snapshot del diagnóstico y retorna el shareId (UUID único del resultado).
   * Este ID se usa para construir la URL pública /r/:shareId.
   */
  async saveDiagnosticSnapshot(input: SaveDiagnosticSnapshotInput): Promise<string | null> {
    console.log('[Diagnostic] isSupabaseConfigured:', isSupabaseConfigured())
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('[Diagnostic] Supabase no configurado — revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local')
      return null
    }

    const sessionId = await ensureFunnelSession()
    console.log('[Diagnostic] sessionId:', sessionId)
    if (!sessionId) {
      console.warn('[Diagnostic] No se pudo obtener sessionId')
      return null
    }

    const baseScenario = input.roiResult.scenarios.find((scenario) => scenario.type === 'base')

    const businessPayload = {
      session_id: sessionId,
      business_name: input.businessConfig.businessName,
      sector: input.businessConfig.sector.toUpperCase(),
      currency: input.businessConfig.currency,
    }

    const businessUpsert = await supabase
      .from('bf_business_profiles')
      .upsert(businessPayload, { onConflict: 'session_id' })

    if (businessUpsert.error) {
      console.error('[Diagnostic] Error en bf_business_profiles:', businessUpsert.error)
      throw new Error(`No se pudo guardar bf_business_profiles: ${businessUpsert.error.message}`)
    }
    console.log('[Diagnostic] bf_business_profiles OK')

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
        console.error('[Diagnostic] Error en bf_question_answers:', answersUpsert.error)
        throw new Error(`No se pudo guardar bf_question_answers: ${answersUpsert.error.message}`)
      }
      console.log('[Diagnostic] bf_question_answers OK')
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

    // 1) Upsert sin .select() para evitar el bug de PostgREST con RETURNING en UPDATEs
    const resultUpsert = await supabase
      .from('bf_diagnostic_results')
      .upsert(resultPayload, { onConflict: 'session_id' })

    if (resultUpsert.error) {
      console.error('[Diagnostic] Error en bf_diagnostic_results upsert:', resultUpsert.error)
      console.error('[Diagnostic] Payload enviado:', {
        session_id: resultPayload.session_id,
        bewe_score: resultPayload.bewe_score,
        bewe_level: resultPayload.bewe_level,
        bewe_label: resultPayload.bewe_label,
      })
      throw new Error(`No se pudo guardar bf_diagnostic_results: ${resultUpsert.error.message}`)
    }
    console.log('[Diagnostic] bf_diagnostic_results upsert OK')

    // 2) SELECT separado para obtener el id — funciona tanto en INSERT como en UPDATE
    const resultSelect = await supabase
      .from('bf_diagnostic_results')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    console.log('[Diagnostic] SELECT id result:', resultSelect.data, 'error:', resultSelect.error)

    if (resultSelect.error || !resultSelect.data?.id) {
      console.error('[Diagnostic] No se pudo obtener el id:', resultSelect.error)
      throw new Error(`No se pudo obtener el id de bf_diagnostic_results: ${resultSelect.error?.message ?? 'sin datos'}`)
    }

    console.log('[Diagnostic] shareId obtenido:', resultSelect.data.id)
    // Retorna el UUID del registro — es el shareId para la URL pública /r/:id
    return resultSelect.data.id as string
  }

  /**
   * Carga un diagnóstico guardado por su shareId (UUID de bf_diagnostic_results).
   * Usado por SharedResultsPage para renderizar resultados compartidos.
   */
  async getByShareId(shareId: string): Promise<SharedDiagnosticPayload | null> {
    if (!isSupabaseConfigured() || !supabase) return null

    const { data, error } = await supabase
      .from('bf_diagnostic_results')
      .select('raw_payload')
      .eq('id', shareId)
      .single()

    if (error || !data?.raw_payload) return null

    const payload = data.raw_payload as SharedDiagnosticPayload
    return payload
  }
}
