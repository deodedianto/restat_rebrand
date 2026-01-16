/**
 * Redirect mapping from old blog URLs (blog.restatolahdata.id/{slug})
 * to new URLs (restatolahdata.id/artikel/{slug})
 * 
 * CRITICAL for SEO: These mappings preserve page-level SEO equity during migration
 * Note: Slugs remain the same, just domain changes
 */

export const blogRedirects: Record<string, string> = {
  // Interpretasi Uji Statistik (6 posts)
  'cara-membaca-hasil-output-amos': 'cara-membaca-hasil-output-amos',
  'cara-membaca-hasil-smart-pls': 'cara-membaca-hasil-smart-pls',
  'cara-membaca-output-spss-regresi-logistik': 'cara-membaca-output-spss-regresi-logistik',
  'interpretasi-analisis-chi-square': 'interpretasi-analisis-chi-square',
  'interpretasi-koefisien-korelasi-spss': 'interpretasi-koefisien-korelasi-spss',
  'interpretasi-uji-anova-satu-arah-di-spss': 'interpretasi-uji-anova-satu-arah-di-spss',

  // Metode Penelitian (6 posts)
  'cara-menentukan-jumlah-sampel-slovin': 'cara-menentukan-jumlah-sampel-slovin',
  'cara-menentukan-uji-statistik': 'cara-menentukan-uji-statistik',
  'hipotesis-penelitian-kuantitatif-dan-kualitatif': 'hipotesis-penelitian-kuantitatif-dan-kualitatif',
  'jenis-data-penelitian': 'jenis-data-penelitian',
  'sumber-data-penelitian-dan-cara-pengolahannya': 'sumber-data-penelitian-dan-cara-pengolahannya',
  'teknik-pengumpulan-data-primer': 'teknik-pengumpulan-data-primer',

  // Metode Statistik (12 posts)
  'penjelasan-uji-t-test-dan-contoh-kasusnya': 'penjelasan-uji-t-test-dan-contoh-kasusnya',
  'penjelasan-lengkap-uji-t-satu-sampel': 'penjelasan-lengkap-uji-t-satu-sampel',
  'penjelasan-lengkap-uji-t-independen': 'penjelasan-lengkap-uji-t-independen',
  'penjelasan-lengkap-uji-t-berpasangan': 'penjelasan-lengkap-uji-t-berpasangan',
  'pengertian-uji-anova': 'pengertian-uji-anova',
  'pahami-perbedaan-mediasi-dan-moderasi': 'pahami-perbedaan-mediasi-dan-moderasi',
  'kenali-rumus-statistik-yang-sering-digunakan': 'kenali-rumus-statistik-yang-sering-digunakan',
  'jenis-uji-korelasi-dan-contoh-penerapannya': 'jenis-uji-korelasi-dan-contoh-penerapannya',
  'analisis-structural-equation-model-sem-dan-contoh-penerapannya': 'analisis-structural-equation-model-sem-dan-contoh-penerapannya',
  'analisis-regresi-logistik-dan-contoh-penerapannya': 'analisis-regresi-logistik-dan-contoh-penerapannya',
  'analisis-regresi-linier-berganda-dan-contoh-penerapannya': 'analisis-regresi-linier-berganda-dan-contoh-penerapannya',
  'analisis-regresi-data-panel-dan-contoh-penerapannya': 'analisis-regresi-data-panel-dan-contoh-penerapannya',

  // Software Statistik (6 posts)
  'download-amos-gratis': 'download-amos-gratis',
  'download-smart-pls': 'download-smart-pls',
  'download-spss-gratis': 'download-spss-gratis',
  'eviews-download': 'eviews-download',
  'lisrel-download-free': 'lisrel-download-free',
  'menentukan-software-statistik': 'menentukan-software-statistik',

  // Tutorial Analisis Statistik (7 posts)
  'analisis-ahp-menggunakan-super-decision': 'analisis-ahp-menggunakan-super-decision',
  'cara-mengolah-data-kuesioner-dengan-amos-sem': 'cara-mengolah-data-kuesioner-dengan-amos-sem',
  'cara-mengolah-data-kuesioner-dengan-smartpls-sem-pls': 'cara-mengolah-data-kuesioner-dengan-smartpls-sem-pls',
  'cara-uji-one-way-anova-di-spss': 'cara-uji-one-way-anova-di-spss',
  'cara-uji-regresi-logistik-dengan-spss': 'cara-uji-regresi-logistik-dengan-spss',
  'pengertian-dan-cara-menghitung-koefisien-dengan-spss': 'pengertian-dan-cara-menghitung-koefisien-dengan-spss',
  'uji-chi-square-dengan-spss': 'uji-chi-square-dengan-spss',
}

/**
 * Get new URL for an old slug
 */
export function getNewUrl(oldSlug: string): string | null {
  const newPath = blogRedirects[oldSlug]
  return newPath ? `https://restatolahdata.id/artikel/${newPath}` : null
}

/**
 * Get all redirect entries for configuration
 */
export function getAllRedirects(): Array<{ from: string; to: string }> {
  return Object.entries(blogRedirects).map(([oldSlug, newPath]) => ({
    from: `/${oldSlug}`,
    to: `https://restatolahdata.id/artikel/${newPath}`,
  }))
}

/**
 * Validate that all redirects are properly mapped
 * Returns list of any issues found
 */
export function validateRedirects(): string[] {
  const issues: string[] = []
  const redirectCount = Object.keys(blogRedirects).length

  if (redirectCount !== 37) {
    issues.push(`Expected 37 redirects, found ${redirectCount}`)
  }

  // Check for duplicate targets
  const targets = Object.values(blogRedirects)
  const uniqueTargets = new Set(targets)
  if (targets.length !== uniqueTargets.size) {
    issues.push('Duplicate redirect targets found')
  }

  return issues
}
