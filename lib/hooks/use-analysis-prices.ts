import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface AnalysisMethod {
  id: string
  name: string
  description: string
  minPrice: number
}

export interface PricingPackage {
  id: string
  name: string
  price: number
  priceFormatted: string
  description: string
  features: string[]
}

// Package descriptions and features
const packageConfig = {
  Basic: {
    description: "Untuk kebutuhan analisis sederhana",
    features: ["Olah Data", "Interpretasi Hasil", "Gratis Konsultasi"],
  },
  Standard: {
    description: "Untuk analisis yang lebih lengkap",
    features: ["Olah Data", "Interpretasi Hasil", "Gratis Konsultasi", "Gratis Revisi", "Analisis Deskriptif"],
  },
  Premium: {
    description: "Solusi lengkap sampai lulus",
    features: [
      "Olah Data",
      "Interpretasi Hasil",
      "Gratis Konsultasi",
      "Gratis Revisi",
      "Analisis Deskriptif",
      "Bimbingan Sampai Lulus",
      "Interpretasi Bab 4 & 5",
    ],
  },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export function useAnalysisPrices() {
  const [analysisMethods, setAnalysisMethods] = useState<AnalysisMethod[]>([])
  const [pricingPackages, setPricingPackages] = useState<PricingPackage[]>([])
  const [allPrices, setAllPrices] = useState<any[]>([]) // Store all raw price data
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalysisPrices()

    // Set up real-time subscription for price updates
    const channel = supabase
      .channel('analysis-prices-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'analysis_prices',
      }, () => {
        loadAnalysisPrices()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  async function loadAnalysisPrices() {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all active analysis prices from Supabase
      const { data, error: fetchError } = await supabase
        .from('analysis_prices')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      if (!data || data.length === 0) {
        throw new Error('No analysis prices found')
      }

      // Store all raw price data
      setAllPrices(data)

      // Group by analysis name to get unique analysis methods
      const analysisMap = new Map<string, { name: string; minPrice: number }>()
      
      data.forEach((item) => {
        const existing = analysisMap.get(item.name)
        if (!existing || item.price < existing.minPrice) {
          analysisMap.set(item.name, {
            name: item.name,
            minPrice: item.price,
          })
        }
      })

      // Transform to AnalysisMethod format
      const methods: AnalysisMethod[] = Array.from(analysisMap.entries()).map(([key, value]) => ({
        id: key.toLowerCase().replace(/\s+/g, '-'),
        name: value.name,
        description: `Analisis ${value.name}`,
        minPrice: value.minPrice,
      }))

      setAnalysisMethods(methods)

      // Get unique packages with their prices
      // We'll use the first analysis as a reference for package pricing
      const packageMap = new Map<string, number>()
      
      // Get prices for each package type
      const packages: ('Basic' | 'Standard' | 'Premium')[] = ['Basic', 'Standard', 'Premium']
      packages.forEach((pkgName) => {
        const pkgData = data.find((item) => item.package === pkgName)
        if (pkgData) {
          packageMap.set(pkgName, pkgData.price)
        }
      })

      // Transform to PricingPackage format
      const pricing: PricingPackage[] = packages
        .filter((pkgName) => packageMap.has(pkgName))
        .map((pkgName) => {
          const price = packageMap.get(pkgName)!
          const config = packageConfig[pkgName]
          
          return {
            id: pkgName.toLowerCase(),
            name: pkgName,
            price,
            priceFormatted: formatCurrency(price),
            description: config.description,
            features: config.features,
          }
        })

      setPricingPackages(pricing)

    } catch (err: any) {
      console.error('Error loading analysis prices:', err)
      setError(err.message || 'Failed to load analysis prices')
      
      // Fallback to empty arrays
      setAnalysisMethods([])
      setPricingPackages([])
    } finally {
      setIsLoading(false)
    }
  }

  // Get price for specific analysis and package
  function getPrice(analysisName: string, packageName: string): number | null {
    const priceData = allPrices.find(
      (item) => item.name === analysisName && item.package === packageName
    )
    return priceData?.price || null
  }

  // Get pricing packages for a specific analysis method
  function getPricingPackagesForAnalysis(analysisName: string): PricingPackage[] {
    if (!analysisName) return pricingPackages

    const packages: ('Basic' | 'Standard' | 'Premium')[] = ['Basic', 'Standard', 'Premium']
    
    return packages
      .map((pkgName) => {
        const priceData = allPrices.find(
          (item) => item.name === analysisName && item.package === pkgName
        )
        
        if (!priceData) return null
        
        const config = packageConfig[pkgName]
        
        return {
          id: pkgName.toLowerCase(),
          name: pkgName,
          price: priceData.price,
          priceFormatted: formatCurrency(priceData.price),
          description: config.description,
          features: config.features,
        }
      })
      .filter((pkg): pkg is PricingPackage => pkg !== null)
  }

  return {
    analysisMethods,
    pricingPackages,
    isLoading,
    error,
    reload: loadAnalysisPrices,
    getPrice,
    getPricingPackagesForAnalysis,
  }
}
