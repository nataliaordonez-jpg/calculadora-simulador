import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, AuraToastProvider } from '@beweco/aurora-ui'
// @ts-expect-error CSS import has no type declarations
import '@beweco/aurora-ui/styles'
import { FunnelProvider } from './funnel/ui/_shared/context/funnel-context'
import { LandingPage } from './funnel/ui/landing/pages/LandingPage'
import { OnboardingPage } from './funnel/ui/onboarding/pages/OnboardingPage'
import { QuestionnairePage } from './funnel/ui/questionnaire/pages/QuestionnairePage'
import { ProcessingPage } from './funnel/ui/processing/pages/ProcessingPage'
import { LeadCapturePage } from './funnel/ui/lead-capture/pages/LeadCapturePage'
import { ResultsDashboardPage } from './funnel/ui/results-dashboard/pages/ResultsDashboardPage'
import { SocialSharePage } from './funnel/ui/social-share/pages/SocialSharePage'

function App() {
  return (
    <ThemeProvider>
      <AuraToastProvider>
        <BrowserRouter>
          <FunnelProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/questionnaire" element={<QuestionnairePage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/lead-capture" element={<LeadCapturePage />} />
              <Route path="/results" element={<ResultsDashboardPage />} />
              <Route path="/share" element={<SocialSharePage />} />
            </Routes>
          </FunnelProvider>
        </BrowserRouter>
      </AuraToastProvider>
    </ThemeProvider>
  )
}

export default App
