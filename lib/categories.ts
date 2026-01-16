import { LucideIcon, BarChart3, BookOpen, Code2, Lightbulb, FlaskConical } from 'lucide-react'

export interface CategoryConfig {
  name: string
  slug: string
  icon: LucideIcon
  color: string
  description: string
}

/**
 * Category configuration with icons, colors, and descriptions
 */
export const categories: Record<string, CategoryConfig> = {
  'interpretasi-uji-statistik': {
    name: 'Interpretasi Hasil',
    slug: 'interpretasi-uji-statistik',
    icon: Lightbulb,
    color: '#472183',
    description: 'Cara interpretasi uji statistik adalah cara memahami hasil dari analisis statistik. Kami membahas cara interpretasi yang mudah dipahami oleh pemula',
  },
  'metode-statistik': {
    name: 'Metode Statistik',
    slug: 'metode-statistik',
    icon: BarChart3,
    color: '#82c3ec',
    description: 'Berikut langkah langkah dalam metode penelitian',
  },
  'metode-penelitian': {
    name: 'Metode Penelitian',
    slug: 'metode-penelitian',
    icon: BookOpen,
    color: '#3795bd',
    description: 'Metode penelitian yang digunakan harus sesuai dengan jenis data yang dikumpulkan dan tujuan penelitian yang ingin dicapai.',
  },
  'software-statistik': {
    name: 'Software Statistik',
    slug: 'software-statistik',
    icon: Code2,
    color: '#0078b0',
    description: 'Disini kami membahas pengenalan software statistik yang sering dipakai oleh pemula seperti, SPSS, EViews, Stata, AMOS, LISREL dan SmartPLS',
  },
  'tutorial-analisis-statistik': {
    name: 'Pengolahan Data',
    slug: 'tutorial-analisis-statistik',
    icon: FlaskConical,
    color: '#4b56d2',
    description: 'Tutorial analisis statistik yang kami buat untuk anda semudah mungkin di pahami untuk pemula. Anda akan mempelajari berbagai pengujian hipotesis.',
  },
}

/**
 * Get category configuration by slug
 */
export function getCategoryConfig(slug: string): CategoryConfig | undefined {
  return categories[slug]
}

/**
 * Get all category configurations
 */
export function getAllCategories(): CategoryConfig[] {
  return Object.values(categories)
}

/**
 * Get category display name (fallback to existing function)
 */
export function getCategoryDisplayName(categorySlug: string): string {
  const config = getCategoryConfig(categorySlug)
  if (config) {
    return config.name
  }
  // Fallback to title case
  return categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
