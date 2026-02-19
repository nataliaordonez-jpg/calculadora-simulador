import { useState, useEffect, useRef } from 'react'
import { IconComponent } from '@beweco/aurora-ui'

interface FaqItem {
  id: string
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: '¿El diagnóstico es realmente gratuito?',
    answer:
      'Sí, 100% gratuito. No necesitas tarjeta de crédito ni compromiso alguno. El diagnóstico y las proyecciones de ROI son completamente sin costo.',
  },
  {
    id: 'faq-2',
    question: '¿Cuánto tiempo toma completarlo?',
    answer:
      'Solo 3 minutos. Son 11 preguntas simples de opción múltiple, adaptadas a tu sector específico.',
  },
  {
    id: 'faq-3',
    question: '¿Qué tan precisas son las proyecciones?',
    answer:
      'Las fórmulas utilizan datos reales de benchmarks de la industria y constantes validadas por sector. Los 3 escenarios (conservador, base, optimista) te dan un rango realista.',
  },
  {
    id: 'faq-4',
    question: '¿Qué sectores cubre el diagnóstico?',
    answer:
      'Belleza y estética, Salud (clínicas, odontología), Fitness (gimnasios, personal trainers), y Bienestar (yoga, pilates, danza, artes marciales).',
  },
  {
    id: 'faq-5',
    question: '¿Qué es el Bewe Score?',
    answer:
      'Es un índice de 0 a 100 que mide el potencial de impacto de la IA en tu negocio, basado en el ROI proyectado, los ahorros y el aumento de ingresos.',
  },
]

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [visibleItems, setVisibleItems] = useState<number>(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true

          FAQ_ITEMS.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems((prev) => Math.max(prev, index + 1))
            }, index * 300)
          })
        }
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="pt-24 pb-40 !mb-12 md:!mb-24">
      <div ref={sectionRef} className="max-w-3xl mx-auto px-6 md:px-12">
        {/* Título — H2: 24px (1.5rem) · SemiBold (600) · line-height 130% */}
        <h2 className="text-h2 text-base-dark text-center mb-16 !mb-12 md:!mb-8">
          Todo lo que necesitas saber
        </h2>

        {/* FAQ Items */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openId === item.id
            const isVisible = index < visibleItems

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border-l-4 border border-l-transparent border-primary-100/60 overflow-hidden transition-all duration-700 ease-out hover:border-l-cyan-light hover:border-primary-200 hover:shadow-md ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
              >
                {/* Pregunta — Body: 16px · SemiBold (600) */}
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between px-6 py-6 text-left cursor-pointer group"
                >
                  <span className="text-body font-semibold text-base-dark pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen
                        ? 'rotate-90 bg-primary-100 text-primary-600'
                        : 'text-base-dark/30 group-hover:text-base-dark/50'
                    }`}
                  >
                    {/* Solar Icon Set — Outline (Lineal) */}
                    <IconComponent
                      icon="solar:alt-arrow-right-linear"
                      size="sm"
                      color="currentColor"
                    />
                  </span>
                </button>

                {/* Respuesta — Small: 14px · Regular (400) · line-height 150% */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-8 text-small text-base-dark/60 leading-[1.5]">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
