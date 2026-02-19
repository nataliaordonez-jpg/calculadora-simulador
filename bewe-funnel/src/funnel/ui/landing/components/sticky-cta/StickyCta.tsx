import { useState, useEffect } from 'react'
import { Button } from '@beweco/aurora-ui'

interface StickyCtaProps {
  onStart: () => void
}

export function StickyCta({ onStart }: StickyCtaProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-primary-100 py-3 px-6 md:hidden animate-[slideUp_300ms_ease-out]">
      <Button
        color="primary"
        size="lg"
        radius="full"
        onPress={onStart}
        className="w-full"
      >
        Diagnosticar mi negocio gratis
      </Button>
    </div>
  )
}
