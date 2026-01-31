import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface ReferralSettings {
  // Settings for the referred user (person using the code)
  discountType: 'percentage' | 'fixed'
  discountValue: number
  // Settings for the referrer (person who shared the code)
  rewardType: 'percentage' | 'fixed'
  rewardValue: number
}

const DEFAULT_SETTINGS: ReferralSettings = {
  discountType: 'percentage',
  discountValue: 10, // 10% discount for referred user
  rewardType: 'fixed',
  rewardValue: 10000, // Rp 10,000 reward for referrer
}

const STORAGE_KEY = 'restat_referral_settings'

export function useReferralSettings() {
  const [settings, setSettings] = useState<ReferralSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from Supabase on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) {
        console.error('Error loading referral settings from Supabase:', error)
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setSettings(parsed)
        }
      } else if (data) {
        // Map database columns to our interface
        const fetchedSettings: ReferralSettings = {
          discountType: data.discount_type as 'percentage' | 'fixed',
          discountValue: data.discount_value,
          rewardType: data.reward_type as 'percentage' | 'fixed',
          rewardValue: data.reward_value,
        }
        setSettings(fetchedSettings)
        // Cache to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedSettings))
      }
    } catch (error) {
      console.error('Error loading referral settings:', error)
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setSettings(parsed)
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Save settings to Supabase
  const updateSettings = async (newSettings: ReferralSettings) => {
    try {
      setIsLoading(true)

      // Update in Supabase
      const { error } = await supabase
        .from('referral_settings')
        .update({
          discount_type: newSettings.discountType,
          discount_value: newSettings.discountValue,
          reward_type: newSettings.rewardType,
          reward_value: newSettings.rewardValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)

      if (error) {
        console.error('Error saving referral settings:', error)
        return false
      }

      // Update local state
      setSettings(newSettings)
      // Cache to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
      return true
    } catch (error) {
      console.error('Error saving referral settings:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Reset to default settings
  const resetSettings = async () => {
    await updateSettings(DEFAULT_SETTINGS)
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    reloadSettings: loadSettings,
  }
}
