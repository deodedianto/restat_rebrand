'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult('Testing connection...')
    try {
      const { data, error } = await supabase.from('users').select('count')
      if (error) throw error
      setResult(`✅ Connected! Users table accessible. Result: ${JSON.stringify(data)}`)
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  const testAuth = async () => {
    setLoading(true)
    setResult('Checking auth session...')
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      setResult(session ? `✅ Logged in as: ${session.user.email}` : '❌ Not logged in')
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  const testOrders = async () => {
    setLoading(true)
    setResult('Testing orders table...')
    try {
      const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .limit(5)
      
      if (error) throw error
      setResult(`✅ Orders table accessible. Found ${count} orders. First 5: ${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  const testAnalysisPrices = async () => {
    setLoading(true)
    setResult('Testing analysis_prices table...')
    try {
      const { data, error, count } = await supabase
        .from('analysis_prices')
        .select('*', { count: 'exact' })
        .limit(5)
      
      if (error) throw error
      setResult(`✅ Analysis prices accessible. Found ${count} prices. First 5: ${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  const testAnalysts = async () => {
    setLoading(true)
    setResult('Testing analysts table...')
    try {
      const { data, error, count } = await supabase
        .from('analysts')
        .select('*', { count: 'exact' })
      
      if (error) throw error
      setResult(`✅ Analysts table accessible. Found ${count} analysts. Data: ${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  const testConsultations = async () => {
    setLoading(true)
    setResult('Testing consultations table...')
    try {
      const { data, error, count } = await supabase
        .from('consultations')
        .select('*', { count: 'exact' })
        .limit(5)
      
      if (error) throw error
      setResult(`✅ Consultations accessible. Found ${count} consultations. First 5: ${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  const testReferrals = async () => {
    setLoading(true)
    setResult('Testing referrals table...')
    try {
      const { data, error, count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact' })
        .limit(5)
      
      if (error) throw error
      setResult(`✅ Referrals accessible. Found ${count} referrals. First 5: ${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  const testExpenses = async () => {
    setLoading(true)
    setResult('Testing expenses table...')
    try {
      const { data, error, count } = await supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .limit(5)
      
      if (error) throw error
      setResult(`✅ Expenses accessible. Found ${count} expenses. First 5: ${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  const testReviews = async () => {
    setLoading(true)
    setResult('Testing reviews table...')
    try {
      const { data, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .limit(5)
      
      if (error) throw error
      setResult(`✅ Reviews accessible. Found ${count} reviews. First 5: ${JSON.stringify(data, null, 2)}`)
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Supabase Integration Test</CardTitle>
          <CardDescription>
            Test your Supabase connection and verify all tables are accessible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button onClick={testConnection} disabled={loading} className="w-full">
              Test Connection
            </Button>
            <Button onClick={testAuth} disabled={loading} variant="outline" className="w-full">
              Test Auth
            </Button>
            <Button onClick={testOrders} disabled={loading} variant="outline" className="w-full">
              Test Orders
            </Button>
            <Button onClick={testAnalysisPrices} disabled={loading} variant="outline" className="w-full">
              Test Prices
            </Button>
            <Button onClick={testAnalysts} disabled={loading} variant="outline" className="w-full">
              Test Analysts
            </Button>
            <Button onClick={testConsultations} disabled={loading} variant="outline" className="w-full">
              Test Consults
            </Button>
            <Button onClick={testReferrals} disabled={loading} variant="outline" className="w-full">
              Test Referrals
            </Button>
            <Button onClick={testExpenses} disabled={loading} variant="outline" className="w-full">
              Test Expenses
            </Button>
            <Button onClick={testReviews} disabled={loading} variant="outline" className="w-full">
              Test Reviews
            </Button>
          </div>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.includes('✅') ? 'bg-green-50 border border-green-200' : 
              result.includes('❌') ? 'bg-red-50 border border-red-200' : 
              'bg-blue-50 border border-blue-200'
            }`}>
              <pre className={`whitespace-pre-wrap text-sm font-mono ${
                result.includes('✅') ? 'text-green-800' : 
                result.includes('❌') ? 'text-red-800' : 
                'text-blue-800'
              }`}>
                {result}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-2">⚠️ Important Setup Steps</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
              <li>Create a <code className="bg-amber-100 px-1 rounded">.env.local</code> file with your Supabase credentials</li>
              <li>Run the SQL commands from <code className="bg-amber-100 px-1 rounded">docs/SUPABASE_DATABASE_DESIGN_V3_FINAL.md</code></li>
              <li>Go to <code className="bg-amber-100 px-1 rounded">/admin/seed</code> to populate analysis prices and analysts</li>
              <li>Create a test user account via <code className="bg-amber-100 px-1 rounded">/register</code></li>
              <li>Test all features: auth, orders, consultations, referrals</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
