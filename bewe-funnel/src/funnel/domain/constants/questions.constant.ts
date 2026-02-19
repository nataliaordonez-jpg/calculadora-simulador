import type { IQuestion } from '../interfaces/questionnaire.interface'
import { Sector } from '../enums/sector.enum'

/* ═══════════════════════════════════════════
   BANCO DE PREGUNTAS
   11 preguntas en el questionnaire
   Sector se selecciona en onboarding
   ═══════════════════════════════════════════ */

export const QUESTIONS: IQuestion[] = [
  // ─── P1: Facturación Mensual (antes p2) ───
  {
    id: 'p2',
    number: 2,
    text: '¿Cuál es tu facturación mensual aproximada?',
    helpText: 'Es el ancla de todo tu diagnóstico. Usamos este dato para convertir porcentajes en dinero real, y Linda puede mostrarte exactamente cuánto ingreso adicional puede generar para tu negocio cada mes.',
    impactLevel: 'maximo',
    isDynamic: false,
    category: 'calculator',
    options: [
      { id: 'p2_opt1', label: 'Hasta $2,000', value: 'range_1', numericValue: 1000 },
      { id: 'p2_opt2', label: '$2,001 - $6,000', value: 'range_2', numericValue: 4000 },
      { id: 'p2_opt3', label: '$6,001 - $12,000', value: 'range_3', numericValue: 9000 },
      { id: 'p2_opt4', label: 'Más de $12,001', value: 'range_4', numericValue: 15000 },
    ],
  },
  // ─── P2: Miembros del Equipo (antes p12) ───
  {
    id: 'p12',
    number: 12,
    text: '¿Cuántas personas conforman tu equipo?',
    helpText: 'Con este dato calculamos el pilar de productividad: cuántas horas operativas libera Linda para tu equipo y qué representa eso en ahorro de costos reales cada mes.',
    impactLevel: 'medio',
    isDynamic: false,
    category: 'calculator',
    options: [
      { id: 'p12_opt1', label: 'Solo yo', value: 'range_1', numericValue: 1 },
      { id: 'p12_opt2', label: '2-3 personas', value: 'range_2', numericValue: 2 },
      { id: 'p12_opt3', label: '4-6 personas', value: 'range_3', numericValue: 5 },
      { id: 'p12_opt4', label: '7-10 personas', value: 'range_4', numericValue: 8 },
      { id: 'p12_opt5', label: 'Más de 10 personas', value: 'range_5', numericValue: 15 },
    ],
  },
  // ─── P3: Horas de Atención Diaria (antes p6) ───
  {
    id: 'p6',
    number: 6,
    text: '¿Cuántas horas al día dedicas a atender clientes?',
    helpText: 'Las horas que no cubres son la oportunidad más clara de Linda. Con este dato calculamos cuántas consultas y ventas ocurren en ese tiempo sin atención y que Linda puede capturar de inmediato.',
    impactLevel: 'medio',
    isDynamic: true,
    category: 'calculator',
    options: [
      { id: 'p6_opt1', label: 'Menos de 8 horas', value: 'range_1', numericValue: 8 },
      { id: 'p6_opt2', label: '8-12 horas', value: 'range_2', numericValue: 10 },
      { id: 'p6_opt3', label: '12-16 horas', value: 'range_3', numericValue: 14 },
      { id: 'p6_opt4', label: '24 horas (ya tengo atención completa)', value: 'range_4', numericValue: 24 },
    ],
    dynamicBySector: {
      [Sector.SALUD]: {
        text: '¿Cuántas horas al día dedicas a atender pacientes?',
        options: [
          { id: 'p6_opt1', label: 'Menos de 8 horas', value: 'range_1', numericValue: 8 },
          { id: 'p6_opt2', label: '8-12 horas', value: 'range_2', numericValue: 10 },
          { id: 'p6_opt3', label: '12-16 horas', value: 'range_3', numericValue: 14 },
          { id: 'p6_opt4', label: '24 horas (ya tengo atención completa)', value: 'range_4', numericValue: 24 },
        ],
      },
      [Sector.FITNESS]: {
        text: '¿Cuántas horas al día dedicas a atender miembros?',
        options: [
          { id: 'p6_opt1', label: 'Menos de 8 horas', value: 'range_1', numericValue: 8 },
          { id: 'p6_opt2', label: '8-12 horas', value: 'range_2', numericValue: 10 },
          { id: 'p6_opt3', label: '12-16 horas', value: 'range_3', numericValue: 14 },
          { id: 'p6_opt4', label: '24 horas (ya tengo atención completa)', value: 'range_4', numericValue: 24 },
        ],
      },
      [Sector.BIENESTAR]: {
        text: '¿Cuántas horas al día dedicas a atender alumnos?',
        options: [
          { id: 'p6_opt1', label: 'Menos de 8 horas', value: 'range_1', numericValue: 8 },
          { id: 'p6_opt2', label: '8-12 horas', value: 'range_2', numericValue: 10 },
          { id: 'p6_opt3', label: '12-16 horas', value: 'range_3', numericValue: 14 },
          { id: 'p6_opt4', label: '24 horas (ya tengo atención completa)', value: 'range_4', numericValue: 24 },
        ],
      },
    },
  },
  // ─── P4: Tiempo de Primera Respuesta (antes p4) ───
  {
    id: 'p4',
    number: 4,
    text: '¿Cuánto tardas en responder a un nuevo mensaje o consulta?',
    helpText: 'Tu tiempo de respuesta actual es el punto de partida. Usamos este dato para calcular cuántas ventas adicionales genera Linda al reducir ese tiempo a cero segundos, las 24 horas del día.',
    impactLevel: 'alto',
    isDynamic: false,
    category: 'calculator',
    options: [
      { id: 'p4_opt1', label: 'Menos de 1 minuto', value: 'range_1', numericValue: 0.008 },
      { id: 'p4_opt2', label: '1-5 minutos', value: 'range_2', numericValue: 0.05 },
      { id: 'p4_opt3', label: '5-15 minutos', value: 'range_3', numericValue: 0.17 },
      { id: 'p4_opt4', label: '15-30 minutos', value: 'range_4', numericValue: 0.375 },
      { id: 'p4_opt5', label: 'De 30 minutos a 1 hora', value: 'range_5', numericValue: 0.75 },
      { id: 'p4_opt6', label: 'Más de una hora', value: 'range_6', numericValue: 1.5 },
    ],
  },
  // ─── P5: Conversaciones Mensuales (antes p11) ───
  {
    id: 'p11',
    number: 11,
    text: '¿Cuántas conversaciones o mensajes manejas al mes con clientes?',
    helpText: 'Es el dato clave del pilar de ahorro. Con este número calculamos cuántas horas libera Linda al resolver consultas repetitivas y cuántas ventas adicionales genera al no dejar ningún chat sin respuesta.',
    impactLevel: 'maximo',
    isDynamic: true,
    category: 'calculator',
    options: [
      { id: 'p11_opt1', label: '0 - 100 conversaciones', value: 'range_1', numericValue: 50 },
      { id: 'p11_opt2', label: '100 - 500 conversaciones', value: 'range_2', numericValue: 300 },
      { id: 'p11_opt3', label: '500 - 1,000 conversaciones', value: 'range_3', numericValue: 750 },
      { id: 'p11_opt4', label: '1,000 - 2,500 conversaciones', value: 'range_4', numericValue: 1750 },
      { id: 'p11_opt5', label: 'Más de 2,500 conversaciones', value: 'range_5', numericValue: 3750 },
    ],
    dynamicBySector: {
      [Sector.SALUD]: {
        text: '¿Cuántas conversaciones o mensajes manejas al mes con pacientes?',
        options: [
          { id: 'p11_opt1', label: '0 - 100 conversaciones', value: 'range_1', numericValue: 50 },
          { id: 'p11_opt2', label: '100 - 500 conversaciones', value: 'range_2', numericValue: 300 },
          { id: 'p11_opt3', label: '500 - 1,000 conversaciones', value: 'range_3', numericValue: 750 },
          { id: 'p11_opt4', label: '1,000 - 2,500 conversaciones', value: 'range_4', numericValue: 1750 },
          { id: 'p11_opt5', label: 'Más de 2,500 conversaciones', value: 'range_5', numericValue: 3750 },
        ],
      },
      [Sector.FITNESS]: {
        text: '¿Cuántas conversaciones o mensajes manejas al mes con miembros?',
        options: [
          { id: 'p11_opt1', label: '0 - 100 conversaciones', value: 'range_1', numericValue: 50 },
          { id: 'p11_opt2', label: '100 - 500 conversaciones', value: 'range_2', numericValue: 300 },
          { id: 'p11_opt3', label: '500 - 1,000 conversaciones', value: 'range_3', numericValue: 750 },
          { id: 'p11_opt4', label: '1,000 - 2,500 conversaciones', value: 'range_4', numericValue: 1750 },
          { id: 'p11_opt5', label: 'Más de 2,500 conversaciones', value: 'range_5', numericValue: 3750 },
        ],
      },
      [Sector.BIENESTAR]: {
        text: '¿Cuántas conversaciones o mensajes manejas al mes con alumnos?',
        options: [
          { id: 'p11_opt1', label: '0 - 100 conversaciones', value: 'range_1', numericValue: 50 },
          { id: 'p11_opt2', label: '100 - 500 conversaciones', value: 'range_2', numericValue: 300 },
          { id: 'p11_opt3', label: '500 - 1,000 conversaciones', value: 'range_3', numericValue: 750 },
          { id: 'p11_opt4', label: '1,000 - 2,500 conversaciones', value: 'range_4', numericValue: 1750 },
          { id: 'p11_opt5', label: 'Más de 2,500 conversaciones', value: 'range_5', numericValue: 3750 },
        ],
      },
    },
  },
  // ─── P6: % Ventas/Oportunidades Perdidas (antes p3) ───
  {
    id: 'p3',
    number: 3,
    text: '¿Qué porcentaje de ventas u oportunidades crees que pierdes por no responder a tiempo?',
    helpText: 'Este dato alimenta directamente el cálculo de ingresos por recuperación. Representa las ventas que Linda puede capturar respondiendo en segundos los chats que hoy quedan sin atender.',
    impactLevel: 'muy_alto',
    isDynamic: false,
    category: 'calculator',
    options: [
      { id: 'p3_opt1', label: '1-5%', value: 'range_1', numericValue: 0.03 },
      { id: 'p3_opt2', label: '5-15%', value: 'range_2', numericValue: 0.10 },
      { id: 'p3_opt3', label: '15-25%', value: 'range_3', numericValue: 0.20 },
      { id: 'p3_opt4', label: '25-40%', value: 'range_4', numericValue: 0.32 },
      { id: 'p3_opt5', label: 'Más del 40%', value: 'range_5', numericValue: 0.60 },
    ],
  },
  // ─── P7: No-Show / Cancelaciones (antes p5) ───
  {
    id: 'p5',
    number: 5,
    text: '¿Qué tan común es que un cliente no se presente a su cita?',
    helpText: 'Con este dato calculamos el ingreso que recuperas cuando Linda envía recordatorios automáticos en el momento exacto. Cada punto porcentual menos de no-show se traduce en dinero directo.',
    impactLevel: 'alto',
    isDynamic: true,
    category: 'diagnostic',
    options: [
      { id: 'p5_opt1', label: 'Muy raro (menos del 5%)', value: 'range_1', numericValue: 0.02 },
      { id: 'p5_opt2', label: 'Ocasional (5-15%)', value: 'range_2', numericValue: 0.10 },
      { id: 'p5_opt3', label: 'Frecuente (15-30%)', value: 'range_3', numericValue: 0.20 },
      { id: 'p5_opt4', label: 'Muy frecuente (más del 30%)', value: 'range_4', numericValue: 0.37 },
      { id: 'p5_opt5', label: 'No manejo citas', value: 'none', numericValue: 0 },
    ],
    dynamicBySector: {
      [Sector.SALUD]: {
        text: '¿Qué tan común es que un paciente no se presente a su cita?',
        options: [
          { id: 'p5_opt1', label: 'Muy raro (menos del 5%)', value: 'range_1', numericValue: 0.02 },
          { id: 'p5_opt2', label: 'Ocasional (5-15%)', value: 'range_2', numericValue: 0.10 },
          { id: 'p5_opt3', label: 'Frecuente (15-30%)', value: 'range_3', numericValue: 0.20 },
          { id: 'p5_opt4', label: 'Muy frecuente (más del 30%)', value: 'range_4', numericValue: 0.37 },
          { id: 'p5_opt5', label: 'No manejo citas', value: 'none', numericValue: 0 },
        ],
      },
      [Sector.FITNESS]: {
        text: '¿Qué tan común es que un miembro no se presente a su clase?',
        options: [
          { id: 'p5_opt1', label: 'Muy raro (menos del 5%)', value: 'range_1', numericValue: 0.02 },
          { id: 'p5_opt2', label: 'Ocasional (5-15%)', value: 'range_2', numericValue: 0.10 },
          { id: 'p5_opt3', label: 'Frecuente (15-30%)', value: 'range_3', numericValue: 0.20 },
          { id: 'p5_opt4', label: 'Muy frecuente (más del 30%)', value: 'range_4', numericValue: 0.37 },
          { id: 'p5_opt5', label: 'No manejo clases', value: 'none', numericValue: 0 },
        ],
      },
      [Sector.BIENESTAR]: {
        text: '¿Qué tan común es que un alumno no se presente a su clase reservada?',
        options: [
          { id: 'p5_opt1', label: 'Muy raro (menos del 5%)', value: 'range_1', numericValue: 0.02 },
          { id: 'p5_opt2', label: 'Ocasional (5-15%)', value: 'range_2', numericValue: 0.10 },
          { id: 'p5_opt3', label: 'Frecuente (15-30%)', value: 'range_3', numericValue: 0.20 },
          { id: 'p5_opt4', label: 'Muy frecuente (más del 30%)', value: 'range_4', numericValue: 0.37 },
          { id: 'p5_opt5', label: 'No manejo clases', value: 'none', numericValue: 0 },
        ],
      },
    },
  },
  // ─── P8: Churn (antes p9) ───
  {
    id: 'p9',
    number: 9,
    text: 'De cada 10 clientes que atiendes, ¿cuántos NO vuelven?',
    helpText: 'Este es el costo oculto de no dar seguimiento. Con este dato calculamos cuánto ingreso recupera Linda al automatizar el contacto con clientes que están a punto de irse.',
    impactLevel: 'muy_alto',
    isDynamic: true,
    category: 'diagnostic',
    options: [
      { id: 'p9_opt1', label: '1-2 clientes', value: 'range_1', numericValue: 0.15 },
      { id: 'p9_opt2', label: '3-4 clientes', value: 'range_2', numericValue: 0.35 },
      { id: 'p9_opt3', label: '5-6 clientes', value: 'range_3', numericValue: 0.55 },
      { id: 'p9_opt4', label: '7 o más clientes', value: 'range_4', numericValue: 0.75 },
    ],
    dynamicBySector: {
      [Sector.SALUD]: {
        text: '¿Qué porcentaje de pacientes no vuelve después de su última atención?',
        options: [
          { id: 'p9_opt1', label: 'Menos del 5%', value: 'range_1', numericValue: 0.03 },
          { id: 'p9_opt2', label: 'Entre 5% y 10%', value: 'range_2', numericValue: 0.075 },
          { id: 'p9_opt3', label: 'Entre 10% y 20%', value: 'range_3', numericValue: 0.15 },
          { id: 'p9_opt4', label: 'Más del 20%', value: 'range_4', numericValue: 0.25 },
        ],
      },
      [Sector.FITNESS]: {
        text: '¿Qué porcentaje de miembros cancela su membresía al mes?',
        options: [
          { id: 'p9_opt1', label: 'Menos del 5%', value: 'range_1', numericValue: 0.03 },
          { id: 'p9_opt2', label: 'Entre 5% y 10%', value: 'range_2', numericValue: 0.075 },
          { id: 'p9_opt3', label: 'Entre 10% y 20%', value: 'range_3', numericValue: 0.15 },
          { id: 'p9_opt4', label: 'Más del 20%', value: 'range_4', numericValue: 0.25 },
        ],
      },
      [Sector.BIENESTAR]: {
        text: '¿Qué porcentaje de alumnos deja de asistir o cancela al mes?',
        options: [
          { id: 'p9_opt1', label: 'Menos del 5%', value: 'range_1', numericValue: 0.03 },
          { id: 'p9_opt2', label: 'Entre 5% y 10%', value: 'range_2', numericValue: 0.075 },
          { id: 'p9_opt3', label: 'Entre 10% y 20%', value: 'range_3', numericValue: 0.15 },
          { id: 'p9_opt4', label: 'Más del 20%', value: 'range_4', numericValue: 0.25 },
        ],
      },
    },
  },
  // ─── P9: Clientes Activos Mensuales (antes p7) ───
  {
    id: 'p7',
    number: 7,
    text: '¿Cuántos clientes atiendes mensualmente?',
    helpText: 'Este número es el multiplicador de todo. Con él proyectamos el impacto real que Linda genera sobre toda tu base de clientes activa. Aunque un cliente vaya más de una vez, cuenta solo como uno.',
    impactLevel: 'maximo',
    isDynamic: true,
    category: 'diagnostic',
    options: [
      { id: 'p7_opt1', label: 'Menos de 50', value: 'range_1', numericValue: 25 },
      { id: 'p7_opt2', label: '51 a 150', value: 'range_2', numericValue: 100 },
      { id: 'p7_opt3', label: '151 a 350', value: 'range_3', numericValue: 250 },
      { id: 'p7_opt4', label: 'Más de 350', value: 'range_4', numericValue: 450 },
    ],
    dynamicBySector: {
      [Sector.SALUD]: {
        text: '¿Cuántos pacientes atienden mensualmente?',
        options: [
          { id: 'p7_opt1', label: 'Menos de 30', value: 'range_1', numericValue: 15 },
          { id: 'p7_opt2', label: '31 a 80', value: 'range_2', numericValue: 55 },
          { id: 'p7_opt3', label: '81 a 200', value: 'range_3', numericValue: 150 },
          { id: 'p7_opt4', label: 'Más de 200', value: 'range_4', numericValue: 300 },
        ],
      },
      [Sector.FITNESS]: {
        text: '¿Cuántos miembros activos tienen mensualmente?',
        options: [
          { id: 'p7_opt1', label: 'Menos de 40', value: 'range_1', numericValue: 20 },
          { id: 'p7_opt2', label: '41 a 120', value: 'range_2', numericValue: 80 },
          { id: 'p7_opt3', label: '121 a 300', value: 'range_3', numericValue: 210 },
          { id: 'p7_opt4', label: 'Más de 300', value: 'range_4', numericValue: 450 },
        ],
      },
      [Sector.BIENESTAR]: {
        text: '¿Cuántos alumnos tienes mensualmente?',
        options: [
          { id: 'p7_opt1', label: 'Menos de 30', value: 'range_1', numericValue: 15 },
          { id: 'p7_opt2', label: '31 a 70', value: 'range_2', numericValue: 45 },
          { id: 'p7_opt3', label: '71 a 150', value: 'range_3', numericValue: 100 },
          { id: 'p7_opt4', label: 'Más de 150', value: 'range_4', numericValue: 200 },
        ],
      },
    },
  },
  // ─── P10: Clientes Nuevos (antes p8) ───
  {
    id: 'p8',
    number: 8,
    text: '¿Cuántos de esos clientes son nuevos, es decir, nunca antes habían visitado tu negocio?',
    helpText: 'Mide tu ritmo de adquisición actual. Usamos este dato para proyectar cuántos clientes nuevos adicionales puede capturar Linda al responder instantáneamente a cada prospecto.',
    impactLevel: 'alto',
    isDynamic: true,
    category: 'diagnostic',
    options: [
      { id: 'p8_opt1', label: '1 a 10', value: 'range_1', numericValue: 5 },
      { id: 'p8_opt2', label: '11 a 30', value: 'range_2', numericValue: 20 },
      { id: 'p8_opt3', label: '31 a 60', value: 'range_3', numericValue: 45 },
      { id: 'p8_opt4', label: 'Más de 60', value: 'range_4', numericValue: 80 },
    ],
    dynamicBySector: {
      [Sector.SALUD]: {
        text: '¿Aproximadamente cuántos pacientes nuevos recibes al mes?',
        options: [
          { id: 'p8_opt1', label: '1 a 8', value: 'range_1', numericValue: 4 },
          { id: 'p8_opt2', label: '9 a 20', value: 'range_2', numericValue: 15 },
          { id: 'p8_opt3', label: '21 a 45', value: 'range_3', numericValue: 30 },
          { id: 'p8_opt4', label: 'Más de 45', value: 'range_4', numericValue: 60 },
        ],
      },
      [Sector.FITNESS]: {
        text: '¿Aproximadamente cuántas membresías nuevas tienes al mes?',
        options: [
          { id: 'p8_opt1', label: 'Menos de 10', value: 'range_1', numericValue: 5 },
          { id: 'p8_opt2', label: '11 a 25', value: 'range_2', numericValue: 18 },
          { id: 'p8_opt3', label: '26 a 50', value: 'range_3', numericValue: 38 },
          { id: 'p8_opt4', label: 'Más de 50', value: 'range_4', numericValue: 75 },
        ],
      },
      [Sector.BIENESTAR]: {
        text: '¿Cuántos alumnos nuevos activas mensualmente?',
        options: [
          { id: 'p8_opt1', label: '1 a 10', value: 'range_1', numericValue: 5 },
          { id: 'p8_opt2', label: '11 a 20', value: 'range_2', numericValue: 15 },
          { id: 'p8_opt3', label: '21 a 40', value: 'range_3', numericValue: 30 },
          { id: 'p8_opt4', label: 'Más de 40', value: 'range_4', numericValue: 60 },
        ],
      },
    },
  },
  // ─── P11: Desafío Principal (SIEMPRE última pregunta) ───
  {
    id: 'p10',
    number: 10,
    text: '¿Cuál es tu mayor desafío actualmente?',
    helpText: 'Tu respuesta define el enfoque del diagnóstico. Linda se configura priorizando las automatizaciones que más impacto tienen en el problema que más te afecta hoy.',
    impactLevel: 'config',
    isDynamic: false,
    category: 'diagnostic',
    options: [
      { id: 'p10_opt1', label: 'Atraer más clientes', value: 'acquisition', numericValue: 0 },
      { id: 'p10_opt2', label: 'Retener los que ya tengo', value: 'retention', numericValue: 0 },
      { id: 'p10_opt3', label: 'Automatizar tareas repetitivas', value: 'automation', numericValue: 0 },
      { id: 'p10_opt4', label: 'Mejorar la experiencia del cliente', value: 'experience', numericValue: 0 },
      { id: 'p10_opt5', label: 'Crecer sin aumentar costos', value: 'scaling', numericValue: 0 },
    ],
  },
]
