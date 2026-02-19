import type { Sector } from '../enums/sector.enum'
import type { Currency } from '../enums/currency.enum'

export interface IBusinessConfig {
  businessName: string
  sector: Sector
  currency: Currency
}
