import { z } from "zod"
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  ratingSchema,
  textSchema,
  currencySchema,
  futureDateSchema,
} from "./common-schemas"

/**
 * User dashboard form validation schemas
 */

// Profile update schema
export const profileUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

// Redeem points schema
export const redeemPointsSchema = z.object({
  amount: currencySchema.refine((val) => val > 0, {
    message: "Amount must be greater than 0",
  }),
})

export type RedeemPointsFormData = z.infer<typeof redeemPointsSchema>

// Order review schema
export const orderReviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  rating: ratingSchema,
  comment: textSchema(10, 1000, "Comment"),
})

export type OrderReviewFormData = z.infer<typeof orderReviewSchema>

// General feedback schema
export const generalFeedbackSchema = z.object({
  rating: ratingSchema,
  comment: textSchema(10, 1000, "Comment"),
})

export type GeneralFeedbackFormData = z.infer<typeof generalFeedbackSchema>

// Order form schema (from order page)
export const orderFormSchema = z.object({
  analysisType: z.string().min(1, "Please select an analysis type"),
  package: z.enum(["basic", "standard", "premium"], {
    errorMap: () => ({ message: "Please select a package" }),
  }),
  researchTitle: z.string().min(1, "Research title is required").max(200, "Research title must be less than 200 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional().or(z.literal("")),
  deliveryDate: futureDateSchema.optional().or(z.literal("")),
})

export type OrderFormData = z.infer<typeof orderFormSchema>

// Booking form schema
export const bookingFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  date: futureDateSchema,
  time: z.string().min(1, "Please select a time slot"),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

// Validation helper functions
export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.safeParse(data)
}

export function validateRedeemPoints(data: unknown) {
  return redeemPointsSchema.safeParse(data)
}

export function validateOrderReview(data: unknown) {
  return orderReviewSchema.safeParse(data)
}

export function validateGeneralFeedback(data: unknown) {
  return generalFeedbackSchema.safeParse(data)
}

export function validateOrderForm(data: unknown) {
  return orderFormSchema.safeParse(data)
}

export function validateBookingForm(data: unknown) {
  return bookingFormSchema.safeParse(data)
}
