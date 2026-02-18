import { Card, Chip } from '@beweco/aurora-ui'

interface Story {
  initial: string
  initialBg: string
  name: string
  role: string
  business: string
  quote: string
  youtubeUrl: string
}

const STORIES: Story[] = [
  {
    initial: 'J',
    initialBg: 'bg-cyan-light',
    name: 'Juan Nuncira',
    role: 'Fundador',
    business: 'SaludClub',
    quote:
      'Linda me ahorra entre un 30% y un 40% de tiempo en ciertos procesos administrativos... la automatización me permite ahorrar tiempo para dedicarme a la venta y otras responsabilidades gerenciales.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dNLhios5FPY',
  },
  {
    initial: 'M',
    initialBg: 'bg-teal-neutral',
    name: 'María Kluver',
    role: 'Fundadora',
    business: 'Uhhh Amor Por Las Uñas',
    quote:
      'Para mi centro estaba todo pensado y es muy fácil de manejar. A mí me solucionó el 50% de la agenda porque quería que la gente se agendara sola. Es mucho más fácil con Linda porque te capta clientes que pensabas que no sabías que los tenías perdidos.',
    youtubeUrl: 'https://www.youtube.com/watch?v=4LoBHB4j9eY',
  },
]

export function SuccessStories() {
  return (
    <section className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 !mb-12 md:!mb-16">

        {/* Título */}
        <h2 className="text-h2 text-base-dark text-center mb-4">
          Negocios que ya están creciendo con Bewe
        </h2>
        <p className="text-body text-base-dark/60 text-center mb-16 max-w-2xl mx-auto !mb-12 md:!mb-8">
          Historias reales de dueños de negocios como tú
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto !mb-12 md:!mb-24">
          {STORIES.map((story, index) => (
            <Card
              key={index}
              shadow="none"
              radius="lg"
              padding="lg"
              className="bg-white border border-primary-100 hover:shadow-lg transition-all duration-500 ease-out hover:scale-[1.02] flex flex-col"
            >
              {/* Testimonio */}
              <p className="text-small text-base-dark/60 leading-[1.7] mb-8 flex-1">
                {story.quote}
              </p>

              {/* Footer: avatar + info + botón YouTube */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full ${story.initialBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-sm">
                      {story.initial}
                    </span>
                  </div>

                  {/* Nombre y negocio */}
                  <div className="min-w-0">
                    <div className="text-small font-semibold text-base-dark">
                      {story.name}
                    </div>
                    <div className="text-xs text-base-dark/50" style={{ fontSize: '12px' }}>
                      {story.role} · {story.business}
                    </div>
                  </div>
                </div>

                {/* Botón YouTube */}
                <a
                  href={story.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-white text-small font-semibold whitespace-nowrap flex-shrink-0 ml-3 transition-all duration-300 hover:opacity-90 hover:shadow-md"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  {/* Icono YouTube */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022ZM10 15.5l6-3.5-6-3.5v7Z" />
                  </svg>
                  Ver entrevista
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
