'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugDataPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [consultations, setConsultations] = useState<any[]>([])
  const [localStorageData, setLocalStorageData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (user) {
      loadData()
      checkLocalStorage()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    // Check orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)

    console.log('Orders:', ordersData, 'Error:', ordersError)
    setOrders(ordersData || [])

    // Check consultations
    const { data: consultationsData, error: consultationsError } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', user.id)

    console.log('Consultations:', consultationsData, 'Error:', consultationsError)
    setConsultations(consultationsData || [])
  }

  const checkLocalStorage = () => {
    const keys = Object.keys(localStorage)
    const data: Record<string, any> = {}
    
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          data[key] = JSON.parse(value)
        }
      } catch {
        data[key] = localStorage.getItem(key)
      }
    })
    
    setLocalStorageData(data)
  }

  const clearLocalStorage = () => {
    if (confirm('Are you sure you want to clear ALL localStorage? This will log you out.')) {
      localStorage.clear()
      window.location.href = '/login'
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Data</h1>
        <p>Please log in to view debug data.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🔍 Debug Data</h1>
        <p className="text-muted-foreground">
          Current User ID: <code className="bg-muted px-2 py-1 rounded">{user.id}</code>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📦 Orders from Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Total: <strong>{orders.length}</strong></p>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders found in Supabase</p>
          ) : (
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(orders, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📅 Consultations from Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Total: <strong>{consultations.length}</strong></p>
          {consultations.length === 0 ? (
            <p className="text-muted-foreground">No consultations found in Supabase</p>
          ) : (
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(consultations, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💾 localStorage Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Total keys: <strong>{Object.keys(localStorageData).length}</strong>
          </p>
          <div className="mb-4">
            <Button onClick={clearLocalStorage} variant="destructive">
              Clear All localStorage
            </Button>
          </div>
          {Object.keys(localStorageData).length === 0 ? (
            <p className="text-muted-foreground">No localStorage data</p>
          ) : (
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔄 Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button onClick={loadData}>Reload Data</Button>
          <Button onClick={checkLocalStorage} variant="outline">
            Refresh localStorage Check
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
