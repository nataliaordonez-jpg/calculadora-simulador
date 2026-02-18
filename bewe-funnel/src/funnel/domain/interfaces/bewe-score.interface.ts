export interface IBeweScore {
  score: number // 0-100
  level: 'critical' | 'low' | 'medium' | 'high' | 'excellent'
  label: string
  description: string
}
