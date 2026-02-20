// ============================================================
// Supabase Edge Function: detect-country
// Detecta el país del usuario por IP y actualiza bf_sessions
// ============================================================
// Deno runtime — NO usar imports de Node.js

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'sessionId requerido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // ── Obtener IP del cliente ────────────────────────────────
    // Supabase Edge Functions reciben la IP real por estos headers
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      null

    if (!ip) {
      return new Response(
        JSON.stringify({ country: null, reason: 'IP no detectada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Geolocalizar IP con ipapi.co (1000 req/día gratis) ───
    let countryCode: string | null = null

    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { 'User-Agent': 'bewe-funnel/1.0' },
      })

      if (geoRes.ok) {
        const geoData = await geoRes.json()
        // ipapi.co devuelve error si es IP privada/inválida
        if (!geoData.error && geoData.country_code) {
          countryCode = geoData.country_code as string
        }
      }
    } catch {
      // Geolocalización falló — continuamos sin país
    }

    // ── Actualizar bf_sessions con el país detectado ─────────
    if (countryCode) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase
        .from('bf_sessions')
        .update({ country: countryCode })
        .eq('id', sessionId)
    }

    return new Response(
      JSON.stringify({ country: countryCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
