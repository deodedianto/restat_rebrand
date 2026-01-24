"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Loader2, Check, MessageCircle } from "lucide-react"
import { validateBookingForm } from "@/lib/validation/user-schemas"
import { supabase } from "@/lib/supabase/client"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  userEmail?: string
  userId?: string
  onSuccess?: () => void
}

export function BookingModal({ isOpen, onClose, userName = "", userEmail = "", userId, onSuccess }: BookingModalProps) {
  const [bookingStep, setBookingStep] = useState<"datetime" | "details">("datetime")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookingName, setBookingName] = useState(userName)
  const [bookingEmail, setBookingEmail] = useState(userEmail)
  const [bookingNotes, setBookingNotes] = useState("")
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleClose = () => {
    setBookingStep("datetime")
    setSelectedDate(null)
    setSelectedTime("")
    setBookingNotes("")
    onClose()
  }

  const handleSelectDateTime = (date: Date, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setValidationErrors({}) // Clear any previous validation errors
    setBookingStep("details")
  }

  const handleSubmitBooking = async () => {
    setValidationErrors({})
    
    // Validate form data
    const result = validateBookingForm({
      name: bookingName,
      email: bookingEmail,
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : "",
      time: selectedTime,
      notes: bookingNotes,
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
    
    setIsSubmittingBooking(true)
    
    try {
      // Save consultation to Supabase
      if (userId && selectedDate) {
        const { error } = await supabase
          .from('consultations')
          .insert({
            user_id: userId,
            scheduled_date: selectedDate.toISOString().split('T')[0],
            scheduled_time: selectedTime,
            notes: bookingNotes || 'Konsultasi gratis via Google Meet',
            status: 'Dijadwalkan',
            contact_name: bookingName,
            contact_email: bookingEmail,
          } as any)

        if (error) throw error

        // Call onSuccess callback to refresh work history
        if (onSuccess) {
          onSuccess()
        }
      }
      
      setIsSubmittingBooking(false)
      handleClose()
      alert("Konsultasi berhasil dijadwalkan! Kami akan menghubungi Anda segera.")
    } catch (error) {
      console.error('Booking error:', error)
      setIsSubmittingBooking(false)
      alert("Terjadi kesalahan saat menjadwalkan konsultasi. Silakan coba lagi.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {bookingStep === "datetime" ? "Pilih Tanggal & Waktu" : "Detail Konsultasi"}
          </DialogTitle>
        </DialogHeader>

        {bookingStep === "datetime" ? (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Konsultasi Gratis</h3>
                  <p className="text-sm text-slate-600">30 menit • Via Google Meet</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Pilih Tanggal</Label>
                <div className="border rounded-lg p-4 bg-slate-50">
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"].map((day) => (
                      <div key={day} className="text-xs font-semibold text-slate-600 py-2">
                        {day}
                      </div>
                    ))}
                    {/* Calendar dates - simplified */}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                      const dateObj = new Date(2026, 0, date)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const isPastDate = dateObj < today
                      const isSelected = selectedDate?.getDate() === date && selectedDate?.getMonth() === 0 && selectedDate?.getFullYear() === 2026
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(dateObj)}
                          className={`py-2 px-1 text-sm rounded-lg transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-bold"
                              : isPastDate
                                ? "text-slate-400 cursor-not-allowed"
                                : "hover:bg-slate-200 text-primary cursor-pointer"
                          }`}
                          disabled={isPastDate}
                        >
                          {date}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* WhatsApp Contact Button */}
                <div className="pt-4">
                  <p className="text-center text-sm text-slate-600 mb-3">Atau hubungi kami langsung</p>
                  <a
                    href="https://wa.me/6285218289639"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2 rounded-full border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Pilih Waktu {selectedDate && `(${selectedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })})`}
                </Label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {["08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00"].map((time) => (
                    <button
                      key={time}
                      onClick={() => handleSelectDateTime(selectedDate!, time)}
                      disabled={!selectedDate}
                      className={`w-full py-3 px-4 text-center rounded-lg border-2 transition-all ${
                        selectedTime === time
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : selectedDate
                            ? "border-slate-200 hover:border-primary hover:bg-slate-50"
                            : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className={`rounded-lg p-4 mb-4 ${validationErrors.date || validationErrors.time ? "bg-red-50 border border-red-200" : "bg-slate-50"}`}>
              <div className="flex items-center gap-3">
                <Calendar className={`w-5 h-5 ${validationErrors.date || validationErrors.time ? "text-red-500" : "text-primary"}`} />
                <div className="flex-1">
                  <p className={`font-medium ${validationErrors.date || validationErrors.time ? "text-red-800" : "text-slate-800"}`}>
                    {selectedDate?.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className={`text-sm ${validationErrors.date || validationErrors.time ? "text-red-600" : "text-slate-600"}`}>{selectedTime} • 30 menit • Via Google Meet</p>
                  {(validationErrors.date || validationErrors.time) && (
                    <p className="text-sm text-red-600 mt-1 font-medium">
                      {validationErrors.date || validationErrors.time}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Validation Error Summary */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-1">Mohon perbaiki kesalahan berikut:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <Label htmlFor="booking-name" className="text-sm font-medium">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="booking-name"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className={`mt-2 ${validationErrors.name ? "border-red-500" : ""}`}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="booking-email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  placeholder="email@example.com"
                  className={`mt-2 ${validationErrors.email ? "border-red-500" : ""}`}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="booking-notes" className="text-sm font-medium">
                  Catatan (Opsional)
                </Label>
                <Textarea
                  id="booking-notes"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Ceritakan sedikit tentang kebutuhan analisis data Anda..."
                  rows={4}
                  className={`mt-2 ${validationErrors.notes ? "border-red-500" : ""}`}
                />
                {validationErrors.notes && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.notes}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setValidationErrors({})
                  setBookingStep("datetime")
                }}
                className="flex-1"
              >
                Kembali
              </Button>
              <Button
                onClick={handleSubmitBooking}
                disabled={!bookingName || !bookingEmail || isSubmittingBooking}
                className="flex-1 gap-2"
              >
                {isSubmittingBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menjadwalkan...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Jadwalkan Konsultasi
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
