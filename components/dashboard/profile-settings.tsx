"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Settings, ChevronDown, ChevronUp, User, Mail, Phone, Lock, Loader2 } from "lucide-react"
import { validateProfileUpdate } from "@/lib/validation/user-schemas"
import { PhoneInput } from "@/components/ui/phone-input"

interface ProfileSettingsProps {
  userName?: string
  userEmail?: string
  userPhone?: string
  onUpdateProfile?: (data: { name: string; email: string; phone: string }) => Promise<boolean>
  onResetPassword?: () => void
}

export function ProfileSettings({
  userName = "",
  userEmail = "",
  userPhone = "",
  onUpdateProfile,
  onResetPassword,
}: ProfileSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Check for hash navigation to open profile section
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#profile") {
      setIsOpen(true)
      // Scroll to the profile section after a short delay
      setTimeout(() => {
        const element = document.getElementById("profile-settings")
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    }
  }, [])
  
  // Profile state
  const [profileName, setProfileName] = useState(userName)
  const [profileEmail, setProfileEmail] = useState(userEmail)
  const [profilePhone, setProfilePhone] = useState(userPhone)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleSaveProfile = async () => {
    setProfileMessage(null)
    setValidationErrors({})
    
    // Validate form data
    const result = validateProfileUpdate({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
    })
    
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      setValidationErrors(errors)
      return
    }

    setIsSavingProfile(true)

    try {
      if (onUpdateProfile) {
        await onUpdateProfile({ name: profileName, email: profileEmail, phone: profilePhone })
      }
      setProfileMessage({ type: "success", text: "Profil berhasil diperbarui" })
    } catch (error) {
      setProfileMessage({ type: "error", text: "Gagal memperbarui profil" })
    } finally {
      setIsSavingProfile(false)
      setTimeout(() => setProfileMessage(null), 3000)
    }
  }

  return (
    <Card className="mb-3 sm:mb-6 border-0 shadow-md overflow-hidden bg-white py-2.5 px-0" id="profile-settings">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer bg-white hover:bg-slate-50 transition-colors py-2 px-4 sm:px-6 gap-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Settings className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base text-slate-800 leading-tight mb-0.5">Pengaturan Profil</CardTitle>
                  <CardDescription className="text-xs text-slate-600 leading-tight">
                    Edit nama, email, dan WhatsApp
                  </CardDescription>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Profile Form */}
            <div className="grid sm:grid-cols-2 gap-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4" />
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Nama lengkap"
                  className={`bg-white ${validationErrors.name ? "border-red-500" : ""}`}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="Email"
                  className={`bg-white ${validationErrors.email ? "border-red-500" : ""}`}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4" />
                  Nomor WhatsApp
                </Label>
                <PhoneInput
                  value={profilePhone}
                  onChange={setProfilePhone}
                  placeholder="8123456789"
                  error={!!validationErrors.phone}
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-600">{validationErrors.phone}</p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-3">
                {profileMessage && (
                  <p className={`text-sm ${profileMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {profileMessage.text}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="rounded-full">
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full bg-white gap-2"
                    onClick={() => {
                      if (onResetPassword) {
                        onResetPassword()
                      } else {
                        alert("Fitur reset password akan segera tersedia. Anda akan menerima link reset password melalui email.")
                      }
                    }}
                  >
                    <Lock className="w-4 h-4" />
                    Reset Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
