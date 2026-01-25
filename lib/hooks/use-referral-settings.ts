import { useState, useEffect } from 'react'

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

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings(parsed)
      }
    } catch (error) {
      console.error('Error loading referral settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save settings to localStorage
  const updateSettings = (newSettings: ReferralSettings) => {
    try {
      setSettings(newSettings)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
      return true
    } catch (error) {
      console.error('Error saving referral settings:', error)
      return false
    }
  }

  // Reset to default settings
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
  }
}
