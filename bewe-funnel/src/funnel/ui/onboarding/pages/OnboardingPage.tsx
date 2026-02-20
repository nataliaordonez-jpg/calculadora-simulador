import { useState } from 'react'
import { Button } from '@beweco/aurora-ui'
import { FunnelLayout } from '../../_shared/components/funnel-layout/FunnelLayout'
import { BusinessNameInput } from '../components/business-name-input/BusinessNameInput'
import { SectorSelector } from '../components/sector-selector/SectorSelector'
import { CurrencySelector } from '../components/currency-selector/CurrencySelector'
import { useFunnelContext } from '../../_shared/context/funnel-context'
import { useFunnelNavigation } from '../../_shared/hooks/use-funnel-navigation'
import { FunnelStep } from '@funnel/domain/enums/funnel-step.enum'
import { Sector } from '@funnel/domain/enums/sector.enum'
import { Currency } from '@funnel/domain/enums/currency.enum'

export function OnboardingPage() {
  const { dispatch } = useFunnelContext()
  const { goToStep } = useFunnelNavigation()

  const [businessName, setBusinessName] = useState('')
  const [sector, setSector] = useState<Sector | null>(null)
  const [currency, setCurrency] = useState<Currency>(Currency.USD)
  const [errors, setErrors] = useState<Record<string, string>>({})

  /* El botón se activa solo cuando las 3 preguntas están respondidas */
  const isFormComplete = businessName.length >= 2 && sector !== null && currency !== null

  const handleContinue = () => {
    const newErrors: Record<string, string> = {}
    if (!businessName || businessName.length < 2) {
      newErrors.businessName = 'Ingresa el nombre de tu negocio'
    }
    if (!sector) {
      newErrors.sector = 'Selecciona un sector'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    dispatch({
      type: 'SET_BUSINESS_CONFIG',
      payload: { businessName, sector: sector!, currency },
    })

    goToStep(FunnelStep.QUESTIONNAIRE)
  }

  return (
    <FunnelLayout showHeader={false}>
      <div className="max-w-2xl mx-auto px-6 md:px-12 py-12">
        <div className="text-center mb-10">
          <h1 className="text-h1 text-base-dark mb-3">
            Cuéntanos sobre tu negocio
          </h1>
          <p className="text-body text-base-dark/60 !mb-12 md:!mb-12">
            Con estos datos personalizaremos tu diagnóstico al máximo
          </p>
        </div>

        <div className="flex flex-col">
          <div className="mb-16 !mb-12 md:!mb-8">
            <BusinessNameInput
              value={businessName}
              onChange={(val) => {
                setBusinessName(val)
                setErrors(prev => ({ ...prev, businessName: '' }))
              }}
              error={errors.businessName}
            />
          </div>

          <div className="mb-24 !mb-16 md:!mb-8">
            <SectorSelector
              value={sector}
              onChange={(val) => {
                setSector(val)
                setErrors(prev => ({ ...prev, sector: '' }))
              }}
              error={errors.sector}
            />
          </div>

          <div>
            <CurrencySelector
              value={currency}
              onChange={setCurrency}
            />
          </div>
        </div>

        <div className="flex justify-center" style={{ marginTop: '60px' }}>
          <Button
            color="primary"
            size="lg"
            radius="full"
            onPress={handleContinue}
            isDisabled={!isFormComplete}
            className={`px-8 py-4 btn-line-slide ${
              !isFormComplete ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Iniciar diagnóstico
          </Button>
        </div>
      </div>
    </FunnelLayout>
  )
}
