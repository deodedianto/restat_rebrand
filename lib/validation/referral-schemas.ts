import { z } from "zod"
import { bankAccountSchema } from "./common-schemas"

/**
 * Bank Account Update Schema
 * Used when users add their bank account information for referral redemption
 */
export const bankAccountUpdateSchema = z.object({
  bankName: z
    .string()
    .min(3, "Nama bank minimal 3 karakter")
    .max(50, "Nama bank maksimal 50 karakter")
    .regex(/^[a-zA-Z\s]+$/, "Nama bank hanya boleh berisi huruf dan spasi"),
  bankAccountNumber: z
    .string()
    .min(5, "Nomor rekening minimal 5 digit")
    .max(20, "Nomor rekening maksimal 20 digit")
    .regex(/^\d+$/, "Nomor rekening hanya boleh berisi angka"),
})

/**
 * Combined Bank Account Schema (for validation)
 * Same as bankAccountSchema from common-schemas but with specific error messages
 */
export const referralBankAccountSchema = bankAccountSchema

/**
 * Redeem Points Schema with Bank Account Check
 */
export const redeemPointsWithBankSchema = z.object({
  amount: z
    .number()
    .min(10000, "Minimal redeem Rp 10.000")
    .refine((val) => val % 10000 === 0, "Jumlah harus kelipatan Rp 10.000"),
  bankName: z.string().min(1, "Informasi rekening bank diperlukan"),
  bankAccountNumber: z.string().min(1, "Informasi rekening bank diperlukan"),
})

/**
 * Helper function to validate bank account update
 */
export function validateBankAccount(data: { bankName: string; bankAccountNumber: string }) {
  return bankAccountUpdateSchema.safeParse(data)
}

/**
 * Helper function to validate redeem request
 */
export function validateRedeemPoints(data: { amount: number; bankName?: string; bankAccountNumber?: string }) {
  return redeemPointsWithBankSchema.safeParse(data)
}

export type BankAccountUpdate = z.infer<typeof bankAccountUpdateSchema>
export type RedeemPointsWithBank = z.infer<typeof redeemPointsWithBankSchema>
