import { z } from "zod"
import {
  idSchema,
  dateSchema,
  currencySchema,
  textSchema,
  slugSchema,
  phoneSchema,
  bankAccountSchema,
  hexColorSchema,
  arrayOfStringsSchema,
  socialMediaSchema,
  positiveIntSchema,
  urlSchema,
} from "./common-schemas"

/**
 * Admin form validation schemas
 */

// ===== EDIT DATA SCHEMAS =====

// Order schema
export const orderSchema = z
  .object({
    id: idSchema.optional(),
    no: positiveIntSchema,
    date: dateSchema,
    deadline: dateSchema,
    customer: textSchema(2, 100, "Customer name"),
    analysis: textSchema(2, 100, "Analysis type"),
    package: z.enum(["Basic", "Standard", "Premium"], {
      errorMap: () => ({ message: "Please select a valid package" }),
    }),
    price: currencySchema,
    analyst: z.string().min(1, "Analyst is required"), // Allow "-" for unassigned
    analystFee: currencySchema,
    workStatus: z.enum(["Menunggu", "Diproses", "Selesai"], {
      errorMap: () => ({ message: "Please select a valid work status" }),
    }),
    paymentStatus: z.enum(["Belum Dibayar", "Dibayar"], {
      errorMap: () => ({ message: "Please select a valid payment status" }),
    }),
  })
  .refine((data) => new Date(data.deadline) >= new Date(data.date), {
    message: "Deadline must be on or after the start date",
    path: ["deadline"],
  })
  .refine((data) => data.analystFee <= data.price, {
    message: "Analyst fee cannot exceed order price",
    path: ["analystFee"],
  })

export type OrderFormData = z.infer<typeof orderSchema>

// Pengeluaran schema
export const pengeluaranSchema = z.object({
  id: idSchema.optional(),
  date: dateSchema,
  type: z.enum(["Fee Analis", "Fee Referal", "Web Development", "Biaya Iklan", "Lainnya"], {
    errorMap: () => ({ message: "Please select a valid expense type" }),
  }),
  name: z.string().min(1, "Name is required").max(100),
  notes: textSchema(1, 500, "Notes").optional().or(z.literal("")),
  amount: currencySchema,
})
  .refine(
    (data) => {
      // Name is required for Fee Analis and Fee Referal
      if (data.type === "Fee Analis" || data.type === "Fee Referal") {
        return data.name && data.name.trim().length > 0
      }
      return true
    },
    {
      message: "Name is required for Fee Analis and Fee Referal",
      path: ["name"],
    }
  )

export type PengeluaranFormData = z.infer<typeof pengeluaranSchema>

// Harga Analisis schema
export const hargaAnalisisSchema = z.object({
  id: idSchema.optional(),
  name: textSchema(2, 100, "Analysis name"),
  package: z.enum(["Basic", "Standard", "Premium"], {
    errorMap: () => ({ message: "Please select a valid package" }),
  }),
  price: currencySchema,
})

export type HargaAnalisisFormData = z.infer<typeof hargaAnalisisSchema>

// Analis schema
export const analisSchema = z.object({
  id: idSchema.optional(),
  name: textSchema(2, 100, "Analyst name"),
  whatsapp: phoneSchema,
  bankName: textSchema(2, 50, "Bank name"),
  bankAccountNumber: z
    .string()
    .min(5, "Nomor rekening minimal 5 digit")
    .max(20, "Nomor rekening maksimal 20 digit")
    .regex(/^\d+$/, "Nomor rekening hanya boleh berisi angka"),
})

export type AnalisFormData = z.infer<typeof analisSchema>

// Voucher schema
export const voucherSchema = z.object({
  id: idSchema.optional(),
  voucherCode: z
    .string()
    .min(3, "Kode voucher minimal 3 karakter")
    .max(50, "Kode voucher maksimal 50 karakter")
    .regex(/^[A-Z0-9]+$/, "Kode voucher hanya boleh huruf besar dan angka"),
  description: z.string().optional().or(z.literal("")),
  discountType: z.enum(["percentage", "fixed"], {
    errorMap: () => ({ message: "Please select discount type" }),
  }),
  discountValue: positiveIntSchema,
  maxUsage: z.number().int().positive().optional().or(z.literal(0)),
  validFrom: z.string().optional().or(z.literal("")),
  validUntil: z.string().optional().or(z.literal("")),
  minOrderAmount: z.number().int().min(0).optional().or(z.literal(0)),
  isActive: z.boolean().optional(),
})
  .refine((data) => {
    // If percentage, value must be 1-100
    if (data.discountType === 'percentage') {
      return data.discountValue >= 1 && data.discountValue <= 100
    }
    return true
  }, {
    message: "Persentase diskon harus antara 1-100",
    path: ["discountValue"],
  })
  .refine((data) => {
    // If validFrom and validUntil are provided, validUntil must be after validFrom
    if (data.validFrom && data.validUntil) {
      return new Date(data.validUntil) >= new Date(data.validFrom)
    }
    return true
  }, {
    message: "Tanggal berakhir harus setelah atau sama dengan tanggal mulai",
    path: ["validUntil"],
  })

export type VoucherFormData = z.infer<typeof voucherSchema>

// ===== ARTIKEL SCHEMAS =====

// Article schema
export const articleSchema = z.object({
  id: idSchema.optional(),
  title: textSchema(5, 200, "Title"),
  slug: slugSchema,
  description: textSchema(20, 300, "Description"),
  date: dateSchema,
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  private: z.boolean().default(false),
  authorId: idSchema,
  categoryId: idSchema,
  externalLink: urlSchema,
  thumbnail: z.string().optional().or(z.literal("")),
  thumbnailText: z.string().max(100, "Thumbnail text must be less than 100 characters").optional().or(z.literal("")),
  bodyMarkdown: textSchema(100, 50000, "Content"),
  tags: arrayOfStringsSchema(0, 20, 2),
  keywords: arrayOfStringsSchema(0, 20, 2),
})

export type ArticleFormData = z.infer<typeof articleSchema>

// Author schema
export const authorSchema = z.object({
  id: idSchema.optional(),
  name: textSchema(2, 100, "Author name"),
  slug: slugSchema,
  title: textSchema(2, 100, "Title/Position"),
  description: textSchema(10, 500, "Description"),
  photo: z.string().min(1, "Photo URL is required"),
  socialMedia: z.array(socialMediaSchema).optional().default([]),
  skills: arrayOfStringsSchema(0, 50, 2),
})

export type AuthorFormData = z.infer<typeof authorSchema>

// Category schema
export const categorySchema = z.object({
  id: idSchema.optional(),
  name: textSchema(2, 100, "Category name"),
  slug: slugSchema,
  description: textSchema(10, 300, "Description"),
  icon: z.string().optional().or(z.literal("")),
  color: hexColorSchema,
})

export type CategoryFormData = z.infer<typeof categorySchema>

// ===== VALIDATION HELPER FUNCTIONS =====

export function validateOrder(data: unknown) {
  return orderSchema.safeParse(data)
}

export function validatePengeluaran(data: unknown) {
  return pengeluaranSchema.safeParse(data)
}

export function validateHargaAnalisis(data: unknown) {
  return hargaAnalisisSchema.safeParse(data)
}

export function validateAnalis(data: unknown) {
  return analisSchema.safeParse(data)
}

export function validateVoucher(data: unknown) {
  return voucherSchema.safeParse(data)
}

export function validateArticle(data: unknown) {
  return articleSchema.safeParse(data)
}

export function validateAuthor(data: unknown) {
  return authorSchema.safeParse(data)
}

export function validateCategory(data: unknown) {
  return categorySchema.safeParse(data)
}
