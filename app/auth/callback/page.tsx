'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * OAuth Callback Page (Fallback Only)
 * 
 * This page is kept as a fallback for error handling.
 * Normal OAuth flow redirects directly to /dashboard.
 * 
 * The auth listener in auth-context.tsx automatically:
 * - Detects the OAuth session
 * - Loads/creates the user profile
 * - Updates the user state
 */
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Check for OAuth errors in URL
    const { searchParams } = new URL(window.location.href)
    const errorParam = searchParams.get('error')
    
    if (errorParam) {
      const errorDescription = searchParams.get('error_description')
      console.error('OAuth error:', errorParam, errorDescription)
      alert(`Authentication failed: ${errorDescription || errorParam}`)
      router.push('/login')
      return
    }

    // If no error, redirect to dashboard
    // (This shouldn't normally happen as OAuth redirects directly to dashboard)
    console.log('Callback fallback: Redirecting to dashboard...')
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-600">Please wait a moment.</p>
      </div>
    </div>
  )
}
