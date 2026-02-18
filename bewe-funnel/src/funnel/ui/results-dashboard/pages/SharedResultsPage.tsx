import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SupabaseDiagnosticAdapter } from '@funnel/infrastructure/adapters/supabase-diagnostic.adapter'
import type { SharedDiagnosticPayload } from '@funnel/infrastructure/adapters/supabase-diagnostic.adapter'
import { useFunnelContext } from '../../_shared/context/funnel-context'
import { ResultsDashboardPage } from './ResultsDashboardPage'
import { FunnelLayout } from '../../_shared/components/funnel-layout/FunnelLayout'
import { IconComponent } from '@beweco/aurora-ui'

const adapter = new SupabaseDiagnosticAdapter()

export function SharedResultsPage() {
  const { shareId } = useParams<{ shareId: string }>()
  const { dispatch } = useFunnelContext()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!shareId) {
      setStatus('error')
      return
    }

    adapter.getByShareId(shareId).then((payload: SharedDiagnosticPayload | null) => {
      if (!payload) {
        setStatus('error')
        return
      }

      // Populate context with the shared data
      dispatch({ type: 'SET_BUSINESS_CONFIG', payload: payload.businessConfig })
      dispatch({
        type: 'SET_RESULTS',
        payload: {
          roi: payload.roiResult,
          growth: payload.growthDiagnostic,
          beweScore: payload.beweScore,
        },
      })
      // Populate answers
      payload.answers.forEach((answer) => {
        dispatch({ type: 'ANSWER_QUESTION', payload: answer })
      })
      // Store the shareId so the URL shown in the modal is always the permanent link
      dispatch({ type: 'SET_SHARE_ID', payload: shareId })

      setStatus('ready')
    }).catch(() => {
      setStatus('error')
    })
  }, [shareId, dispatch])

  if (status === 'loading') {
    return (
      <FunnelLayout showHeader={false}>
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: -1, background: 'linear-gradient(135deg, #0A2540 0%, #1B4F8A 40%, #2E8B7A 75%, #34D399 100%)' }}
        />
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-white">
          {/* Spinner */}
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#34D399',
            animation: 'spin 0.9s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
              Cargando tu diagnóstico
            </h2>
            <p style={{ fontSize: '1rem', fontWeight: 400, color: 'rgba(255,255,255,0.65)' }}>
              Estamos recuperando tus resultados personalizados…
            </p>
          </div>
        </div>
      </FunnelLayout>
    )
  }

  if (status === 'error') {
    return (
      <FunnelLayout showHeader={false}>
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: -1, background: 'linear-gradient(135deg, #0A2540 0%, #1B4F8A 40%, #2E8B7A 75%, #34D399 100%)' }}
        />
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-white px-6">
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(248,113,113,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconComponent icon="solar:close-circle-linear" size="xl" color="#F87171" />
          </div>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
              Diagnóstico no encontrado
            </h2>
            <p style={{ fontSize: '1rem', fontWeight: 400, color: 'rgba(255,255,255,0.65)', marginBottom: '32px', lineHeight: '150%' }}>
              El enlace que estás usando ya no está disponible o no existe. Puedes crear tu propio diagnóstico gratuito a continuación.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px',
                background: '#60A5FA',
                color: '#ffffff',
                borderRadius: '999px',
                fontSize: '0.875rem', fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 200ms',
              }}
            >
              Crear mi diagnóstico gratis →
            </a>
          </div>
        </div>
      </FunnelLayout>
    )
  }

  // Data is loaded in context — render the full results dashboard
  return <ResultsDashboardPage />
}
