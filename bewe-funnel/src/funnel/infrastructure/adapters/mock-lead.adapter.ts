import type { ILead, ILeadCaptureData } from '../../domain/interfaces/lead.interface'
import type { IBusinessConfig } from '../../domain/interfaces/business-config.interface'
import type { ILeadRepository } from '../../domain/ports/lead.port'

export class MockLeadAdapter implements ILeadRepository {
  async saveLead(
    lead: ILeadCaptureData,
    businessConfig: IBusinessConfig,
    diagnosticId: string,
  ): Promise<ILead> {
    // Simula un guardado con delay
    await new Promise(resolve => setTimeout(resolve, 800))

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

  async checkExistingClient(_email: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return false
  }
}
