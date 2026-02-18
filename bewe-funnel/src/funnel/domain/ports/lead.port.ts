import type { ILead, ILeadCaptureData } from '../interfaces/lead.interface'
import type { IBusinessConfig } from '../interfaces/business-config.interface'

export interface ILeadRepository {
  saveLead(lead: ILeadCaptureData, businessConfig: IBusinessConfig, diagnosticId: string): Promise<ILead>
  checkExistingClient(email: string): Promise<boolean>
}
