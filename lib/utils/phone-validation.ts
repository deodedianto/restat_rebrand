/**
 * Validates if a user has a phone number
 * @param phone - The phone number to validate
 * @returns true if phone number exists and is not empty
 */
export function hasPhoneNumber(phone: string | undefined | null): boolean {
  if (!phone) return false
  const trimmed = phone.trim()
  return trimmed.length > 0
}

/**
 * Validates if a phone number is in the correct format (+62xxxxxxxxx)
 * @param phone - The phone number to validate
 * @returns true if phone number is in correct format
 */
export function isValidPhoneFormat(phone: string | undefined | null): boolean {
  if (!phone) return false
  // Check if phone starts with +62 and has 11-14 digits total
  const phoneRegex = /^\+62\d{9,12}$/
  return phoneRegex.test(phone.trim())
}
