import type { ReactNode } from 'react'

interface FunnelLayoutProps {
  children: ReactNode
  showHeader?: boolean
  showProgress?: boolean
  progress?: number
  className?: string
}

export function FunnelLayout({ children, showHeader = true, showProgress = false, progress = 0, className = '' }: FunnelLayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      {/* ── Fondo decorativo global (gradiente + círculos difuminados) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-aqua-soft via-white to-primary-100 opacity-60" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-secondary-100 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-[40%] left-[20%] w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-25" />
      </div>

      {/* ─── Top Bar ─── */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary-100">
          <div className="max-w-6xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-h3 text-base-dark">Bewe</span>
            </div>
          </div>
        </header>
      )}

      {/* ─── Progress Bar (independiente del header) ─── */}
      {showProgress && (
        <div className="sticky top-0 z-40 h-1 bg-primary-100">
          <div
            className="h-full bg-primary-400 transition-all duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}

      {/* ─── Content ─── */}
      <main className="relative z-10">{children}</main>
    </div>
  )
}
