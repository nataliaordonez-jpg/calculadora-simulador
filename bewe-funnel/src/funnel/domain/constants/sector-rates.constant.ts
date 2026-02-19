import { Sector } from '../enums/sector.enum'
import { ScenarioType } from '../enums/scenario-type.enum'

/* ─── Tasas de Deflexión por Sector y Escenario ─── */
export const DEFLECTION_RATES: Record<Sector | 'default', Record<ScenarioType, number>> = {
  [Sector.BELLEZA]:   { pessimistic: 0.25, base: 0.30, optimistic: 0.35 },
  [Sector.SALUD]:     { pessimistic: 0.20, base: 0.25, optimistic: 0.30 },
  [Sector.FITNESS]:   { pessimistic: 0.35, base: 0.42, optimistic: 0.50 },
  [Sector.BIENESTAR]: { pessimistic: 0.25, base: 0.30, optimistic: 0.40 },
  default:            { pessimistic: 0.25, base: 0.30, optimistic: 0.40 },
}

/* ─── Tasas de Recuperación por Sector y Escenario ─── */
export const RECOVERY_RATES: Record<Sector | 'default', Record<ScenarioType, number>> = {
  [Sector.BELLEZA]:   { pessimistic: 0.45, base: 0.55, optimistic: 0.70 },
  [Sector.SALUD]:     { pessimistic: 0.50, base: 0.60, optimistic: 0.75 },
  [Sector.FITNESS]:   { pessimistic: 0.35, base: 0.45, optimistic: 0.60 },
  [Sector.BIENESTAR]: { pessimistic: 0.40, base: 0.50, optimistic: 0.65 },
  default:            { pessimistic: 0.40, base: 0.50, optimistic: 0.65 },
}

/* ─── Costo por Hora del Agente (USD) ─── */
export const AGENT_COST_PER_HOUR: Record<Sector | 'default', Record<ScenarioType, number>> = {
  [Sector.BELLEZA]:   { pessimistic: 18, base: 22, optimistic: 26 },
  [Sector.SALUD]:     { pessimistic: 22, base: 26, optimistic: 32 },
  [Sector.FITNESS]:   { pessimistic: 15, base: 18, optimistic: 22 },
  [Sector.BIENESTAR]: { pessimistic: 16, base: 20, optimistic: 24 },
  default:            { pessimistic: 16, base: 20, optimistic: 24 },
}

/* ─── Multiplicadores por Escenario ─── */
export const SCENARIO_MULTIPLIERS: Record<ScenarioType, {
  conversion: number
  productivity: number
  costReduction: number
}> = {
  pessimistic: { conversion: 1.15, productivity: 1.15, costReduction: 0.85 },
  base:        { conversion: 1.35, productivity: 1.15, costReduction: 1.00 },
  optimistic:  { conversion: 1.65, productivity: 1.15, costReduction: 1.20 },
}

/* ─── CSAT por Escenario ─── */
export const CSAT_BY_SCENARIO: Record<ScenarioType, number> = {
  pessimistic: 3.5,
  base: 3.8,
  optimistic: 4.2,
}

/* ─── ROI Limits por Escenario ─── */
export const ROI_LIMITS: Record<ScenarioType, { min: number; max: number }> = {
  pessimistic: { min: 50, max: 150 },
  base:        { min: 100, max: 250 },
  optimistic:  { min: 200, max: 400 },
}

/* ─── Constantes Fijas ─── */
export const AVERAGE_HANDLING_TIME = 0.33  // 20 min en horas
export const PRODUCTIVITY_GAIN = 0.15      // 15%
export const WORKING_DAYS = 22
export const MONTHLY_INVESTMENT_USD = 150
export const CONVERSION_RATE_BASELINE = 0.15 // 15% de BD benchmarks
