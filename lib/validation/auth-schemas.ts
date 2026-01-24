import { z } from "zod"
import { emailSchema, passwordSchema, loginPasswordSchema, nameSchema } from "./common-schemas"

/**
 * Authentication form validation schemas
 */

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register form schema
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Validation helper functions
export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data)
}

export function validateRegister(data: unknown) {
  return registerSchema.safeParse(data)
}
