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
        // Get the code from the URL
        const { searchParams } = new URL(window.location.href)
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (errorParam) {
          setError(errorDescription || 'Authentication failed')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        if (!code) {
          setError('No authentication code found')
          setTimeout(() => router.push('/login'), 3000)
          return
        }

        // Exchange the code for a session
        const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError) {
          console.error('Session exchange error:', sessionError)
          throw sessionError
        }

        if (session) {
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          // If no profile exists, create one
          if (!profile && !profileError) {
            const { error: insertError } = await supabase.from('users').insert({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email!,
              whatsapp: session.user.user_metadata?.phone || '',
              phone: session.user.user_metadata?.phone || '',
              role: 'user',
            } as any)

            if (insertError) {
              console.error('Profile creation error:', insertError)
            }
          }

          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          setError('Failed to create session')
          setTimeout(() => router.push('/login'), 3000)
        }
      } catch (err: any) {
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
