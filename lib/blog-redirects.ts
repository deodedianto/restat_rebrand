/**
 * Redirect mapping from old blog URLs (blog.restatolahdata.id/{slug})
 * to new URLs (restatolahdata.id/artikel/{slug})
 * 
 * CRITICAL for SEO: These mappings preserve page-level SEO equity during migration
 * Note: Slugs are IDENTICAL on old and new blogs (identity mappings)
 */

export const blogRedirects: Record<string, string> = {
  // Interpretasi Uji Statistik (6 posts)
  'cara-membaca-hasil-output-amos': 'cara-membaca-hasil-output-amos',
  'cara-baca-hasil-output-smartpls': 'cara-baca-hasil-output-smartpls',
  'cara-baca-output-regresi-logistik-spss': 'cara-baca-output-regresi-logistik-spss',
  'interpretasi-chi-square-spss': 'interpretasi-chi-square-spss',
  'interpretasi-korelasi-pearson-spss': 'interpretasi-korelasi-pearson-spss',
  'interpretasi-one-way-anova-spss': 'interpretasi-one-way-anova-spss',

  // Metode Penelitian (6 posts)
  'cara-menentukan-jumlah-sampel-penelitian-dengan-slovin': 'cara-menentukan-jumlah-sampel-penelitian-dengan-slovin',
  'cara-menentukan-uji-statistik': 'cara-menentukan-uji-statistik',
  'hipotesis-penelitian-kuantitatif-dan-kualitatif': 'hipotesis-penelitian-kuantitatif-dan-kualitatif',
  'pahami-jenis-jenis-data-penelitian': 'pahami-jenis-jenis-data-penelitian',
  'cara-mudah-mendapatkan-data-penelitian': 'cara-mudah-mendapatkan-data-penelitian',
  'cara-pengumpulan-data-primer': 'cara-pengumpulan-data-primer',

  // Metode Statistik (12 posts)
  'penerapan-uji-beda-rata-rata-dengan-t-test': 'penerapan-uji-beda-rata-rata-dengan-t-test',
  'uji-t-satu-sampel': 'uji-t-satu-sampel',
  'uji-t-independen': 'uji-t-independen',
  'uji-t-berpasangan': 'uji-t-berpasangan',
  'penjelasan-lengkap-uji-anova': 'penjelasan-lengkap-uji-anova',
  'perbedaan-mediasi-dan-moderasi': 'perbedaan-mediasi-dan-moderasi',
  'rumus-statistik-deskriptif-yang-sering-digunakan': 'rumus-statistik-deskriptif-yang-sering-digunakan',
  'mengukur-hubungan-variabel-dengan-analisis-korelasi': 'mengukur-hubungan-variabel-dengan-analisis-korelasi',
  'penjelasan-lengkap-analisis-sem': 'penjelasan-lengkap-analisis-sem',
  'penggunaan-regresi-logistik-dan-penerapannya': 'penggunaan-regresi-logistik-dan-penerapannya',
  'penggunaan-regresi-linear-berganda': 'penggunaan-regresi-linear-berganda',
  'penggunanaan-regresi-data-panel': 'penggunanaan-regresi-data-panel',

  // Software Statistik (6 posts)
  '5-software-statistik-mudah-digunakan-untuk-pemula': '5-software-statistik-mudah-digunakan-untuk-pemula',
  'amos-download': 'amos-download',
  'download-eviews': 'download-eviews',
  'download-lisrel': 'download-lisrel',
  'download-smart-pls': 'download-smart-pls',
  'spss-download': 'spss-download',

  // Tutorial Analisis Statistik (7 posts)
  'analisis-ahp': 'analisis-ahp',
  'cara-mengolah-data-kuesioner-skala-likert-dengan-amos': 'cara-mengolah-data-kuesioner-skala-likert-dengan-amos',
  'cara-mengolah-data-kuesioner-smartpls': 'cara-mengolah-data-kuesioner-smartpls',
  'cara-uji-one-way-anova-di-spss': 'cara-uji-one-way-anova-di-spss',
  'analisa-regresi-logistik-dengan-spss': 'analisa-regresi-logistik-dengan-spss',
  'cara-uji-korelasi-pearson-dengan-spss': 'cara-uji-korelasi-pearson-dengan-spss',
  'cara-uji-chi-square-di-spss': 'cara-uji-chi-square-di-spss',
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
