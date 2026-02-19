import type { ILeadCaptureData, ILead } from '../domain/interfaces/lead.interface'
import type { IBusinessConfig } from '../domain/interfaces/business-config.interface'
import type { ILeadRepository } from '../domain/ports/lead.port'

export async function captureLead(
  data: ILeadCaptureData,
  config: IBusinessConfig,
  diagnosticId: string,
  repository: ILeadRepository,
): Promise<ILead> {
  return repository.saveLead(data, config, diagnosticId)
}
