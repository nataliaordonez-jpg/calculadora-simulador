import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button, Card, IconComponent } from '@beweco/aurora-ui'
import { FunnelLayout } from '../../_shared/components/funnel-layout/FunnelLayout'
import { ShareModal } from '../components/ShareModal'
import { useFunnelContext } from '../../_shared/context/funnel-context'
import { runDiagnostic } from '@funnel/application/run-diagnostic.usecase'
import { QUESTIONS } from '@funnel/domain/constants/questions.constant'
import { Sector } from '@funnel/domain/enums/sector.enum'
import type { IQuestionnaireAnswer } from '@funnel/domain/interfaces/questionnaire.interface'
import { ScenarioType } from '@funnel/domain/enums/scenario-type.enum'
import { SupabaseDiagnosticAdapter } from '@funnel/infrastructure/adapters/supabase-diagnostic.adapter'

const _diagnosticAdapter = new SupabaseDiagnosticAdapter()

interface ScenarioProjection {
  mes1_3: number
  mes4_6: number
  anio1: number
  roi: number
  horasAhorradas: number
}

interface DiagnosticoResultados {
  nombreNegocio: string
  sector: Sector
  facturacionMensual: number
  tiempoRespuestaPromedio: string
  horasAtencion: number
  porcentajeNoShow: number
  porcentajeChurn: number
  conversacionesMensuales: number
  tamanoEquipo: number
  consultasSinRespuesta: number
  citasPerdidasMes: number
  clientesPerdidosMes: number
  consultasFueraHorario: number
  porcentajeConsultasFueraHorario: number
  ticketPromedio: number
  valorVidaCliente: number
  totalPerdidaMensual: number
  ingresosPerdidosRespuestaLenta: number
  ingresosPerdidosNoShow: number
  ingresosPerdidosFueraHorario: number
  ingresosPerdidosChurn: number
  // Tiempo desperdiciado (Pilares 1 + 4)
  deflectionSavings: number
  productivitySavings: number
  costoTiempoMensual: number
  savedHours: number
  costoHoraAgente: number
  tasaDeflexion: number
  consultasRepetitivasMes: number
  // Baja adquisición
  gananciaAdquisicionMensual: number
  clientesAdicionalesMes: number
  clientesNuevosMes: number
  // Solo Salud
  gananciaAdherenciaMensual: number
  sesionesPorPaciente: number
  sesionesPorPacienteNuevo: number
  sesionesAdicionalesMes: number
  // Solo Fitness
  gananciaUpsellsMensual: number
  ingresosUpsellsActual: number
  escenarioConservador: ScenarioProjection
  escenarioRealista: ScenarioProjection
  escenarioOptimista: ScenarioProjection
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

function formatResponseTime(hours: number): string {
  if (hours <= 0) return '0 min'
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`
  if (hours < 2) return `${hours.toFixed(1)} h`
  return `${Math.round(hours)} h`
}

function generateMockAnswers(): IQuestionnaireAnswer[] {
  return QUESTIONS.map((q) => {
    const opt = q.options[1] ?? q.options[0]
    return {
      questionId: q.id,
      questionNumber: q.number,
      selectedOptionId: opt.id,
      numericValue: opt.numericValue,
    }
  })
}

function getScenarioByType<T extends { type: ScenarioType }>(items: T[], type: ScenarioType): T | undefined {
  return items.find((item) => item.type === type)
}

function useInView<T extends HTMLElement>(threshold = 0.2): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || inView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [inView, threshold])

  return [ref, inView]
}

function useCountUp(target: number, start: boolean, duration = 1800): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return

    let animationFrame = 0
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = clamp((now - startTime) / duration, 0, 1)
      const eased = 1 - (1 - progress) * (1 - progress)
      setValue(Math.round(target * eased))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick)
      }
    }

    animationFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, start, duration])

  return value
}

function getScenarioAutomation(active: 'conservador' | 'realista' | 'optimista'): number {
  if (active === 'conservador') return 60
  if (active === 'optimista') return 85
  return 70
}

function buildDiagnosticsData(
  answers: IQuestionnaireAnswer[],
  businessName: string,
  sector: Sector,
  facturacionMensual: number,
  roiResult: {
    ticketPromedio: number
    monthlyRevenueIncrease: number
    monthlyCostSavings: number
    scenarios: Array<{ type: ScenarioType; monthlyBenefit: number; roiPercentage: number }>
  },
  growthDiagnostic: { metrics: Array<{ metricKey: string; monthlyGain: number; currentValue?: number; projectedValue?: number }> }
): DiagnosticoResultados {
  const answerById = (id: string, fallback: number) => answers.find((a) => a.questionId === id)?.numericValue ?? fallback
  const tiempoRespuestaHoras = answerById('p4', 0.75)
  const horasAtencion = answerById('p6', 8)
  const porcentajeNoShow = answerById('p5', 0.12) * 100
  const porcentajeChurn = answerById('p9', 0.2) * 100
  const conversacionesMensuales = answerById('p11', 300)
  const tamanoEquipo = answerById('p12', 2)
  const clientesMensuales = answerById('p7', 100)
  const porcentajeOportunidadesPerdidas = answerById('p3', 0.1)
  const clientesNuevosMes = answerById('p8', 20)

  const consultasSinRespuesta = Math.round(conversacionesMensuales * porcentajeOportunidadesPerdidas)
  const citasPerdidasMes = Math.round(clientesMensuales * (porcentajeNoShow / 100))
  const clientesPerdidosMes = Math.round(clientesMensuales * (porcentajeChurn / 100))
  const porcentajeConsultasFueraHorario = Math.round(((24 - horasAtencion) / 24) * 100)
  const consultasFueraHorario = Math.round(conversacionesMensuales * (porcentajeConsultasFueraHorario / 100))

  const ticketPromedio = Math.max(roiResult.ticketPromedio, 10)
  const valorVidaCliente = Math.round(ticketPromedio * (sector === Sector.FITNESS ? 8 : 6))

  const ingresosPerdidosRespuestaLenta = Math.round(roiResult.monthlyRevenueIncrease * 0.45)
  const ingresosPerdidosNoShow = Math.round(citasPerdidasMes * ticketPromedio * 0.55)
  const ingresosPerdidosFueraHorario = Math.round(consultasFueraHorario * ticketPromedio * 0.18)
  const churnGain = growthDiagnostic.metrics.find((m) => m.metricKey === 'churn_reduction')?.monthlyGain ?? 0
  const ingresosPerdidosChurn = Math.round(Math.max(churnGain, clientesPerdidosMes * valorVidaCliente * 0.12))

  // ── Tiempo Desperdiciado (Pilar 1 Deflexión + Pilar 4 Productividad) ──
  const tasaDeflexion = 0.35 // 35% de consultas son repetitivas (tasa base)
  const costoHoraAgente = 12  // USD/hora (costo promedio agente base)
  const AVERAGE_HANDLING_TIME = 0.25 // 15 min por consulta
  const consultasRepetitivasMes = Math.round(conversacionesMensuales * tasaDeflexion)
  const deflectionSavings = Math.round(consultasRepetitivasMes * AVERAGE_HANDLING_TIME * costoHoraAgente)
  const savedHours = Math.round(consultasRepetitivasMes * AVERAGE_HANDLING_TIME)
  const productivitySavings = Math.round(roiResult.monthlyCostSavings * 0.5)
  const costoTiempoMensual = deflectionSavings + productivitySavings

  // ── Baja Adquisición ──
  const acquisitionMetric = growthDiagnostic.metrics.find((m) => m.metricKey === 'acquisition')
  const gananciaAdquisicionMensual = Math.round(acquisitionMetric?.monthlyGain ?? clientesNuevosMes * ticketPromedio * 0.35)
  const clientesAdicionalesMes = Math.round(
    acquisitionMetric
      ? (acquisitionMetric.projectedValue ?? clientesNuevosMes) - (acquisitionMetric.currentValue ?? clientesNuevosMes)
      : clientesNuevosMes * 0.35
  )

  // ── Adherencia (Solo Salud) ──
  const adherenceMetric = growthDiagnostic.metrics.find((m) => m.metricKey === 'adherence')
  const gananciaAdherenciaMensual = Math.round(adherenceMetric?.monthlyGain ?? 0)
  const sesionesPorPaciente = Math.round((adherenceMetric?.currentValue ?? 3) * 10) / 10
  const sesionesPorPacienteNuevo = Math.round((adherenceMetric?.projectedValue ?? 4) * 10) / 10
  const sesionesAdicionalesMes = Math.round(clientesMensuales * (sesionesPorPacienteNuevo - sesionesPorPaciente))

  // ── Upsells (Solo Fitness) ──
  const upsellsMetric = growthDiagnostic.metrics.find((m) => m.metricKey === 'upsells')
  const gananciaUpsellsMensual = Math.round(upsellsMetric?.monthlyGain ?? 0)
  const ingresosUpsellsActual = Math.round(upsellsMetric?.currentValue ?? facturacionMensual * 0.08)

  const totalPerdidaMensual = Math.round(
    ingresosPerdidosRespuestaLenta +
      ingresosPerdidosNoShow +
      ingresosPerdidosFueraHorario +
      ingresosPerdidosChurn +
      costoTiempoMensual +
      gananciaAdquisicionMensual
  )

  const pessimistic = getScenarioByType(roiResult.scenarios, ScenarioType.PESSIMISTIC) ?? roiResult.scenarios[0]
  const base = getScenarioByType(roiResult.scenarios, ScenarioType.BASE) ?? roiResult.scenarios[1] ?? roiResult.scenarios[0]
  const optimistic = getScenarioByType(roiResult.scenarios, ScenarioType.OPTIMISTIC) ?? roiResult.scenarios[2] ?? base

  const monthlyHours = tamanoEquipo * horasAtencion * 22
  const scenarioHours = {
    conservador: Math.round(monthlyHours * 0.08),
    realista: Math.round(monthlyHours * 0.12),
    optimista: Math.round(monthlyHours * 0.16),
  }

  const escenarioConservador = {
    mes1_3: Math.round(pessimistic.monthlyBenefit),
    mes4_6: Math.round(pessimistic.monthlyBenefit * 1.95),
    anio1: Math.round(pessimistic.monthlyBenefit * 12),
    roi: Math.round(pessimistic.roiPercentage),
    horasAhorradas: scenarioHours.conservador,
  }
  const escenarioRealista = {
    mes1_3: Math.round(base.monthlyBenefit),
    mes4_6: Math.round(base.monthlyBenefit * 1.9),
    anio1: Math.round(base.monthlyBenefit * 12),
    roi: Math.round(base.roiPercentage),
    horasAhorradas: scenarioHours.realista,
  }
  const escenarioOptimista = {
    mes1_3: Math.round(optimistic.monthlyBenefit),
    mes4_6: Math.round(optimistic.monthlyBenefit * 1.9),
    anio1: Math.round(optimistic.monthlyBenefit * 12),
    roi: Math.round(optimistic.roiPercentage),
    horasAhorradas: scenarioHours.optimista,
  }

  return {
    nombreNegocio: businessName,
    sector,
    facturacionMensual,
    tiempoRespuestaPromedio: formatResponseTime(tiempoRespuestaHoras),
    horasAtencion: Math.round(horasAtencion),
    porcentajeNoShow: Math.round(porcentajeNoShow),
    porcentajeChurn: Math.round(porcentajeChurn),
    conversacionesMensuales: Math.round(conversacionesMensuales),
    tamanoEquipo: Math.round(tamanoEquipo),
    consultasSinRespuesta,
    citasPerdidasMes,
    clientesPerdidosMes,
    consultasFueraHorario,
    porcentajeConsultasFueraHorario,
    ticketPromedio: Math.round(ticketPromedio),
    valorVidaCliente,
    totalPerdidaMensual,
    ingresosPerdidosRespuestaLenta,
    ingresosPerdidosNoShow,
    ingresosPerdidosFueraHorario,
    ingresosPerdidosChurn,
    deflectionSavings,
    productivitySavings,
    costoTiempoMensual,
    savedHours,
    costoHoraAgente,
    tasaDeflexion: Math.round(tasaDeflexion * 100),
    consultasRepetitivasMes,
    gananciaAdquisicionMensual,
    clientesAdicionalesMes,
    clientesNuevosMes: Math.round(clientesNuevosMes),
    gananciaAdherenciaMensual,
    sesionesPorPaciente,
    sesionesPorPacienteNuevo,
    sesionesAdicionalesMes,
    gananciaUpsellsMensual,
    ingresosUpsellsActual,
    escenarioConservador,
    escenarioRealista,
    escenarioOptimista,
  }
}

function RevealCard({
  children,
  delayMs = 0,
  className = '',
}: {
  children: ReactNode
  delayMs?: number
  className?: string
}) {
  const [ref, visible] = useInView<HTMLDivElement>(0.2)

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(24px)',
        transition: `all 700ms ease ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  )
}

function ChatSimulation({ serviceType, businessName, sector, managesAppointments = true }: { serviceType: string; businessName: string; sector: Sector; managesAppointments?: boolean }) {
  const [chatRef, chatVisible] = useInView<HTMLDivElement>(0.3)
  const [visibleCount, setVisibleCount] = useState(0)
  const [showTyping, setShowTyping] = useState(false)

  // Fecha de mañana en español
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const serviceEmoji = {
    [Sector.BELLEZA]:   '✂️',
    [Sector.SALUD]:     '🩺',
    [Sector.FITNESS]:   '💪',
    [Sector.BIENESTAR]: '💆',
  }[sector] ?? '📋'

  // ── Conversación CON citas / clases ──
  const confirmationContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <p className="text-small font-semibold text-base-dark">¡Listo! ✅ Tu cita está confirmada:</p>
      <p className="text-small text-base-dark">📅 {dateFormatted}, 3:00 PM</p>
      <p className="text-small text-base-dark">{serviceEmoji} {serviceType} (60 min)</p>
      <p className="text-small text-base-dark">📍 {businessName}</p>
    </div>
  )

  const appointmentMessages: { side: string; content: ReactNode }[] = [
    { side: 'right', content: `Hola, quisiera saber si tienen disponibilidad para ${serviceType} mañana a las 3pm` },
    { side: 'left',  content: `¡Hola! Claro que sí. Tengo disponibilidad mañana a las 3:00 PM para ${serviceType}. ¿Te gustaría que te lo agende?` },
    { side: 'right', content: 'Perfecto, sí por favor' },
    { side: 'left',  content: confirmationContent },
  ]

  // ── Conversación SIN citas / clases — alternativa por nicho ──
  const alternativeMessages: Record<Sector, { side: string; content: ReactNode }[]> = {
    [Sector.FITNESS]: [
      { side: 'right', content: 'Hola, ¿cuánto cuesta la membresía mensual y qué incluye?' },
      { side: 'left',  content: `¡Hola! 💪 En ${businessName} tenemos planes para todos los objetivos. ¿Te cuento qué incluye cada uno?` },
      { side: 'right', content: 'Sí, me interesa el plan completo' },
      { side: 'left',  content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p className="text-small font-semibold text-base-dark">💪 Planes disponibles en {businessName}:</p>
          <p className="text-small text-base-dark">🥉 Básico — Acceso a sala y zona de pesas</p>
          <p className="text-small text-base-dark">🥈 Premium — Sala + zonas especializadas</p>
          <p className="text-small text-base-dark">🥇 VIP — Acceso total + servicios incluidos</p>
          <p className="text-small text-base-dark">¿Te enviamos precios y condiciones? 📲</p>
        </div>
      )},
    ],
    [Sector.SALUD]: [
      { side: 'right', content: 'Hola, quisiera información sobre sus tratamientos para control de glucosa' },
      { side: 'left',  content: `¡Hola! 🩺 En ${businessName} contamos con programas de control metabólico. ¿Es para un diagnóstico previo o control preventivo?` },
      { side: 'right', content: 'Es para control preventivo' },
      { side: 'left',  content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p className="text-small font-semibold text-base-dark">🩺 Programa de Control Preventivo:</p>
          <p className="text-small text-base-dark">📋 Evaluación inicial completa</p>
          <p className="text-small text-base-dark">🧪 Análisis de laboratorio incluido</p>
          <p className="text-small text-base-dark">📊 Seguimiento personalizado mensual</p>
          <p className="text-small text-base-dark">¿Te gustaría que un especialista te contacte? 📲</p>
        </div>
      )},
    ],
    [Sector.BIENESTAR]: [
      { side: 'right', content: 'Hola, ¿qué servicios tienen para el manejo del estrés?' },
      { side: 'left',  content: `¡Hola! 🌿 En ${businessName} tenemos masajes relajantes, aromaterapia, meditación guiada y reflexología. ¿Sobre cuál te gustaría más información?` },
      { side: 'right', content: 'Me interesa la aromaterapia' },
      { side: 'left',  content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p className="text-small font-semibold text-base-dark">🌿 Sesión de Aromaterapia en {businessName}:</p>
          <p className="text-small text-base-dark">⏱️ 60 min · Aceites esenciales 100% naturales</p>
          <p className="text-small text-base-dark">🎯 Reduce estrés, ansiedad y tensión muscular</p>
          <p className="text-small text-base-dark">✨ Incluye evaluación aromática personalizada</p>
          <p className="text-small text-base-dark">¿Te enviamos precios y disponibilidad? 📲</p>
        </div>
      )},
    ],
    [Sector.BELLEZA]: [
      { side: 'right', content: 'Hola, ¿qué tratamientos tienen para cabello dañado por decoloración?' },
      { side: 'left',  content: `¡Hola! ✂️ En ${businessName} tenemos tratamientos reconstructivos especializados. ¿Quieres que te cuente sobre nuestra línea de recuperación capilar?` },
      { side: 'right', content: 'Sí, me interesa' },
      { side: 'left',  content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p className="text-small font-semibold text-base-dark">✂️ Línea de Recuperación Capilar:</p>
          <p className="text-small text-base-dark">💆 Tratamiento de keratina y proteínas</p>
          <p className="text-small text-base-dark">✨ Hidratación profunda con aceites naturales</p>
          <p className="text-small text-base-dark">🛍️ También disponible para uso en casa</p>
          <p className="text-small text-base-dark">¿Te gustaría conocer precios? 📲</p>
        </div>
      )},
    ],
  }

  const messages = managesAppointments
    ? appointmentMessages
    : (alternativeMessages[sector] ?? appointmentMessages)

  useEffect(() => {
    if (!chatVisible) return

    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setVisibleCount(1), 300))
    timers.push(setTimeout(() => setShowTyping(true), 1100))
    timers.push(setTimeout(() => { setShowTyping(false); setVisibleCount(2) }, 2800))
    timers.push(setTimeout(() => setVisibleCount(3), 4000))
    timers.push(setTimeout(() => setShowTyping(true), 4800))
    timers.push(setTimeout(() => { setShowTyping(false); setVisibleCount(4) }, 6400))
    timers.push(setTimeout(() => setShowTyping(true), 7200))

    return () => timers.forEach(clearTimeout)
  }, [chatVisible])

  return (
    <div ref={chatRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {messages.slice(0, visibleCount).map((msg, index) => (
        <div
          key={`msg-${index}`}
          className={`flex ${msg.side === 'right' ? 'justify-end' : 'justify-start'}`}
          style={{ animation: 'chatBubbleIn 420ms cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-small ${
              msg.side === 'right' ? 'bg-primary-400 text-white' : 'text-base-dark'
            }`}
            style={msg.side === 'left' ? { backgroundColor: '#D6F6EB', border: '1px solid #9AE9CC' } : {}}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {showTyping && (
        <div className="flex justify-start" style={{ animation: 'chatBubbleIn 300ms ease both' }}>
          <div
            className="rounded-2xl px-4 py-3 text-small text-base-dark inline-flex items-center gap-1"
            style={{ backgroundColor: '#D6F6EB', border: '1px solid #9AE9CC' }}
          >
            <span className="typing-dot">.</span>
            <span className="typing-dot" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="typing-dot" style={{ animationDelay: '0.4s' }}>.</span>
            <span className="ml-1 text-small text-base-dark/70">Linda está escribiendo</span>
          </div>
        </div>
      )}
    </div>
  )
}

function HeartBreak({ triggered }: { triggered: boolean }) {
  return (
    // key cambia cuando triggered pasa a true → reinicia la animación si el usuario vuelve a entrar en vista
    <span
      key={triggered ? 'active' : 'idle'}
      className="relative inline-block"
      style={{ width: '1.4em', height: '1.4em', verticalAlign: 'middle' }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center text-[1.8rem]"
        style={{
          animation: triggered ? 'heartWhole 2s ease-in-out 2 forwards' : 'none',
          opacity: triggered ? undefined : 1,
        }}
      >
        ❤️
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center text-[1.8rem]"
        style={{
          animation: triggered ? 'heartBroken 2s ease-in-out 2 forwards' : 'none',
          opacity: triggered ? undefined : 0,
        }}
      >
        💔
      </span>
    </span>
  )
}

interface MetricItem {
  icon: string
  iconColor: string
  iconBg: string
  iconClass: string
  animation: string
  animDuration: string
  title: string
  value: string
  description: string
  badge: string
  badgeClass: string
  badgeIcon: string
  badgeIconColor: string
  border: string
}

function MetricCard({ metric, delayMs, className = '' }: { metric: MetricItem; delayMs: number; className?: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <RevealCard delayMs={delayMs} className={`h-full ${className}`}>
      <div
        className={`h-full bg-white rounded-2xl shadow-sm border border-primary-100 border-l-[5px] ${metric.border} transition-all duration-300 flex flex-col p-6 cursor-default`}
        style={{ transform: hovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: hovered ? '0 10px 30px rgba(0,0,0,0.12)' : '' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex-1">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: metric.iconBg,
              animation: hovered ? `${metric.animation} ${metric.animDuration} ease-in-out` : 'none',
            }}
          >
            <IconComponent icon={metric.icon} size="lg" color={metric.iconColor} />
          </div>
          <p className="text-small font-semibold text-base-dark/60 mt-4">{metric.title}</p>
          <p className="text-[2.2rem] font-black text-base-dark mt-1">{metric.value}</p>
          <p className="text-body text-base-dark/70 mt-3">{metric.description}</p>
        </div>
        <span className={`inline-flex items-center gap-2 mt-6 rounded-full px-3 py-1.5 text-small font-medium ${metric.badgeClass}`}>
          <IconComponent icon={metric.badgeIcon} size="sm" color={metric.badgeIconColor} />
          {metric.badge}
        </span>
      </div>
    </RevealCard>
  )
}

interface PainItem {
  key: string
  icon: string
  iconColor: string
  iconBg: string
  animation: string
  animDuration: string
  animIterations: string
  title: string
  subtitle: string
  explain: string
  bullets: string[]
  impact: number
  impactText: string
  border: string
}

// ── Terminología por sector ──
function getSectorTerms(sector: Sector) {
  switch (sector) {
    case Sector.FITNESS:
      return { cliente: 'miembro', clientes: 'miembros', cita: 'clase', citas: 'clases' }
    case Sector.SALUD:
      return { cliente: 'paciente', clientes: 'pacientes', cita: 'cita', citas: 'citas' }
    case Sector.BIENESTAR:
      return { cliente: 'alumno', clientes: 'alumnos', cita: 'clase', citas: 'clases' }
    default:
      return { cliente: 'cliente', clientes: 'clientes', cita: 'cita', citas: 'citas' }
  }
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function PainCard({ pain, delayMs }: { pain: PainItem; delayMs: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <RevealCard key={pain.key} delayMs={delayMs}>
      <div
        className={`bg-white rounded-2xl shadow-sm border border-primary-100 border-l-[6px] ${pain.border} transition-all duration-300 p-6 cursor-default`}
        style={{ transform: hovered ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.1)' : '' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: pain.iconBg,
              animation: hovered ? `${pain.animation} ${pain.animDuration} ease-in-out ${pain.animIterations}` : 'none',
            }}
          >
            <IconComponent icon={pain.icon} size="md" color={pain.iconColor} />
          </div>
          <div>
            <h3 className="text-h3 text-base-dark">{pain.title}</h3>
            <p className="text-small text-base-dark/60">{pain.subtitle}</p>
          </div>
        </div>
        <p className="text-body text-base-dark/75" style={{ marginTop: '20px', marginBottom: '20px' }}>{pain.explain}</p>
        <div className="rounded-xl bg-white p-4 border border-primary-100">
          <p className="text-small font-semibold text-base-dark mb-2">EN TU CASO:</p>
          <ul className="space-y-1">
            {pain.bullets.map((bullet) => (
              <li key={bullet} className="text-small text-base-dark/70">• {bullet}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#F87171', marginTop: '20px' }}>
          <p className="text-[2rem] font-black text-white">
            {formatCurrency(pain.impact)}/mes
          </p>
          <p className="text-small text-white/80">{pain.impactText}</p>
        </div>
      </div>
    </RevealCard>
  )
}

function buildPainCards(data: DiagnosticoResultados): PainItem[] {
  const cards: PainItem[] = []
  const t = getSectorTerms(data.sector)

  // ── BASE 1: Respuestas Lentas (todos los sectores) ──
  cards.push({
    key: 'slow', icon: 'solar:alarm-linear', iconColor: '#F87171', iconBg: '#FEE2E2',
    animation: 'relojTick', animDuration: '0.6s', animIterations: '3',
    title: 'Respuestas Lentas', subtitle: `${data.tiempoRespuestaPromedio} promedio de respuesta`,
    explain: 'Por cada 10 minutos de retraso, pierdes un 7% de probabilidad de cerrar la venta. (Fuente: Harvard Business Review)',
    bullets: [
      `${data.consultasSinRespuesta} consultas al mes llegan y nunca reciben respuesta`,
      `Cada una representa ~${formatCurrency(data.ticketPromedio)} de venta potencial`,
      `Tus competidores que responden en menos de 5 minutos se quedan con esos ${t.clientes}`,
    ],
    impact: data.ingresosPerdidosRespuestaLenta,
    impactText: 'en oportunidades perdidas por responder tarde',
    border: 'border-l-primary-500',
  })

  // ── BASE 2: Horario Limitado (todos los sectores) ──
  cards.push({
    key: 'hours', icon: 'solar:moon-stars-linear', iconColor: '#FBBF24', iconBg: '#FEF3C7',
    animation: 'lunaHide', animDuration: '1.2s', animIterations: '1',
    title: 'Horario Limitado', subtitle: `Solo ${data.horasAtencion} de 24 horas cubiertas`,
    explain: `El ${data.porcentajeConsultasFueraHorario}% de tus consultas llega cuando estás cerrado. Tus ${t.clientes} no duermen cuando tú duermes.`,
    bullets: [
      `${24 - data.horasAtencion} horas al día sin atención`,
      `${data.consultasFueraHorario} consultas/mes fuera de horario`,
      'Para cuando abres al día siguiente, ya eligieron a otro proveedor',
    ],
    impact: data.ingresosPerdidosFueraHorario,
    impactText: 'en ventas fuera de horario que nadie responde',
    border: 'border-l-primary-400',
  })

  // ── BASE 3: Churn (todos los sectores) ──
  cards.push({
    key: 'churn', icon: 'solar:user-cross-linear', iconColor: '#34D399', iconBg: '#D6F6EB',
    animation: 'manoAway', animDuration: '1.5s', animIterations: '1',
    title: `${cap(t.clientes)} que Se Van`, subtitle: `${data.porcentajeChurn}% de churn mensual`,
    explain: `Retener un ${t.cliente} cuesta 7 veces menos que conseguir uno nuevo. Sin seguimiento automatizado, se van en silencio.`,
    bullets: [
      `${data.clientesPerdidosMes} ${t.clientes} al mes no vuelven después de su última ${t.cita}`,
      `Valor de vida promedio del ${t.cliente}: ~${formatCurrency(data.valorVidaCliente)}`,
      'Sin un sistema de retención, pierdes esa relación para siempre',
    ],
    impact: data.ingresosPerdidosChurn,
    impactText: `en ingresos futuros que se van con cada ${t.cliente} perdido`,
    border: 'border-l-error',
  })

  // ── BASE 4: Tiempo Desperdiciado en Tareas Repetitivas (todos los sectores) ──
  cards.push({
    key: 'waste', icon: 'solar:widget-5-linear', iconColor: '#60A5FA', iconBg: '#DFEDFE',
    animation: 'relojTick', animDuration: '0.8s', animIterations: '3',
    title: 'Tiempo Desperdiciado en Tareas Repetitivas', subtitle: `${data.tasaDeflexion}% de tus consultas son preguntas repetitivas`,
    explain: 'Tu equipo pasa horas respondiendo las mismas preguntas una y otra vez. Ese tiempo podría invertirse en cerrar ventas y mejorar la experiencia.',
    bullets: [
      `${data.consultasRepetitivasMes} consultas repetitivas al mes que tu equipo responde manualmente`,
      `Tu equipo gasta ~${data.savedHours} horas respondiendo lo mismo`,
      `Cada hora de tu equipo cuesta ~${formatCurrency(data.costoHoraAgente)}`,
    ],
    impact: data.costoTiempoMensual,
    impactText: 'en tiempo que podría invertirse en actividades de alto valor',
    border: 'border-l-secondary-400',
  })

  // ── BASE 5: Baja Adquisición (todos los sectores) ──
  cards.push({
    key: 'acquisition', icon: 'solar:chart-2-linear', iconColor: '#34D399', iconBg: '#D6F6EB',
    animation: 'calendarioFloat', animDuration: '1.0s', animIterations: '2',
    title: `Captación Lenta de Nuevos ${cap(t.clientes)}`, subtitle: `${data.clientesNuevosMes} nuevos ${t.clientes} al mes`,
    explain: `Responder rápido es la clave para captar ${t.clientes} nuevos. Los negocios que responden en menos de 5 minutos captan un 35% más de ${t.clientes}.`,
    bullets: [
      `Respondes en ${data.tiempoRespuestaPromedio} promedio — tus competidores responden en <5 min`,
      `Los negocios que responden más rápido captan el 35% más de ${t.clientes} nuevos`,
      `Podrías captar ${data.clientesAdicionalesMes} ${t.clientes} adicionales al mes`,
    ],
    impact: data.gananciaAdquisicionMensual,
    impactText: `en ingresos de nuevos ${t.clientes} que tus competidores te están quitando`,
    border: 'border-l-secondary-500',
  })

  // ── SECTOR: Citas/Clases Vacías (solo si el usuario maneja citas/clases) ──
  if (data.porcentajeNoShow > 0) {
  cards.push({
    key: 'noshow', icon: 'solar:calendar-linear', iconColor: '#60A5FA', iconBg: '#DFEDFE',
    animation: 'calendarioFlip', animDuration: '0.8s', animIterations: '1',
      title: `${cap(t.citas)} Vacías`, subtitle: `${data.porcentajeNoShow}% de no-show mensual`,
      explain: `Cada ${t.cita} vacía es un espacio en tu agenda que no genera ingreso pero sí tiene un costo operativo.`,
    bullets: [
        `${data.citasPerdidasMes} ${t.citas} perdidas al mes`,
      `Ticket promedio por servicio: ${formatCurrency(data.ticketPromedio)}`,
        `Sin recordatorios automáticos, los ${t.clientes} simplemente olvidan`,
    ],
    impact: data.ingresosPerdidosNoShow,
      impactText: `en ${t.citas} vacías que pudieron generar ingreso`,
    border: 'border-l-warning',
  })
  }

  // ── SECTOR SALUD: Adherencia Baja ──
  if (data.sector === Sector.SALUD && data.gananciaAdherenciaMensual > 0) {
    cards.push({
      key: 'adherence', icon: 'solar:medical-kit-linear', iconColor: '#34D399', iconBg: '#D6F6EB',
      animation: 'relojTick', animDuration: '1.0s', animIterations: '2',
      title: 'Pacientes que Abandonan Tratamientos', subtitle: `${data.sesionesPorPaciente} sesiones promedio por paciente`,
      explain: 'Sin seguimiento automatizado, los pacientes olvidan continuar su tratamiento. Cada abandono representa ingresos perdidos y peores resultados clínicos.',
      bullets: [
        `Sin seguimiento automatizado, los pacientes olvidan continuar`,
        `Podrías incrementar a ${data.sesionesPorPacienteNuevo} sesiones por paciente`,
        `Son ${data.sesionesAdicionalesMes} consultas más al mes`,
      ],
      impact: data.gananciaAdherenciaMensual,
      impactText: 'en sesiones que se completan gracias al seguimiento automatizado',
      border: 'border-l-secondary-400',
    })
  }

  // ── SECTOR FITNESS: Upsells Perdidos ──
  if (data.sector === Sector.FITNESS && data.gananciaUpsellsMensual > 0) {
    cards.push({
      key: 'upsells', icon: 'solar:bag-smile-linear', iconColor: '#FAD19E', iconBg: '#FEF3C7',
      animation: 'manoAdios', animDuration: '1.0s', animIterations: '2',
      title: 'Oportunidades de Venta Cruzada Perdidas', subtitle: `${formatCurrency(data.ingresosUpsellsActual)} en servicios adicionales actuales`,
      explain: `Linda puede sugerir servicios complementarios en el momento exacto. Los ${t.clientes} que reciben recomendaciones personalizadas gastan un 31% más.`,
      bullets: [
        'Linda sugiere servicios complementarios en el momento exacto',
        `Los ${t.clientes} con recomendaciones personalizadas gastan 31% más`,
        `Podrías generar ${formatCurrency(data.gananciaUpsellsMensual)} adicionales en ventas cruzadas`,
      ],
      impact: data.gananciaUpsellsMensual,
      impactText: 'en ventas adicionales que no estás proponiendo',
      border: 'border-l-warning',
    })
  }

  return cards
}

export function ResultsDashboardPage() {
  const { state, dispatch } = useFunnelContext()
  const act2Ref = useRef<HTMLElement>(null)
  const act7Ref = useRef<HTMLElement>(null)
  const scenarioContentRef = useRef<HTMLDivElement>(null)
  const [activeScenario, setActiveScenario] = useState<'conservador' | 'realista' | 'optimista'>('realista')
  const [openFormula, setOpenFormula] = useState<number | null>(null)
  const [hoveredFormula, setHoveredFormula] = useState<number | null>(null)
  const [rocketHovered, setRocketHovered] = useState(false)
  /**
   * URL de compartir definitiva.
   * - Si ya hay shareId en contexto (flujo normal): construye la URL permanente inmediatamente.
   * - Si no: arranca como null mientras se intenta guardar en Supabase.
   * - Fallback garantizado: si Supabase falla/no está configurado → usa window.location.href.
   */
  const [shareUrl, setShareUrl] = useState<string | null>(
    state.shareId ? `${window.location.origin}/r/${state.shareId}` : null
  )

  const answersForRendering = useMemo(() => {
    return state.questionnaire.answers.length > 0 ? state.questionnaire.answers : generateMockAnswers()
  }, [state.questionnaire.answers])

  const fullResults = useMemo(() => {
    const config = state.businessConfig.businessName
      ? state.businessConfig
      : { ...state.businessConfig, businessName: 'Tu Negocio' }

    const calculated = state.roiResult && state.growthDiagnostic && state.beweScore
      ? {
          roi: state.roiResult,
          growth: state.growthDiagnostic,
          beweScore: state.beweScore,
        }
      : runDiagnostic(answersForRendering, config)

    const facturacionMensual = answersForRendering.find((a) => a.questionId === 'p2')?.numericValue ?? 4000

    return {
      diagnostico: buildDiagnosticsData(
        answersForRendering,
        config.businessName,
        config.sector,
        facturacionMensual,
        calculated.roi,
        calculated.growth
      ),
      config,
      calculated,
    }
  }, [state, answersForRendering])

  const data = fullResults.diagnostico
  const t = getSectorTerms(data.sector)
  const serviceType = {
    [Sector.BELLEZA]: 'corte y styling',
    [Sector.SALUD]: 'consulta de valoración',
    [Sector.FITNESS]: 'clase personalizada',
    [Sector.BIENESTAR]: 'masaje relajante',
  }[data.sector]

  const [heroRef, heroVisible] = useInView<HTMLDivElement>(0.35)
  const [totalRef, totalVisible] = useInView<HTMLDivElement>(0.45)
  // HeartBreak: se activa cuando el título está al 50% de la pantalla
  const [heartRef, heartVisible] = useInView<HTMLHeadingElement>(0.5)
  const heroAmount = useCountUp(data.totalPerdidaMensual, heroVisible, 2000)
  const totalAmount = useCountUp(data.totalPerdidaMensual, totalVisible, 1700)
  const stickyDiff = data.escenarioRealista.mes4_6 + data.totalPerdidaMensual

  const activeScenarioData =
    activeScenario === 'conservador'
      ? data.escenarioConservador
      : activeScenario === 'optimista'
      ? data.escenarioOptimista
      : data.escenarioRealista
  const automationRate = getScenarioAutomation(activeScenario)
  const stage1Recovery = Math.round(activeScenarioData.mes1_3 * 0.5)
  const stage1NoShow   = Math.round(activeScenarioData.mes1_3 * 0.25)
  const stage1Savings  = Math.round(activeScenarioData.mes1_3 * 0.25)
  const stage2IngresosAdicionales = Math.round(activeScenarioData.mes4_6 * 0.76)
  const stage2ClientesRecuperados = Math.round(activeScenarioData.mes4_6 * 0.24)

  const goToAct7 = () => {
    act7Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const goToAct2 = () => {
    act2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleFreeTrial = () => window.open('https://bewe.co/demo', '_blank')

  /**
   * Garantiza que siempre haya una shareUrl disponible.
   * 1. Si ya tenemos URL (shareId del contexto) → no hace nada.
   * 2. Si no → intenta guardar en Supabase y obtener la URL permanente /r/:id.
   * 3. Si Supabase falla, retorna null, o supera 8s → usa window.location.href como fallback.
   */
  useEffect(() => {
    if (shareUrl) return // Ya tenemos URL — no hacer nada

    let cancelled = false

    // Timeout de seguridad: si en 8s no llegó respuesta, usamos la URL actual
    const fallbackTimer = setTimeout(() => {
      if (!cancelled) setShareUrl(window.location.href)
    }, 8000)

    const { calculated, config } = fullResults
    void _diagnosticAdapter.saveDiagnosticSnapshot({
      businessConfig: config,
      answers: answersForRendering,
      roiResult: calculated.roi,
      growthDiagnostic: calculated.growth,
      beweScore: calculated.beweScore,
    }).then((id) => {
      clearTimeout(fallbackTimer)
      if (cancelled) return
      if (id) {
        const permanentUrl = `${window.location.origin}/r/${id}`
        setShareUrl(permanentUrl)
        dispatch({ type: 'SET_SHARE_ID', payload: id })
      } else {
        // Supabase no configurado (sin .env.local) o no devolvió ID → fallback a URL actual
        console.warn('[ShareUrl] Supabase no configurado o no retornó ID. ¿Existe el archivo .env.local?')
        setShareUrl(window.location.href)
      }
    }).catch((err: unknown) => {
      clearTimeout(fallbackTimer)
      console.error('[ShareUrl] Error guardando en Supabase:', err)
      if (!cancelled) setShareUrl(window.location.href)
    })

    return () => {
      cancelled = true
      clearTimeout(fallbackTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo al montar

  // Si ProcessingPage termina de guardar mientras el usuario ya está aquí,
  // actualizar shareUrl con la URL permanente (mejor que la fallback)
  useEffect(() => {
    if (state.shareId && (!shareUrl || !shareUrl.includes('/r/'))) {
      setShareUrl(`${window.location.origin}/r/${state.shareId}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.shareId])

  // Scroll inmediato al hero al montar (evita que React Router mantenga scroll previo)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  // Scrollbar degradé — solo activa en esta página
  useEffect(() => {
    document.documentElement.classList.add('results-page')
    return () => {
      document.documentElement.classList.remove('results-page')
    }
  }, [])

  return (
    <FunnelLayout showHeader={false}>
      {/* ── SHARE MODAL (aparece 3s después de cargar) ── */}
      <ShareModal
        businessName={data.nombreNegocio}
        roi={data.escenarioRealista.roi}
        potentialMonthly={data.escenarioRealista.mes4_6}
        totalPerdidaMensual={data.totalPerdidaMensual}
        formatCurrency={formatCurrency}
        shareUrl={shareUrl ?? undefined}
      />

      <div className="relative">
        {/* ── Fondo gradiente fijo — permanece durante el scroll ── */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: -1, background: 'linear-gradient(135deg, #0A2540 0%, #1B4F8A 40%, #2E8B7A 75%, #34D399 100%)' }}
        />
        <aside className="hidden min-[1400px]:block fixed right-10 top-1/2 -translate-y-1/2 z-30 w-[300px]">
          <Card shadow="lg" radius="lg" padding="lg" className="border border-primary-200 bg-white/95 backdrop-blur-md">
            <p className="text-small font-semibold text-base-dark mb-3">TU SITUACIÓN</p>
            <div className="space-y-3">
              <div>
                <p className="text-small text-base-dark/50">PERDIENDO HOY:</p>
                <p className="text-h3" style={{ color: 'var(--color-secondary-500)' }}>
                  -{formatCurrency(data.totalPerdidaMensual)}/mes
                </p>
              </div>
              <div>
                <p className="text-small text-base-dark/50">CON LINDA IA:</p>
                <p className="text-h3" style={{ color: 'var(--color-secondary-500)' }}>
                  +{formatCurrency(data.escenarioRealista.mes4_6)}/mes
                </p>
              </div>
              <div className="rounded-xl bg-primary-100 p-3">
                <p className="text-h3" style={{ color: '#2FBE8A' }}>+{formatCurrency(stickyDiff)}/mes</p>
                <p className="text-small" style={{ color: '#487CBB' }}>de diferencia</p>
              </div>
              <Button
                color="primary"
                radius="full"
                size="lg"
                className="w-full animate-heartbeat"
                onPress={goToAct7}
                startContent={<IconComponent icon="solar:rocket-2-linear" size="sm" color="#fff" />}
              >
                Activar Free Trial
              </Button>
              <p className="text-small text-center text-base-dark/60">15 días gratis · Sin tarjeta</p>
            </div>
          </Card>
        </aside>

        <section
          ref={heroRef}
          className="min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 py-16 md:py-20"
        >
          <div
            className={`transition-all duration-[2000ms] ${
              heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
            style={{ willChange: 'transform, opacity' }}
          >
            <p className="text-[4.5rem] md:text-[7rem] font-black leading-none" style={{ color: '#F87171' }}>
              -{formatCurrency(heroAmount)}
            </p>
          </div>
          <h1 className="text-h1 md:text-[3rem] font-bold text-white max-w-4xl" style={{ marginTop: '56px' }}>
            Esto es lo que tu negocio está dejando de ganar cada mes
          </h1>
          <p className="text-body text-white/70" style={{ marginTop: '32px' }}>
            Basado en las respuestas de tu diagnóstico de {data.nombreNegocio}
          </p>
          <div style={{ marginTop: '64px' }}>
            <button
              type="button"
              onClick={goToAct2}
              className="inline-flex items-center gap-2 text-small animate-bounce"
              style={{ color: '#FFFFFF' }}
            >
              Scroll hacia abajo
              <IconComponent icon="solar:alt-arrow-down-linear" size="sm" color="#fff" />
            </button>
          </div>
        </section>

        <section ref={act2Ref} className="max-w-[1200px] mx-auto px-6 md:px-12" style={{ paddingTop: '80px', paddingBottom: '100px' }}>
          <h2 className="text-h1 text-white mb-3 text-center">Radiografía de {data.nombreNegocio} Total</h2>
          <p className="text-body text-white/70 text-center" style={{ marginBottom: '48px' }}>
            Así está tu negocio HOY. Estos son los números reales que revelaron tus respuestas:
          </p>
          {(() => {
            const radiografiaCards: MetricItem[] = [
              {
                icon: 'solar:alarm-linear', iconColor: '#F87171', iconBg: '#FEE2E2', iconClass: 'icono-alarma',
                animation: 'alarmaRing', animDuration: '0.8s',
                title: 'TIEMPO DE RESPUESTA', value: data.tiempoRespuestaPromedio,
                description: `Tiempo promedio que tardas en dar la primera respuesta a un ${t.cliente} que te contacta.`,
                badge: 'Zona crítica de pérdida', badgeClass: 'bg-[#FEE2E2] text-[#B91C1C]',
                badgeIcon: 'solar:danger-triangle-linear', badgeIconColor: '#B91C1C', border: 'border-l-error',
              },
              {
                icon: 'solar:moon-stars-linear', iconColor: '#FBBF24', iconBg: '#FEF3C7', iconClass: 'icono-luna',
                animation: 'lunaRotate', animDuration: '2s',
                title: 'COBERTURA DE ATENCIÓN', value: `${data.horasAtencion} horas`,
                description: 'Horas al día en las que puedes atender consultas. El resto del tiempo, nadie responde.',
                badge: `${24 - data.horasAtencion} horas desatendidas`, badgeClass: 'bg-[#FEF3C7] text-[#B45309]',
                badgeIcon: 'solar:clock-circle-linear', badgeIconColor: '#B45309', border: 'border-l-warning',
              },
              ...(data.porcentajeNoShow > 0 ? [{
                icon: 'solar:calendar-linear', iconColor: '#60A5FA', iconBg: '#DFEDFE', iconClass: 'icono-calendario',
                animation: 'calendarioFloat', animDuration: '0.8s',
                title: 'TASA DE NO-SHOW', value: `${data.porcentajeNoShow}%`,
                description: `Porcentaje de ${t.citas} agendadas donde el ${t.cliente} no se presenta. Espacios vacíos en tu agenda.`,
                badge: `${data.citasPerdidasMes} ${t.citas} perdidas/mes`, badgeClass: 'bg-[#FEE2E2] text-[#B91C1C]',
                badgeIcon: 'solar:calendar-minimalistic-linear', badgeIconColor: '#B91C1C', border: 'border-l-error',
              }] : []),
              {
                icon: 'solar:user-cross-linear', iconColor: '#34D399', iconBg: '#D6F6EB', iconClass: 'icono-mano',
                animation: 'manoAdios', animDuration: '0.8s',
                title: 'CHURN MENSUAL', value: `${data.porcentajeChurn}%`,
                description: `${cap(t.clientes)} que no vuelven después de su última visita. Pierdes ${t.clientes} cada mes sin seguimiento.`,
                badge: `${data.clientesPerdidosMes} ${t.clientes} perdidos/mes`, badgeClass: 'bg-[#FEE2E2] text-[#B91C1C]',
                badgeIcon: 'solar:user-minus-linear', badgeIconColor: '#B91C1C', border: 'border-l-error',
              },
              {
                icon: 'solar:graph-down-linear', iconColor: '#F87171', iconBg: '#FEE2E2', iconClass: 'icono-alarma',
                animation: 'alarmaRing', animDuration: '0.8s',
                title: '% VENTAS PERDIDAS', value: `${Math.round(data.consultasSinRespuesta / Math.max(data.conversacionesMensuales, 1) * 100)}%`,
                description: 'Porcentaje de oportunidades que se pierden al mes por falta de atención oportuna.',
                badge: `${data.consultasSinRespuesta} chats sin respuesta`, badgeClass: 'bg-[#FEE2E2] text-[#B91C1C]',
                badgeIcon: 'solar:close-circle-linear', badgeIconColor: '#B91C1C', border: 'border-l-error',
              },
              {
                icon: 'solar:chat-round-dots-linear', iconColor: '#60A5FA', iconBg: '#DFEDFE', iconClass: 'icono-calendario',
                animation: 'calendarioFloat', animDuration: '1.0s',
                title: 'VOLUMEN DE CONVERSACIONES', value: `${data.conversacionesMensuales}/mes`,
                description: `Total de interacciones con ${t.clientes} cada mes. Cada una es una oportunidad de venta.`,
                badge: `${data.tasaDeflexion}% son preguntas repetitivas`, badgeClass: 'bg-[#DFEDFE] text-[#1D4ED8]',
                badgeIcon: 'solar:bolt-linear', badgeIconColor: '#1D4ED8', border: 'border-l-primary-400',
              },
            ]
            const isOddTotal = radiografiaCards.length % 2 !== 0
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[860px] mx-auto">
                {radiografiaCards.map((metric, index) => {
                  const isLastAlone = isOddTotal && index === radiografiaCards.length - 1
                  if (isLastAlone) {
                    return (
                      <div
                        key={metric.title}
                        style={{ gridColumn: '1 / -1', maxWidth: '414px', width: '100%', margin: '0 auto' }}
                      >
                        <MetricCard metric={metric} delayMs={(index + 1) * 100} />
                      </div>
                    )
                  }
                  return (
                    <MetricCard
                      key={metric.title}
                      metric={metric}
                      delayMs={(index + 1) * 100}
                    />
                  )
                })}
              </div>
            )
          })()}
        </section>

        <section className="py-[100px] px-6 md:px-12">
          <div className="max-w-[900px] mx-auto">
            <h2 ref={heartRef} className="text-h1 text-white mb-16 text-center flex items-center justify-center gap-3" style={{ marginBottom: '48px' }}>
              <HeartBreak triggered={heartVisible} />
              Aquí es donde se te escapa el dinero
            </h2>
            <div className="space-y-6">
              {buildPainCards(data).map((pain, idx) => (
                <PainCard key={pain.key} pain={pain} delayMs={idx * 120} />
              ))}
            </div>

            <div ref={totalRef} className="rounded-2xl p-8 text-center border border-primary-100" style={{ marginTop: '40px', background: '#ffffff' }}>
              <p className="text-small tracking-widest font-semibold" style={{ color: '#64748B' }}>TOTAL DE OPORTUNIDADES IDENTIFICADAS</p>
              <p className="text-[3rem] md:text-[4rem] font-black mt-2" style={{ color: 'var(--color-secondary-500)' }}>
                {formatCurrency(totalVisible ? totalAmount : 0)}/mes
              </p>
              <p className="text-body mt-2" style={{ color: '#64748B' }}>Y esto es solo lo que podemos medir con los datos que proporcionaste...</p>
            </div>
          </div>
        </section>

        <section style={{ marginTop: '48px', paddingTop: '60px', paddingBottom: '100px', paddingLeft: '80px', paddingRight: '80px', textAlign: 'center', color: 'white' }}>
          <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <p className="text-h3 text-white/90">Pero aquí viene lo bueno...</p>
          <h2 className="font-black" style={{ fontSize: '3.5rem', lineHeight: '1.1', fontWeight: 900, marginTop: '24px' }}>¿Y si pudieras recuperar todo eso?</h2>
          <p className="text-body text-white/85 max-w-2xl mx-auto" style={{ marginTop: '32px', marginBottom: '48px' }}>
            No estamos hablando de trabajar más horas. Estamos hablando de <strong className="text-white font-bold">trabajar más inteligente.</strong>
          </p>
          <div className="max-w-3xl mx-auto mt-10 text-left rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.93)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', padding: '60px' }}>
            <p className="text-body text-base-dark font-bold text-center mb-6">Así funciona Linda IA en tiempo real:</p>
            <ChatSimulation serviceType={serviceType} businessName={data.nombreNegocio} sector={data.sector} managesAppointments={data.porcentajeNoShow > 0} />
            <p className="text-small text-base-dark/60 mt-6">Tiempo de respuesta: 0 segundos · Disponible 24/7</p>
          </div>
          </div>
        </section>

        {/* ── ACTO 5: Tu proyección de crecimiento ── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-[100px]">

          {/* Encabezado */}
          <div className="text-center" style={{ marginBottom: '56px' }}>
            <h2 className="text-h1 text-white">Tu proyección de crecimiento con Linda IA</h2>
            <p className="text-body" style={{ color: 'rgba(255,255,255,0.65)', marginTop: '16px' }}>
              Elige el escenario que mejor refleje tus expectativas y ve cómo crecería tu negocio
            </p>
          </div>

          {/* Selector de escenarios */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '56px' }}>

            {/* Card Conservador */}
            <button
              type="button"
              onClick={() => { setActiveScenario('conservador'); setTimeout(() => scenarioContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '36px 28px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transform: activeScenario === 'conservador' ? 'translateY(-6px) scale(1.02)' : 'none',
                boxShadow: activeScenario === 'conservador'
                  ? '0 0 0 3px #34D399, 0 16px 48px rgba(52,211,153,0.25)'
                  : '0 4px 20px rgba(0,0,0,0.18)',
                transition: 'all 300ms ease',
              }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#DFEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <IconComponent icon="solar:shield-check-linear" size="lg" color="#355B8A" />
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 500, lineHeight: '140%', color: '#0A2540', marginBottom: '8px' }}>Conservador</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', color: '#64748B', marginBottom: '24px' }}>Tu negocio alcanza el 60% de automatización. Adopción gradual y cautelosa.</p>
              <span style={{ borderRadius: '999px', padding: '6px 18px', fontSize: '0.875rem', fontWeight: 600, background: activeScenario === 'conservador' ? '#60A5FA' : '#F1F5F9', color: activeScenario === 'conservador' ? '#fff' : '#64748B', marginTop: 'auto', transition: 'all 300ms' }}>
                Escenario mínimo
              </span>
            </button>

            {/* Card Realista – con estrella en esquina */}
            <button
              type="button"
              onClick={() => { setActiveScenario('realista'); setTimeout(() => scenarioContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '36px 28px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transform: activeScenario === 'realista' ? 'translateY(-6px) scale(1.02)' : 'none',
                boxShadow: activeScenario === 'realista'
                  ? '0 0 0 3px #34D399, 0 16px 48px rgba(52,211,153,0.25)'
                  : '0 4px 20px rgba(0,0,0,0.18)',
                transition: 'all 300ms ease',
              }}
            >
              {/* Estrella en esquina superior derecha */}
              <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                <IconComponent icon="solar:star-bold" size="sm" color="#F59E0B" />
              </div>
              <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#D6F6EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <IconComponent icon="solar:chart-2-linear" size="lg" color="#1D7454" />
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 500, lineHeight: '140%', color: '#0A2540', marginBottom: '8px' }}>Realista</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', color: '#64748B', marginBottom: '24px' }}>Tu negocio alcanza 70–80% de automatización. Escenario más probable basado en datos.</p>
              <span style={{ borderRadius: '999px', padding: '6px 18px', fontSize: '0.875rem', fontWeight: 600, background: activeScenario === 'realista' ? '#34D399' : '#F1F5F9', color: activeScenario === 'realista' ? '#fff' : '#64748B', marginTop: 'auto', transition: 'all 300ms' }}>
                Recomendado
              </span>
            </button>

            {/* Card Optimista */}
            <button
              type="button"
              onClick={() => { setActiveScenario('optimista'); setTimeout(() => scenarioContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '36px 28px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transform: activeScenario === 'optimista' ? 'translateY(-6px) scale(1.02)' : 'none',
                boxShadow: activeScenario === 'optimista'
                  ? '0 0 0 3px #34D399, 0 16px 48px rgba(52,211,153,0.25)'
                  : '0 4px 20px rgba(0,0,0,0.18)',
                transition: 'all 300ms ease',
              }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <IconComponent icon="solar:rocket-2-linear" size="lg" color="#B45309" />
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 500, lineHeight: '140%', color: '#0A2540', marginBottom: '8px' }}>Optimista</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', color: '#64748B', marginBottom: '24px' }}>Tu negocio supera el 85% de automatización. Implementación perfecta y alta adopción.</p>
              <span style={{ borderRadius: '999px', padding: '6px 18px', fontSize: '0.875rem', fontWeight: 600, background: activeScenario === 'optimista' ? '#F59E0B' : '#F1F5F9', color: activeScenario === 'optimista' ? '#fff' : '#64748B', marginTop: 'auto', transition: 'all 300ms' }}>
                Mejor caso
              </span>
            </button>

          </div>

          {/* Contenido dinámico */}
          <div ref={scenarioContentRef} key={activeScenario} style={{ animation: 'fadeIn 400ms ease both', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '780px', margin: '0 auto' }}>

            {/* ── FASE 1: Implementación ── */}
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '28px 32px' }}>
              {/* Encabezado */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#0A2540', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>1</span>
                </div>
                <div>
                  <h3 className="text-h3 text-base-dark">Implementación (Mes 1-3)</h3>
                  <p className="text-small" style={{ color: '#2FBE8A', marginTop: '2px' }}>Linda aprende tu negocio y comienza a operar</p>
                </div>
              </div>

              {/* Bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  `Linda responde el ${automationRate}% de consultas básicas`,
                  'Sistema de recordatorios básicos activo',
                  'Captura de leads fuera de horario funcionando',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 900, lineHeight: 1 }}>✓</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#475569' }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Desglose financiero */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 20px 16px' }}>
                {[
                  { label: 'Recuperación de ventas perdidas:', value: stage1Recovery },
                  { label: 'Reducción de no-show:',            value: stage1NoShow   },
                  { label: 'Ahorro operativo:',                value: stage1Savings  },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#34D399' }}>+{formatCurrency(value)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid #CBD5E1', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-small font-semibold text-base-dark">TOTAL MES 3:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#34D399' }}>+{formatCurrency(activeScenarioData.mes1_3)}/mes</span>
                </div>
              </div>
            </div>

            {/* ── FASE 2: Optimización ── */}
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#0A2540', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>2</span>
                </div>
                <div>
                  <h3 className="text-h3 text-base-dark">Optimización (Mes 4-6)</h3>
                  <p className="text-small" style={{ color: '#2FBE8A', marginTop: '2px' }}>Linda mejora su precisión y expande capacidades</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  'Seguimiento automático básico de clientes inactivos',
                  `Tu equipo liberó ${activeScenarioData.horasAhorradas} horas al mes`,
                  'Upsells ocasionales funcionando',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 900, lineHeight: 1 }}>✓</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#475569' }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px 20px 16px' }}>
                {[
                  { label: 'Ingresos adicionales:', value: stage2IngresosAdicionales },
                  { label: 'Clientes recuperados:', value: stage2ClientesRecuperados },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#34D399' }}>+{formatCurrency(value)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid #CBD5E1', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-small font-semibold text-base-dark">TOTAL MES 6:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#34D399' }}>+{formatCurrency(activeScenarioData.mes4_6)}/mes</span>
                </div>
              </div>
            </div>

            {/* ── FASE 3: Consolidación ── */}
            <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#0A2540', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>3</span>
                </div>
                <div>
                  <h3 className="text-h3 text-base-dark">Consolidación (Mes 7-12)</h3>
                  <p className="text-small" style={{ color: '#2FBE8A', marginTop: '2px' }}>Linda ya es parte integral de tu operación</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {[
                  'Tu base de clientes creció un 15%',
                  `Churn reducido en ${Math.round(data.porcentajeChurn * 0.35)}%`,
                  'Procesos completamente optimizados',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 900, lineHeight: 1 }}>✓</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#475569' }}>{item}</span>
                  </div>
                ))}
              </div>

              {/* Caja oscura – PROYECCIÓN COMPLETA AÑO 1 */}
              <div style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1B4F8A 40%, #2E8B7A 75%, #34D399 100%)', borderRadius: '16px', padding: '28px 24px' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textAlign: 'center', marginBottom: '20px' }}>PROYECCIÓN COMPLETA — AÑO 1</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                      <IconComponent icon="solar:wallet-money-bold-duotone" size="lg" color="#34D399" />
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '130%', color: '#34D399' }}>+{formatCurrency(activeScenarioData.anio1)}</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>Incremento anual</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                      <IconComponent icon="solar:graph-up-bold-duotone" size="lg" color="#34D399" />
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '130%', color: '#34D399' }}>{activeScenarioData.roi.toLocaleString()}%</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>ROI primer año</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                      <IconComponent icon="solar:alarm-bold-duotone" size="lg" color="#34D399" />
                    </div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600, lineHeight: '130%', color: '#34D399' }}>{activeScenarioData.horasAhorradas}h</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>Tiempo ahorrado</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ── ACTO 7: CTA FREE TRIAL ── */}
        <style>{`
          @keyframes coheteVuela {
            0%   { transform: translateY(0px) rotate(0deg); }
            15%  { transform: translateY(-10px) rotate(-4deg); }
            30%  { transform: translateY(-18px) rotate(4deg); }
            45%  { transform: translateY(-22px) rotate(-2deg); }
            60%  { transform: translateY(-18px) rotate(3deg); }
            75%  { transform: translateY(-10px) rotate(-4deg); }
            90%  { transform: translateY(-3px) rotate(1deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes coheteDespega {
            0%   { transform: translateY(0px) scale(1) rotate(0deg); opacity: 1; }
            25%  { transform: translateY(-10px) scale(1.08) rotate(-8deg); opacity: 1; }
            55%  { transform: translateY(-45px) scale(1.18) rotate(5deg); opacity: 0.75; }
            80%  { transform: translateY(-70px) scale(1.25) rotate(0deg); opacity: 0.35; }
            100% { transform: translateY(-90px) scale(1.3) rotate(0deg); opacity: 0; }
          }
        `}</style>
        <section ref={act7Ref} className="px-6 md:px-12" style={{ paddingTop: '64px', paddingBottom: '60px', marginTop: '48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* Título principal — mismo estilo que "¿Y si pudieras recuperar todo eso?" */}
            <h2 className="font-black" style={{ fontSize: '3.5rem', lineHeight: '1.1', fontWeight: 900, color: 'white', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
              Tu diagnóstico completo está listo 🎉
            </h2>

            {/* Subtítulo — Body: 1rem / 400 / line-height 150% */}
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.85)', marginBottom: '48px', fontWeight: 400, lineHeight: '150%', fontFamily: 'Inter, sans-serif' }}>
              Únete a los{' '}
              <strong style={{ color: '#34D399', fontWeight: 600 }}>500+ negocios</strong>
              {' '}que ya recuperaron lo que estaban perdiendo
            </p>

            {/* Botón principal gigante con cohete animado */}
            <button
              type="button"
              onClick={handleFreeTrial}
              style={{
                background: 'linear-gradient(135deg,#34D399,#2FBE8A)',
                border: 'none',
                borderRadius: '20px',
                padding: '40px 48px',
                cursor: 'pointer',
                boxShadow: rocketHovered ? '0 20px 50px rgba(52,211,153,0.5)' : '0 15px 40px rgba(52,211,153,0.4)',
                transform: rocketHovered ? 'translateY(-5px)' : 'translateY(0)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                maxWidth: '700px',
                width: '100%',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={() => setRocketHovered(true)}
              onMouseLeave={() => setRocketHovered(false)}
            >
              {/* Efecto brillo deslizante */}
              <span aria-hidden="true" style={{
                position: 'absolute', top: 0, width: '100%', height: '100%',
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)',
                pointerEvents: 'none',
                left: rocketHovered ? '100%' : '-100%',
                transition: rocketHovered ? 'left 0.55s ease' : 'none',
              }} />

              {/* Cohete — animación vía inline style controlada por estado React */}
              <span style={{
                fontSize: '48px',
                display: 'block',
                lineHeight: 1,
                transformOrigin: 'center',
                willChange: 'transform',
                animation: rocketHovered
                  ? 'coheteDespega 0.8s ease-out forwards'
                  : 'coheteVuela 2s ease-in-out infinite',
              }}>🚀</span>

              {/* Línea 1 — H2: 1.5rem / 600 / line-height 130% */}
              <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', lineHeight: '130%', fontFamily: 'Inter, sans-serif' }}>
                Activar mi Free Trial de 15 días
              </span>

              {/* Línea 2 — Small: 0.875rem / 400 / line-height 150% */}
              <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', fontWeight: 400, lineHeight: '150%', fontFamily: 'Inter, sans-serif' }}>
                Empieza a recuperar {formatCurrency(data.escenarioRealista.mes4_6)}/mes esta semana
              </span>
            </button>

            {/* Garantías — Small: 0.875rem / 400 / line-height 150% */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
              {[
                'Sin tarjeta de crédito',
                'Configuración en 24 horas',
                'Resultados en la primera semana',
                'Cancela cuando quieras',
              ].map((g) => (
                <span key={g} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', fontFamily: 'Inter, sans-serif' }}>
                  <IconComponent icon="solar:check-circle-linear" size="sm" color="#34D399" />
                  {g}
                </span>
              ))}
            </div>

            {/* Separador */}
            <div style={{ margin: '0 auto 32px', maxWidth: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.25)' }} />
              {/* Small: 0.875rem / 400 */}
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontWeight: 400, fontFamily: 'Inter, sans-serif' }}>o</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.25)' }} />
            </div>

            {/* Link "Ya soy cliente" — Body: 1rem / 400 / line-height 150% */}
            <a
              href="https://app.bewe.co"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 400, lineHeight: '150%', textDecoration: 'none', display: 'inline-block', padding: '10px 0', borderBottom: '2px solid transparent', transition: 'color 0.3s ease, border-color 0.3s ease', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'white'; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'rgba(255,255,255,0.5)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'transparent'; }}
            >
              Ya soy cliente de Bewe →
            </a>

          </div>
        </section>

        {/* ── SECCIÓN: FUENTES Y METODOLOGÍA ── */}
        <section className="py-[80px] px-6 md:px-12" style={{ marginTop: '80px' }}>
          <div className="max-w-[1200px] mx-auto">

            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', lineHeight: '120%', marginBottom: '16px' }}>Fuentes y Metodología</h2>
              <p style={{ fontSize: '1rem', fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: '150%' }}>Transparencia total: así calculamos tu diagnóstico</p>
            </div>

            {/* 9 Fuentes académicas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
              {[
                { num: 1, title: 'Harvard Business Review – Lead Response Time',       finding: 'Las empresas que responden a leads en 5 minutos tienen 100x más probabilidad de contactarlos que las que responden en 30 minutos.',           url: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads' },
                { num: 2, title: 'Velocify / Forbes – Speed to Lead',                   finding: 'El 35-50% de las ventas va al proveedor que responde primero. La velocidad de respuesta es el factor #1 en conversión.',                          url: 'https://www.forbes.com/sites/christinecomaford/2014/10/04/' },
                { num: 3, title: 'Signpost – Online Appointments',                      finding: 'Los negocios que usan recordatorios automáticos reducen las cancelaciones y no-shows hasta en un 37%.',                                            url: 'https://www.signpost.com' },
                { num: 4, title: 'Heallist – Time Savings with AI',                     finding: 'Los profesionales de salud y bienestar ahorran entre 2-4 horas diarias al automatizar la gestión de citas y comunicación con clientes.',          url: 'https://heallist.com' },
                { num: 5, title: 'Bain & Company – Customer Retention',                 finding: 'Aumentar la retención de clientes en un 5% incrementa las ganancias entre un 25% y 95%. El costo de adquirir un nuevo cliente es 5-7x mayor.',    url: 'https://www.bain.com/insights/retaining-customers/' },
                { num: 6, title: 'McKinsey – Personalization Value',                    finding: 'Las empresas que personalizan la experiencia del cliente generan un 40% más de ingresos que las que no lo hacen.',                                  url: 'https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-value-of-getting-personalization-right' },
                { num: 7, title: 'Harvard Business Review – Acquisition Costs',         finding: 'Adquirir un nuevo cliente cuesta entre 5 y 25 veces más que retener uno existente. El valor de vida del cliente es clave.',                       url: 'https://hbr.org/2014/10/the-value-of-keeping-the-right-customers' },
                { num: 8, title: 'Harvard Business Review – Response Time Impact',      finding: 'Las empresas que responden dentro de la primera hora tienen 7 veces más probabilidad de tener una conversación significativa con un decisor.',       url: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads' },
                { num: 9, title: 'BMJ / Journal of Medical – SMS Reminders',            finding: 'Los recordatorios por SMS reducen las tasas de no-show entre un 26% y 38% en servicios de salud y bienestar.',                                      url: 'https://www.bmj.com/content/342/bmj.d3527' },
              ].map(({ num, title, finding, url }) => (
                <div key={num} style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '18px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#D6F6EB', border: '1px solid #9AE9CC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399' }}>{num}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: '150%', color: '#0A2540', marginBottom: '6px' }}>{title}</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', color: '#475569', marginBottom: '8px' }}>{finding}</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', fontWeight: 400, color: '#34D399', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                      <IconComponent icon="solar:link-minimalistic-2-linear" size="sm" color="#34D399" />
                      Ver fuente
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECCIÓN: FÓRMULAS ── */}
        <section className="px-6 md:px-12" style={{ marginTop: '80px', paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="max-w-[1200px] mx-auto">

            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', lineHeight: '120%', marginBottom: '16px' }}>Cómo calculamos tu diagnóstico</h2>
              <p style={{ fontSize: '1rem', fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: '150%' }}>Fórmulas detalladas con tus datos reales</p>
            </div>

            {/* 7 Fórmulas unificadas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '860px', margin: '0 auto' }}>
              {[
                {
                  title: 'Pilar 1: Ahorro por Deflexión de Consultas',
                  icon: 'solar:chat-round-dots-linear',
                  color: '#34D399',
                  steps: [
                    { label: 'Consultas mensuales totales',                    formula: `${data.conversacionesMensuales} conversaciones/mes` },
                    { label: 'Tasa de automatización con Linda',                formula: `${data.tasaDeflexion}% de consultas automatizadas` },
                    { label: 'Consultas que Linda resuelve sola',               formula: `${data.conversacionesMensuales} × ${data.tasaDeflexion}% = ${Math.round(data.conversacionesMensuales * data.tasaDeflexion / 100)} consultas/mes` },
                    { label: 'Costo por consulta manual (costo/hora ÷ 4)',      formula: `${formatCurrency(data.costoHoraAgente)} ÷ 4 = ${formatCurrency(data.costoHoraAgente / 4)}/consulta` },
                  ],
                  result: data.deflectionSavings,
                  resultLabel: 'Ahorro mensual por deflexión',
                },
                {
                  title: 'Pilar 2: Ingresos por Recuperación de Ventas Perdidas',
                  icon: 'solar:bag-heart-linear',
                  color: '#60A5FA',
                  steps: [
                    { label: 'Consultas sin respuesta oportuna',         formula: `${data.consultasSinRespuesta} consultas/mes sin responder a tiempo` },
                    { label: 'Tasa de recuperación con Linda (30%)',     formula: `${data.consultasSinRespuesta} × 30% = ${Math.round(data.consultasSinRespuesta * 0.3)} consultas recuperadas` },
                    { label: 'Ticket promedio de cada venta',            formula: `${formatCurrency(data.ticketPromedio)} por cliente` },
                  ],
                  result: data.ingresosPerdidosRespuestaLenta * 0.3,
                  resultLabel: 'Ingresos adicionales por recuperación',
                },
                {
                  title: 'Pilar 3: Ingresos por Velocidad de Respuesta',
                  icon: 'solar:bolt-circle-linear',
                  color: '#FAD19E',
                  steps: [
                    { label: 'Oportunidades perdidas por respuesta lenta',  formula: `${formatCurrency(data.ingresosPerdidosRespuestaLenta)}/mes en ventas no cerradas` },
                    { label: 'Factor de mejora con respuesta inmediata',     formula: 'Estudios HBR: 100x más probabilidad de contacto en <5 min' },
                    { label: 'Tasa de recuperación aplicada (conservadora)', formula: '15% de las oportunidades perdidas' },
                  ],
                  result: data.ingresosPerdidosRespuestaLenta * 0.15,
                  resultLabel: 'Ingresos adicionales por velocidad',
                },
                {
                  title: 'Pilar 4: Ahorro por Productividad del Equipo',
                  icon: 'solar:users-group-two-rounded-linear',
                  color: '#67E8F9',
                  steps: [
                    { label: 'Horas semanales en tareas repetitivas',   formula: `${data.tamanoEquipo} personas × 8h/semana = ${data.tamanoEquipo * 8}h/semana` },
                    { label: 'Horas ahorradas con Linda (según MIT)',    formula: `${Math.round(data.savedHours)}h/mes liberadas para tareas de alto valor` },
                    { label: 'Costo hora del equipo',                   formula: `${formatCurrency(data.costoHoraAgente)}/hora × ${Math.round(data.savedHours)}h = ahorro directo` },
                  ],
                  result: data.productivitySavings,
                  resultLabel: 'Valor monetario del tiempo ahorrado',
                },
                {
                  title: 'Reducción de No-Show',
                  icon: 'solar:calendar-minimalistic-linear',
                  color: '#60A5FA',
                  steps: [
                    { label: 'Tasa actual de no-show',              formula: `${data.porcentajeNoShow.toFixed(1)}% de citas no asistidas` },
                    { label: 'Citas afectadas mensualmente',         formula: `${data.citasPerdidasMes} citas perdidas/mes` },
                    { label: 'Reducción con recordatorios (37%)',    formula: `${data.porcentajeNoShow.toFixed(1)}% × (1 - 37%) = ${(data.porcentajeNoShow * 0.63).toFixed(1)}% nuevo no-show` },
                    { label: 'Citas recuperadas',                    formula: `${Math.round(data.citasPerdidasMes * 0.37)} citas × ${formatCurrency(data.ticketPromedio)} = impacto mensual` },
                  ],
                  result: data.ingresosPerdidosNoShow * 0.37,
                  resultLabel: 'Ingresos recuperados de no-show',
                },
                {
                  title: 'Reducción de Churn (Clientes que se van)',
                  icon: 'solar:user-minus-rounded-linear',
                  color: '#F87171',
                  steps: [
                    { label: 'Tasa actual de churn mensual',         formula: `${data.porcentajeChurn.toFixed(1)}% de clientes no vuelven` },
                    { label: 'Clientes perdidos mensualmente',        formula: `${data.clientesPerdidosMes} clientes/mes` },
                    { label: 'Reducción de churn con seguimiento',    formula: `${data.porcentajeChurn.toFixed(1)}% × (1 - 10%) = ${(data.porcentajeChurn * 0.9).toFixed(1)}%` },
                    { label: 'Valor de vida del cliente',             formula: `${formatCurrency(data.valorVidaCliente)} por cliente retenido` },
                  ],
                  result: data.ingresosPerdidosChurn * 0.1,
                  resultLabel: 'Valor mensual de clientes retenidos',
                },
                {
                  title: 'Aumento de Adquisición de Nuevos Clientes',
                  icon: 'solar:user-plus-rounded-linear',
                  color: '#34D399',
                  steps: [
                    { label: 'Clientes nuevos actuales/mes',          formula: `${data.clientesNuevosMes} clientes nuevos/mes` },
                    { label: 'Mejora con seguimiento inteligente',     formula: 'Linda convierte +35% de leads que antes no respondían' },
                    { label: 'Clientes adicionales potenciales',       formula: `${data.clientesAdicionalesMes} clientes adicionales/mes` },
                  ],
                  result: data.gananciaAdquisicionMensual,
                  resultLabel: 'Ingresos por nuevos clientes adicionales',
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  onMouseEnter={() => setHoveredFormula(idx)}
                  onMouseLeave={() => setHoveredFormula(null)}
                  style={{
                    background: '#ffffff',
                    border: hoveredFormula === idx ? '1px solid #9AE9CC' : '1px solid #E2E8F0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: hoveredFormula === idx ? '0 6px 24px rgba(52,211,153,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                    transform: hoveredFormula === idx ? 'translateY(-2px)' : 'none',
                    transition: 'all 250ms ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFormula(openFormula === idx ? null : idx)}
                    style={{ width: '100%', background: 'transparent', border: 'none', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconComponent icon={item.icon} size="sm" color={item.color} />
                    </div>
                    <span style={{ flex: 1, fontSize: '1rem', fontWeight: 500, lineHeight: '140%', color: '#0A2540' }}>{item.title}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#34D399', marginRight: '8px' }}>+{formatCurrency(item.result)}/mes</span>
                    <IconComponent icon={openFormula === idx ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} size="sm" color="#64748B" />
                  </button>
                  {openFormula === idx && (
                    <div style={{ padding: '0 24px 24px', animation: 'fadeIn 250ms ease both' }}>
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                        {item.steps.map((step, si) => (
                          <div key={si} style={{ padding: '12px 16px', borderBottom: si < item.steps.length - 1 ? '1px solid #E2E8F0' : 'none', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', color: '#64748B' }}>{step.label}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: '150%', color: '#0A2540', fontFamily: 'monospace' }}>{step.formula}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: '#EFF6FF', border: '1px solid #B0D2FC', borderRadius: '10px', padding: '14px 18px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: '150%', color: '#475569' }}>{item.resultLabel}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 500, lineHeight: '140%', color: '#60A5FA' }}>+{formatCurrency(item.result)}/mes</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>
    </FunnelLayout>
  )
}
