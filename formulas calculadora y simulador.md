**FÓRMULAS DE LA CALCULADORA DE ROI**

Extraídas para la Herramienta Unificada

Numeración de preguntas según documento de estructura final


# CUANTIFICACIÓN** DE RESPUESTAS**

Solo preguntas que alimentan fórmulas de la calculadora, con sus opciones reales del documento depreguntas.


## **P1 - Sector**

No se convierte en número. Se usa para seleccionar constantes (deflexión, recuperación, costo/hora). Mapeo interno:

"belleza": "servicios"

"wellness": "salud"

"fitness": "retail"

"salud": "salud"


## **P2 - **Facturación** Mensual**


| NOTA: La calculadora original NO tenía esta pregunta. Tenía 'ticket promedio'. En la herramienta unificada el ticket se calcula como P2 / P7. |
| --------------------------------------------------------------------------------------------------------------------------------------------- |


**USD**

"Hasta $2,000": 1000,

"$2,001 - $6,000": 4000,

"$6,001 - $12,000": 9000,

"Más de $12,001": 15000

**COP**

"Hasta $7.000.000": 3500000,

"$7.000.001 - $14.000.000": 10500000,

"$14.000.001 - $30.000.000": 22000000,

"Más de $30.000.000": 45000000

**MXN**

"Hasta $35,000": 17500,

"$35,001 - $75,000": 55000,

"$75,001 - $140,000": 107500,

"Mas de $140,000": 160000

**EUR**

"Hasta 2,000": 1000,

"2,001 - 6,000": 4000,

"6,001 - 12,000": 9000,

"Más de 12,000": 15000


## **P3 - % Ventas/Oportunidades Perdidas**

En la calculadora original = 'unansweredChats'. Se parsea como punto medio del rango / 100.


// Opciones del documento de estructura:

"1-5%"        -> (1+5)/2 = 3    -> se usa como 0.03

"5-15%"       -> (5+15)/2 = 10   -> se usa como 0.10

"15-25%"      -> (15+25)/2 = 20  -> se usa como 0.20

"25-40%"      -> (25+40)/2 = 32  -> se usa como 0.32

"Más del 40%" -> 40 * 1.5 = 60   -> se usa como 0.60


## **P4 - Tiempo de Primera Respuesta**

Se parsea como horas.


// Opciones del documento de estructura:

"Menos de 1 minuto"       -> ~0.008 horas (0.5 min)

"1-5 minutos"             -> ~0.05 horas (3 min)

"5-15 minutos"            -> ~0.17 horas (10 min)

"15-30 minutos"           -> ~0.375 horas (22.5 min)

"de 30 minutos a 1 hora"  -> ~0.75 horas (45 min)

"Más de una hora"         -> ~1.5 horas (90 min)


| NOTA: En el código original, el factor de velocidad (Pilar 3) NO varía según la opción de P4. Es un multiplicador fijo por escenario. P4 se usa para: (1) mostrar en resultado, (2) calcular improvement_factor, (3) inferir DIGITALIZACIÓN para fórmulas del diagnóstico. |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |


## **P5 - No-Show / Cancelaciones**

Se parsea como porcentaje. Opciones genéricas (las dinámicas por nicho usan los mismos rangos):


// Opciones del documento de estructura:

"0-5% (casi ninguno)"    -> (0+5)/2 = 2  -> se usa como 0.02

"5-15% (normal)"         -> (5+15)/2 = 10 -> se usa como 0.10

"15-25% (alto)"          -> (15+25)/2 = 20 -> se usa como 0.20

"Más del 25% (criticó)"  -> 25 * 1.5 = 37 -> se usa como 0.37

"No manejo citas"        -> 0


| NOTA: La tasa de no-show mejorada con IA viene de la tabla 'benchmarks' en BD (ai_improved_value = 8% para todos los sectores), no es constante en el código. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- |


## **P6 - Horas de **Atención** Diaria**

Se parsea con parseBusinessHours(), válida rango 1-24, fallback a 8.


// Opciones del documento de estructura:

"Menos de 8 horas"                       -> 8 (fallback)

"8-12 horas"                             -> 10

"12-16 horas"                            -> 14

"24 horas (ya tengo atención completa)"  -> 24


## **P7 - Clientes Activos Mensuales**


| NOTA: Viene del diagnóstico. Opciones dinámicas por nicho. Se usa para calcular ticket promedio = P2 / P7. |
| ---------------------------------------------------------------------------------------------------------- |


## **P11 - Conversaciones Mensuales**

Opciones de la calculadora original. Se parsea con parseIntegerValue():


// Opciones del documento de estructura:

"0 - 100 conversaciones"        -> (0+100)/2 = 50

"100 - 500 conversaciones"      -> (100+500)/2 = 300

"500 - 1,000 conversaciones"    -> (500+1000)/2 = 750

"1,000 - 2,500 conversaciones"  -> (1000+2500)/2 = 1750

"Más de 2,500 conversaciones"   -> 2500 * 1.5 = 3750


// Alimenta: Pilar 1, Pilar 2, Pilar 3


## **P12 - Miembros del Equipo**

Opciones de la calculadora original. Se parsea con parseIntegerValue():


// Opciones del documento de estructura:

"Solo yo"             -> 1

"2-3 personas"        -> (2+3)/2 = 2 (redondeado)

"4-6 personas"        -> (4+6)/2 = 5

"7-10 personas"       -> (7+10)/2 = 8 (redondeado)

"Más de 10 personas"  -> 10 * 1.5 = 15


// Alimenta: Pilar 4


## **Ticket Promedio (dato calculado, no es pregunta)**


| DATO CALCULADO: Se calcula: facturacionMensual (P2) / clientesMensuales (P7). Se convierte a USD para cálculos internos. |
| ------------------------------------------------------------------------------------------------------------------------ |


**Tabla de resultados en USD: P2 x P7**

(Usando valores del diagnóstico para P7 - ejemplo Fitness)


| P2 Facturación / P7 Clientes | < 40 (=20) | 41-120 (=80) | 121-300 (=210) | > 300 (=450) |
| ---------------------------- | ---------- | ------------ | -------------- | ------------ |
| Hasta $2,000 (=1000)         | $50.00     | $12.50       | $4.76          | $2.22        |
| $2,001-$6,000 (=4000)        | $200.00    | $50.00       | $19.05         | $8.89        |
| $6,001-$12,000 (=9000)       | $450.00    | $112.50      | $42.86         | $20.00       |
| Más de $12,001 (=15000)      | $750.00    | $187.50      | $71.43         | $33.33       |


ticketPromedioLocal = facturacionMensual / clientesMensuales

ticketPromedioUSD = convertToUSD(ticketPromedioLocal, currency)


# **CONSTANTES POR SECTOR (DEL **CÓDIGO**)**

Se seleccionan automáticamente según P1. No dependen de respuestas del usuario.


## **Tasas de **Deflexión


| Sector   | Pesimista | Base | Optimista |
| -------- | --------- | ---- | --------- |
| belleza  | 25%       | 30%  | 35%       |
| fitness  | 35%       | 42%  | 50%       |
| wellness | 28%       | 35%  | 42%       |
| salud    | 20%       | 25%  | 30%       |
| default  | 25%       | 30%  | 40%       |


## **Tasas de **Recuperación


| Sector   | Pesimista | Base | Optimista |
| -------- | --------- | ---- | --------- |
| belleza  | 45%       | 55%  | 70%       |
| fitness  | 35%       | 45%  | 60%       |
| wellness | 40%       | 50%  | 65%       |
| salud    | 50%       | 60%  | 75%       |
| default  | 40%       | 50%  | 65%       |


## **Costo por Hora del Agente (USD)**


| Sector   | Pesimista | Base | Optimista |
| -------- | --------- | ---- | --------- |
| belleza  | $18       | $22  | $26       |
| fitness  | $15       | $18  | $22       |
| wellness | $20       | $24  | $28       |
| salud    | $22       | $26  | $32       |
| default  | $16       | $20  | $24       |


## **Multiplicadores por Escenario**

pesimista: { conversión: 1.15, productivity: 1.15, cost_reduction: 0.85 }

base:      { conversion: 1.35, productivity: 1.15, cost_reduction: 1.00 }

optimista: { conversion: 1.65, productivity: 1.15, cost_reduction: 1.20 }


## **Constantes Fijas**

averageHandlingTime = 0.33  // 20 min

productivityGain = 0.15     // 15% (estudio MIT)

diasLaborales = 22

inversionMensual = 150      // USD


## **Tasa de **Conversión** Actual**


| NOTA: Viene de tabla 'benchmarks' en BD, campo 'conversion_rate.baseline_value', por sector. Valor real en BD: 15% (baseline) y 35% (ai_improved) para TODOS los sectores (no diferenciado aun). |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |


## **VALORES REALES DE LA BD (tabla benchmarks de Supabase)**

Estos son los valores encontrados en las tablas benchmark_sets y benchmarks en Supabase (producción). Actualmente los valores NO están diferenciados por sector - son iguales para todos:

conversion_rate:      baseline=15.0  ai_improved=35.0  (porcentaje)

no_show_rate:         baseline=25.0  ai_improved=8.0   (porcentaje)

response_time_hours:  baseline=4.0   ai_improved=0.1   (horas)

agent_productivity:   baseline=100.0 ai_improved=180.0 (porcentaje)

customer_satisfaction: baseline=75.0  ai_improved=88.0  (porcentaje)

chat_coverage:        baseline=60.0  ai_improved=95.0  (porcentaje)

escalation_rate:      baseline=15.0  ai_improved=5.0   (porcentaje)

quality_consistency:  baseline=70.0  ai_improved=92.0  (porcentaje)


| IMPORTANTE: Sectores en BD: salud, retail (=fitness), servicios (=belleza), inmobiliaria, educación, hotelería, consultora, ecommerce, tecnología, otros. Los 4 nichos del diagnóstico se mapean así: belleza=servicios, fitness=retail, salud/bienestar=salud. |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |


# **PILAR 1: AHORRO POR **DEFLEXIÓN

La IA resuelve consultas sin necesidad de un humano.


## **Inputs y de donde salen- interaccionesMensuales: P11 (Conversaciones Mensuales)**

- tasaDeflexion: constante por sector (P1) y escenario

- averageHandlingTime: constante fija = 0.33 horas

- costoHoraAgente: constante por sector (P1) y escenario


## Fórmula

deflectionSavings = interaccionesMensuales(P11) * tasaDeflexion(P1) * 0.33 * costoHoraAgente(P1)


**Ejemplo (Base, belleza, P11=100-500 conv)**

interacciones = 300 (P11)

deflection = 300 * 0.30 * 0.33 * 22 = $653.40 USD/mes


# **PILAR 2: INGRESOS POR **RECUPERACIÓN

Re-contactar chats que se perdieron porque nadie respondió.


## **Inputs y de donde salen- interaccionesMensuales: P11 (Conversaciones Mensuales)- unansweredPercentage: P3 (% Ventas Perdidas), punto medio / 100**

- tasaRecuperacion: constante por sector (P1) y escenario

- conversionActual: BD benchmarks = 15% (0.15) todos los sectores

**- ticketPromedio: P2 (Facturación) / P7 (Clientes), convertido a USD**


## Fórmula

unansweredChats = interaccionesMensuales(P11) * unansweredPercentage(P3) / 100

chatsRecuperados = unansweredChats * tasaRecuperacion(P1)

recoveryRevenue = chatsRecuperados * conversionActual(P1) * ticketPromedio(P2/P7)


**Ejemplo (Base, belleza, P11=300, P3=15-25%, P2=$6-12k, P7=80)**

unanswered = 300 * 0.20 = 60

recovered = 60 * 0.55 = 33

ticket = 9000/80 = $112.50

recoveryRevenue = 33 * 0.15 * 112.50 = $556.88 USD/mes


# **PILAR 3: INGRESOS POR VELOCIDAD**

Responder más rápido aumenta las conversiones.


## **Inputs y de donde salen- interaccionesMensuales: P11 (Conversaciones Mensuales)- ticketPromedio: P2 (Facturación) / P7 (Clientes), convertido a USD**

- conversionActual: BD benchmarks = 15% (0.15) todos los sectores

- factorVelocidad: multiplicador FIJO por escenario (pesim=1.15, base=1.35, optim=1.65)


| NOTA: El factor de velocidad NO depende de P4. Es fijo por escenario. P4 solo se usa en el detalle del resultado y para inferir DIGITALIZACIÓN en el diagnóstico. |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |


## Fórmula

improvedConversion = conversionActual(P1) * factorVelocidad(escenario)

speedRevenue = interaccionesMensuales(P11) * ticketPromedio(P2/P7) * (improvedConversion - conversionActual)


**Ejemplo (Base, belleza, P11=300, ticket=$112.50)**

improvedConv = 0.15 * 1.35 = 0.2025

speedRevenue = 300 * 112.50 * (0.2025-0.15) = $1,771.88 USD/mes


# **PILAR 4: AHORRO POR PRODUCTIVIDAD**

Los agentes trabajan más eficientemente con ayuda de IA.


## **Inputs y de donde salen- empleados: P12 (Miembros del Equipo)- businessHours: P6 (Horas de Atención)**

- costoHoraAgente: constante por sector (P1) y escenario

- productivityGain: constante fija = 0.15 (15%)

- diasLaborales: constante fija = 22


## Fórmula

currentAgentHours = empleados(P12) * businessHours(P6) * 22

savedHours = currentAgentHours * 0.15

productivitySavings = savedHours * costoHoraAgente(P1)


**Ejemplo (Base, belleza, P12=2-3 personas, P6=12 horas)**

hours = 2 * 12 * 22 = 528

saved = 528 * 0.15 = 79.2

productivity = 79.2 * 22 = $1,742.40 USD/mes


# **COMO SE JUNTA TODO**


## **Totales mensuales**

monthlyRevenueIncrease = recoveryRevenue + speedRevenue

monthlyCostSavings = deflectionSavings + productivitySavings


## **Score de Calidad (multiplicador)**

escalationRate = 1 - tasaDeflexion

CSAT por escenario: pesimista=3.5, base=3.8, optimista=4.2


if escalationRate < 0.15 AND csat >= 4.2: multiplier = 1.03

if escalationRate < 0.25 AND csat >= 3.8: multiplier = 0.98

if escalationRate < 0.35 AND csat >= 3.5: multiplier = 0.92

else: multiplier = 0.85


adjustedRevenue = monthlyRevenueIncrease * qualityMultiplier

adjustedSavings = monthlyCostSavings * qualityMultiplier


## **ROI**

monthlyBenefit = adjustedRevenue + adjustedSavings

rawROI = ((monthlyBenefit - 150) / 150) * 100


// Límites:

pesimista: { min: 50, max: 150 }

base:      { min: 100, max: 250 }

optimista: { min: 200, max: 400 }


## **Payback**

paybackMonths = MAX(1, REDONDEAR(150 / monthlyBenefit))


# ÍNDICE** DE IMPACTO (0-100)**

impactScore = MIN(100, REDONDEAR(

(adjustedRevenue / 1000) * 0.30 +

(adjustedSavings / 100) * 0.40 +

roiPercentage * 0.30

))


0-40: Bajo | 41-65: Moderado | 66-85: Alto | 86-100: Excepcional

Escenario Base, valores en USD, máximo 100.


# **LOS 3 ESCENARIOS**

Pesimista: tasas min, costos min, conversión 1.15, CSAT 3.5

Base: tasas base, costos base, conversion 1.35, CSAT 3.8

Optimista: tasas max, costos max, conversión 1.65, CSAT 4.2


# **EJEMPLO COMPLETO (ESCENARIO BASE)**

P1=Belleza | P2=$6,001-$12,000 | P3=15-25% | P6=12h | P7=80 clientes | P11=100-500 conv | P12=2-3 personas


ticket = P2/P7 = 9000/80 = $112.50


PILAR 1: 300(P11) * 0.30 * 0.33 * 22 = $653.40

PILAR 2: 300*0.20=60 -> 60*0.55=33 -> 33*0.15*112.50 = $556.88

PILAR 3: 0.15*1.35=0.2025 -> 300*112.50*0.0525 = $1,771.88

PILAR 4: 2(P12)*12(P6)*22=528 -> 528*0.15=79.2 -> 79.2*22 = $1,742.40


revenue = 111.38 + 354.38 = $465.76

savings = 653.40 + 1742.40 = $2,395.80


quality (belleza base: escalation=0.70, csat=3.8 -> 0.92)

adjRevenue = 465.76 * 0.92 = $428.50

adjSavings = 2395.80 * 0.92 = $2,204.14


benefit = 2632.64 | rawROI = 1655% | cap base=250%

payback = 150/2632.64 = 1 mes

impactScore = MIN(100, 0.13+8.82+75) = 84 (Alto)


# **RESUMEN: PREGUNTAS vs PILARES**


| Pregunta             | Pilar 1 Deflexión | Pilar 2 Recuperación | Pilar 3 Velocidad | Pilar 4 Productividad | Otros            |
| -------------------- | ----------------- | -------------------- | ----------------- | --------------------- | ---------------- |
| P1 Sector            | Deflexión + costo | Recuperación         | Conv. sector      | Costo/hora            | -                |
| P2 Facturación       | -                 | Ticket (P2/P7)       | Ticket (P2/P7)    | -                     | Diagnóstico      |
| P3 % Ventas perdidas | -                 | unansweredPct        | -                 | -                     | -                |
| P4 Tiempo respuesta  | -                 | -                    | Solo resultado    | -                     | Infiere DIGITAL. |
| P5 No-Show           | -                 | -                    | -                 | -                     | Diag + resultado |
| P6 Horas atención    | -                 | -                    | -                 | businessHours         | -                |
| P7 Clientes activos  | -                 | Ticket (P2/P7)       | Ticket (P2/P7)    | -                     | Diagnóstico      |
| P8 Clientes nuevos   | -                 | -                    | -                 | -                     | Solo diagnóstico |
| P9 Churn             | -                 | -                    | -                 | -                     | Solo diagnóstico |
| P10 Desafío          | -                 | -                    | -                 | -                     | Personaliza      |
| P11 Conversaciones   | interacciones     | interacciones        | interacciones     | -                     | -                |
| P12 Equipo           | -                 | -                    | -                 | empleados             | -                |


| DATO CALCULADO: Todos los inputs de las fórmulas tienen su pregunta resuelta. No hay inputs faltantes. |
| ------------------------------------------------------------------------------------------------------ |


# **FÓRMULAS DEL DIAGNÓSTICO DE CRECIMIENTO**

Reutilizables en la Herramienta Unificada

Nichos: Belleza | Salud | Fitness | Bienestar

Numeración de preguntas según documento de estructura final


# INFERENCIA DE DIGITALIZACIÓN DESDE P4

En el diagnóstico original, la digitalización se preguntaba directamente con la pregunta '¿Qué tan fácil es para tus clientes reservar o gestionar sin contactarte?' (Muy fácil / Fácil / Difícil / Muy difícil).


En la herramienta unificada esa pregunta no existe, pero P4 (tiempo de primera respuesta) permite inferir el mismo nivel. La lógica: un negocio que tarda más en responder tiene menor digitalización.


**Mapeo desde P4 (opciones del documento de estructura)**

const DIGITALIZACION_DESDE_P4 = {

"Menos de 1 minuto":       "muy_digital",

"1-5 minutos":             "digital",

"5-15 minutos":            "poco_digital",

"15-30 minutos":           "poco_digital",

"de 30 minutos a 1 hora":  "nada_digital",

"Más de una hora":         "nada_digital"

};


**Equivalencia con diagnóstico original**


| Diagnostico Original | Valor        | P4 Equivalente                |
| -------------------- | ------------ | ----------------------------- |
| Muy fácil            | muy_digital  | Menos de 1 minuto             |
| Fácil                | digital      | 1-5 minutos                   |
| Difícil              | poco_digital | 5-15 min / 15-30 min          |
| Muy difícil          | nada_digital | 30 min-1 hora / Más de 1 hora |


Alimenta: Adquisición (todos los nichos) y Adherencia (Salud).


# CUANTIFICACIÓN COMÚN A TODOS LOS NICHOS


## Selector: Moneda + P2 Facturación Mensual

Los rangos se adaptan según la moneda. El valor usado en cálculos es el punto medio del rango.


| USD            | EUR           | COP              | MXN              | Valor usado                            |
| -------------- | ------------- | ---------------- | ---------------- | -------------------------------------- |
| Hasta $2,000   | Hasta 2,000   | Hasta $7.000.000 | Hasta $35,000    | 1,000 / 3,500,000 / 17,500 / 1,000     |
| $2,001-$6,000  | 2,001-6,000   | $7M-$14M         | $35,001-$75,000  | 4,000 / 10,500,000 / 55,000 / 4,000    |
| $6,001-$12,000 | 6,001-12,000  | $14M-$30M        | $75,001-$140,000 | 9,000 / 22,000,000 / 107,500 / 9,000   |
| Más de $12,001 | Más de 12,000 | Mas de $30M      | Mas de $140,000  | 15,000 / 45,000,000 / 160,000 / 15,000 |


# BELLEZA (Peluqueria, Estetica, Spa, Uñas)


## P7 - Clientes Mensuales

Pregunta: ¿Cuántos clientes atiende mensualmente?

const CLIENTES_MENSUALES_BELLEZA = {

"Menos de 50":  25,

"51 a 150":     100,

"151 a 350":    250,

"Más de 350":   450

};


## P8 - Clientes Nuevos

Pregunta: Aproximadamente cuántos clientes nuevos atiendes al mes?

const CLIENTES_NUEVOS_BELLEZA = {

"1 a 10":    5,

"11 a 30":   20,

"31 a 60":   45,

"Más de 60": 80

};


## P5 - No-Show

Pregunta: ¿Qué tan común es que un cliente no se presente a su cita?

// Opciones del documento de estructura (Belleza):

// "Muy raro (menos del 5% de inasistencias)"

// "Ocasional (entre 5% y 15% de inasistencias)"

// "Frecuente (entre 15% y 30% de inasistencias)"

// "Muy frecuente (más del 30% de inasistencias)"


**Constantes**

const NO_SHOW_ACTUAL_BELLEZA = {

"Muy raro (<5%)":      0.97,

"Ocasional (5-15%)":   0.90,

"Frecuente (15-30%)":  0.78,

"Muy frecuente (>30%)": 0.60

};


const MEJORA_NO_SHOW_BELLEZA = {

"Muy raro (<5%)":      0.25,  // -25%

"Ocasional (5-15%)":   0.30,  // -30%

"Frecuente (15-30%)":  0.35,  // -35%

"Muy frecuente (>30%)": 0.40  // -40%

};


**Fórmula: Reducción No-Show**

NoShowNuevo = NO_SHOW_ACTUAL * (1 - MEJORA_NO_SHOW)


// Ejemplo: NO_SHOW_ACTUAL = 0.90, MEJORA = 0.30

// NoShowNuevo = 0.90 * (1 - 0.30) = 0.90 * 0.70 = 0.63

// Pasa del 10% de no-show a 6.3%


## P9 - Churn

Pregunta: De cada 10 clientes que atiendes, cuántos NO vuelven?

// Opciones del documento de estructura (Belleza):

// "1-2 clientes"

// "3-4 clientes"

// "5-6 clientes"

// "7 o más clientes"


**Constantes**

const CHURN_ACTUAL_BELLEZA = {

"1-2": 0.85,

"3-4": 0.65,

"5-6": 0.45,

"7+":  0.25

};


const CHURN_MEJORA_BELLEZA = {

"1-2": 0.95,  // -5%

"3-4": 0.90,  // -10%

"5-6": 0.85,  // -15%

"7+":  0.80   // -20%

};


**Fórmula: Reducción de Churn**

// PASO 1: Calcular nuevo churn

const churnNuevo = CHURN_ACTUAL * CHURN_MEJORA;


// PASO 2: Calcular reducción absoluta

const reduccionChurnAbsoluta = CHURN_ACTUAL - churnNuevo;

const reduccionChurnPorcentual = (1 - CHURN_MEJORA) * 100;


// PASO 3: Calcular clientes retenidos

const clientesPerdidosActual = CLIENTES_MENSUALES(P7) * CHURN_ACTUAL(P9);

const clientesPerdidosNuevo = CLIENTES_MENSUALES(P7) * churnNuevo;

const clientesRetenidos = clientesPerdidosActual - clientesPerdidosNuevo;


// PASO 4: Ticket por cliente

const ticketPorCliente = FACTURACION_MENSUAL(P2) / CLIENTES_MENSUALES(P7);


// PASO 5: Ganancia

const gananciaChurnMensual = clientesRetenidos * ticketPorCliente;

const gananciaChurnAnual = gananciaChurnMensual * 12;


## P8 - Aumento de Clientes Nuevos (Adquisicion)

Usa DIGITALIZACIÓN inferida desde P4.


**Constante**

const ADQUISICION_MEJORA_BELLEZA = {

"muy_digital":   1.15,  // +15%

"digital":       1.25,  // +25%

"poco_digital":  1.35,  // +35%

"nada_digital":  1.50   // +50%

};


**Fórmula: Aumento de Adquisicion**

// PASO 1: Obtener clientes nuevos actuales

const clientesNuevosActual = CLIENTES_NUEVOS_BELLEZA(P8);


// PASO 2: Calcular clientes adicionales

const digitalizacion = DIGITALIZACION_DESDE_P4(P4);

const clientesAdicionalesMes = clientesNuevosActual * (ADQUISICION_MEJORA[digitalizacion] - 1);

const clientesAdicionalesAnual = clientesAdicionalesMes * 12;


// PASO 3: Ticket por cliente

const ticketPorCliente = FACTURACION_MENSUAL(P2) / CLIENTES_MENSUALES(P7);


// PASO 4: Ganancia

const gananciaAdquisicionMensual = clientesAdicionalesMes * ticketPorCliente;

const gananciaAdquisicionAnual = gananciaAdquisicionMensual * 12;


## Crecimiento Total - Belleza

IngresosNuevos = IngresosActuales(P2) + IngresosAdquisicion + IngresosChurn


| ELIMINADA: La fórmula original incluía IngresosFrecuencia (dependía de FRECUENCIA_ASISTENCIA). Se eliminó porque esa pregunta no está en la herramienta unificada. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |


# SALUD (Clínica, Odontología, Fisioterapia)


## P7 - Pacientes Mensuales

Pregunta: ¿Cuántos pacientes atienden mensualmente?

const PACIENTES_MENSUALES_SALUD = {

"Menos de 30":  15,

"31 a 80":      55,

"81 a 200":     150,

"Más de 200":   300

};


## P8 - Pacientes Nuevos

Pregunta: Aproximadamente cuántos pacientes nuevos recibes al mes?

const CLIENTES_NUEVOS_SALUD = {

"1 a 8":     4,

"9 a 20":    15,

"21 a 45":   30,

"Más de 45": 60

};


## P5 - No-Show

Pregunta: ¿Qué tan común es que un paciente no se presente a su cita?

// Opciones del documento de estructura (Salud):

// "Muy raro (menos del 5% de inasistencias)"

// "Ocasional (entre 5% y 15% de inasistencias)"

// "Frecuente (entre 15% y 30% de inasistencias)"

// "Muy frecuente (más del 30% de inasistencias)"


**Constantes**

const NO_SHOW_PORCENTAJE_SALUD = {

"Muy raro (<5%)":      0.03,

"Ocasional (5-15%)":   0.10,

"Frecuente (15-30%)":  0.22,

"Muy frecuente (>30%)": 0.40

};


const MEJORA_NO_SHOW_SALUD = {

"Muy raro (<5%)":      0.80,  // -20%

"Ocasional (5-15%)":   0.70,  // -30%

"Frecuente (15-30%)":  0.62,  // -38%

"Muy frecuente (>30%)": 0.55  // -45%

};


**Fórmula: Reducción No-Show**

const noShowNuevo = noShowActual(P5) * mejoraNoShow(P5);

const citasPerdidosActual = pacientesMensuales(P7) * noShowActual;

const citasPerdidosNuevo = pacientesMensuales(P7) * noShowNuevo;

const citasRecuperadas = citasPerdidosActual - citasPerdidosNuevo;

const ticketPorPaciente = facturacionMensual(P2) / pacientesMensuales(P7);

const tiempoAhorrado = citasRecuperadas * 15; // 15 min por reagenda


// NOTA: En salud, No-Show NO suma a facturación directa

// Es métrica operativa con impacto indirecto en adherencia


## P9 - Churn

Pregunta: En un mes promedio, ¿qué porcentaje de pacientes no vuelve después de su última atención?

// Opciones del documento de estructura (Salud):

// "Menos del 5%"

// "Entre 5% y 10%"

// "Entre 10% y 20%"

// "Más del 20%"


**Constantes**

const CHURN_PORCENTAJE_SALUD = {

"<5%":   0.03,

"5-10%": 0.075,

"10-20%": 0.15,

">20%":  0.25

};


const MEJORA_CHURN_SALUD = {

"<5%":   0.92,  // -8%

"5-10%": 0.85,  // -15%

"10-20%": 0.78, // -22%

">20%":  0.70   // -30%

};


**Fórmula: Reducción de Churn**

const churnNuevo = churnActual(P9) * mejoraChurn(P9);

const pacientesAbandonanActual = pacientesMensuales(P7) * churnActual;

const pacientesAbandonanNuevo = pacientesMensuales(P7) * churnNuevo;

const pacientesRetenidos = pacientesAbandonanActual - pacientesAbandonanNuevo;

const ticketPorPaciente = facturacionMensual(P2) / pacientesMensuales(P7);

const gananciaChurnMensual = pacientesRetenidos * ticketPorPaciente;

const gananciaChurnAnual = gananciaChurnMensual * 12;


## P8 - Aumento de Adquisición

Usa DIGITALIZACIÓN inferida desde P4.


**Constante**

const MEJORA_ADQUISICION_SALUD = {

"muy_digital":   1.15,  // +15%

"digital":       1.22,  // +22%

"poco_digital":  1.30,  // +30%

"nada_digital":  1.40   // +40%

};


**Fórmula: Aumento de Adquisicion**

const pacientesNuevosActual = CLIENTES_NUEVOS_SALUD(P8);

const digitalizacion = DIGITALIZACION_DESDE_P4(P4);

const pacientesAdicionalesMes = pacientesNuevosActual * (MEJORA_ADQUISICION[digitalizacion] - 1);

const ticketPorPaciente = facturacionMensual(P2) / pacientesMensuales(P7);

const gananciaAdquisicionMensual = pacientesAdicionalesMes * ticketPorPaciente;

const gananciaAdquisicionAnual = gananciaAdquisicionMensual * 12;


## Adherencia (Sesiones de tratamiento)

Usa DIGITALIZACIÓN inferida desde P4 y CHURN (P9) para estimar sesiones promedio.


**Constantes**

const SESIONES_PROMEDIO_SALUD = {

"<5%":   3.5,  // Churn bajo = pacientes fieles

"5-10%": 3.0,

"10-20%": 2.5,

">20%":  2.0   // Churn crítico

};


const MEJORA_ADHERENCIA_SALUD = {

"muy_digital":   1.10,  // +10%

"digital":       1.18,  // +18%

"poco_digital":  1.28,  // +28%

"nada_digital":  1.40   // +40%

};


**Fórmula: Adherencia**

const sesionesPorPaciente = SESIONES_PROMEDIO_SALUD(P9);

const digitalizacion = DIGITALIZACION_DESDE_P4(P4);

const sesionesPorPacienteNuevo = sesionesPorPaciente * MEJORA_ADHERENCIA[digitalización];

const sesionesAdicionalesPorPaciente = sesionesPorPacienteNuevo - sesionesPorPaciente;

const sesionesAdicionalesMes = pacientesMensuales(P7) * sesionesAdicionalesPorPaciente;

const sesionesTotalesMes = pacientesMensuales(P7) * sesionesPorPaciente;

const ticketPorSesion = facturacionMensual(P2) / sesionesTotalesMes;

const gananciaAdherenciaMensual = sesionesAdicionalesMes * ticketPorSesion;

const gananciaAdherenciaAnual = gananciaAdherenciaMensual * 12;


## Crecimiento Total - Salud

const gananciaTotalMensual =

churn.gananciaNumericaMensual +

adquisicion.gananciaNumericaMensual +

adherencia.gananciaNumericaMensual;


// NOTA: No-Show NO suma a facturación, es métrica operativa

const facturacionProyectada = facturacionMensual(P2) + gananciaTotalMensual;

const porcentajeCrecimiento = (gananciaTotalMensual / facturacionMensual) * 100;


# FITNESS (Gimnasio, Personal Trainer, Crossfit)


## P7 - Miembros Mensuales

Pregunta: ¿Cuántos miembros activos tienen mensualmente?

const CLIENTES_MENSUALES_FITNESS = {

"Menos de 40":  20,

"41 a 120":     80,

"121 a 300":    210,

"Más de 300":   450

};


## P8 - Clientes Nuevos

Pregunta: Aproximadamente cuántas membresías nuevas tienes al mes?

const CLIENTES_NUEVOS_FITNESS = {

"Menos de 10": 5,

"11 a 25":     18,

"26 a 50":     38,

"Más de 50":   75

};


## P5 - No-Show (Fitness)


| NOTA: En el diagnóstico original, Fitness no tenía fórmula de no-show. P5 en Fitness se usa con la pregunta de cancelación de membresía (que es la misma P9 de churn). |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |


## P9 - Churn

Pregunta: En un mes promedio, ¿qué porcentaje de miembros cancela su membresía?

// Opciones del documento de estructura (Fitness):

// "Menos del 5%"

// "Entre 5% y 10%"

// "Entre 10% y 20%"

// "Más del 20%"


**Constantes**

const CHURN_PORCENTAJE_FITNESS = {

"<5%":   { valor: 0.03,  nivel: "bajo" },

"5-10%": { valor: 0.075, nivel: "medio" },

"10-20%": { valor: 0.15, nivel: "alto" },

">20%":  { valor: 0.25,  nivel: "crítico" }

};


| ELIMINADA: La fórmula original de churn en Fitness usaba una MATRIZ CHURN x ENGAGEMENT donde el engagement venía de FRECUENCIA ASISTENCIA. Como esa pregunta no está en la herramienta unificada, se debe usar una versión simplificada sin la dimensión de engagement. Opción sugerida: usar la diagonal de la matriz (churn bajo=0.90, medio=0.85, alto=0.75, crítico=0.70). |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |


**Constante simplificada (sin engagement)**

// Extraída de la diagonal de la matriz original

const MEJORA_CHURN_FITNESS_SIMPLIFICADA = {

"bajo":    0.90,  // -10%

"medio":   0.85,  // -15%

"alto":    0.75,  // -25%

"crítico": 0.70   // -30%

};


**Fórmula: Reducción de Churn (simplificada)**

const churnData = CHURN_PORCENTAJE_FITNESS(P9);

const churnActual = churnData.valor;

const nivelChurn = churnData.nivel;

const mejoraChurn = MEJORA_CHURN_FITNESS_SIMPLIFICADA[nivelChurn];


const churnNuevo = churnActual * mejoraChurn;

const clientesAbandonanActual = clientesMensuales(P7) * churnActual;

const clientesAbandonanNuevo = clientesMensuales(P7) * churnNuevo;

const clientesRetenidos = clientesAbandonanActual - clientesAbandonanNuevo;


const membresiaPorCliente = facturacionMensual(P2) / clientesMensuales(P7);

const gananciaChurnMensual = clientesRetenidos * membresiaPorCliente;

const gananciaChurnAnual = gananciaChurnMensual * 12;


**Referencia: Matriz ORIGINAL (requería FRECUENCIA_ASISTENCIA)**

// SOLO COMO REFERENCIA - No se puede usar sin frecuencia de asistencia

const MEJORA_CHURN_FITNESS_ORIGINAL = {

"bajo":    { "alto": 0.92, "medio": 0.90, "bajo": 0.88, "crítico": 0.85 },

"medio":   { "alto": 0.90, "medio": 0.85, "bajo": 0.80, "crítico": 0.75 },

"alto":    { "alto": 0.88, "medio": 0.82, "bajo": 0.75, "crítico": 0.70 },

"crítico": { "alto": 0.85, "medio": 0.78, "bajo": 0.72, "crítico": 0.70 }

};


## P8 - Aumento de Adquisición

Usa DIGITALIZACIÓN inferida desde P4.


**Constante**

const MEJORA_ADQUISICION_FITNESS = {

"muy_digital":   1.12,  // +12%

"digital":       1.20,  // +20%

"poco_digital":  1.30,  // +30%

"nada_digital":  1.40   // +40%

};


**Fórmula: Aumento de Adquisicion**

const clientesNuevosActual = CLIENTES_NUEVOS_FITNESS(P8);

const digitalizacion = DIGITALIZACION_DESDE_P4(P4);

const clientesAdicionalesMes = clientesNuevosActual * (MEJORA_ADQUISICION[digitalizacion] - 1);

const membresiaPorCliente = facturacionMensual(P2) / clientesMensuales(P7);

const gananciaAdquisicionMensual = clientesAdicionalesMes * membresiaPorCliente;

const gananciaAdquisicionAnual = gananciaAdquisicionMensual * 12;


## Upsells (Servicios adicionales)


| ELIMINADA: La fórmula original usaba engagementNivel que venía de FRECUENCIA_ASISTENCIA. Como esa pregunta no está, se debe usar una versión simplificada. Opción sugerida: usar la mejora correspondiente al nivel de churn (churn bajo = engagement alto, churn crítico = engagement crítico). |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |


**Constante simplificada (usando nivel de churn como proxy de engagement)**

// Lógica: churn bajo implica engagement alto y viceversa

const MEJORA_UPSELLS_FITNESS_SIMPLIFICADA = {

"bajo":    1.25,  // churn bajo = engagement alto -> +25%

"medio":   1.15,  // +15%

"alto":    1.08,  // +8%

"crítico": 1.05   // +5%

};


const PORCENTAJE_UPSELLS_BASE = 0.15; // 15% de facturacion es upsells


**Fórmula: Upsells (simplificada)**

const nivelChurn = CHURN_PORCENTAJE_FITNESS(P9).nivel;

const mejoraUpsells = MEJORA_UPSELLS_FITNESS_SIMPLIFICADA[nivelChurn];

const ingresosUpsellsActual = facturacionMensual(P2) * PORCENTAJE_UPSELLS_BASE;

const ingresosUpsellsNuevo = ingresosUpsellsActual * mejoraUpsells;

const gananciaUpsellsMensual = ingresosUpsellsNuevo - ingresosUpsellsActual;

const gananciaUpsellsAnual = gananciaUpsellsMensual * 12;


## Crecimiento Total - Fitness

const gananciaTotalMensual =

churn.gananciaNumericaMensual +

adquisicion.gananciaNumericaMensual +

upsells.gananciaNumericaMensual;


const facturacionProyectada = facturacionMensual(P2) + gananciaTotalMensual;

const porcentajeCrecimiento = (gananciaTotalMensual / facturacionMensual) * 100;


# BIENESTAR (Yoga, Pilates, Danza, Artes Marciales)


## P7 - Alumnos Mensuales

Pregunta: ¿Cuántos alumnos tienes mensualmente?

const CLIENTES_MENSUALES_BIENESTAR = {

"Menos de 30":  15,

"31 a 70":      45,

"71 a 150":     100,

"Más de 150":   200

};


## P8 - Alumnos Nuevos

Pregunta: ¿Cuántos alumnos nuevos activas mensualmente?

const CLIENTES_NUEVOS_BIENESTAR = {

"1 a 10":    5,

"11 a 20":   15,

"21 a 40":   30,

"Más de 40": 60

};


## P5 - No-Show

Pregunta: ¿Qué tan común es que un alumno no se presente a su clase reservada?

// Opciones del documento de estructura (Bienestar):

// "Muy raro (menos del 5% de inasistencias)"

// "Ocasional (entre 5% y 15% de inasistencias)"

// "Frecuente (entre 15% y 30% de inasistencias)"

// "Muy frecuente (más del 30% de inasistencias)"


**Constantes**

const NO_SHOW_PORCENTAJE_BIENESTAR = {

"Muy raro (<5%)":      0.03,

"Ocasional (5-15%)":   0.10,

"Frecuente (15-30%)":  0.22,

"Muy frecuente (>30%)": 0.40

};


const MEJORA_NO_SHOW_BIENESTAR = {

"Muy raro (<5%)":      0.80,  // -20%

"Ocasional (5-15%)":   0.72,  // -28%

"Frecuente (15-30%)":  0.67,  // -33%

"Muy frecuente (>30%)": 0.62  // -38%

};


**Fórmula: Reducción No-Show**

const noShowNuevo = noShowActual(P5) * mejoraNoShow(P5);

const clasesPerdidasActual = alumnosMensuales(P7) * noShowActual;

const clasesPerdidasNuevo = alumnosMensuales(P7) * noShowNuevo;

const clasesRecuperadas = clasesPerdidasActual - clasesPerdidasNuevo;

const tiempoAhorrado = clasesRecuperadas * 10; // 10 min por reagenda


// NOTA: En bienestar, No-Show NO suma a facturación directa


## P9 - Churn

Pregunta: En un mes promedio, ¿qué porcentaje de alumnos deja de asistir o cancela?

// Opciones del documento de estructura (Bienestar):

// "Menos del 5%"

// "Entre 5% y 10%"

// "Entre 10% y 20%"

// "Más del 20%"


**Constantes**

const CHURN_PORCENTAJE_BIENESTAR = {

"<5%":   { valor: 0.03,  nivel: "bajo" },

"5-10%": { valor: 0.075, nivel: "medio" },

"10-20%": { valor: 0.15, nivel: "alto" },

">20%":  { valor: 0.25,  nivel: "crítico" }

};


const MEJORA_CHURN_BIENESTAR = {

"<5%":   0.92,  // -8%

"5-10%": 0.85,  // -15%

"10-20%": 0.78, // -22%

">20%":  0.72   // -28%

};


**Fórmula: Reducción de Churn**

const churnActual = CHURN_PORCENTAJE_BIENESTAR(P9).valor;

const mejoraChurn = MEJORA_CHURN_BIENESTAR(P9);

const churnNuevo = churnActual * mejoraChurn;

const alumnosAbandonanActual = alumnosMensuales(P7) * churnActual;

const alumnosAbandonanNuevo = alumnosMensuales(P7) * churnNuevo;

const alumnosRetenidos = alumnosAbandonanActual - alumnosAbandonanNuevo;

const ticketPorAlumno = facturacionMensual(P2) / alumnosMensuales(P7);

const gananciaChurnMensual = alumnosRetenidos * ticketPorAlumno;

const gananciaChurnAnual = gananciaChurnMensual * 12;


## P8 - Aumento de Adquisición

Usa DIGITALIZACIÓN inferida desde P4.


**Constante**

const MEJORA_ADQUISICION_BIENESTAR = {

"muy_digital":   1.15,  // +15%

"digital":       1.22,  // +22%

"poco_digital":  1.30,  // +30%

"nada_digital":  1.38   // +38%

};


**Fórmula: Aumento de Adquisición**

const alumnosNuevosActual = CLIENTES_NUEVOS_BIENESTAR(P8);

const digitalizacion = DIGITALIZACION_DESDE_P4(P4);

const alumnosAdicionalesMes = alumnosNuevosActual * (MEJORA_ADQUISICION[digitalizacion] - 1);

const ticketPorAlumno = facturacionMensual(P2) / alumnosMensuales(P7);

const gananciaAdquisicionMensual = alumnosAdicionalesMes * ticketPorAlumno;

const gananciaAdquisicionAnual = gananciaAdquisicionMensual * 12;


## Aceleración de Renovación


| ELIMINADA: La fórmula original usaba una MATRIZ FRECUENCIA x DIGITALIZACIÓN. Como la pregunta de frecuencia de asistencia no está en la herramienta unificada, esta fórmula completa no se puede calcular. Se conserva la referencia por si se decide agregar la pregunta en el futuro. |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |


**Referencia: Matriz ORIGINAL (requería FRECUENCIA_ASISTENCIA)**

// SOLO COMO REFERENCIA - No se puede usar sin frecuencia de asistencia

const MEJORA_ACELERACION_RENOVACION = {

"semanal":   { "muy_digital": 1.08, "digital": 1.12, "poco_digital": 1.15, "nada_digital": 1.15 },

"quincenal": { "muy_digital": 1.12, "digital": 1.18, "poco_digital": 1.22, "nada_digital": 1.28 },

"mensual":   { "muy_digital": 1.18, "digital": 1.25, "poco_digital": 1.32, "nada_digital": 1.38 },

"semestral": { "muy_digital": 1.35, "digital": 1.40, "poco_digital": 1.45, "nada_digital": 1.45 }

};


## Crecimiento Total - Bienestar

const gananciaTotalMensual =

churn.gananciaNumericaMensual +

adquisicion.gananciaNumericaMensual;


// NOTA: No-Show NO suma a facturación

// NOTA: Aceleración de Renovación ELIMINADA (requería frecuencia)

const facturacionProyectada = facturacionMensual(P2) + gananciaTotalMensual;

const porcentajeCrecimiento = (gananciaTotalMensual / facturacionMensual) * 100;


# RESUMEN: PREGUNTAS vs FÓRMULAS DEL DIAGNÓSTICO


| Pregunta        | Belleza             | Salud                | Fitness             | Bienestar           |
| --------------- | ------------------- | -------------------- | ------------------- | ------------------- |
| P2 Facturación  | Ticket, ganancias   | Ticket, ganancias    | Ticket, ganancias   | Ticket, ganancias   |
| P4 Tiempo resp. | Adquisición (dig.)  | Adquis. + Adherencia | Adquisición (dig.)  | Adquisición (dig.)  |
| P5 No-Show      | Reducción no-show   | Reducción no-show    | Sin fórmula         | Reducción no-show   |
| P7 Clientes     | Ticket, churn, adq. | Ticket, churn, adq.  | Ticket, churn, adq. | Ticket, churn, adq. |
| P8 Nuevos       | Adquisición         | Adquisición          | Adquisición         | Adquisición         |
| P9 Churn        | Retención           | Retención            | Retención (simpl.)  | Retención           |


## Fórmulas eliminadas por falta de FRECUENCIA_ASISTENCIA

1. Belleza - IngresosFrecuencia: dependía de frecuencia de visitas del cliente.

2. Fitness - Churn original: usaba matriz CHURN x ENGAGEMENT. Reemplazada por versión simplificada usando diagonal de la matriz.

3. Fitness - Upsells original: usaba engagementNivel. Reemplazada usando nivel de churn como proxy.

4. Bienestar - Aceleración de Renovación: usaba matriz FRECUENCIA x DIGITALIZACIÓN. Eliminada, no tiene proxy viable.


## Preguntas que NO alimentan fórmulas del diagnóstico

P3 (% ventas perdidas) - Solo calculadora ROI

P6 (Horas de atención) - Solo calculadora ROI

P10 (Desafío principal) - Personaliza resultado, no calcula

P11 (Conversaciones mensuales) - Solo calculadora ROI

P12 (Miembros del equipo) - Solo calculadora ROI
