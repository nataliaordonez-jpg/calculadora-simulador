import type { ScenarioType } from '../enums/scenario-type.enum'

export interface IPillarResult {
  pillarName: string
  pillarKey: 'deflection' | 'recovery' | 'speed' | 'productivity'
  monthlyAmount: number
  description: string
  formula: string
}

export interface IScenario {
  type: ScenarioType
  label: string
  monthlyBenefit: number
  roiPercentage: number
  revenueIncrease: number
  costSavings: number
}

export interface IROIResult {
  pillars: IPillarResult[]
  totalMonthlyBenefit: number
  monthlyRevenueIncrease: number
  monthlyCostSavings: number
  scenarios: IScenario[]
  ticketPromedio: number
}
