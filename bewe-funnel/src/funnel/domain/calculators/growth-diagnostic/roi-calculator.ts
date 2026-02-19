import type { IROIResult, IPillarResult, IScenario } from '../../interfaces/roi-result.interface'
import type { IQuestionnaireAnswer } from '../../interfaces/questionnaire.interface'
import type { IBusinessConfig } from '../../interfaces/business-config.interface'
import { Sector } from '../../enums/sector.enum'
import { ScenarioType } from '../../enums/scenario-type.enum'
import {
  DEFLECTION_RATES,
  RECOVERY_RATES,
  AGENT_COST_PER_HOUR,
  SCENARIO_MULTIPLIERS,
  CSAT_BY_SCENARIO,
  ROI_LIMITS,
  AVERAGE_HANDLING_TIME,
  PRODUCTIVITY_GAIN,
  WORKING_DAYS,
  MONTHLY_INVESTMENT_USD,
  CONVERSION_RATE_BASELINE,
} from '../../constants/sector-rates.constant'
import { convertToUSD } from '../../helpers/currency.helper'

/* ═══════════════════════════════════════════
   CALCULADORA ROI — 4 Pilares
   Fuente: formulas calculadora y simulador.md
   ═══════════════════════════════════════════ */

interface CalculatorInputs {
  sector: Sector
  facturacionMensual: number      // P2 valor numérico en moneda local
  unansweredPercentage: number    // P3 como decimal (0.03, 0.10, etc.)
  businessHours: number           // P6
  clientesMensuales: number       // P7
  conversacionesMensuales: number // P11
  empleados: number               // P12
  currency: IBusinessConfig['currency']
}

function extractInputs(answers: IQuestionnaireAnswer[], config: IBusinessConfig): CalculatorInputs {
  const findAnswer = (questionId: string) =>
    answers.find(a => a.questionId === questionId)

  const p2 = findAnswer('p2')?.numericValue ?? 4000
  const p3 = findAnswer('p3')?.numericValue ?? 0.10
  const p6 = findAnswer('p6')?.numericValue ?? 8
  const p7 = findAnswer('p7')?.numericValue ?? 100
  const p11 = findAnswer('p11')?.numericValue ?? 300
  const p12 = findAnswer('p12')?.numericValue ?? 2

  return {
    sector: config.sector,
    facturacionMensual: p2,
    unansweredPercentage: p3,
    businessHours: p6,
    clientesMensuales: p7,
    conversacionesMensuales: p11,
    empleados: p12,
    currency: config.currency,
  }
}

function getSectorKey(sector: Sector): Sector | 'default' {
  if (Object.values(Sector).includes(sector)) return sector
  return 'default'
}

/* ─── Pilar 1: Ahorro por Deflexión ─── */
function calculateDeflection(inputs: CalculatorInputs, scenario: ScenarioType): IPillarResult {
  const sectorKey = getSectorKey(inputs.sector)
  const deflectionRate = DEFLECTION_RATES[sectorKey][scenario]
  const costPerHour = AGENT_COST_PER_HOUR[sectorKey][scenario]

  const monthlyAmount = inputs.conversacionesMensuales * deflectionRate * AVERAGE_HANDLING_TIME * costPerHour

  return {
    pillarName: 'Ahorro por Deflexión',
    pillarKey: 'deflection',
    monthlyAmount,
    description: 'La IA resuelve consultas sin necesidad de un humano',
    formula: `${inputs.conversacionesMensuales} × ${(deflectionRate * 100).toFixed(0)}% × ${AVERAGE_HANDLING_TIME}h × $${costPerHour}/h`,
  }
}

/* ─── Pilar 2: Ingresos por Recuperación ─── */
function calculateRecovery(inputs: CalculatorInputs, scenario: ScenarioType): IPillarResult {
  const sectorKey = getSectorKey(inputs.sector)
  const recoveryRate = RECOVERY_RATES[sectorKey][scenario]
  const ticketPromedioUSD = convertToUSD(
    inputs.facturacionMensual / inputs.clientesMensuales,
    inputs.currency
  )

  const unansweredChats = inputs.conversacionesMensuales * inputs.unansweredPercentage
  const recoveredChats = unansweredChats * recoveryRate
  const monthlyAmount = recoveredChats * CONVERSION_RATE_BASELINE * ticketPromedioUSD

  return {
    pillarName: 'Ingresos por Recuperación',
    pillarKey: 'recovery',
    monthlyAmount,
    description: 'Re-contactar chats que se perdieron porque nadie respondió',
    formula: `${unansweredChats.toFixed(0)} chats × ${(recoveryRate * 100).toFixed(0)}% rec. × ${(CONVERSION_RATE_BASELINE * 100).toFixed(0)}% conv. × $${ticketPromedioUSD.toFixed(2)}`,
  }
}

/* ─── Pilar 3: Ingresos por Velocidad ─── */
function calculateSpeed(inputs: CalculatorInputs, scenario: ScenarioType): IPillarResult {
  const factorVelocidad = SCENARIO_MULTIPLIERS[scenario].conversion
  const ticketPromedioUSD = convertToUSD(
    inputs.facturacionMensual / inputs.clientesMensuales,
    inputs.currency
  )

  const improvedConversion = CONVERSION_RATE_BASELINE * factorVelocidad
  const monthlyAmount = inputs.conversacionesMensuales * ticketPromedioUSD * (improvedConversion - CONVERSION_RATE_BASELINE)

  return {
    pillarName: 'Ingresos por Velocidad',
    pillarKey: 'speed',
    monthlyAmount,
    description: 'Responder más rápido aumenta las conversiones',
    formula: `${inputs.conversacionesMensuales} conv. × $${ticketPromedioUSD.toFixed(2)} × (${(improvedConversion * 100).toFixed(1)}% - ${(CONVERSION_RATE_BASELINE * 100).toFixed(0)}%)`,
  }
}

/* ─── Pilar 4: Ahorro por Productividad ─── */
function calculateProductivity(inputs: CalculatorInputs, scenario: ScenarioType): IPillarResult {
  const sectorKey = getSectorKey(inputs.sector)
  const costPerHour = AGENT_COST_PER_HOUR[sectorKey][scenario]

  const currentAgentHours = inputs.empleados * inputs.businessHours * WORKING_DAYS
  const savedHours = currentAgentHours * PRODUCTIVITY_GAIN
  const monthlyAmount = savedHours * costPerHour

  return {
    pillarName: 'Ahorro por Productividad',
    pillarKey: 'productivity',
    monthlyAmount,
    description: 'Los agentes trabajan más eficientemente con ayuda de IA',
    formula: `${inputs.empleados} emp. × ${inputs.businessHours}h × ${WORKING_DAYS} días × ${(PRODUCTIVITY_GAIN * 100).toFixed(0)}% × $${costPerHour}/h`,
  }
}

/* ─── Quality Multiplier ─── */
function getQualityMultiplier(sector: Sector, scenario: ScenarioType): number {
  const sectorKey = getSectorKey(sector)
  const deflectionRate = DEFLECTION_RATES[sectorKey][scenario]
  const escalationRate = 1 - deflectionRate
  const csat = CSAT_BY_SCENARIO[scenario]

  if (escalationRate < 0.15 && csat >= 4.2) return 1.03
  if (escalationRate < 0.25 && csat >= 3.8) return 0.98
  if (escalationRate < 0.35 && csat >= 3.5) return 0.92
  return 0.85
}

/* ─── Calcular Escenario Completo ─── */
function calculateScenario(inputs: CalculatorInputs, scenario: ScenarioType): {
  pillars: IPillarResult[]
  scenarioResult: IScenario
} {
  const deflection = calculateDeflection(inputs, scenario)
  const recovery = calculateRecovery(inputs, scenario)
  const speed = calculateSpeed(inputs, scenario)
  const productivity = calculateProductivity(inputs, scenario)

  const pillars = [deflection, recovery, speed, productivity]

  const monthlyRevenueIncrease = recovery.monthlyAmount + speed.monthlyAmount
  const monthlyCostSavings = deflection.monthlyAmount + productivity.monthlyAmount

  const qualityMultiplier = getQualityMultiplier(inputs.sector, scenario)
  const adjustedRevenue = monthlyRevenueIncrease * qualityMultiplier
  const adjustedSavings = monthlyCostSavings * qualityMultiplier

  const monthlyBenefit = adjustedRevenue + adjustedSavings
  const rawROI = ((monthlyBenefit - MONTHLY_INVESTMENT_USD) / MONTHLY_INVESTMENT_USD) * 100
  const limits = ROI_LIMITS[scenario]
  const clampedROI = Math.min(limits.max, Math.max(limits.min, rawROI))

  const labels: Record<ScenarioType, string> = {
    pessimistic: 'Conservador',
    base: 'Base',
    optimistic: 'Optimista',
  }

  return {
    pillars,
    scenarioResult: {
      type: scenario,
      label: labels[scenario],
      monthlyBenefit,
      roiPercentage: clampedROI,
      revenueIncrease: adjustedRevenue,
      costSavings: adjustedSavings,
    },
  }
}

/* ═══ FUNCIÓN PRINCIPAL ═══ */
export function calculateROI(
  answers: IQuestionnaireAnswer[],
  config: IBusinessConfig,
): IROIResult {
  const inputs = extractInputs(answers, config)
  const ticketPromedio = convertToUSD(
    inputs.facturacionMensual / inputs.clientesMensuales,
    inputs.currency
  )

  const pessimistic = calculateScenario(inputs, ScenarioType.PESSIMISTIC)
  const base = calculateScenario(inputs, ScenarioType.BASE)
  const optimistic = calculateScenario(inputs, ScenarioType.OPTIMISTIC)

  // Usamos los pilares del escenario base para el desglose
  const basePillars = base.pillars

  const monthlyRevenueIncrease = base.scenarioResult.revenueIncrease
  const monthlyCostSavings = base.scenarioResult.costSavings

  return {
    pillars: basePillars,
    totalMonthlyBenefit: base.scenarioResult.monthlyBenefit,
    monthlyRevenueIncrease,
    monthlyCostSavings,
    scenarios: [
      pessimistic.scenarioResult,
      base.scenarioResult,
      optimistic.scenarioResult,
    ],
    ticketPromedio,
  }
}
