import type { FunnelStep } from '../enums/funnel-step.enum'

export interface IAnalyticsService {
  trackStepView(step: FunnelStep): void
  trackStepComplete(step: FunnelStep, durationMs: number): void
  trackLeadCaptured(email: string): void
  trackShareClick(platform: string): void
}
