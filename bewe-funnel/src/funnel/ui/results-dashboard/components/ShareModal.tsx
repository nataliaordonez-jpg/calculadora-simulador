import { useState, useEffect, useCallback } from 'react'

interface ShareModalProps {
  businessName: string
  roi: number
  potentialMonthly: number
  formatCurrency: (val: number) => string
  /** URL única para compartir los resultados. Si no se provee, usa la URL actual. */
  shareUrl?: string
}

export const ShareModal = ({ businessName, roi, potentialMonthly, formatCurrency, shareUrl: shareUrlProp }: ShareModalProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [showFloatingBtn, setShowFloatingBtn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [instagramLoading, setInstagramLoading] = useState(false)
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' })

  const shareUrl = shareUrlProp ?? window.location.href

  // Aparecer a los 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Tecla ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) closeModal()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isVisible])

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

  const closeModal = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => setShowFloatingBtn(true), 300)
  }, [])

  const openModal = () => {
    setIsVisible(true)
    setShowFloatingBtn(false)
  }

  const copyURL = async () => {
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

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎉 Mira el diagnóstico de ROI para ${businessName} con Linda IA:\n\n` +
      `💰 ROI Proyectado: ${roi.toLocaleString()}%\n` +
      `📈 Potencial de crecimiento: +${formatCurrency(potentialMonthly)}/mes\n\n` +
      `Revisa los detalles completos aquí:`
    )
    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    )
  }

  const shareTwitter = () => {
    const text = encodeURIComponent(
      `Acabo de descubrir el potencial real de mi negocio 🚀\n\n` +
      `💰 ROI proyectado: ${roi.toLocaleString()}%\n` +
      `📈 Potencial: +${formatCurrency(potentialMonthly)}/mes\n\n` +
      `Mira mi diagnóstico completo:`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareInstagram = () => {
    setInstagramLoading(true)
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
      showToast('✓ Imagen descargada. Súbela a Instagram Stories')
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            animation: 'modalIn 320ms cubic-bezier(0.34,1.56,0.64,1) both',
            position: 'relative',
          }}>

            {/* ── HEADER ── */}
            <div style={{
              padding: '40px 40px 28px',
              borderBottom: '1px solid #E2E8F0',
              textAlign: 'center',
              position: 'relative',
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
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #0A2540 0%, #1B4F8A 50%, #34D399 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '38px',
              }}>
                🎉
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0A2540', lineHeight: '130%', marginBottom: '10px' }}>
                ¡Tu Diagnóstico está Listo!
              </h2>
              <p style={{ fontSize: '1rem', fontWeight: 400, color: '#64748B', lineHeight: '150%' }}>
                Guarda y comparte tus resultados para acceder a ellos cuando quieras
              </p>
            </div>

            {/* ── BODY ── */}
            <div style={{ padding: '28px 40px' }}>

              {/* URL */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A2540', marginBottom: '10px' }}>
                  🔗 Tu enlace único:
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    readOnly
                    value={shareUrl}
                    style={{
                      flex: 1, padding: '12px 16px',
                      border: '2px solid #E2E8F0', borderRadius: '12px',
                      fontFamily: 'monospace', fontSize: '0.8rem',
                      background: '#F8FAFC', color: '#475569',
                      outline: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  />
                  <button
                    type="button"
                    onClick={copyURL}
                    style={{
                      padding: '12px 20px',
                      background: copied ? '#34D399' : '#60A5FA',
                      color: '#ffffff',
                      border: 'none', borderRadius: '12px',
                      fontSize: '0.875rem', fontWeight: 600,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'all 200ms',
                      transform: copied ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Redes sociales */}
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A2540', marginBottom: '12px' }}>
                  📱 Comparte en tus redes:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {socialButtons.map((social) => {
                    const isHovered = hoveredSocial === social.id
                    return (
                      <button
                        key={social.id}
                        type="button"
                        onClick={social.onClick}
                        onMouseEnter={() => setHoveredSocial(social.id)}
                        onMouseLeave={() => setHoveredSocial(null)}
                        style={{
                          padding: '14px 8px',
                          border: `2px solid ${isHovered ? social.color : '#E2E8F0'}`,
                          borderRadius: '12px',
                          background: isHovered ? social.hoverBg : '#ffffff',
                          color: isHovered ? '#ffffff' : social.color,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: '8px',
                          cursor: 'pointer',
                          transform: isHovered ? 'translateY(-3px)' : 'none',
                          boxShadow: isHovered ? `0 8px 20px ${social.color}44` : 'none',
                          transition: 'all 200ms ease',
                        }}
                        disabled={social.id === 'instagram' && instagramLoading}
                      >
                        {social.icon}
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: '1' }}>
                          {social.id === 'instagram' && instagramLoading ? 'Generando...' : social.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {/* Nota Instagram */}
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '10px', textAlign: 'center' }}>
                  📸 Instagram: genera y descarga una imagen lista para Stories
                </p>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{ padding: '4px 40px 32px', textAlign: 'center' }}>
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
      )}

      {/* ── BOTÓN FLOTANTE ── */}
      {showFloatingBtn && (
        <button
          type="button"
          onClick={openModal}
          title="Compartir resultados"
          style={{
            position: 'fixed',
            bottom: '30px', right: '90px',
            width: '56px', height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(96,165,250,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9998,
            animation: 'slideInBounce 500ms ease both',
            transition: 'all 250ms ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.transform = 'scale(1.12) translateY(-3px)'
            el.style.boxShadow = '0 12px 35px rgba(96,165,250,0.55)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.transform = 'none'
            el.style.boxShadow = '0 8px 25px rgba(96,165,250,0.45)'
          }}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
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
