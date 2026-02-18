export interface ILeadCaptureData {
  fullName: string
  email: string
  phone: string
}

export interface ILead extends ILeadCaptureData {
  id: string
  businessName: string
  sector: string
  currency: string
  diagnosticId: string
  createdAt: string
  isExistingClient: boolean
}
