'use client'

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { supabase } from './supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  name: string
  email: string
  whatsapp: string
  phone: string
  referralCode: string
  referralEarnings: number
  referralCount: number
  bankName?: string
  bankAccountNumber?: string
  role: 'user' | 'admin' | 'analyst'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    whatsapp: string,
    password: string,
    usedReferralCode?: string,
  ) => Promise<boolean>
  logout: () => void
  updateProfile: (data: { name: string; whatsapp: string; email: string; phone: string }) => Promise<boolean>
  updateBankAccount: (data: { bankName: string; bankAccountNumber: string }) => Promise<boolean>
  resetPassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  generateReferralCode: () => Promise<string>
  redeemEarnings: (amount: number) => Promise<boolean>
  validateReferralCode: (code: string) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadingPromiseRef = useRef<Promise<void> | null>(null)
  const lastProcessedSessionRef = useRef<string | null>(null)

  // Load user profile from Supabase
  const loadUserProfile = async (userId: string) => {
    // If already loading, await the existing promise
    if (loadingPromiseRef.current) {
      await loadingPromiseRef.current
      return
    }
    
    // Create promise and set ref SYNCHRONOUSLY (before any async work)
    let resolvePromise: () => void
    const loadPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })
    loadingPromiseRef.current = loadPromise
    
    // Now do the actual async work
    ;(async () => {
      try {
      // @ts-ignore - Supabase type inference issue
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      // If profile doesn't exist (OAuth user), create it
      if (profileError?.code === 'PGRST116' || !profile) {
        // Get user metadata from Supabase Auth
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          console.error('No auth user found')
          resolvePromise!()
          return
        }

        // Create profile for OAuth user
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            name: authUser.user_metadata?.full_name || 
                  authUser.user_metadata?.name || 
                  authUser.email?.split('@')[0] || 
                  'User',
            email: authUser.email!,
            whatsapp: authUser.user_metadata?.phone || '',
            phone: authUser.user_metadata?.phone || '',
            role: 'user',
          } as any)
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile:', insertError.message)
          resolvePromise!()
          return
        }

        // Continue with the newly created profile
        const userProfile: any = newProfile
        
        setUser({
          id: userProfile.id,
          name: userProfile.name || '',
          email: userProfile.email,
          whatsapp: userProfile.whatsapp,
          phone: userProfile.phone || '',
          referralCode: userProfile.referral_code || '',
          referralEarnings: 0,
          referralCount: 0,
          bankName: userProfile.bank_name || undefined,
          bankAccountNumber: userProfile.bank_account_number || undefined,
          role: userProfile.role,
        })
        
        resolvePromise!()
        return
      }

      if (profileError) {
        console.error('Error loading profile:', (profileError as any)?.message || profileError)
        resolvePromise!()
        return
      }

      console.log('Profile loaded, calculating referral earnings...')

      // Cast profile to any to work around Supabase type inference issues
      const userProfile: any = profile

      // Calculate referral earnings
      // @ts-ignore - Supabase type inference issue
      const { data: referrals } = await supabase
        .from('referrals')
        .select('reward_amount')
        .eq('referrer_id', userProfile.id)
        .eq('reward_status', 'Approved')

      const earnings = referrals?.reduce((sum: number, r: any) => sum + r.reward_amount, 0) || 0

      console.log('Setting user state with profile data')

      setUser({
        id: userProfile.id,
        name: userProfile.name || '',
        email: userProfile.email,
        whatsapp: userProfile.whatsapp,
        phone: userProfile.phone || '',
        referralCode: userProfile.referral_code || '',
        referralEarnings: earnings,
        referralCount: referrals?.length || 0,
        bankName: userProfile.bank_name || undefined,
        bankAccountNumber: userProfile.bank_account_number || undefined,
        role: userProfile.role,
      })

        console.log('User profile loaded successfully')
        resolvePromise!()
      } catch (error: any) {
        // Ignore AbortError as it's expected when navigating away
        if (error?.name === 'AbortError') {
          console.log('Profile load was aborted (likely due to navigation)')
          resolvePromise!()
          return
        }
        console.error('Unexpected error loading profile:', error)
        resolvePromise!()
      } finally {
        loadingPromiseRef.current = null
      }
    })()
    
    await loadPromise
  }

  // Auth state listener
  useEffect(() => {
    let isMounted = true
    
    // Listen for auth changes - will fire immediately with INITIAL_SESSION if already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const sessionKey = `${event}:${session?.user?.id || 'none'}:${session?.access_token?.substring(0, 10) || 'none'}`
        
        // Ignore if component unmounted or duplicate event
        if (!isMounted) return
        if (sessionKey === lastProcessedSessionRef.current) {
          console.log('Ignoring duplicate auth event:', event, sessionKey)
          return
        }
        
        lastProcessedSessionRef.current = sessionKey
        
        if (session?.user) {
          // Promise-based locking in loadUserProfile prevents duplicate loads
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        
        if (isMounted) {
          setIsLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      lastProcessedSessionRef.current = null
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Supabase auth error:', error.message, error)
        throw error
      }
      
      // Don't manually load profile - let the auth listener handle it
      // This prevents race conditions with the auth state change listener
      return !!data.user
    } catch (error: any) {
      console.error('Login error:', error?.message || error)
      console.error('Login error type:', error?.name)
      return false
    }
  }

  const register = async (
    name: string,
    email: string,
    whatsapp: string,
    password: string,
    usedReferralCode?: string,
  ): Promise<boolean> => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        throw authError
      }
      
      if (!authData.user) {
        console.error('No user returned from signup')
        return false
      }

      console.log('Auth user created:', authData.user.id)

      // 2. Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name,
          email,
          whatsapp: whatsapp || '',
          phone: '',
          role: 'user' as const,
        } as any)
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        console.error('Profile error details:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code,
        })
        throw profileError
      }

      console.log('Profile created successfully')

      // 3. Handle referral code
      if (usedReferralCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', usedReferralCode)
          .single()

        if (referrer) {
          const { error: referralError } = await supabase.from('referrals').insert({
            referrer_id: (referrer as any).id,
            referred_user_id: (profile as any).id,
            referral_code_used: usedReferralCode,
            reward_amount: 50000,
            reward_status: 'Verify',
            is_reward_paid: false,
          } as any)
          
          if (referralError) {
            console.error('Referral insertion error:', referralError)
          }
        }
      }

      await loadUserProfile(authData.user.id)
      console.log('Registration completed successfully')
      return true
    } catch (error: any) {
      console.error('Registration error:', error)
      console.error('Error type:', typeof error)
      console.error('Error keys:', Object.keys(error || {}))
      console.error('Error message:', error?.message)
      console.error('Error details:', error?.details)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateProfile = async (data: { 
    name: string
    whatsapp: string
    email: string
    phone: string 
  }): Promise<boolean> => {
    if (!user) return false

    try {
      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('users')
        // @ts-ignore - Supabase type inference issue
        .update({
          name: data.name,
          whatsapp: data.whatsapp,
          phone: data.phone,
        })
        .eq('id', user.id)

      if (error) throw error

      setUser({ ...user, name: data.name, whatsapp: data.whatsapp, phone: data.phone })
      return true
    } catch (error) {
      console.error('Update profile error:', error)
      return false
    }
  }

  const updateBankAccount = async (data: {
    bankName: string
    bankAccountNumber: string
  }): Promise<boolean> => {
    if (!user) {
      console.error('No user found')
      return false
    }

    try{
      // Add timeout to prevent hanging forever
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000)
      )

      // @ts-ignore - Supabase type inference issue
      const updatePromise = supabase
        .from('users')
        // @ts-ignore - Supabase type inference issue
        .update({
          bank_name: data.bankName,
          bank_account_number: data.bankAccountNumber,
        })
        .eq('id', user.id)
        .select()

      const { data: result, error } = await Promise.race([updatePromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Bank account error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      setUser({ 
        ...user, 
        bankName: data.bankName, 
        bankAccountNumber: data.bankAccountNumber 
      })
      return true
    } catch (error) {
      console.error('Update bank account error:', error)
      return false
    }
  }

  const resetPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!user) return false

    try {
      // Re-authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) throw signInError

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Reset password error:', error)
      return false
    }
  }

  const generateReferralCode = async (): Promise<string> => {
    if (!user) return ''
    if (user.referralCode) return user.referralCode

    // Generate unique code (must match CHECK constraint: [A-Z0-9]{6,10})
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'RESTAT' // No hyphen - constraint doesn't allow it
    for (let i = 0; i < 4; i++) { // 4 more chars to make it 10 total
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    try {
      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('users')
        // @ts-ignore - Supabase type inference issue
        .update({ referral_code: code })
        .eq('id', user.id)
        .is('referral_code', null)

      if (error) throw error

      setUser({ ...user, referralCode: code })
      return code
    } catch (error) {
      console.error('Generate referral code error:', error)
      return ''
    }
  }

  const redeemEarnings = async (amount: number): Promise<boolean> => {
    if (!user || user.referralEarnings < amount) return false

    // This would create a withdrawal request in expenses table
    // For now, just return true
    return true
  }

  const validateReferralCode = async (code: string): Promise<boolean> => {
    if (!code || code.trim().length === 0) return false

    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', code.trim().toUpperCase())
      .single()

    return !!data
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        updateBankAccount,
        resetPassword,
        generateReferralCode,
        redeemEarnings,
        validateReferralCode,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
