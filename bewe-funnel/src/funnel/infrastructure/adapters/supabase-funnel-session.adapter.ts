import { supabase, isSupabaseConfigured } from '@shared/lib/supabase-client'

const SESSION_TOKEN_KEY = 'bewe_funnel_session_token'

export function getSessionToken(): string {
  if (typeof window === 'undefined') return 'server-session'

  const existing = window.localStorage.getItem(SESSION_TOKEN_KEY)
  if (existing) return existing

  const created = crypto.randomUUID()
  window.localStorage.setItem(SESSION_TOKEN_KEY, created)
  return created
}

export async function ensureFunnelSession(): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null

  const sessionToken = getSessionToken()

  const existing = await supabase
    .from('bf_sessions')
    .select('id')
    .eq('session_token', sessionToken)
    .maybeSingle()

  if (existing.data?.id) {
    return existing.data.id
  }

  const payload = {
    session_token: sessionToken,
    source: 'bewe-funnel-web',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
  }

  const inserted = await supabase
    .from('bf_sessions')
    .insert(payload)
    .select('id')
    .single()

  if (inserted.error) {
    // Si hubo carrera por token duplicado, intentamos leer de nuevo.
    const retry = await supabase
      .from('bf_sessions')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle()

    if (retry.data?.id) return retry.data.id
    throw new Error(`No se pudo crear sesión bf_sessions: ${inserted.error.message}`)
  }

  return inserted.data.id
}

