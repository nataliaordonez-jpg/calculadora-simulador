import type { IBeweScore } from '../../interfaces/bewe-score.interface'
import type { IROIResult } from '../../interfaces/roi-result.interface'
import { ScenarioType } from '../../enums/scenario-type.enum'

/* ═══════════════════════════════════════════
   BEWE SCORE — Índice de Impacto (0-100)
   Fuente: formulas calculadora y simulador.md
   ═══════════════════════════════════════════ */

export function calculateBeweScore(roiResult: IROIResult): IBeweScore {
  const baseScenario = roiResult.scenarios.find(s => s.type === ScenarioType.BASE)
  if (!baseScenario) {
    return { score: 0, level: 'critical', label: 'Sin datos', description: 'No se pudo calcular el score.' }
  }

  const adjustedRevenue = baseScenario.revenueIncrease
  const adjustedSavings = baseScenario.costSavings
  const roiPercentage = baseScenario.roiPercentage

  const score = Math.min(
    100,
    Math.round(
      (adjustedRevenue / 1000) * 0.30 +
      (adjustedSavings / 100) * 0.40 +
      roiPercentage * 0.30
    )
  )

  let level: IBeweScore['level']
  let label: string
  let description: string

  if (score <= 20) {
    level = 'critical'
    label = 'Crítico'
    description = 'Tu negocio necesita atención urgente. Linda puede transformar tus resultados.'
  } else if (score <= 40) {
    level = 'low'
    label = 'Bajo'
    description = 'Hay muchas oportunidades de mejora. Linda puede ayudarte a crecer significativamente.'
  } else if (score <= 65) {
    level = 'medium'
    label = 'Moderado'
    description = 'Tu negocio tiene potencial. Con IA puedes llevarlo al siguiente nivel.'
  } else if (score <= 85) {
    level = 'high'
    label = 'Alto'
    description = 'Excelente potencial de crecimiento. La IA puede maximizar tus resultados.'
  } else {
    level = 'excellent'
    label = 'Excepcional'
    description = '¡Tu negocio está listo para despegar! La IA multiplicará tu rendimiento.'
  }

  return { score, level, label, description }
}
