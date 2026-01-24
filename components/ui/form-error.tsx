import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div className={cn("flex items-center gap-2 text-sm text-red-600", className)}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <p>{message}</p>
    </div>
  )
}

interface FormFieldErrorProps {
  error?: string
}

export function FormFieldError({ error }: FormFieldErrorProps) {
  if (!error) return null

  return <p className="text-sm text-red-600 mt-1">{error}</p>
}

interface FormErrorSummaryProps {
  errors: Record<string, string>
  className?: string
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorMessages = Object.values(errors).filter(Boolean)
  
  if (errorMessages.length === 0) return null

  return (
    <div className={cn("bg-red-50 border border-red-200 rounded-lg p-4", className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {errorMessages.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
