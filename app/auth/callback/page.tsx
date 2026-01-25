'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback: Starting...')

        // Check for errors in URL
        const { searchParams } = new URL(window.location.href)
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription)
          setError(errorDescription || 'Authentication failed')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        // Wait for the auth listener to process the OAuth
        // The listener in auth-context.tsx will handle profile creation
        console.log('Waiting for auth listener to process OAuth...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Check if session was established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          console.error('No session after OAuth:', sessionError)
          setError('Failed to establish session')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        console.log('Session established, redirecting...')
        router.push('/dashboard')
      } catch (err: any) {
        // Ignore AbortError as it's expected during navigation
        if (err?.name === 'AbortError') {
          console.log('Request aborted (expected during navigation)')
          return
        }
        
        console.error('Callback error:', err)
        setError(err.message || 'An error occurred during authentication')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {error ? (
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        ) : (
          <div>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing you in...</h2>
            <p className="text-gray-600">Please wait while we complete your authentication.</p>
          </div>
        )}
      </div>
    </div>
  )
}
