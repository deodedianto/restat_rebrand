/**
 * Referral System Utilities
 * 
 * This file contains helper functions and constants for the referral system
 */

// Referral code format: RESTAT-XXXXXX (where X is alphanumeric)
export const REFERRAL_CODE_PREFIX = "RESTAT-"
export const REFERRAL_CODE_LENGTH = 13 // RESTAT- (7) + 6 characters
export const REFERRAL_REWARD_AMOUNT = 10000 // Rp 10,000 per referral
export const MINIMUM_REDEEM_AMOUNT = 10000 // Rp 10,000 minimum redemption

/**
 * Validates referral code format
 * @param code - The referral code to validate
 * @returns true if code matches RESTAT-XXXXXX format
 */
export function isValidReferralCodeFormat(code: string): boolean {
  if (!code || typeof code !== "string") return false
  
  const trimmed = code.trim().toUpperCase()
  
  // Check format: RESTAT-XXXXXX
  const regex = /^RESTAT-[A-Z0-9]{6}$/
  return regex.test(trimmed)
}

/**
 * Formats a referral code to uppercase
 * @param code - The code to format
 * @returns Uppercase formatted code
 */
export function formatReferralCode(code: string): string {
  return code.trim().toUpperCase()
}

/**
 * Gets referral statistics for display
 * @param referralCount - Number of users referred
 * @param referralPoints - Total points earned
 * @returns Object with formatted statistics
 */
export function getReferralStats(referralCount: number, referralPoints: number) {
  return {
    totalUsers: referralCount || 0,
    totalPoints: referralPoints || 0,
    canRedeem: referralPoints >= MINIMUM_REDEEM_AMOUNT,
    potentialEarnings: referralCount * REFERRAL_REWARD_AMOUNT,
  }
}

/**
 * Validates redemption amount
 * @param amount - Amount to redeem
 * @param availablePoints - User's available points
 * @returns Object with validation result and error message
 */
export function validateRedemption(amount: number, availablePoints: number) {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: "Jumlah tidak valid" }
  }
  
  if (amount < MINIMUM_REDEEM_AMOUNT) {
    return { valid: false, error: `Minimal redeem Rp ${MINIMUM_REDEEM_AMOUNT.toLocaleString("id-ID")}` }
  }
  
  if (amount > availablePoints) {
    return { valid: false, error: "Poin tidak mencukupi" }
  }
  
  return { valid: true, error: null }
}
