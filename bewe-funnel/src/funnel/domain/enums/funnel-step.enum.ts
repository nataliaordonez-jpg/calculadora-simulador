export enum FunnelStep {
  LANDING = 'landing',
  ONBOARDING = 'onboarding',
  QUESTIONNAIRE = 'questionnaire',
  PROCESSING = 'processing',
  LEAD_CAPTURE = 'lead_capture',
  RESULTS = 'results',
  SHARE = 'share',
}

export const FUNNEL_STEP_ORDER: FunnelStep[] = [
  FunnelStep.LANDING,
  FunnelStep.ONBOARDING,
  FunnelStep.QUESTIONNAIRE,
  FunnelStep.PROCESSING,
  FunnelStep.LEAD_CAPTURE,
  FunnelStep.RESULTS,
  FunnelStep.SHARE,
]
