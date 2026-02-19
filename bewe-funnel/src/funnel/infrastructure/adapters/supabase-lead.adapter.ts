import type { ILead, ILeadCaptureData } from '@funnel/domain/interfaces/lead.interface'
import type { IBusinessConfig } from '@funnel/domain/interfaces/business-config.interface'
import type { ILeadRepository } from '@funnel/domain/ports/lead.port'
import { supabase, isSupabaseConfigured } from '@shared/lib/supabase-client'
import { ensureFunnelSession } from './supabase-funnel-session.adapter'

export class SupabaseLeadAdapter implements ILeadRepository {
  async saveLead(
    lead: ILeadCaptureData,
    businessConfig: IBusinessConfig,
    diagnosticId: string,
  ): Promise<ILead> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        ...lead,
        id: `lead_${Date.now()}`,
        businessName: businessConfig.businessName,
        sector: businessConfig.sector,
        currency: businessConfig.currency,
        diagnosticId,
        createdAt: new Date().toISOString(),
        isExistingClient: false,
      }
    }

    const createdAt = new Date().toISOString()
    const sessionId = await ensureFunnelSession()

    if (!sessionId) {
      throw new Error('No se pudo resolver la sesión para guardar el lead')
    }

    const existingClient = await this.checkExistingClient(lead.email)

    const { data, error } = await supabase
      .from('bf_leads')
      .insert({
        session_id: sessionId,
        full_name: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        is_existing_client: existingClient,
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`No se pudo guardar el lead en Supabase: ${error.message}`)
    }

    return {
      ...lead,
      id: data?.id ?? `lead_${Date.now()}`,
      businessName: businessConfig.businessName,
      sector: businessConfig.sector,
      currency: businessConfig.currency,
      diagnosticId: diagnosticId || sessionId,
      createdAt,
      isExistingClient: existingClient,
    }
  }

  async checkExistingClient(email: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return false

    const { data, error } = await supabase
      .from('bf_leads')
      .select('id')
      .ilike('email', email)
      .limit(1)

    if (error) return false
    return (data?.length ?? 0) > 0
  }
}
