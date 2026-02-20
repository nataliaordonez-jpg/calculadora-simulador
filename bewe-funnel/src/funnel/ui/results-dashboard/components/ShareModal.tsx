import { useState, useEffect, useCallback } from 'react'

interface ShareModalProps {
  businessName: string
  roi: number
  potentialMonthly: number
  totalPerdidaMensual: number
  formatCurrency: (val: number) => string
  /** URL única para compartir los resultados. Si no se provee, usa la URL actual. */
  shareUrl?: string
}

export const ShareModal = ({ businessName, roi, potentialMonthly, totalPerdidaMensual, formatCurrency, shareUrl: shareUrlProp }: ShareModalProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [showFloatingBtn, setShowFloatingBtn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [instagramLoading, setInstagramLoading] = useState(false)
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' })
  const [whatsappCopied, setWhatsappCopied] = useState(false)
  const [linkedinCopied, setLinkedinCopied] = useState(false)

  // shareUrl se actualiza reactivamente cuando llega el prop desde Supabase
  const shareUrl = shareUrlProp ?? null
  const isUrlReady = shareUrl !== null && shareUrl !== ''

  // Aparecer a los 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const closeModal = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => setShowFloatingBtn(true), 300)
  }, [])

  // Tecla ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) closeModal()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isVisible, closeModal])

  // Bloquear scroll del body
  useEffect(() => {
    if (isVisible) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isVisible])

  const showToast = (message: string) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 3000)
  }

  const openModal = () => {
    setIsVisible(true)
    setShowFloatingBtn(false)
  }

  const copyURL = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    showToast('✓ Enlace copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  const funnelUrl = window.location.origin
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const buildWhatsAppMessage = () => {
    const shocked    = String.fromCodePoint(0x1F631) // 😱
    const pointRight = String.fromCodePoint(0x1F449) // 👉
    return (
      `${shocked} Acabo de descubrir que pierdo ${formatCurrency(totalPerdidaMensual)}/mes en mi negocio\n\n` +
      `Hice este diagnóstico de 3 minutos y me abrió los ojos completamente\n\n` +
      `Mis resultados:\n${pointRight} ${shareUrl}\n\n` +
      `Haz el tuyo gratis:\n${pointRight} ${funnelUrl}\n\n` +
      `Te va a sorprender`
    )
  }

  const shareWhatsApp = () => {
    if (!shareUrl) return
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const message = buildWhatsAppMessage()

    // En todos los casos: copia al portapapeles y muestra el banner
    navigator.clipboard.writeText(message)
      .then(() => {
        setWhatsappCopied(true)
        setTimeout(() => setWhatsappCopied(false), 15000)
      })
      .catch(() => {})

    if (isMobile) {
      // Móvil: muestra el banner un instante y luego abre la app nativa con el texto pre-cargado
      setTimeout(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
      }, 1200)
    }
    // Desktop: solo muestra el banner (no abre WhatsApp, el usuario pega el texto copiado)
  }

  const shareLinkedIn = () => {
    if (!shareUrl) return
    // LinkedIn no permite pre-llenar texto desde URLs externas.
    // Copiamos el copy al portapapeles y mostramos un banner con botón "Abrir LinkedIn".
    const post =
      `${formatCurrency(totalPerdidaMensual)}/mes en oportunidades perdidas.\n\n` +
      `Eso es lo que reveló un diagnóstico de 3 minutos sobre mi negocio.\n\n` +
      `El análisis identifica:\n` +
      `→ Pérdidas actuales por consultas no atendidas\n` +
      `→ Potencial de ingresos sin explotar\n` +
      `→ ROI de automatización\n\n` +
      `Basado en data de HBR, MIT y McKinsey.\n\n` +
      `Mis resultados: ${shareUrl}\n` +
      `Tu diagnóstico: ${funnelUrl}\n\n` +
      `3 minutos que pueden cambiar tu perspectiva del negocio.\n\n` +
      `#BusinessGrowth #Automatización #ROI`

    navigator.clipboard.writeText(post)
      .then(() => {
        setLinkedinCopied(true)
        setTimeout(() => setLinkedinCopied(false), 15000)
      })
      .catch(() => showToast('No se pudo copiar. Intenta de nuevo.'))
  }

  const shareTwitter = () => {
    if (!shareUrl) return
    const dailyLoss = formatCurrency(Math.round(totalPerdidaMensual / 30))
    const text = encodeURIComponent(
      `Mi negocio pierde ${dailyLoss} cada día sin que me dé cuenta 💸\n\n` +
      `3 minutos de diagnóstico me lo mostraron todo\n\n` +
      `Mis resultados: ${shareUrl}\n\n` +
      `Haz el tuyo gratis: ${funnelUrl}`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const shareInstagram = () => {
    if (!shareUrl) return
    setInstagramLoading(true)
    // Copiar caption al portapapeles para que el usuario lo pegue en Instagram
    const caption =
      `${formatCurrency(totalPerdidaMensual)} 💸\n\n` +
      `Eso pierdo CADA MES en mi negocio y yo aquí pensando que todo estaba bien 🤡\n\n` +
      `Hice este diagnóstico de 3 min (gratis, sin nada) y me cambió la perspectiva completamente\n\n` +
      `Link para hacer el tuyo: ${funnelUrl}\n\n` +
      `¿Cuánto te salió a ti? 👇`
    navigator.clipboard.writeText(caption).catch(() => {})
    setTimeout(() => {
      generateInstagramImage()
      setInstagramLoading(false)
    }, 1500)
  }

  const generateInstagramImage = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fondo con gradiente de marca
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#0A2540')
    gradient.addColorStop(0.4, '#1B4F8A')
    gradient.addColorStop(0.75, '#2E8B7A')
    gradient.addColorStop(1, '#34D399')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Marca
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Bewe IA', canvas.width / 2, 160)

    ctx.font = '400 40px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.fillText('Diagnóstico de Crecimiento', canvas.width / 2, 230)

    // Nombre del negocio
    ctx.font = 'bold 52px Arial'
    ctx.fillStyle = '#34D399'
    ctx.fillText(businessName, canvas.width / 2, 380)

    // Card blanca de resultados
    ctx.fillStyle = 'rgba(255,255,255,0.96)'
    const rx = 80, ry = 470, rw = canvas.width - 160, rh = 880, rad = 50
    ctx.beginPath()
    ctx.moveTo(rx + rad, ry)
    ctx.lineTo(rx + rw - rad, ry)
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad)
    ctx.lineTo(rx + rw, ry + rh - rad)
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh)
    ctx.lineTo(rx + rad, ry + rh)
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad)
    ctx.lineTo(rx, ry + rad)
    ctx.quadraticCurveTo(rx, ry, rx + rad, ry)
    ctx.closePath()
    ctx.fill()

    // ROI
    ctx.textAlign = 'left'
    ctx.fillStyle = '#0A2540'
    ctx.font = 'bold 44px Arial'
    ctx.fillText('💰 ROI Proyectado', 150, 590)
    ctx.font = 'bold 120px Arial'
    ctx.fillStyle = '#34D399'
    ctx.fillText(`${roi.toLocaleString()}%`, 150, 730)

    // Potencial mensual
    ctx.font = 'bold 44px Arial'
    ctx.fillStyle = '#0A2540'
    ctx.fillText('📈 Potencial Mensual', 150, 890)
    ctx.font = 'bold 100px Arial'
    ctx.fillStyle = '#34D399'
    ctx.fillText(`+${formatCurrency(potentialMonthly)}`, 150, 1010)

    // Retorno de inversión
    ctx.font = 'bold 44px Arial'
    ctx.fillStyle = '#0A2540'
    ctx.fillText('⏰ Retorno de Inversión', 150, 1170)
    ctx.font = 'bold 90px Arial'
    ctx.fillStyle = '#FBBF24'
    ctx.fillText('1 mes', 150, 1280)

    // CTA
    ctx.textAlign = 'center'
    ctx.font = '400 38px Arial'
    ctx.fillStyle = '#64748B'
    ctx.fillText('Obtén tu diagnóstico gratuito:', canvas.width / 2, 1580)
    ctx.font = 'bold 46px Arial'
    ctx.fillStyle = '#60A5FA'
    ctx.fillText('bewe.com/diagnostico', canvas.width / 2, 1660)

    // Linda IA badge
    ctx.font = '400 34px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText('Powered by Linda IA · BeweOS', canvas.width / 2, 1830)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diagnostico-${businessName.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('✓ Imagen descargada y caption copiado. Pégalo en tu post de Instagram')
      setTimeout(() => {
        if (window.innerWidth <= 768) {
          window.location.href = 'instagram://story-camera'
          setTimeout(() => window.open('https://www.instagram.com/', '_blank'), 1000)
        } else {
          window.open('https://www.instagram.com/', '_blank')
        }
      }, 2000)
    }, 'image/png')
  }

  const socialButtons = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      color: '#25D366',
      hoverBg: '#25D366',
      onClick: shareWhatsApp,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: '#0A66C2',
      hoverBg: '#0A66C2',
      onClick: shareLinkedIn,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      color: '#1DA1F2',
      hoverBg: '#1DA1F2',
      onClick: shareTwitter,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.738-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      color: '#E1306C',
      hoverBg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
      onClick: shareInstagram,
      icon: instagramLoading ? (
        <div style={{ width: '28px', height: '28px', border: '3px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
    },
  ]

  if (!isVisible && !showFloatingBtn) return null

  return (
    <>
      {/* ── OVERLAY + MODAL ── */}
      {isVisible && (
        <>
        <style>{`
          @media (max-width: 540px) {
            .sm-modal-header   { padding: 22px 18px 18px !important; }
            .sm-modal-icon     { width: 56px !important; height: 56px !important; font-size: 24px !important; margin-bottom: 12px !important; }
            .sm-modal-title    { font-size: 1.125rem !important; }
            .sm-modal-subtitle { font-size: 0.8125rem !important; }
            .sm-modal-body     { padding: 16px 18px !important; }
            .sm-modal-footer   { padding: 4px 18px 20px !important; }
            .sm-social-grid    { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            animation: 'modalIn 320ms cubic-bezier(0.34,1.56,0.64,1) both',
            position: 'relative',
          }}>

            {/* ── HEADER ── */}
            <div className="sm-modal-header" style={{
              padding: '32px 28px 22px',
              borderBottom: '1px solid #E2E8F0',
              textAlign: 'center',
              position: 'relative',
              boxSizing: 'border-box',
              width: '100%',
            }}>
              {/* Botón X */}
              <button
                type="button"
                onClick={closeModal}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', color: '#64748B',
                  transition: 'all 200ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'rotate(90deg)'; (e.currentTarget as HTMLButtonElement).style.background = '#E2E8F0' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9' }}
                aria-label="Cerrar"
              >
                ✕
              </button>

              {/* Icono */}
              <div className="sm-modal-icon" style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #0A2540 0%, #1B4F8A 50%, #34D399 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '32px',
              }}>
                🎉
              </div>

              <h2 className="sm-modal-title" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0A2540', lineHeight: '130%', marginBottom: '10px', fontFamily: 'Inter, sans-serif' }}>
                ¡Tu Diagnóstico está Listo!
              </h2>
              <p className="sm-modal-subtitle" style={{ fontSize: '0.9375rem', fontWeight: 400, color: '#64748B', lineHeight: '150%', fontFamily: 'Inter, sans-serif' }}>
                Guarda y comparte tus resultados para acceder a ellos cuando quieras
              </p>
            </div>

            {/* ── BODY ── */}
            <div className="sm-modal-body" style={{ padding: '22px 28px', boxSizing: 'border-box', width: '100%' }}>

              {/* URL */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#0A2540', marginBottom: '10px', fontFamily: 'Inter, sans-serif' }}>
                  {/* Solar: link-linear */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Tu enlace único:
                </p>
                <div style={{ display: 'flex', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    flex: 1, minWidth: 0, padding: '12px 16px',
                    border: `2px solid ${isUrlReady ? '#E2E8F0' : '#B0D2FC'}`,
                    borderRadius: '12px',
                    background: isUrlReady ? '#F8FAFC' : '#EFF6FF',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    overflow: 'hidden',
                    transition: 'all 300ms',
                  }}>
                    {!isUrlReady && (
                      <div style={{
                        width: '14px', height: '14px', flexShrink: 0,
                        border: '2px solid #B0D2FC', borderTopColor: '#60A5FA',
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                      }} />
                    )}
                    <span style={{
                      fontFamily: 'monospace', fontSize: '0.8rem',
                      color: isUrlReady ? '#475569' : '#60A5FA',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      flex: 1,
                    }}>
                      {isUrlReady ? shareUrl : 'Generando tu enlace único…'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyURL}
                    disabled={!isUrlReady}
                    style={{
                      padding: '12px 20px',
                      background: copied ? '#34D399' : isUrlReady ? '#60A5FA' : '#B0D2FC',
                      color: '#ffffff',
                      border: 'none', borderRadius: '12px',
                      fontSize: '0.875rem', fontWeight: 600,
                      cursor: isUrlReady ? 'pointer' : 'not-allowed',
                      whiteSpace: 'nowrap',
                      transition: 'all 200ms',
                      transform: copied ? 'translateY(-1px)' : 'none',
                      opacity: isUrlReady ? 1 : 0.6,
                    }}
                  >
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Redes sociales */}
              <div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#0A2540', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
                  {/* Solar: share-linear */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Comparte en tus redes:
                </p>
                <div className="sm-social-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {socialButtons.map((social) => {
                    const isHovered = hoveredSocial === social.id
                    return (
                        <button
                        key={social.id}
                        type="button"
                        onClick={social.onClick}
                        onMouseEnter={() => isUrlReady && setHoveredSocial(social.id)}
                        onMouseLeave={() => setHoveredSocial(null)}
                        disabled={!isUrlReady || (social.id === 'instagram' && instagramLoading)}
                        style={{
                          padding: '14px 8px',
                          border: `2px solid ${isHovered && isUrlReady ? social.color : '#E2E8F0'}`,
                          borderRadius: '12px',
                          background: isHovered && isUrlReady ? social.hoverBg : '#ffffff',
                          color: isHovered && isUrlReady ? '#ffffff' : isUrlReady ? social.color : '#CBD5E1',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: '8px',
                          cursor: isUrlReady ? 'pointer' : 'not-allowed',
                          transform: isHovered && isUrlReady ? 'translateY(-3px)' : 'none',
                          boxShadow: isHovered && isUrlReady ? `0 8px 20px ${social.color}44` : 'none',
                          transition: 'all 200ms ease',
                          opacity: isUrlReady ? 1 : 0.5,
                        }}
                      >
                        {social.icon}
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: '1' }}>
                          {social.id === 'instagram' && instagramLoading ? 'Generando...' : social.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {/* Banner WhatsApp copiado */}
                {whatsappCopied && (
                  <div style={{
                    marginTop: '12px',
                    padding: '14px 16px',
                    background: '#F0FDF4',
                    border: '1.5px solid #86EFAC',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px', lineHeight: 1 }}>✅</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#166534', fontFamily: 'Inter, sans-serif', lineHeight: '130%' }}>
                          Mensaje copiado al portapapeles
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#15803D', fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '130%' }}>
                          {isMobileDevice
                            ? 'Abriendo WhatsApp con el mensaje listo…'
                            : <>Abre WhatsApp Web y pega con <kbd style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '4px', padding: '1px 5px', fontSize: '0.7rem', fontFamily: 'monospace', color: '#166534' }}>Ctrl + V</kbd></>
                          }
                        </p>
                      </div>
                    </div>
                    {!isMobileDevice && (
                      <button
                        type="button"
                        onClick={() => window.open('https://web.whatsapp.com/', '_blank')}
                        style={{
                          flexShrink: 0,
                          padding: '8px 14px',
                          background: '#25D366',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          fontFamily: 'Inter, sans-serif',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Abrir WhatsApp
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {/* Banner LinkedIn copiado */}
                {linkedinCopied && (
                  <div style={{
                    marginTop: '12px',
                    padding: '14px 16px',
                    background: '#EFF6FF',
                    border: '1.5px solid #93C5FD',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px', lineHeight: 1 }}>✅</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#1E3A5F', fontFamily: 'Inter, sans-serif', lineHeight: '130%' }}>
                          Publicación copiada al portapapeles
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#1D4ED8', fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '130%' }}>
                          Abre LinkedIn, crea una publicación y pega con <kbd style={{ background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: '4px', padding: '1px 5px', fontSize: '0.7rem', fontFamily: 'monospace', color: '#1E3A5F' }}>Ctrl + V</kbd>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open('https://www.linkedin.com/feed/', '_blank')}
                      style={{
                        flexShrink: 0,
                        padding: '8px 14px',
                        background: '#0A66C2',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Abrir LinkedIn
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </button>
                  </div>
                )}

                {/* Nota Instagram */}
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.75rem', color: '#94A3B8', marginTop: '10px', fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '150%' }}>
                  {/* Solar: camera-linear */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Instagram: genera y descarga una imagen lista para Stories
                </p>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="sm-modal-footer" style={{ padding: '4px 28px 24px', textAlign: 'center', boxSizing: 'border-box', width: '100%' }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: '12px 36px',
                  background: '#F8FAFC',
                  color: '#475569',
                  border: '2px solid #E2E8F0',
                  borderRadius: '999px',
                  fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#E2E8F0' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC' }}
              >
                Continuar viendo mis resultados
              </button>
            </div>

          </div>
        </div>
        </>
      )}

      {/* ── BOTÓN FLOTANTE CON RING PULSANTE ── */}
      {showFloatingBtn && (
        <>
          <style>{`
            @keyframes ringPulse {
              0%, 100% { transform: scale(1); opacity: 0.75; }
              50%       { transform: scale(1.45); opacity: 0; }
            }
          `}</style>
          <style>{`
            @media (max-width: 540px) {
              .sm-modal-header { padding: 22px 18px 18px !important; }
              .sm-modal-icon   { width: 56px !important; height: 56px !important; font-size: 24px !important; margin-bottom: 12px !important; }
              .sm-modal-title  { font-size: 1.125rem !important; }
              .sm-modal-subtitle { font-size: 0.8125rem !important; }
              .sm-modal-body   { padding: 16px 18px !important; }
              .sm-modal-footer { padding: 4px 18px 20px !important; }
              .sm-social-grid  { grid-template-columns: repeat(2, 1fr) !important; }
            }
          `}</style>

          {/* Wrapper posiciona el conjunto; z-index y offset aquí */}
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '20px',
              zIndex: 9998,
              animation: 'slideInBounce 500ms ease both',
            }}
          >
            {/* Ring pulsante — animación via inline style (garantizada en React) */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-7px',
                borderRadius: '50%',
                border: '3px solid rgba(10,37,64,0.7)',
                pointerEvents: 'none',
                animation: 'ringPulse 2s ease-in-out infinite',
                willChange: 'transform, opacity',
              }}
            />

            {/* Botón — gradiente idéntico al fondo de la página de resultados */}
            <button
              type="button"
              onClick={openModal}
              title="Compartir resultados"
              aria-label="Compartir resultados"
              style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0A2540 0%, #1B4F8A 40%, #2E8B7A 75%, #34D399 100%)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(52,211,153,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.transform = 'translateY(-3px) scale(1.05)'
                el.style.boxShadow = '0 12px 35px rgba(52,211,153,0.55)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.transform = 'none'
                el.style.boxShadow = '0 8px 25px rgba(52,211,153,0.4)'
              }}
            >
              <svg
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                style={{ transition: 'transform 0.3s ease' }}
              >
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </>
      )}

      {/* ── TOAST ── */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: showFloatingBtn ? '100px' : '30px',
          right: '30px',
          background: '#34D399',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(52,211,153,0.35)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '0.875rem', fontWeight: 600,
          zIndex: 10000,
          animation: 'toastIn 300ms ease both',
        }}>
          {toast.message}
        </div>
      )}
    </>
  )
}
