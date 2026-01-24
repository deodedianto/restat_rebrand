"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface PhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

const countries = [
  {
    code: "+62",
    country: "ID",
    flag: "🇮🇩",
    name: "Indonesia",
  },
  {
    code: "+1",
    country: "US",
    flag: "🇺🇸",
    name: "United States",
  },
  {
    code: "+44",
    country: "GB",
    flag: "🇬🇧",
    name: "United Kingdom",
  },
  {
    code: "+65",
    country: "SG",
    flag: "🇸🇬",
    name: "Singapore",
  },
  {
    code: "+60",
    country: "MY",
    flag: "🇲🇾",
    name: "Malaysia",
  },
]

export function PhoneInput({
  value = "",
  onChange,
  placeholder = "8123456789",
  className,
  disabled = false,
  error = false,
}: PhoneInputProps) {
  // Parse the value to extract country code and phone number
  const getCountryCodeAndNumber = (fullValue: string) => {
    if (!fullValue) return { countryCode: "+62", phoneNumber: "" }
    
    // Find matching country code
    const matchedCountry = countries.find((c) => fullValue.startsWith(c.code))
    
    if (matchedCountry) {
      return {
        countryCode: matchedCountry.code,
        phoneNumber: fullValue.slice(matchedCountry.code.length),
      }
    }
    
    // Default to +62 if no match
    return { countryCode: "+62", phoneNumber: fullValue }
  }

  const { countryCode, phoneNumber } = getCountryCodeAndNumber(value)
  const [selectedCountryCode, setSelectedCountryCode] = React.useState(countryCode)
  const [number, setNumber] = React.useState(phoneNumber)

  // Update internal state when value prop changes
  React.useEffect(() => {
    const { countryCode: newCode, phoneNumber: newNumber } = getCountryCodeAndNumber(value)
    setSelectedCountryCode(newCode)
    setNumber(newNumber)
  }, [value])

  const handleCountryCodeChange = (newCode: string) => {
    setSelectedCountryCode(newCode)
    if (onChange) {
      onChange(newCode + number)
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, "") // Only allow digits
    setNumber(newNumber)
    if (onChange) {
      onChange(selectedCountryCode + newNumber)
    }
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Country Code Selector */}
      <Select value={selectedCountryCode} onValueChange={handleCountryCodeChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "w-[120px] bg-slate-50 border-slate-200",
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">
                {countries.find((c) => c.code === selectedCountryCode)?.flag}
              </span>
              <span className="font-medium">{selectedCountryCode}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span className="font-medium">{country.code}</span>
                <span className="text-slate-500 text-sm">{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Phone Number Input */}
      <div className="flex-1 relative">
        <input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm",
            "ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-slate-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            "dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
          )}
        />
      </div>
    </div>
  )
}
