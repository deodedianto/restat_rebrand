import { useState } from "react"
import { z } from "zod"

export function useFormValidation<T extends z.ZodSchema>(schema: T) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validate = (data: z.infer<T>): boolean => {
    setValidationErrors({})
    
    const result = schema.safeParse(data)
    
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      setValidationErrors(errors)
      return false
    }
    
    return true
  }

  const clearErrors = () => {
    setValidationErrors({})
  }

  const setError = (field: string, message: string) => {
    setValidationErrors(prev => ({ ...prev, [field]: message }))
  }

  return {
    validationErrors,
    validate,
    clearErrors,
    setError,
  }
}
