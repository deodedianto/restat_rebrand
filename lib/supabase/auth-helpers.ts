import { supabase } from './client'

/**
 * Sign in with Google OAuth
 * Redirects user to Google sign-in page
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Google sign-in error:', error)
    throw error
  }

  return data
}

/**
 * Sign in with other OAuth providers (future expansion)
 */
export async function signInWithProvider(provider: 'google' | 'github' | 'facebook') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error(`${provider} sign-in error:`, error)
    throw error
  }

  return data
}
