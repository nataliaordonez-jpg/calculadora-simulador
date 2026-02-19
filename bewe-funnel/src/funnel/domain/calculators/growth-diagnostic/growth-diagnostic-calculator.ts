import type { IGrowthDiagnostic, IGrowthMetric } from '../../interfaces/growth-diagnostic.interface'
import type { IQuestionnaireAnswer } from '../../interfaces/questionnaire.interface'
import type { IBusinessConfig } from '../../interfaces/business-config.interface'
import { Sector } from '../../enums/sector.enum'
import {
  DIGITALIZACION_DESDE_P4,
  MEJORA_ADQUISICION,
  NO_SHOW_ACTUAL_BELLEZA, MEJORA_NO_SHOW_BELLEZA,
  NO_SHOW_PORCENTAJE_SALUD, MEJORA_NO_SHOW_SALUD,
  NO_SHOW_PORCENTAJE_BIENESTAR, MEJORA_NO_SHOW_BIENESTAR,
  CHURN_ACTUAL_BELLEZA, CHURN_MEJORA_BELLEZA,
  CHURN_PORCENTAJE_SALUD, MEJORA_CHURN_SALUD,
  CHURN_PORCENTAJE_FITNESS, MEJORA_CHURN_FITNESS,
  CHURN_PORCENTAJE_BIENESTAR, MEJORA_CHURN_BIENESTAR,
  SESIONES_PROMEDIO_SALUD, MEJORA_ADHERENCIA_SALUD,
  MEJORA_UPSELLS_FITNESS, PORCENTAJE_UPSELLS_BASE,
} from '../../constants/diagnostic-constants.constant'
import type { DigitalizationLevel } from '../../constants/diagnostic-constants.constant'

/* ═══════════════════════════════════════════
   DIAGNÓSTICO DE CRECIMIENTO por Sector
   Fuente: formulas calculadora y simulador.md
   ═══════════════════════════════════════════ */

interface DiagnosticInputs {
  sector: Sector
  facturacionMensual: number // P2
  p4OptionId: string         // Para inferir digitalización
  p5OptionId: string         // No-show
  clientesMensuales: number  // P7
  clientesNuevos: number     // P8
  p9OptionId: string         // Churn
}

function extractDiagInputs(answers: IQuestionnaireAnswer[], config: IBusinessConfig): DiagnosticInputs {
  const find = (qId: string) => answers.find(a => a.questionId === qId)

  return {
    sector: config.sector,
    facturacionMensual: find('p2')?.numericValue ?? 4000,
    p4OptionId: find('p4')?.selectedOptionId ?? 'p4_opt3',
    p5OptionId: find('p5')?.selectedOptionId ?? 'p5_opt2',
    clientesMensuales: find('p7')?.numericValue ?? 100,
    clientesNuevos: find('p8')?.numericValue ?? 20,
    p9OptionId: find('p9')?.selectedOptionId ?? 'p9_opt2',
  }
}

function getDigitalization(p4Id: string): DigitalizationLevel {
  return DIGITALIZACION_DESDE_P4[p4Id] ?? 'poco_digital'
}

/* ─── Belleza ─── */
function diagnosticoBelleza(inputs: DiagnosticInputs): IGrowthMetric[] {
  const metrics: IGrowthMetric[] = []
  const ticket = inputs.facturacionMensual / inputs.clientesMensuales
  const dig = getDigitalization(inputs.p4OptionId)

  // Churn
  const churnActual = CHURN_ACTUAL_BELLEZA[inputs.p9OptionId] ?? 0.65
  const churnMejora = CHURN_MEJORA_BELLEZA[inputs.p9OptionId] ?? 0.90
  const churnNuevo = churnActual * churnMejora
  const perdidosActual = inputs.clientesMensuales * (1 - churnActual)
  const perdidosNuevo = inputs.clientesMensuales * (1 - churnNuevo)
  const retenidos = perdidosActual - perdidosNuevo
  const gananciaChurn = Math.abs(retenidos) * ticket

  metrics.push({
    metricKey: 'churn_reduction',
    label: 'Reducción de Abandono',
    currentValue: (1 - churnActual) * 100,
    projectedValue: (1 - churnNuevo) * 100,
    improvement: ((1 - churnMejora) * 100),
    monthlyGain: gananciaChurn,
    unit: 'percentage',
  })

  // Adquisición
  const mejoraAdq = MEJORA_ADQUISICION[Sector.BELLEZA][dig]
  const clientesAdicionales = inputs.clientesNuevos * (mejoraAdq - 1)
  const gananciaAdq = clientesAdicionales * ticket

  metrics.push({
    metricKey: 'acquisition',
    label: 'Nuevos Clientes Adicionales',
    currentValue: inputs.clientesNuevos,
    projectedValue: inputs.clientesNuevos + clientesAdicionales,
    improvement: (mejoraAdq - 1) * 100,
    monthlyGain: gananciaAdq,
    unit: 'clients',
  })

  // No-Show
  const noShowActual = NO_SHOW_ACTUAL_BELLEZA[inputs.p5OptionId] ?? 0.90
  const mejoraNoShow = MEJORA_NO_SHOW_BELLEZA[inputs.p5OptionId] ?? 0.30
  const noShowNuevo = noShowActual * (1 - mejoraNoShow)

  metrics.push({
    metricKey: 'no_show',
    label: 'Reducción de No-Show',
    currentValue: (1 - noShowActual) * 100,
    projectedValue: (1 - noShowNuevo) * 100,
    improvement: mejoraNoShow * 100,
    monthlyGain: 0,
    unit: 'percentage',
  })

  return metrics
}

/* ─── Salud ─── */
function diagnosticoSalud(inputs: DiagnosticInputs): IGrowthMetric[] {
  const metrics: IGrowthMetric[] = []
  const ticket = inputs.facturacionMensual / inputs.clientesMensuales
  const dig = getDigitalization(inputs.p4OptionId)

  // Churn
  const churnActual = CHURN_PORCENTAJE_SALUD[inputs.p9OptionId] ?? 0.075
  const mejoraChurn = MEJORA_CHURN_SALUD[inputs.p9OptionId] ?? 0.85
  const churnNuevo = churnActual * mejoraChurn
  const pacientesAbActual = inputs.clientesMensuales * churnActual
  const pacientesAbNuevo = inputs.clientesMensuales * churnNuevo
  const retenidos = pacientesAbActual - pacientesAbNuevo
  const gananciaChurn = retenidos * ticket

  metrics.push({
    metricKey: 'churn_reduction',
    label: 'Retención de Pacientes',
    currentValue: churnActual * 100,
    projectedValue: churnNuevo * 100,
    improvement: (1 - mejoraChurn) * 100,
    monthlyGain: gananciaChurn,
    unit: 'percentage',
  })

  // Adquisición
  const mejoraAdq = MEJORA_ADQUISICION[Sector.SALUD][dig]
  const pacientesAdicionales = inputs.clientesNuevos * (mejoraAdq - 1)
  const gananciaAdq = pacientesAdicionales * ticket

  metrics.push({
    metricKey: 'acquisition',
    label: 'Nuevos Pacientes Adicionales',
    currentValue: inputs.clientesNuevos,
    projectedValue: inputs.clientesNuevos + pacientesAdicionales,
    improvement: (mejoraAdq - 1) * 100,
    monthlyGain: gananciaAdq,
    unit: 'clients',
  })

  // Adherencia
  const sesionesPromedio = SESIONES_PROMEDIO_SALUD[inputs.p9OptionId] ?? 3.0
  const mejoraAdherencia = MEJORA_ADHERENCIA_SALUD[dig]
  const sesionesNuevas = sesionesPromedio * mejoraAdherencia
  const sesionesAdicionales = sesionesNuevas - sesionesPromedio
  const sesionesTotalesMes = inputs.clientesMensuales * sesionesPromedio
  const ticketSesion = inputs.facturacionMensual / sesionesTotalesMes
  const gananciaAdherencia = inputs.clientesMensuales * sesionesAdicionales * ticketSesion

  metrics.push({
    metricKey: 'adherence',
    label: 'Adherencia al Tratamiento',
    currentValue: sesionesPromedio,
    projectedValue: sesionesNuevas,
    improvement: (mejoraAdherencia - 1) * 100,
    monthlyGain: gananciaAdherencia,
    unit: 'sessions',
  })

  // No-Show
  const noShowActual = NO_SHOW_PORCENTAJE_SALUD[inputs.p5OptionId] ?? 0.10
  const mejoraNoShow = MEJORA_NO_SHOW_SALUD[inputs.p5OptionId] ?? 0.70
  const noShowNuevo = noShowActual * mejoraNoShow

  metrics.push({
    metricKey: 'no_show',
    label: 'Reducción de No-Show',
    currentValue: noShowActual * 100,
    projectedValue: noShowNuevo * 100,
    improvement: (1 - mejoraNoShow) * 100,
    monthlyGain: 0,
    unit: 'percentage',
  })

  return metrics
}

/* ─── Fitness ─── */
function diagnosticoFitness(inputs: DiagnosticInputs): IGrowthMetric[] {
  const metrics: IGrowthMetric[] = []
  const ticket = inputs.facturacionMensual / inputs.clientesMensuales
  const dig = getDigitalization(inputs.p4OptionId)

  // Churn
  const churnData = CHURN_PORCENTAJE_FITNESS[inputs.p9OptionId] ?? { valor: 0.075, nivel: 'medio' as const }
  const churnActual = churnData.valor
  const mejoraChurn = MEJORA_CHURN_FITNESS[churnData.nivel]
  const churnNuevo = churnActual * mejoraChurn
  const clientesAbActual = inputs.clientesMensuales * churnActual
  const clientesAbNuevo = inputs.clientesMensuales * churnNuevo
  const retenidos = clientesAbActual - clientesAbNuevo
  const gananciaChurn = retenidos * ticket

  metrics.push({
    metricKey: 'churn_reduction',
    label: 'Retención de Miembros',
    currentValue: churnActual * 100,
    projectedValue: churnNuevo * 100,
    improvement: (1 - mejoraChurn) * 100,
    monthlyGain: gananciaChurn,
    unit: 'percentage',
  })

  // Adquisición
  const mejoraAdq = MEJORA_ADQUISICION[Sector.FITNESS][dig]
  const clientesAdicionales = inputs.clientesNuevos * (mejoraAdq - 1)
  const gananciaAdq = clientesAdicionales * ticket

  metrics.push({
    metricKey: 'acquisition',
    label: 'Nuevas Membresías Adicionales',
    currentValue: inputs.clientesNuevos,
    projectedValue: inputs.clientesNuevos + clientesAdicionales,
    improvement: (mejoraAdq - 1) * 100,
    monthlyGain: gananciaAdq,
    unit: 'clients',
  })

  // Upsells
  const mejoraUpsells = MEJORA_UPSELLS_FITNESS[churnData.nivel]
  const ingresosUpsActual = inputs.facturacionMensual * PORCENTAJE_UPSELLS_BASE
  const ingresosUpsNuevo = ingresosUpsActual * mejoraUpsells
  const gananciaUps = ingresosUpsNuevo - ingresosUpsActual

  metrics.push({
    metricKey: 'upsells',
    label: 'Upsells y Servicios Adicionales',
    currentValue: ingresosUpsActual,
    projectedValue: ingresosUpsNuevo,
    improvement: (mejoraUpsells - 1) * 100,
    monthlyGain: gananciaUps,
    unit: 'currency',
  })

  return metrics
}

/* ─── Bienestar ─── */
function diagnosticoBienestar(inputs: DiagnosticInputs): IGrowthMetric[] {
  const metrics: IGrowthMetric[] = []
  const ticket = inputs.facturacionMensual / inputs.clientesMensuales
  const dig = getDigitalization(inputs.p4OptionId)

  // Churn
  const churnData = CHURN_PORCENTAJE_BIENESTAR[inputs.p9OptionId] ?? { valor: 0.075, nivel: 'medio' as const }
  const churnActual = churnData.valor
  const mejoraChurn = MEJORA_CHURN_BIENESTAR[inputs.p9OptionId] ?? 0.85
  const churnNuevo = churnActual * mejoraChurn
  const alumnosAbActual = inputs.clientesMensuales * churnActual
  const alumnosAbNuevo = inputs.clientesMensuales * churnNuevo
  const retenidos = alumnosAbActual - alumnosAbNuevo
  const gananciaChurn = retenidos * ticket

  metrics.push({
    metricKey: 'churn_reduction',
    label: 'Retención de Alumnos',
    currentValue: churnActual * 100,
    projectedValue: churnNuevo * 100,
    improvement: (1 - mejoraChurn) * 100,
    monthlyGain: gananciaChurn,
    unit: 'percentage',
  })

  // Adquisición
  const mejoraAdq = MEJORA_ADQUISICION[Sector.BIENESTAR][dig]
  const alumnosAdicionales = inputs.clientesNuevos * (mejoraAdq - 1)
  const gananciaAdq = alumnosAdicionales * ticket

  metrics.push({
    metricKey: 'acquisition',
    label: 'Nuevos Alumnos Adicionales',
    currentValue: inputs.clientesNuevos,
    projectedValue: inputs.clientesNuevos + alumnosAdicionales,
    improvement: (mejoraAdq - 1) * 100,
    monthlyGain: gananciaAdq,
    unit: 'clients',
  })

  // No-Show
  const noShowActual = NO_SHOW_PORCENTAJE_BIENESTAR[inputs.p5OptionId] ?? 0.10
  const mejoraNoShow = MEJORA_NO_SHOW_BIENESTAR[inputs.p5OptionId] ?? 0.72
  const noShowNuevo = noShowActual * mejoraNoShow

  metrics.push({
    metricKey: 'no_show',
    label: 'Reducción de No-Show',
    currentValue: noShowActual * 100,
    projectedValue: noShowNuevo * 100,
    improvement: (1 - mejoraNoShow) * 100,
    monthlyGain: 0,
    unit: 'percentage',
  })

  return metrics
}

/* ═══ FUNCIÓN PRINCIPAL ═══ */
export function calculateGrowthDiagnostic(
  answers: IQuestionnaireAnswer[],
  config: IBusinessConfig,
): IGrowthDiagnostic {
  const inputs = extractDiagInputs(answers, config)

  let metrics: IGrowthMetric[]

  switch (inputs.sector) {
    case Sector.BELLEZA:
      metrics = diagnosticoBelleza(inputs)
      break
    case Sector.SALUD:
      metrics = diagnosticoSalud(inputs)
      break
    case Sector.FITNESS:
      metrics = diagnosticoFitness(inputs)
      break
    case Sector.BIENESTAR:
      metrics = diagnosticoBienestar(inputs)
      break
    default:
      metrics = diagnosticoBelleza(inputs) // fallback
  }

  const totalMonthlyGain = metrics.reduce((sum, m) => sum + m.monthlyGain, 0)

  return {
    sector: inputs.sector,
    metrics,
    totalMonthlyGrowthGain: totalMonthlyGain,
    totalAnnualGrowthGain: totalMonthlyGain * 12,
  }
}
