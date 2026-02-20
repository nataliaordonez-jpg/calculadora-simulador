import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import { supabase, isSupabaseConfigured } from '@shared/lib/supabase-client'

// ─── Helpers ────────────────────────────────────────────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
  AR: 'Argentina', BO: 'Bolivia', BR: 'Brasil', CA: 'Canadá', CL: 'Chile',
  CO: 'Colombia', CR: 'Costa Rica', CU: 'Cuba', DO: 'Rep. Dominicana',
  EC: 'Ecuador', ES: 'España', FR: 'Francia', GB: 'Reino Unido',
  GT: 'Guatemala', HN: 'Honduras', IT: 'Italia', MX: 'México',
  NI: 'Nicaragua', PA: 'Panamá', PE: 'Perú', PT: 'Portugal',
  PY: 'Paraguay', SE: 'Suecia', SV: 'El Salvador', US: 'Estados Unidos',
  UY: 'Uruguay', VE: 'Venezuela', DE: 'Alemania', NL: 'Países Bajos',
  AU: 'Australia', JP: 'Japón', CN: 'China', IN: 'India',
}

function countryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code
}

function countryFlag(code: string): string {
  // Convierte código ISO 2 letras a emoji de bandera
  const c = code.toUpperCase()
  if (c.length !== 2) return ''
  const offset = 0x1F1E6 - 65
  return String.fromCodePoint(c.charCodeAt(0) + offset) + String.fromCodePoint(c.charCodeAt(1) + offset)
}

function parseDevice(ua: string | null): string {
  if (!ua) return 'Desconocido'
  const u = ua.toLowerCase()
  if (u.includes('bot') || u.includes('crawler') || u.includes('spider') || u.includes('headless')) return 'Bot'
  if (u.includes('iphone') || u.includes('ipad')) return 'Mobile - iOS'
  if (u.includes('android') && u.includes('mobile')) return 'Mobile - Android'
  if (u.includes('android')) return 'Mobile - Android'
  return 'Desktop'
}

function parseSource(referrer: string | null): string {
  if (!referrer || referrer === '') return 'Direct'
  try {
    const url = new URL(referrer)
    const host = url.hostname.replace('www.', '')
    if (host.includes('google')) return 'Google'
    if (host.includes('facebook') || host.includes('fb.com')) return 'Facebook'
    if (host.includes('instagram')) return 'Instagram'
    if (host.includes('linkedin')) return 'LinkedIn'
    if (host.includes('twitter') || host.includes('t.co')) return 'Twitter / X'
    if (host.includes('whatsapp')) return 'WhatsApp'
    return host
  } catch {
    return 'Direct'
  }
}

function fmtDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

// Números de pregunta reales según questions.constant.ts
const QUESTION_LABELS: Record<number, string> = {
  2:  '¿Cuál es tu facturación mensual aproximada?',
  3:  '¿Qué porcentaje de ventas u oportunidades pierdes por no responder a tiempo?',
  4:  '¿Cuánto tardas en responder a un nuevo mensaje o consulta?',
  5:  '¿Qué tan común es que un cliente no se presente a su cita?',
  6:  '¿Cuántas horas al día dedicas a atender clientes?',
  7:  '¿Cuántos clientes atiendes mensualmente?',
  8:  '¿Cuántos de esos clientes son nuevos este mes?',
  9:  'De cada 10 clientes que atiendes, ¿cuántos NO vuelven?',
  10: '¿Cuál es tu mayor desafío actualmente?',
  11: '¿Cuántas conversaciones o mensajes manejas al mes con clientes?',
  12: '¿Cuántas personas conforman tu equipo?',
}

// Mapa completo de option_id → etiqueta legible
const OPTION_LABELS: Record<string, string> = {
  // P2 — Facturación mensual
  p2_opt1: 'Hasta $2,000',
  p2_opt2: '$2,001 - $6,000',
  p2_opt3: '$6,001 - $12,000',
  p2_opt4: 'Más de $12,001',
  // P12 — Equipo
  p12_opt1: 'Solo yo',
  p12_opt2: '2-3 personas',
  p12_opt3: '4-6 personas',
  p12_opt4: '7-10 personas',
  p12_opt5: 'Más de 10 personas',
  // P6 — Horas atención
  p6_opt1: 'Menos de 8 horas',
  p6_opt2: '8-12 horas',
  p6_opt3: '12-16 horas',
  p6_opt4: '24 horas (atención completa)',
  // P4 — Tiempo de respuesta
  p4_opt1: 'Menos de 1 minuto',
  p4_opt2: '1-5 minutos',
  p4_opt3: '5-15 minutos',
  p4_opt4: '15-30 minutos',
  p4_opt5: 'De 30 minutos a 1 hora',
  p4_opt6: 'Más de una hora',
  // P11 — Conversaciones mensuales
  p11_opt1: '0 - 100 conversaciones',
  p11_opt2: '100 - 500 conversaciones',
  p11_opt3: '500 - 1,000 conversaciones',
  p11_opt4: '1,000 - 2,500 conversaciones',
  p11_opt5: 'Más de 2,500 conversaciones',
  // P3 — % Ventas perdidas
  p3_opt1: '1-5%',
  p3_opt2: '5-15%',
  p3_opt3: '15-25%',
  p3_opt4: '25-40%',
  p3_opt5: 'Más del 40%',
  // P5 — No-show / Cancelaciones
  p5_opt1: 'Muy raro (menos del 5%)',
  p5_opt2: 'Ocasional (5-15%)',
  p5_opt3: 'Frecuente (15-30%)',
  p5_opt4: 'Muy frecuente (más del 30%)',
  p5_opt5: 'No manejo citas / clases',
  // P9 — Churn
  p9_opt1: '1-2 clientes / Menos del 5%',
  p9_opt2: '3-4 clientes / 5-10%',
  p9_opt3: '5-6 clientes / 10-20%',
  p9_opt4: '7 o más / Más del 20%',
  // P7 — Clientes activos
  p7_opt1: 'Menos de 50',
  p7_opt2: '51 a 150',
  p7_opt3: '151 a 350',
  p7_opt4: 'Más de 350',
  // P8 — Clientes nuevos
  p8_opt1: '1 a 10',
  p8_opt2: '11 a 30',
  p8_opt3: '31 a 60',
  p8_opt4: 'Más de 60',
  // P10 — Desafío principal
  p10_opt1: 'Atraer más clientes',
  p10_opt2: 'Retener los que ya tengo',
  p10_opt3: 'Automatizar tareas repetitivas',
  p10_opt4: 'Mejorar la experiencia del cliente',
  p10_opt5: 'Crecer sin aumentar costos',
}

const VARIANT_COLORS: Record<string, string> = {
  A: '#6366F1',
  B: '#22D3EE',
  C: '#10B981',
  D: '#F59E0B',
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnalyticsData {
  totalSessions: number
  totalPreleads: number
  totalAbandonos: number
  tasaConversion: number
  variantStats: { variant: string; sessions: number; preleads: number; conversion: number }[]
  dailyData: { date: string; sessions: number; conversions: number; pct: number }[]
  abandonoPorPregunta: { questionNumber: number; label: string; abandonos: number; pct: number }[]
  tiempoPorPregunta: { questionNumber: number; label: string; respuestas: number; avgSeconds: number }[]
  distribucionRespuestas: {
    questionNumber: number
    label: string
    options: { option: string; count: number; pct: number }[]
  }[]
  fuenteTrafico: { fuente: string; visitantes: number }[]
  visitantesPais: { pais: string; visitantes: number }[]
  visitantesDispositivo: { dispositivo: string; visitantes: number; pct: number }[]
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AnalyticsDashboardPage() {
  const today = new Date()
  const defaultStart = addDays(today, -30)

  const [startDate, setStartDate] = useState(fmtDate(defaultStart))
  const [endDate, setEndDate] = useState(fmtDate(today))
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase no configurado. Revisa las variables de entorno.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const start = new Date(startDate + 'T00:00:00Z').toISOString()
      const end = new Date(endDate + 'T23:59:59Z').toISOString()

      // 1. Sessions en rango (migración aplicada: ab_variant, device_type, country disponibles)
      const { data: sessions, error: sessErr } = await supabase
        .from('bf_sessions')
        .select('id, created_at, user_agent, referrer, ab_variant, device_type, country')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: true })

      if (sessErr) throw new Error(`Sessions: ${sessErr.message}`)
      const allSessions = sessions ?? []
      const sessionIds = allSessions.map((s) => s.id)

      // 2. Leads
      const { data: leads, error: leadsErr } = sessionIds.length
        ? await supabase.from('bf_leads').select('id, session_id, created_at').in('session_id', sessionIds)
        : { data: [], error: null }
      if (leadsErr) throw new Error(`Leads: ${leadsErr.message}`)
      const allLeads = leads ?? []
      const leadSessionIds = new Set(allLeads.map((l) => l.session_id))

      // 3. Diagnostic results (sesiones completadas)
      const { data: diagnostics, error: diagErr } = sessionIds.length
        ? await supabase.from('bf_diagnostic_results').select('session_id').in('session_id', sessionIds)
        : { data: [], error: null }
      if (diagErr) throw new Error(`Diagnostics: ${diagErr.message}`)
      const completedSessionIds = new Set((diagnostics ?? []).map((d) => d.session_id))

      // 4. Respuestas del cuestionario
      const { data: answers, error: answersErr } = sessionIds.length
        ? await supabase
            .from('bf_question_answers')
            .select('session_id, question_id, question_number, selected_option_id, answer_label, answered_at')
            .in('session_id', sessionIds)
            .order('answered_at', { ascending: true })
        : { data: [], error: null }
      if (answersErr) throw new Error(`Answers: ${answersErr.message}`)
      const allAnswers = answers ?? []

      // ── Cómputos ──────────────────────────────────────────────────────────

      const totalSessions = allSessions.length
      const totalPreleads = allLeads.length
      const totalAbandonos = allSessions.filter((s) => !leadSessionIds.has(s.id)).length
      const tasaConversion = totalSessions > 0 ? (totalPreleads / totalSessions) * 100 : 0

      // A/B Variants — columna ab_variant disponible tras migración
      const variantMap = new Map<string, { sessions: number; preleads: number }>()
      allSessions.forEach((s: any) => {
        const v = (s.ab_variant as string | null) ?? 'Sin variante'
        const cur = variantMap.get(v) ?? { sessions: 0, preleads: 0 }
        cur.sessions++
        if (leadSessionIds.has(s.id)) cur.preleads++
        variantMap.set(v, cur)
      })
      const variantStats = Array.from(variantMap.entries())
        .map(([variant, stats]) => ({
          variant,
          sessions: stats.sessions,
          preleads: stats.preleads,
          conversion: stats.sessions > 0 ? Math.round((stats.preleads / stats.sessions) * 10000) / 100 : 0,
        }))
        .sort((a, b) => b.sessions - a.sessions)

      // Daily data
      const dayMap = new Map<string, { sessions: number; conversions: number }>()
      allSessions.forEach((s) => {
        const day = s.created_at.split('T')[0]
        const cur = dayMap.get(day) ?? { sessions: 0, conversions: 0 }
        cur.sessions++
        if (leadSessionIds.has(s.id)) cur.conversions++
        dayMap.set(day, cur)
      })
      const dailyData = Array.from(dayMap.entries())
        .map(([date, d]) => ({
          date,
          sessions: d.sessions,
          conversions: d.conversions,
          pct: d.sessions > 0 ? Math.round((d.conversions / d.sessions) * 10000) / 100 : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Abandono por pregunta — max question_number de sesiones que NO completaron
      const abandonoMap = new Map<number, number>()
      const incompleteSessions = allSessions.filter((s) => !completedSessionIds.has(s.id))
      const incompleteIds = new Set(incompleteSessions.map((s) => s.id))
      const answersPerSession = new Map<string, number[]>()
      allAnswers.forEach((a) => {
        if (incompleteIds.has(a.session_id)) {
          const arr = answersPerSession.get(a.session_id) ?? []
          arr.push(a.question_number)
          answersPerSession.set(a.session_id, arr)
        }
      })
      answersPerSession.forEach((qNums) => {
        const maxQ = Math.max(...qNums)
        abandonoMap.set(maxQ, (abandonoMap.get(maxQ) ?? 0) + 1)
      })
      // Sessions with NO answers at all → abandonaron en la primera pregunta real (Q2)
      incompleteSessions.forEach((s) => {
        if (!answersPerSession.has(s.id)) {
          abandonoMap.set(2, (abandonoMap.get(2) ?? 0) + 1)
        }
      })
      const totalAbandonosWithAnswers = Array.from(abandonoMap.values()).reduce((a, b) => a + b, 0)
      const abandonoPorPregunta = Array.from(abandonoMap.entries())
        .map(([qn, abandonos]) => ({
          questionNumber: qn,
          label: QUESTION_LABELS[qn] ?? `Pregunta ${qn}`,
          abandonos,
          pct: totalAbandonosWithAnswers > 0 ? Math.round((abandonos / totalAbandonosWithAnswers) * 10000) / 100 : 0,
        }))
        .sort((a, b) => a.questionNumber - b.questionNumber)

      // Tiempo promedio por pregunta
      const timeByQuestion = new Map<number, { total: number; count: number }>()
      const answersBySession = new Map<string, typeof allAnswers[0][]>()
      allAnswers.forEach((a) => {
        const arr = answersBySession.get(a.session_id) ?? []
        arr.push(a)
        answersBySession.set(a.session_id, arr)
      })
      answersBySession.forEach((sessionAnswers) => {
        const sorted = [...sessionAnswers].sort((a, b) =>
          new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime()
        )
        sorted.forEach((ans, idx) => {
          let elapsed = 0
          if (idx === 0) {
            // Time from session start to first answer - use session started_at if available
            elapsed = 10 // fallback default
          } else {
            const prev = sorted[idx - 1]
            elapsed = (new Date(ans.answered_at).getTime() - new Date(prev.answered_at).getTime()) / 1000
          }
          const cur = timeByQuestion.get(ans.question_number) ?? { total: 0, count: 0 }
          cur.total += elapsed
          cur.count++
          timeByQuestion.set(ans.question_number, cur)
        })
      })
      const tiempoPorPregunta = Array.from(timeByQuestion.entries())
        .map(([qn, t]) => ({
          questionNumber: qn,
          label: QUESTION_LABELS[qn] ?? `Pregunta ${qn}`,
          respuestas: t.count,
          avgSeconds: t.count > 0 ? Math.round((t.total / t.count) * 10) / 10 : 0,
        }))
        .sort((a, b) => a.questionNumber - b.questionNumber)

      // Distribución de respuestas por pregunta
      const distMap = new Map<number, Map<string, number>>()
      allAnswers.forEach((a) => {
        if (!distMap.has(a.question_number)) distMap.set(a.question_number, new Map())
        const optMap = distMap.get(a.question_number)!
        const rawId = a.selected_option_id ?? ''
        const label = a.answer_label || OPTION_LABELS[rawId] || rawId || 'N/A'
        optMap.set(label, (optMap.get(label) ?? 0) + 1)
      })
      const distribucionRespuestas = Array.from(distMap.entries())
        .map(([qn, optMap]) => {
          const total = Array.from(optMap.values()).reduce((a, b) => a + b, 0)
          const options = Array.from(optMap.entries())
            .map(([option, count]) => ({ option, count, pct: total > 0 ? Math.round((count / total) * 10000) / 100 : 0 }))
            .sort((a, b) => b.count - a.count)
          return {
            questionNumber: qn,
            label: QUESTION_LABELS[qn] ?? `Pregunta ${qn}`,
            options,
          }
        })
        .sort((a, b) => a.questionNumber - b.questionNumber)

      // Tráfico por fuente
      const sourceMap = new Map<string, number>()
      allSessions.forEach((s) => {
        const src = parseSource(s.referrer)
        sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1)
      })
      const fuenteTrafico = Array.from(sourceMap.entries())
        .map(([fuente, visitantes]) => ({ fuente, visitantes }))
        .sort((a, b) => b.visitantes - a.visitantes)

      // Dispositivo — usa columna device_type si existe, si no parsea user_agent como fallback
      const deviceMap = new Map<string, number>()
      allSessions.forEach((s: any) => {
        const d = (s.device_type as string | null) ?? parseDevice(s.user_agent)
        deviceMap.set(d, (deviceMap.get(d) ?? 0) + 1)
      })
      const visitantesDispositivo = Array.from(deviceMap.entries())
        .map(([dispositivo, visitantes]) => ({
          dispositivo,
          visitantes,
          pct: totalSessions > 0 ? Math.round((visitantes / totalSessions) * 10000) / 100 : 0,
        }))
        .sort((a, b) => b.visitantes - a.visitantes)

      // País — usa columna 'country' si existe (tras migración), si no queda vacío
      const paisMap = new Map<string, number>()
      allSessions.forEach((s: any) => {
        const code = s.country as string | null
        if (code && code.trim()) {
          const nombre = countryName(code.trim())
          paisMap.set(nombre, (paisMap.get(nombre) ?? 0) + 1)
        }
      })
      const visitantesPais = Array.from(paisMap.entries())
        .map(([pais, visitantes]) => ({ pais, visitantes }))
        .sort((a, b) => b.visitantes - a.visitantes)

      setData({
        totalSessions,
        totalPreleads,
        totalAbandonos,
        tasaConversion,
        variantStats,
        dailyData,
        abandonoPorPregunta,
        tiempoPorPregunta,
        distribucionRespuestas,
        fuenteTrafico,
        visitantesPais,
        visitantesDispositivo,
      })
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => { fetchData() }, [fetchData])

  const exportCSV = () => {
    if (!data) return
    const rows = [
      ['Métrica', 'Valor'],
      ['Total Sesiones', data.totalSessions],
      ['Total Preleads', data.totalPreleads],
      ['Total Abandonos', data.totalAbandonos],
      ['Tasa de Conversión (%)', data.tasaConversion.toFixed(2)],
      [],
      ['Variante', 'Sesiones', 'Preleads', 'Conversión (%)'],
      ...data.variantStats.map((v) => [v.variant, v.sessions, v.preleads, v.conversion]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${startDate}-${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const card = (value: string | number, label: string, color: string, icon: React.ReactNode, badge?: string, badgeColor?: string) => (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #F1F5F9', flex: 1, minWidth: 180 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ color: '#64748B', fontSize: 14 }}>{icon}</div>
        {badge && (
          <span style={{ background: badgeColor ?? '#F1F5F9', color: '#64748B', borderRadius: 20, padding: '2px 10px', fontSize: 12, border: `1px solid ${badgeColor ?? '#E2E8F0'}` }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>{label}</div>
    </div>
  )

  const sectionTitle = (title: string, sub?: string) => (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  )

  const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14 }
  const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 12px', color: '#94A3B8', fontWeight: 500, borderBottom: '1px solid #F1F5F9', fontSize: 13 }
  const tdStyle: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #F8FAFC', color: '#334155' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>Analytics Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#334155', outline: 'none', cursor: 'pointer' }} />
            <span style={{ color: '#94A3B8', fontSize: 12 }}>–</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#334155', outline: 'none', cursor: 'pointer' }} />
          </div>
          <button onClick={exportCSV} disabled={!data}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar CSV
          </button>
          <button onClick={fetchData} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

        {/* Error state */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#B91C1C', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ flex: 1, height: 100, borderRadius: 12, background: '#E2E8F0', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* ── KPI Cards ── */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
              {card(data.totalSessions, 'Total sesiones', '#6366F1',
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                'Rango', '#EEF2FF')}
              {card(data.totalPreleads, 'Total preleads', '#10B981',
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
                'Rango', '#ECFDF5')}
              {card(data.totalAbandonos, 'Total abandonos', '#EF4444',
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
                'Rango', '#FEF2F2')}
              {card(`${data.tasaConversion.toFixed(2)}%`, 'Tasa de conversión', '#F59E0B',
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
                'Rango', '#FFFBEB')}
            </div>

            {/* ── A/B Testing ── */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
              {sectionTitle(
                '🧪 A/B Testing: Conversión por Variante',
                `${startDate} - ${endDate}`
              )}

              {/* Variant cards */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                {data.variantStats.map((v) => {
                  const color = VARIANT_COLORS[v.variant] ?? '#94A3B8'
                  const isBest = v.sessions === Math.max(...data.variantStats.map((x) => x.sessions))
                  return (
                    <div key={v.variant} style={{ flex: 1, minWidth: 160, background: '#F8FAFC', borderRadius: 12, padding: '16px 20px', border: `1px solid ${color}22`, position: 'relative' }}>
                      {isBest && v.sessions > 0 && (
                        <span style={{ position: 'absolute', top: 12, right: 12, background: color, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                          {Math.round((v.sessions / data.totalSessions) * 100)}%
                        </span>
                      )}
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', marginBottom: 8 }}>
                        {v.variant === 'Sin variante' ? '⚠️' : `Variante ${v.variant}`}
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A' }}>{v.sessions}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>sesiones</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#10B981' }}>{v.preleads}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>preleads capturados</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>Conversión:</span>
                        <span style={{
                          background: v.conversion > 0 ? '#6366F1' : '#F1F5F9',
                          color: v.conversion > 0 ? '#fff' : '#94A3B8',
                          borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: 700
                        }}>
                          {v.conversion > 0 ? `${v.conversion}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Comparison table */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#334155', marginBottom: 12 }}>Comparación Detallada</h3>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Variante</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Sesiones</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Preleads</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Conversión</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.variantStats.map((v, i) => {
                      const maxConv = Math.max(...data.variantStats.map((x) => x.conversion), 0.01)
                      return (
                        <tr key={v.variant}>
                          <td style={tdStyle}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: i === 0 ? 600 : 400 }}>
                              {i === 0 && v.sessions > 0 && <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>🥇 Mejor</span>}
                              {v.variant === 'Sin variante' ? '⚠️ Sin variante' : `Variante ${v.variant}`}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>{v.sessions}</td>
                          <td style={{ ...tdStyle, textAlign: 'right', color: '#10B981', fontWeight: 600 }}>{v.preleads}</td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            <span style={{ background: v.conversion > 0 ? '#EEF2FF' : '#F1F5F9', color: v.conversion > 0 ? '#4338CA' : '#94A3B8', borderRadius: 20, padding: '3px 10px', fontSize: 13, fontWeight: 600 }}>
                              {v.conversion > 0 ? `${v.conversion}%` : '0%'}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right', minWidth: 120 }}>
                            <div style={{ background: '#F1F5F9', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                              <div style={{ background: '#10B981', height: '100%', width: `${(v.conversion / maxConv) * 100}%`, borderRadius: 4, transition: 'width 0.6s ease' }} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bar chart by variant */}
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#334155', marginBottom: 12 }}>Tasa de Conversión por Variante</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.variantStats} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="variant" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                  <Tooltip formatter={(val: number) => [`${val}%`, 'Conversión']} />
                  <Bar dataKey="conversion" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div style={{ marginTop: 12, fontSize: 12, color: '#64748B' }}>
                <p style={{ margin: '4px 0', fontWeight: 600 }}>📊 Análisis de Conversión:</p>
                <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                  <li>La variante con 🥇 es la que tiene mejor tasa de conversión (más preleads por sesión)</li>
                  <li>Los datos "Sin variante" corresponden a sesiones antiguas sin A/B test</li>
                  <li>Usa estas métricas para decidir qué landing mantener o mejorar</li>
                </ul>
              </div>
            </div>

            {/* ── Conversión Diaria ── */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
              {sectionTitle(`Conversión Diaria`, `${startDate} - ${endDate}`)}
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.dailyData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis yAxisId="count" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis yAxisId="pct" orientation="right" tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                  <Tooltip labelFormatter={(l) => `Fecha: ${l}`} formatter={(val: number, name: string) => [
                    name === '% Conversión' ? `${val}%` : val,
                    name
                  ]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="count" type="monotone" dataKey="sessions" stroke="#6366F1" dot={{ r: 3 }} name="Sesiones" strokeWidth={2} />
                  <Line yAxisId="count" type="monotone" dataKey="conversions" stroke="#10B981" dot={{ r: 3 }} name="Conversiones" strokeWidth={2} />
                  <Line yAxisId="pct" type="monotone" dataKey="pct" stroke="#F59E0B" dot={{ r: 3 }} name="% Conversión" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ── Abandono por Pregunta ── */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
              {sectionTitle('Abandono por Pregunta')}
              {data.abandonoPorPregunta.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: 14 }}>Sin datos de abandono en el período seleccionado.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.abandonoPorPregunta} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="questionNumber" label={{ value: 'Pregunta #', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94A3B8' }} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} label={{ value: 'Abandonos', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94A3B8' }} />
                      <Tooltip formatter={(val: number) => [val, 'Abandonos']} labelFormatter={(l) => `Pregunta ${l}`} />
                      <Bar dataKey="abandonos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <table style={{ ...tableStyle, marginTop: 16 }}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, width: 40 }}>#</th>
                        <th style={thStyle}>Pregunta</th>
                        <th style={{ ...thStyle, textAlign: 'right', width: 100 }}>Abandonos</th>
                        <th style={{ ...thStyle, textAlign: 'right', width: 80 }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.abandonoPorPregunta.map((row) => (
                        <tr key={row.questionNumber}>
                          <td style={{ ...tdStyle, color: '#64748B' }}>{row.questionNumber}</td>
                          <td style={tdStyle}>{row.label}</td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{row.abandonos}</td>
                          <td style={{ ...tdStyle, textAlign: 'right', color: row.pct > 20 ? '#EF4444' : '#94A3B8', fontWeight: row.pct > 20 ? 600 : 400 }}>
                            {row.pct.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            {/* ── Tiempo Promedio por Pregunta ── */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
              {sectionTitle('Tiempo Promedio por Pregunta')}
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 40 }}>#</th>
                    <th style={thStyle}>Pregunta</th>
                    <th style={{ ...thStyle, textAlign: 'right', width: 100 }}>Respuestas</th>
                    <th style={{ ...thStyle, textAlign: 'right', width: 140 }}>Tiempo Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tiempoPorPregunta.map((row) => (
                    <tr key={row.questionNumber}>
                      <td style={{ ...tdStyle, color: '#64748B' }}>{row.questionNumber}</td>
                      <td style={tdStyle}>{row.label}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{row.respuestas}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: row.avgSeconds > 120 ? '#F59E0B' : '#334155' }}>{row.avgSeconds}s</span>
                          {row.avgSeconds > 120 && <span style={{ fontSize: 14 }}>⏱️</span>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Distribución de Respuestas ── */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                {sectionTitle('Distribución de Respuestas por Pregunta')}
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{startDate} - {endDate}</span>
              </div>
              {data.distribucionRespuestas.map((q) => (
                <div key={q.questionNumber} style={{ background: '#F8FAFC', borderRadius: 12, padding: '16px 20px', marginBottom: 12, border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                      Q{q.questionNumber} <span style={{ color: '#334155' }}>{q.label}</span>
                    </span>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>
                      {q.options.reduce((a, b) => a + b.count, 0)} respuestas
                    </span>
                  </div>
                  {q.options.slice(0, 5).map((opt, i) => (
                    <div key={opt.option} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '} {opt.option}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748B' }}>{opt.count} ({opt.pct.toFixed(1)}%)</span>
                      </div>
                      <div style={{ background: '#E2E8F0', borderRadius: 4, height: 6 }}>
                        <div style={{ background: '#6366F1', width: `${opt.pct}%`, height: '100%', borderRadius: 4, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 12, color: '#64748B' }}>
                <p style={{ margin: '4px 0', fontWeight: 600 }}>💡 Análisis de Respuestas:</p>
                <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                  <li>Las opciones más seleccionadas aparecen primero con medallas (🥇🥈🥉)</li>
                  <li>El porcentaje indica qué % de usuarios eligió cada opción</li>
                  <li>Útil para identificar patrones en tu audiencia y optimizar el cuestionario</li>
                </ul>
              </div>
            </div>

            {/* ── Tráfico + País + Dispositivo ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
              {/* Tráfico por fuente */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
                {sectionTitle('Tráfico por Fuente')}
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Fuente</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Visitantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fuenteTrafico.map((row) => (
                      <tr key={row.fuente}>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{row.fuente}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: '#F59E0B', fontWeight: 600 }}>{row.visitantes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Visitantes por País */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
                {sectionTitle('Visitantes por País')}
                {data.visitantesPais.length === 0 ? (
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#1E40AF' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>🌍 Detección de país activa</div>
                    <div style={{ color: '#3B82F6' }}>Las nuevas visitas al funnel quedarán registradas aquí automáticamente. Las sesiones anteriores no tienen este dato.</div>
                  </div>
                ) : (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>País</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Visitantes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.visitantesPais.map((row) => {
                        // Buscar el código ISO del nombre para la bandera
                        const code = Object.entries(COUNTRY_NAMES).find(([, name]) => name === row.pais)?.[0] ?? row.pais.slice(0, 2).toUpperCase()
                        return (
                          <tr key={row.pais}>
                            <td style={{ ...tdStyle, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 18, lineHeight: 1 }}>{countryFlag(code)}</span>
                              {row.pais}
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right', color: '#6366F1', fontWeight: 600 }}>{row.visitantes}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Dispositivo */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
                {sectionTitle('Visitantes por Dispositivo')}
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Dispositivo</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Visitantes</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.visitantesDispositivo.map((row) => (
                      <tr key={row.dispositivo}>
                        <td style={tdStyle}>{row.dispositivo}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: row.dispositivo === 'Bot' ? '#EF4444' : '#6366F1', fontWeight: 600 }}>
                          {row.visitantes}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right', color: '#94A3B8' }}>{row.pct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: 12, color: '#CBD5E1', paddingBottom: 32 }}>
              {lastUpdated && `Última actualización: ${lastUpdated.toLocaleTimeString('es-ES')}`}
              {' · '}
              Datos en tiempo real desde Supabase
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
