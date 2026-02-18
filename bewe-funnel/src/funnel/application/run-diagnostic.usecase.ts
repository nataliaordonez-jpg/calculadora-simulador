import type { IQuestionnaireAnswer } from '../domain/interfaces/questionnaire.interface'
import type { IBusinessConfig } from '../domain/interfaces/business-config.interface'
import type { IROIResult } from '../domain/interfaces/roi-result.interface'
import type { IGrowthDiagnostic } from '../domain/interfaces/growth-diagnostic.interface'
import type { IBeweScore } from '../domain/interfaces/bewe-score.interface'
import { calculateROI } from '../domain/calculators/growth-diagnostic/roi-calculator'
import { calculateGrowthDiagnostic } from '../domain/calculators/growth-diagnostic/growth-diagnostic-calculator'
import { calculateBeweScore } from '../domain/calculators/growth-diagnostic/bewe-score-calculator'

export interface DiagnosticResult {
  roi: IROIResult
  growth: IGrowthDiagnostic
  beweScore: IBeweScore
}

export function runDiagnostic(
  answers: IQuestionnaireAnswer[],
  config: IBusinessConfig,
): DiagnosticResult {
  const roi = calculateROI(answers, config)
  const growth = calculateGrowthDiagnostic(answers, config)
  const beweScore = calculateBeweScore(roi)

  return { roi, growth, beweScore }
}
