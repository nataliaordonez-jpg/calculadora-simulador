export enum Sector {
  BELLEZA = 'belleza',
  SALUD = 'salud',
  FITNESS = 'fitness',
  BIENESTAR = 'bienestar',
}

export const SECTOR_LABELS: Record<Sector, string> = {
  [Sector.BELLEZA]: 'Belleza',
  [Sector.BIENESTAR]: 'Bienestar',
  [Sector.FITNESS]: 'Fitness',
  [Sector.SALUD]: 'Salud',
}

export const SECTOR_DESCRIPTIONS: Record<Sector, string> = {
  [Sector.BELLEZA]: 'Peluquería, Estética, Spa, Uñas',
  [Sector.BIENESTAR]: 'Yoga, Pilates, Danza, Artes Marciales',
  [Sector.FITNESS]: 'Gimnasio, Personal Trainer, Crossfit',
  [Sector.SALUD]: 'Clínica, Odontología, Fisioterapia',
}
