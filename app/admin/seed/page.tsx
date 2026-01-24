'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { seedAnalysisPrices, seedSampleAnalysts, seedAll } from '@/lib/supabase/seed'

export default function SeedPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSeedAnalysisPrices = async () => {
    setLoading(true)
    setStatus('Seeding analysis prices...')
    try {
      await seedAnalysisPrices()
      setStatus('✅ Success! Analysis prices seeded.')
    } catch (error: any) {
      setStatus('❌ Error: ' + error.message)
    }
    setLoading(false)
  }

  const handleSeedAnalysts = async () => {
    setLoading(true)
    setStatus('Seeding analysts...')
    try {
      await seedSampleAnalysts()
      setStatus('✅ Success! Analysts seeded.')
    } catch (error: any) {
      setStatus('❌ Error: ' + error.message)
    }
    setLoading(false)
  }

  const handleSeedAll = async () => {
    setLoading(true)
    setStatus('Seeding all data...')
    try {
      await seedAll()
      setStatus('✅ Success! All data seeded.')
    } catch (error: any) {
      setStatus('❌ Error: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Populate your Supabase database with initial data. This will create analysis prices and sample analysts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={handleSeedAnalysisPrices} disabled={loading} className="w-full">
              {loading ? 'Seeding...' : 'Seed Analysis Prices (36 items)'}
            </Button>
            <Button onClick={handleSeedAnalysts} disabled={loading} variant="outline" className="w-full">
              {loading ? 'Seeding...' : 'Seed Sample Analysts (3 items)'}
            </Button>
            <Button onClick={handleSeedAll} disabled={loading} variant="default" className="w-full">
              {loading ? 'Seeding...' : 'Seed All Data'}
            </Button>
          </div>
          
          {status && (
            <div className={`mt-4 p-4 rounded-lg ${
              status.includes('✅') ? 'bg-green-50 text-green-800' : 
              status.includes('❌') ? 'bg-red-50 text-red-800' : 
              'bg-blue-50 text-blue-800'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">{status}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
