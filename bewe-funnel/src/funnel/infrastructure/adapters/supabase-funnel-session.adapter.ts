import { supabase, isSupabaseConfigured } from '@shared/lib/supabase-client'

// Llama a la Edge Function para detectar el país del usuario por IP
// Se ejecuta en background (fire-and-forget) — no bloquea el flujo principal
async function detectCountryInBackground(sessionId: string): Promise<void> {
  if (!supabase) return
  try {
    await supabase.functions.invoke('detect-country', {
      body: { sessionId },
    })
  } catch {
    // Silencioso — el país es opcional, no debe romper el flujo
  }
}

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

  // Detectar tipo de dispositivo desde user_agent
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  function detectDevice(u: string): string {
    const s = u.toLowerCase()
    if (s.includes('bot') || s.includes('crawler') || s.includes('spider')) return 'Bot'
    if ((s.includes('iphone') || s.includes('ipad'))) return 'Mobile - iOS'
    if (s.includes('android') && s.includes('mobile')) return 'Mobile - Android'
    if (s.includes('android')) return 'Mobile - Android'
    return 'Desktop'
  }

  // Asignar variante A/B aleatoria (50/50) para nuevas sesiones
  const abVariant = Math.random() < 0.5 ? 'A' : 'B'

  const payload = {
    session_token: sessionToken,
    source: 'bewe-funnel-web',
    user_agent: ua || null,
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    device_type: detectDevice(ua),
    ab_variant: abVariant,
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

  const newSessionId = inserted.data.id

  // Detectar país en background — no bloquea ni falla el flujo
  detectCountryInBackground(newSessionId)

  return newSessionId
}

