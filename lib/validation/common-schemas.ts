import { z } from "zod"

/**
 * Common validation schemas for reuse across the application
 * These validators ensure consistent validation rules
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .max(100, "Email must be less than 100 characters")

// Password validation (min 8 chars, includes uppercase, lowercase, number)
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")

// Simple password validation for login (no complexity rules)
export const loginPasswordSchema = z
  .string()
  .min(1, "Password is required")

// Indonesian phone number validation (+62xxxxxxxxx, 11-14 digits total)
export const phoneSchema = z
  .string()
  .regex(/^\+62\d{9,12}$/, "Phone number must start with +62 and be 11-14 digits total")
  .or(z.literal(""))
  .optional()

// URL validation
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .or(z.literal(""))
  .optional()

// Slug validation (lowercase letters, numbers, hyphens)
export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, use hyphens, no spaces")
  .max(200, "Slug must be less than 200 characters")

// Date validation (YYYY-MM-DD format)
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")

// Future date validation
export const futureDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine(
    (date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    },
    { message: "Date must be today or in the future" }
  )

// Currency/Price validation (positive number)
export const currencySchema = z
  .number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  })
  .min(0, "Price must be zero or positive")
  .max(1000000000, "Price is too large")

// Percentage validation (0-100)
export const percentageSchema = z
  .number()
  .min(0, "Percentage must be at least 0")
  .max(100, "Percentage cannot exceed 100")

// Rating validation (1-5 stars)
export const ratingSchema = z
  .number()
  .int("Rating must be a whole number")
  .min(1, "Rating must be at least 1 star")
  .max(5, "Rating cannot exceed 5 stars")

// Text validation with min/max length
export function textSchema(
  minLength: number = 1,
  maxLength: number = 1000,
  fieldName: string = "Field"
) {
  return z
    .string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`)
}

// Optional text validation
export function optionalTextSchema(maxLength: number = 1000, fieldName: string = "Field") {
  return z
    .string()
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`)
    .optional()
    .or(z.literal(""))
}

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots, apostrophes, and hyphens")

// ID validation
export const idSchema = z
  .string()
  .min(1, "ID is required")
  .max(50, "ID must be less than 50 characters")

// Positive integer validation
export const positiveIntSchema = z
  .number({
    required_error: "Value is required",
    invalid_type_error: "Value must be a number",
  })
  .int("Value must be a whole number")
  .min(1, "Value must be at least 1")

// Non-negative integer validation
export const nonNegativeIntSchema = z
  .number({
    required_error: "Value is required",
    invalid_type_error: "Value must be a number",
  })
  .int("Value must be a whole number")
  .min(0, "Value must be zero or positive")

// Array of strings validation
export function arrayOfStringsSchema(
  minItems: number = 0,
  maxItems: number = 100,
  itemMinLength: number = 1
) {
  return z
    .array(
      z.string().min(itemMinLength, `Each item must be at least ${itemMinLength} characters`)
    )
    .min(minItems, `At least ${minItems} items required`)
    .max(maxItems, `Maximum ${maxItems} items allowed`)
}

// Hex color validation
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #FF5733)")

// Social media URL validation
export const socialMediaSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Invalid URL format"),
})

// Bank account validation (basic)
export const bankAccountSchema = z
  .string()
  .min(5, "Bank account must be at least 5 characters")
  .max(100, "Bank account must be less than 100 characters")
  .regex(/^[A-Z\s]+ - \d+$/, "Format: BANK NAME - ACCOUNT NUMBER")
