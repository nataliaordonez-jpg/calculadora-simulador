import { Sector } from '../enums/sector.enum'

/* ═══════════════════════════════════════════
   CONSTANTES DEL DIAGNÓSTICO DE CRECIMIENTO
   Fuente: formulas calculadora y simulador.md
   ═══════════════════════════════════════════ */

export type DigitalizationLevel = 'muy_digital' | 'digital' | 'poco_digital' | 'nada_digital'
export type ChurnLevel = 'bajo' | 'medio' | 'alto' | 'critico'
export type NoShowLevel = 'muy_raro' | 'ocasional' | 'frecuente' | 'muy_frecuente'

/* ─── Inferencia de digitalización desde P4 ─── */
export const DIGITALIZACION_DESDE_P4: Record<string, DigitalizationLevel> = {
  'p4_opt1': 'muy_digital',    // Menos de 1 minuto
  'p4_opt2': 'digital',        // 1-5 minutos
  'p4_opt3': 'poco_digital',   // 5-15 minutos
  'p4_opt4': 'poco_digital',   // 15-30 minutos
  'p4_opt5': 'nada_digital',   // 30 min - 1 hora
  'p4_opt6': 'nada_digital',   // Más de 1 hora
}

/* ─── Clientes Mensuales por Sector (P7) ─── */
export const CLIENTES_MENSUALES: Record<Sector, Record<string, number>> = {
  [Sector.BELLEZA]: {
    'p7_opt1': 25,   // Menos de 50
    'p7_opt2': 100,  // 51 a 150
    'p7_opt3': 250,  // 151 a 350
    'p7_opt4': 450,  // Más de 350
  },
  [Sector.SALUD]: {
    'p7_opt1': 15,   // Menos de 30
    'p7_opt2': 55,   // 31 a 80
    'p7_opt3': 150,  // 81 a 200
    'p7_opt4': 300,  // Más de 200
  },
  [Sector.FITNESS]: {
    'p7_opt1': 20,   // Menos de 40
    'p7_opt2': 80,   // 41 a 120
    'p7_opt3': 210,  // 121 a 300
    'p7_opt4': 450,  // Más de 300
  },
  [Sector.BIENESTAR]: {
    'p7_opt1': 15,   // Menos de 30
    'p7_opt2': 45,   // 31 a 70
    'p7_opt3': 100,  // 71 a 150
    'p7_opt4': 200,  // Más de 150
  },
}

/* ─── Clientes Nuevos por Sector (P8) ─── */
export const CLIENTES_NUEVOS: Record<Sector, Record<string, number>> = {
  [Sector.BELLEZA]: {
    'p8_opt1': 5,    // 1 a 10
    'p8_opt2': 20,   // 11 a 30
    'p8_opt3': 45,   // 31 a 60
    'p8_opt4': 80,   // Más de 60
  },
  [Sector.SALUD]: {
    'p8_opt1': 4,    // 1 a 8
    'p8_opt2': 15,   // 9 a 20
    'p8_opt3': 30,   // 21 a 45
    'p8_opt4': 60,   // Más de 45
  },
  [Sector.FITNESS]: {
    'p8_opt1': 5,    // Menos de 10
    'p8_opt2': 18,   // 11 a 25
    'p8_opt3': 38,   // 26 a 50
    'p8_opt4': 75,   // Más de 50
  },
  [Sector.BIENESTAR]: {
    'p8_opt1': 5,    // 1 a 10
    'p8_opt2': 15,   // 11 a 20
    'p8_opt3': 30,   // 21 a 40
    'p8_opt4': 60,   // Más de 40
  },
}

/* ─── No-Show Belleza ─── */
export const NO_SHOW_ACTUAL_BELLEZA: Record<string, number> = {
  'p5_opt1': 0.97, 'p5_opt2': 0.90, 'p5_opt3': 0.78, 'p5_opt4': 0.60,
}
export const MEJORA_NO_SHOW_BELLEZA: Record<string, number> = {
  'p5_opt1': 0.25, 'p5_opt2': 0.30, 'p5_opt3': 0.35, 'p5_opt4': 0.40,
}

/* ─── No-Show Salud ─── */
export const NO_SHOW_PORCENTAJE_SALUD: Record<string, number> = {
  'p5_opt1': 0.03, 'p5_opt2': 0.10, 'p5_opt3': 0.22, 'p5_opt4': 0.40,
}
export const MEJORA_NO_SHOW_SALUD: Record<string, number> = {
  'p5_opt1': 0.80, 'p5_opt2': 0.70, 'p5_opt3': 0.62, 'p5_opt4': 0.55,
}

/* ─── No-Show Bienestar ─── */
export const NO_SHOW_PORCENTAJE_BIENESTAR: Record<string, number> = {
  'p5_opt1': 0.03, 'p5_opt2': 0.10, 'p5_opt3': 0.22, 'p5_opt4': 0.40,
}
export const MEJORA_NO_SHOW_BIENESTAR: Record<string, number> = {
  'p5_opt1': 0.80, 'p5_opt2': 0.72, 'p5_opt3': 0.67, 'p5_opt4': 0.62,
}

/* ─── Churn Belleza ─── */
export const CHURN_ACTUAL_BELLEZA: Record<string, number> = {
  'p9_opt1': 0.85, 'p9_opt2': 0.65, 'p9_opt3': 0.45, 'p9_opt4': 0.25,
}
export const CHURN_MEJORA_BELLEZA: Record<string, number> = {
  'p9_opt1': 0.95, 'p9_opt2': 0.90, 'p9_opt3': 0.85, 'p9_opt4': 0.80,
}

/* ─── Churn Salud ─── */
export const CHURN_PORCENTAJE_SALUD: Record<string, number> = {
  'p9_opt1': 0.03, 'p9_opt2': 0.075, 'p9_opt3': 0.15, 'p9_opt4': 0.25,
}
export const MEJORA_CHURN_SALUD: Record<string, number> = {
  'p9_opt1': 0.92, 'p9_opt2': 0.85, 'p9_opt3': 0.78, 'p9_opt4': 0.70,
}

/* ─── Churn Fitness ─── */
export const CHURN_PORCENTAJE_FITNESS: Record<string, { valor: number; nivel: ChurnLevel }> = {
  'p9_opt1': { valor: 0.03, nivel: 'bajo' },
  'p9_opt2': { valor: 0.075, nivel: 'medio' },
  'p9_opt3': { valor: 0.15, nivel: 'alto' },
  'p9_opt4': { valor: 0.25, nivel: 'critico' },
}
export const MEJORA_CHURN_FITNESS: Record<ChurnLevel, number> = {
  bajo: 0.90, medio: 0.85, alto: 0.75, critico: 0.70,
}

/* ─── Churn Bienestar ─── */
export const CHURN_PORCENTAJE_BIENESTAR: Record<string, { valor: number; nivel: ChurnLevel }> = {
  'p9_opt1': { valor: 0.03, nivel: 'bajo' },
  'p9_opt2': { valor: 0.075, nivel: 'medio' },
  'p9_opt3': { valor: 0.15, nivel: 'alto' },
  'p9_opt4': { valor: 0.25, nivel: 'critico' },
}
export const MEJORA_CHURN_BIENESTAR: Record<string, number> = {
  'p9_opt1': 0.92, 'p9_opt2': 0.85, 'p9_opt3': 0.78, 'p9_opt4': 0.72,
}

/* ─── Adquisición por Sector ─── */
export const MEJORA_ADQUISICION: Record<Sector, Record<DigitalizationLevel, number>> = {
  [Sector.BELLEZA]:   { muy_digital: 1.15, digital: 1.25, poco_digital: 1.35, nada_digital: 1.50 },
  [Sector.SALUD]:     { muy_digital: 1.15, digital: 1.22, poco_digital: 1.30, nada_digital: 1.40 },
  [Sector.FITNESS]:   { muy_digital: 1.12, digital: 1.20, poco_digital: 1.30, nada_digital: 1.40 },
  [Sector.BIENESTAR]: { muy_digital: 1.15, digital: 1.22, poco_digital: 1.30, nada_digital: 1.38 },
}

/* ─── Adherencia Salud ─── */
export const SESIONES_PROMEDIO_SALUD: Record<string, number> = {
  'p9_opt1': 3.5, 'p9_opt2': 3.0, 'p9_opt3': 2.5, 'p9_opt4': 2.0,
}
export const MEJORA_ADHERENCIA_SALUD: Record<DigitalizationLevel, number> = {
  muy_digital: 1.10, digital: 1.18, poco_digital: 1.28, nada_digital: 1.40,
}

/* ─── Upsells Fitness ─── */
export const MEJORA_UPSELLS_FITNESS: Record<ChurnLevel, number> = {
  bajo: 1.25, medio: 1.15, alto: 1.08, critico: 1.05,
}
export const PORCENTAJE_UPSELLS_BASE = 0.15
