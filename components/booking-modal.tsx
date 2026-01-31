"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Loader2, Check, MessageCircle, Video, ExternalLink } from "lucide-react"
import { validateBookingForm } from "@/lib/validation/user-schemas"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  userEmail?: string
  userId?: string
  onSuccess?: () => void
}

interface TimeSlot {
  time: string
  available: boolean
  label?: string
}

export function BookingModal({ isOpen, onClose, userName = "", userEmail = "", userId, onSuccess }: BookingModalProps) {
  const [bookingStep, setBookingStep] = useState<"datetime" | "details" | "success">("datetime")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookingName, setBookingName] = useState(userName)
  const [bookingEmail, setBookingEmail] = useState(userEmail)
  const [bookingNotes, setBookingNotes] = useState("")
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  // New states for API integration
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [meetLink, setMeetLink] = useState<string>("")

  // Update booking name and email when props change
  useEffect(() => {
    setBookingName(userName)
    setBookingEmail(userEmail)
  }, [userName, userEmail])

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    } else {
      setAvailableSlots([])
    }
  }, [selectedDate])

  const fetchAvailableSlots = async (date: Date) => {
    setIsLoadingSlots(true)
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`/api/calendar/availability?date=${dateStr}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability')
      }
      
      const data = await response.json()
      setAvailableSlots(data.slots || [])
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setAvailableSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleClose = () => {
    setBookingStep("datetime")
    setSelectedDate(null)
    setSelectedTime("")
    setBookingNotes("")
    setAvailableSlots([])
    setMeetLink("")
    onClose()
  }

  const handleSelectDateTime = (time: string) => {
    setSelectedTime(time)
    setValidationErrors({})
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
      if (!userId || !selectedDate) {
        throw new Error('Missing user ID or selected date')
      }

      // Call booking API to create calendar event and save to database
      const response = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName: bookingName,
          userEmail: bookingEmail,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          notes: bookingNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book consultation')
      }

      // Save Meet link and show success screen
      setMeetLink(data.consultation?.meetLink || '')
      setIsSubmittingBooking(false)
      setBookingStep("success")

      // Call onSuccess callback to refresh work history
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Booking error:', error)
      setIsSubmittingBooking(false)
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat menjadwalkan konsultasi. Silakan coba lagi.")
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
                    {/* Dynamic calendar - show next 42 days (6 weeks) */}
                    {Array.from({ length: 42 }, (_, i) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const dateObj = new Date(today)
                      dateObj.setDate(today.getDate() + i)
                      
                      const isPastDate = dateObj < today
                      const isSelected = selectedDate?.toDateString() === dateObj.toDateString()
                      
                      return (
                        <button
                          key={i}
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
                          {dateObj.getDate()}
                        </button>
                      )
                    })}
                  </div>
                  {selectedDate && (
                    <div className="mt-3 text-center text-sm font-medium text-primary">
                      {selectedDate.toLocaleDateString("id-ID", { 
                        weekday: "long", 
                        day: "numeric", 
                        month: "long", 
                        year: "numeric" 
                      })}
                    </div>
                  )}
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
                  Pilih Waktu WIB {selectedDate && `(${selectedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })})`}
                </Label>
                
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-slate-600">Memuat waktu tersedia...</span>
                  </div>
                ) : !selectedDate ? (
                  <div className="flex items-center justify-center py-12 text-sm text-slate-500">
                    Pilih tanggal terlebih dahulu
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500">Tidak ada waktu tersedia untuk tanggal ini</p>
                    <p className="text-xs text-slate-400 mt-1">Silakan pilih tanggal lain</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableSlots.filter(slot => slot.available).map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleSelectDateTime(slot.time)}
                        className="w-full py-3 px-4 text-center rounded-lg border-2 border-slate-200 hover:border-primary hover:bg-slate-50 transition-all"
                      >
                        <span className="font-medium">{slot.time}</span>
                        <span className="text-xs text-slate-500 ml-2">WIB</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : bookingStep === "success" ? (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Konsultasi Berhasil Dijadwalkan!</h3>
              <p className="text-slate-600">Email undangan telah dikirim ke {bookingEmail}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Tanggal & Waktu</p>
                  <p className="font-semibold text-slate-800">
                    {selectedDate?.toLocaleDateString("id-ID", { 
                      weekday: "long", 
                      day: "numeric", 
                      month: "long", 
                      year: "numeric" 
                    })}
                  </p>
                  <p className="text-sm font-medium text-slate-700">{selectedTime} WIB (30 menit)</p>
                </div>
              </div>

              {meetLink && (
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-2">Link Google Meet</p>
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <Video className="w-4 h-4" />
                      Buka Google Meet
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-xs text-slate-500 mt-2">Link ini juga tersedia di dashboard Anda</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Anda akan menerima email konfirmasi dan reminder sebelum jadwal konsultasi. 
                Pastikan untuk join tepat waktu melalui link Google Meet di atas.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                className="flex-1"
              >
                Tutup
              </Button>
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
