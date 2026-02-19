import { Card, IconComponent } from '@beweco/aurora-ui'
import type { ReactNode } from 'react'

interface FeatureBullet {
  icon: string
  text: ReactNode
}

interface FeatureTheme {
  cardBg: string
  cardBorder: string
  iconColor: string
}

interface Feature {
  icon: string
  title: string
  subtitle: ReactNode
  description: ReactNode
  bullets?: FeatureBullet[]
  theme: FeatureTheme
}

/* Cada card usa un color de "Fondos y Superficies Suaves" */
const FEATURES: Feature[] = [
  {
    icon: 'solar:refresh-circle-linear',
    title: '¿Qué es el ROI?',
    subtitle: <>En el ecosistema BeweOS, el ROI (Retorno de Inversión) no se calcula solo comparando gastos contra ingresos. Aquí, el ROI se define como el <strong>Costo de Oportunidad Recuperado.</strong></>,
    description: 'Mide cuánto dinero y tiempo estás dejando de perder al sustituir tareas manuales ineficientes por automatización con Inteligencia Artificial.',
    theme: {
      cardBg: 'bg-cyan-light/15',       /* Cian Claro #67E8F9 */
      cardBorder: 'border-cyan-light/30 hover:border-cyan-light/60',
      iconColor: '#67E8F9',
    },
  },
  {
    icon: 'solar:wallet-money-linear',
    title: '¿Sabes cuánto dinero pierdes cada mes?',
    subtitle: 'Nuestra calculadora de ROI gratuita revela los "costos ocultos" que frenan tu crecimiento.',
    description: null,
    bullets: [
      { icon: 'solar:clock-circle-linear', text: <><strong>Respuestas tardías:</strong> Clientes que se van a la competencia.</> },
      { icon: 'solar:users-group-rounded-linear', text: <><strong>Falta de seguimiento:</strong> Ventas perdidas por no reactivar clientes.</> },
      { icon: 'solar:chart-square-linear', text: <><strong>Marketing inconsistente:</strong> Ingresos perdidos sin campañas activas.</> },
    ],
    theme: {
      cardBg: 'bg-aqua-soft/40',        /* Aqua Muy Suave #CCFBF1 */
      cardBorder: 'border-aqua-soft/60 hover:border-aqua-soft',
      iconColor: '#75C9C8',              /* Teal Neutro para contraste */
    },
  },
  {
    icon: 'solar:calculator-linear',
    title: '¿Por qué usar esta Calculadora?',
    subtitle: <>Te entrega un <strong>diagnóstico financiero en menos de 2 minutos.</strong></>,
    description: null,
    bullets: [
      { icon: 'solar:graph-up-linear', text: <><strong>Diagnóstico por Industria</strong> — Ajustamos las métricas a tu sector.</> },
      { icon: 'solar:graph-down-linear', text: <><strong>Proyección de Pérdidas</strong> — Horas y dólares perdidos mensualmente.</> },
      { icon: 'solar:dollar-linear', text: <><strong>Potencial de Recuperación</strong> — Transforma pérdidas en ganancias.</> },
    ],
    theme: {
      cardBg: 'bg-warm-yellow/30',      /* Amarillo Suave #FEF3C7 */
      cardBorder: 'border-warm-yellow/50 hover:border-warm-yellow',
      iconColor: '#FBBF24',              /* Warning para contraste */
    },
  },
  {
    icon: 'solar:shield-check-linear',
    title: 'Detén la fuga de capital hoy',
    subtitle: 'El primer paso para mejorar la rentabilidad es entender dónde está el problema.',
    description: 'Solo ingresa tu volumen de clientes y ticket promedio. Nuestra calculadora de ROI te mostrará el impacto real que un asistente de IA como Linda tendría en tu facturación anual.',
    theme: {
      cardBg: 'bg-primary-100/40',      /* Primary 100 #DFEDFE */
      cardBorder: 'border-primary-200/60 hover:border-primary-300',
      iconColor: '#60A5FA',              /* Primary 400 */
    },
  },
]

export function FeatureHighlights() {
  return (
    <section className="pt-24 pb-40 !mb-12 md:!mb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <h2 className="text-h2 text-base-dark text-center mb-4">
          ¿Qué obtendrás en tu diagnóstico?
        </h2>
        <p className="text-body text-base-dark/60 text-center mb-16 max-w-2xl mx-auto !mb-12 md:!mb-8">
          Un análisis completo y personalizado basado en datos reales de tu industria
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {FEATURES.map((feature, index) => (
            <Card
              key={index}
              shadow="none"
              radius="lg"
              padding="lg"
              className={`group ${feature.theme.cardBg} border ${feature.theme.cardBorder} transition-all duration-500 ease-out hover:shadow-lg hover:scale-[1.03] cursor-default`}
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500 ease-out shadow-sm">
                <IconComponent icon={feature.icon} size="lg" color={feature.theme.iconColor} />
              </div>

              <h3 className="text-h3 text-base-dark mb-2">{feature.title}</h3>
              <p className="text-small text-base-dark/60 mb-3">{feature.subtitle}</p>

              {feature.description && (
                <p className="text-small text-base-dark/60">{feature.description}</p>
              )}

              {feature.bullets && (
                <ul className="space-y-3 mt-2">
                  {feature.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 flex-shrink-0 mt-0.5">
                        <IconComponent icon={bullet.icon} size="sm" color={feature.theme.iconColor} />
                      </div>
                      <span className="text-small text-base-dark/70 ">{bullet.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
