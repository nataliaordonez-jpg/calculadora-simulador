import type { Sector } from '../enums/sector.enum'

export interface IGrowthMetric {
  metricKey: string
  label: string
  currentValue: number
  projectedValue: number
  improvement: number
  monthlyGain: number
  unit: 'percentage' | 'clients' | 'currency' | 'sessions'
}

export interface IGrowthDiagnostic {
  sector: Sector
  metrics: IGrowthMetric[]
  totalMonthlyGrowthGain: number
  totalAnnualGrowthGain: number
}
