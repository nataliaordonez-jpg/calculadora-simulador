import type { IAnalyticsService } from '../../domain/ports/analytics.port'
import type { FunnelStep } from '../../domain/enums/funnel-step.enum'

export class ConsoleAnalyticsAdapter implements IAnalyticsService {
  trackStepView(step: FunnelStep): void {
    console.log(`[Analytics] Step viewed: ${step}`)
  }

  trackStepComplete(step: FunnelStep, durationMs: number): void {
    console.log(`[Analytics] Step completed: ${step} (${durationMs}ms)`)
  }

  trackLeadCaptured(email: string): void {
    console.log(`[Analytics] Lead captured: ${email}`)
  }

  trackShareClick(platform: string): void {
    console.log(`[Analytics] Share clicked: ${platform}`)
  }
}
