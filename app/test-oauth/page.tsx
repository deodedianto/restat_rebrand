'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { signInWithGoogle } from '@/lib/supabase/auth-helpers'

export default function TestOAuthPage() {
  const [log, setLog] = useState<string[]>([])

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const handleGoogleSignIn = async () => {
    try {
      addLog('Starting Google sign-in...')
      addLog(`Origin: ${window.location.origin}`)
      addLog(`Redirect URL: ${window.location.origin}/auth/callback`)
      
      const result = await signInWithGoogle()
      
      addLog('Sign-in initiated successfully!')
      addLog(`Result: ${JSON.stringify(result, null, 2)}`)
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`)
      addLog(`Full error: ${JSON.stringify(error, null, 2)}`)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">OAuth Test Page</h1>
        
        <Button onClick={handleGoogleSignIn} className="mb-6">
          Test Google Sign-In
        </Button>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Logs:</h2>
          <div className="space-y-1 font-mono text-sm">
            {log.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click the button to test.</p>
            ) : (
              log.map((entry, index) => (
                <div key={index} className="text-gray-700">{entry}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
