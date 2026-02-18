import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, Input, Phone, IconComponent } from '@beweco/aurora-ui'
import type { PhoneValue } from '@beweco/aurora-ui'
import { leadCaptureSchema, type LeadCaptureFormData } from '@funnel/domain/validations/lead.validation'

/* ── Longitud de teléfono por país (ISO 3166-1 alpha-2) ── */
const PHONE_LENGTH_BY_COUNTRY: Record<string, { min: number; max: number }> = {
  CO: { min: 10, max: 10 },  // Colombia
  US: { min: 10, max: 10 },  // Estados Unidos
  CA: { min: 10, max: 10 },  // Canadá
  MX: { min: 10, max: 10 },  // México
  AR: { min: 10, max: 10 },  // Argentina
  CL: { min: 9, max: 9 },    // Chile
  PE: { min: 9, max: 9 },    // Perú
  EC: { min: 9, max: 9 },    // Ecuador
  VE: { min: 10, max: 10 },  // Venezuela
  BO: { min: 8, max: 8 },    // Bolivia
  PY: { min: 9, max: 9 },    // Paraguay
  UY: { min: 8, max: 9 },    // Uruguay
  PA: { min: 8, max: 8 },    // Panamá
  CR: { min: 8, max: 8 },    // Costa Rica
  GT: { min: 8, max: 8 },    // Guatemala
  HN: { min: 8, max: 8 },    // Honduras
  SV: { min: 8, max: 8 },    // El Salvador
  NI: { min: 8, max: 8 },    // Nicaragua
  DO: { min: 10, max: 10 },  // República Dominicana
  CU: { min: 8, max: 8 },    // Cuba
  PR: { min: 10, max: 10 },  // Puerto Rico
  BR: { min: 10, max: 11 },  // Brasil
  ES: { min: 9, max: 9 },    // España
  PT: { min: 9, max: 9 },    // Portugal
  FR: { min: 9, max: 9 },    // Francia
  DE: { min: 10, max: 11 },  // Alemania
  IT: { min: 9, max: 10 },   // Italia
  GB: { min: 10, max: 11 },  // Reino Unido
  JP: { min: 10, max: 11 },  // Japón
  CN: { min: 11, max: 11 },  // China
  IN: { min: 10, max: 10 },  // India
  AU: { min: 9, max: 9 },    // Australia
}

const DEFAULT_PHONE_LENGTH = { min: 7, max: 15 }

interface LeadModalProps {
  onSubmit: (data: LeadCaptureFormData) => void
  isLoading: boolean
}

export function LeadModal({ onSubmit, isLoading }: LeadModalProps) {
  const [phoneValue, setPhoneValue] = useState<PhoneValue>({ number: '', code: '57', country: 'CO' })
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureSchema),
    mode: 'onChange',
  })

  const watchedName = watch('fullName')
  const watchedEmail = watch('email')

  const getPhoneRules = useCallback((country?: string) => {
    if (!country) return DEFAULT_PHONE_LENGTH
    return PHONE_LENGTH_BY_COUNTRY[country] ?? DEFAULT_PHONE_LENGTH
  }, [])

  const validatePhoneDigits = useCallback((digits: string, country?: string): string | null => {
    if (digits.length === 0) return null
    const rules = getPhoneRules(country)

    if (digits.length < rules.min) {
      return `Mínimo ${rules.min} dígitos`
    }
    if (digits.length > rules.max) {
      return `Máximo ${rules.max} dígitos`
    }
    return null
  }, [getPhoneRules])

  /* ── ¿Todos los campos están correctos? ── */
  const isPhoneValid = useMemo(() => {
    const digits = phoneValue.number.replace(/\D/g, '')
    const rules = getPhoneRules(phoneValue.country)
    return digits.length >= rules.min && digits.length <= rules.max
  }, [phoneValue, getPhoneRules])

  const isFormComplete = isValid && !!watchedName && !!watchedEmail && isPhoneValid && !phoneError

  const onFormSubmit = (data: LeadCaptureFormData) => {
    const digits = phoneValue.number.replace(/\D/g, '')
    const error = validatePhoneDigits(digits, phoneValue.country)

    if (!digits) {
      setPhoneError('Ingresa tu número de teléfono')
      return
    }

    if (error) {
      setPhoneError(error)
      return
    }

    setPhoneError(null)
    const cleanCode = (phoneValue.code ?? '').replace(/\D/g, '')
    const fullPhone = cleanCode
      ? `+${cleanCode}${digits}`
      : digits

    onSubmit({
      ...data,
      phone: fullPhone,
      phoneCountry: phoneValue.country,
      phonePrefix: cleanCode ? `+${cleanCode}` : '',
    })
  }

  return (
    <Card shadow="lg" radius="lg" padding="lg" className="border border-primary-200">
      <div className="text-center mb-6">
        <h2 className="text-h2 text-base-dark mb-2">
          ¡Tu diagnóstico está listo!
        </h2>
        <p className="text-body text-base-dark/60 mb-4">
          Estás a un paso de descubrir el potencial real de tu negocio
        </p>
        <ul className="inline-flex flex-col items-center space-y-2 mb-2">
          <li className="inline-flex items-center gap-2 text-small text-base-dark/70">
            <IconComponent icon="solar:chart-2-linear" size="sm" color="var(--color-primary-400)" />
            Tu proyección de ROI en 3 escenarios distintos
          </li>
          <li className="inline-flex items-center gap-2 text-small text-base-dark/70">
            <IconComponent icon="solar:wallet-money-linear" size="sm" color="var(--color-secondary-400)" />
            El ahorro exacto en costos que puedes lograr
          </li>
          <li className="inline-flex items-center gap-2 text-small text-base-dark/70">
            <IconComponent icon="solar:diploma-verified-linear" size="sm" color="var(--color-accent)" />
            Tu diagnóstico de crecimiento personalizado según tu sector
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div style={{ marginBottom: '28px' }}>
          <label className="block text-small font-medium text-base-dark" style={{ marginBottom: '10px' }}>
            Nombre completo
          </label>
          <Input
            placeholder="Tu nombre"
            variant="bordered"
            size="md"
            radius="lg"
            isInvalid={!!errors.fullName}
            errorMessage={errors.fullName?.message}
            {...register('fullName')}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label className="block text-small font-medium text-base-dark" style={{ marginBottom: '10px' }}>
            Email
          </label>
          <Input
            type="email"
            placeholder="tu@email.com"
            variant="bordered"
            size="md"
            radius="lg"
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <Phone
            label="Teléfono"
            value={phoneValue}
            onChange={(val: PhoneValue) => {
              setPhoneValue(val)
              const digits = val.number.replace(/\D/g, '')
              setPhoneError(validatePhoneDigits(digits, val.country))
            }}
            error={!!phoneError}
            errorText={phoneError ?? undefined}
            translations={{
              placeholder: 'Número de teléfono',
              searchPlaceholder: 'Buscar país...',
              selectCountryAriaLabel: 'Seleccionar país',
              noCountriesFound: 'No se encontraron países',
            }}
          />
        </div>

        {isLoading ? (
          <Button
            type="submit"
            color="primary"
            size="lg"
            radius="full"
            isLoading
            isDisabled
            className="w-full shadow-lg"
          >
            Guardando...
          </Button>
        ) : (
          <button
            type="submit"
            disabled={!isFormComplete}
            className="btn-slide-reveal w-full h-12 rounded-full text-button font-semibold shadow-lg group"
          >
            {/* Texto normal (se oculta en hover) */}
            <span className="relative z-[3] inline-flex items-center gap-2 transition-opacity duration-300 group-hover:opacity-0">
              <IconComponent
                icon={isFormComplete ? 'solar:lock-keyhole-unlocked-linear' : 'solar:lock-keyhole-linear'}
                size="sm"
                color="currentColor"
              />
              Ver mi diagnóstico completo
            </span>
            {/* Candado abierto (aparece en hover) */}
            <span className="absolute inset-0 z-[4] flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
              <IconComponent
                icon="solar:lock-keyhole-unlocked-bold-duotone"
                size="lg"
                color="#fff"
              />
            </span>
          </button>
        )}

        <p className="text-small text-base-dark/50 text-center mt-4" style={{ marginBottom: '16px' }}>
          Usaremos tus datos para que puedas guardar y consultar tu diagnóstico.
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1" style={{ border: '1px solid #34D399', backgroundColor: 'rgba(214, 246, 235, 0.3)' }}>
            <IconComponent icon="solar:check-circle-linear" size="sm" color="#34D399" />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#279E73' }}>100% Gratuito</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary-400 bg-primary-100/30 px-3 py-1">
            <IconComponent icon="solar:check-circle-linear" size="sm" color="var(--color-primary-400)" />
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-primary-600)' }}>Sin compromiso</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(254, 243, 199, 0.3)' }}>
            <IconComponent icon="solar:check-circle-linear" size="sm" color="var(--color-accent)" />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#B8860B' }}>Resultados inmediatos</span>
          </span>
        </div>
      </form>
    </Card>
  )
}
