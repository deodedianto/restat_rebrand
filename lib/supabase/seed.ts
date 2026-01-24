import { supabase } from './client'

const analysisMethods = [
  { name: "Regresi Linear", description: "Analisis hubungan linear antar variabel" },
  { name: "Regresi Logistik", description: "Analisis untuk variabel dependen kategorikal" },
  { name: "Uji T", description: "Perbandingan rata-rata dua kelompok" },
  { name: "ANOVA", description: "Perbandingan rata-rata lebih dari dua kelompok" },
  { name: "Korelasi", description: "Analisis hubungan antar variabel" },
  { name: "Chi-Square", description: "Uji independensi data kategorikal" },
  { name: "SEM", description: "Structural Equation Modeling" },
  { name: "Path Analysis", description: "Analisis jalur hubungan kausal" },
  { name: "Factor Analysis", description: "Reduksi dimensi dan identifikasi faktor" },
  { name: "Cluster Analysis", description: "Pengelompokan data berdasarkan kesamaan" },
  { name: "Time Series", description: "Analisis data berdasarkan waktu" },
  { name: "Statistik Deskriptif", description: "Ringkasan dan visualisasi data" },
]

const packages = [
  { name: 'Basic', price: 250000 },
  { name: 'Standard', price: 500000 },
  { name: 'Premium', price: 700000 },
]

export async function seedAnalysisPrices() {
  const prices = []
  
  // Create all combinations of analysis methods and packages
  for (const method of analysisMethods) {
    for (const pkg of packages) {
      prices.push({
        name: method.name,
        package: pkg.name,
        price: pkg.price,
        description: method.description,
        is_active: true,
      })
    }
  }

  console.log(`Seeding ${prices.length} analysis prices...`)

  const { data, error } = await supabase
    .from('analysis_prices')
    .upsert(prices, {
      onConflict: 'name,package',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error('Seed error:', error)
    throw error
  }

  console.log('Successfully seeded analysis prices:', data)
  return data
}

export async function seedSampleAnalysts() {
  const analysts = [
    {
      name: 'Dr. Ahmad',
      whatsapp: '+628123456789',
      bank_name: 'BCA',
      bank_account_number: '1234567890',
      is_active: true,
    },
    {
      name: 'Dr. Siti',
      whatsapp: '+628987654321',
      bank_name: 'Mandiri',
      bank_account_number: '0987654321',
      is_active: true,
    },
    {
      name: 'Hamka',
      whatsapp: '+628111222333',
      bank_name: 'BNI',
      bank_account_number: '1112223334',
      is_active: true,
    },
  ]

  console.log(`Seeding ${analysts.length} sample analysts...`)

  const { data, error } = await supabase
    .from('analysts')
    .upsert(analysts, {
      onConflict: 'whatsapp',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error('Seed analysts error:', error)
    throw error
  }

  console.log('Successfully seeded analysts:', data)
  return data
}

export async function seedAll() {
  try {
    await seedAnalysisPrices()
    await seedSampleAnalysts()
    console.log('✅ All seed data inserted successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}
