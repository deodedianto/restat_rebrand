/**
 * Redirect mapping from old blog URLs (blog.restatolahdata.id/{slug})
 * to new URLs (restatolahdata.id/artikel/{category}/{slug})
 * 
 * CRITICAL for SEO: These mappings preserve page-level SEO equity during migration
 */

export const blogRedirects: Record<string, string> = {
  // Interpretasi Uji Statistik (6 posts)
  'cara-membaca-hasil-output-amos': 'interpretasi-uji-statistik/cara-membaca-hasil-output-amos',
  'cara-membaca-hasil-smart-pls': 'interpretasi-uji-statistik/cara-membaca-hasil-smart-pls',
  'cara-membaca-output-spss-regresi-logistik': 'interpretasi-uji-statistik/cara-membaca-output-spss-regresi-logistik',
  'interpretasi-analisis-chi-square': 'interpretasi-uji-statistik/interpretasi-analisis-chi-square',
  'interpretasi-koefisien-korelasi-spss': 'interpretasi-uji-statistik/interpretasi-koefisien-korelasi-spss',
  'interpretasi-uji-anova-satu-arah-di-spss': 'interpretasi-uji-statistik/interpretasi-uji-anova-satu-arah-di-spss',

  // Metode Penelitian (6 posts)
  'cara-menentukan-jumlah-sampel-slovin': 'metode-penelitian/cara-menentukan-jumlah-sampel-slovin',
  'cara-menentukan-uji-statistik': 'metode-penelitian/cara-menentukan-uji-statistik',
  'hipotesis-penelitian-kuantitatif-dan-kualitatif': 'metode-penelitian/hipotesis-penelitian-kuantitatif-dan-kualitatif',
  'jenis-data-penelitian': 'metode-penelitian/jenis-data-penelitian',
  'sumber-data-penelitian-dan-cara-pengolahannya': 'metode-penelitian/sumber-data-penelitian-dan-cara-pengolahannya',
  'teknik-pengumpulan-data-primer': 'metode-penelitian/teknik-pengumpulan-data-primer',

  // Metode Statistik (12 posts)
  'penjelasan-uji-t-test-dan-contoh-kasusnya': 'metode-statistik/penjelasan-uji-t-test-dan-contoh-kasusnya',
  'penjelasan-lengkap-uji-t-satu-sampel': 'metode-statistik/penjelasan-lengkap-uji-t-satu-sampel',
  'penjelasan-lengkap-uji-t-independen': 'metode-statistik/penjelasan-lengkap-uji-t-independen',
  'penjelasan-lengkap-uji-t-berpasangan': 'metode-statistik/penjelasan-lengkap-uji-t-berpasangan',
  'pengertian-uji-anova': 'metode-statistik/pengertian-uji-anova',
  'pahami-perbedaan-mediasi-dan-moderasi': 'metode-statistik/pahami-perbedaan-mediasi-dan-moderasi',
  'kenali-rumus-statistik-yang-sering-digunakan': 'metode-statistik/kenali-rumus-statistik-yang-sering-digunakan',
  'jenis-uji-korelasi-dan-contoh-penerapannya': 'metode-statistik/jenis-uji-korelasi-dan-contoh-penerapannya',
  'analisis-structural-equation-model-sem-dan-contoh-penerapannya': 'metode-statistik/analisis-structural-equation-model-sem-dan-contoh-penerapannya',
  'analisis-regresi-logistik-dan-contoh-penerapannya': 'metode-statistik/analisis-regresi-logistik-dan-contoh-penerapannya',
  'analisis-regresi-linier-berganda-dan-contoh-penerapannya': 'metode-statistik/analisis-regresi-linier-berganda-dan-contoh-penerapannya',
  'analisis-regresi-data-panel-dan-contoh-penerapannya': 'metode-statistik/analisis-regresi-data-panel-dan-contoh-penerapannya',

  // Software Statistik (6 posts)
  'download-amos-gratis': 'software-statistik/download-amos-gratis',
  'download-smart-pls': 'software-statistik/download-smart-pls',
  'download-spss-gratis': 'software-statistik/download-spss-gratis',
  'eviews-download': 'software-statistik/eviews-download',
  'lisrel-download-free': 'software-statistik/lisrel-download-free',
  'menentukan-software-statistik': 'software-statistik/menentukan-software-statistik',

  // Tutorial Analisis Statistik (7 posts)
  'analisis-ahp-menggunakan-super-decision': 'tutorial-analisis-statistik/analisis-ahp-menggunakan-super-decision',
  'cara-mengolah-data-kuesioner-dengan-amos-sem': 'tutorial-analisis-statistik/cara-mengolah-data-kuesioner-dengan-amos-sem',
  'cara-mengolah-data-kuesioner-dengan-smartpls-sem-pls': 'tutorial-analisis-statistik/cara-mengolah-data-kuesioner-dengan-smartpls-sem-pls',
  'cara-uji-one-way-anova-di-spss': 'tutorial-analisis-statistik/cara-uji-one-way-anova-di-spss',
  'cara-uji-regresi-logistik-dengan-spss': 'tutorial-analisis-statistik/cara-uji-regresi-logistik-dengan-spss',
  'pengertian-dan-cara-menghitung-koefisien-dengan-spss': 'tutorial-analisis-statistik/pengertian-dan-cara-menghitung-koefisien-dengan-spss',
  'uji-chi-square-dengan-spss': 'tutorial-analisis-statistik/uji-chi-square-dengan-spss',
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
