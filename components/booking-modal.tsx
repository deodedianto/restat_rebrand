"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Loader2, Check, MessageCircle } from "lucide-react"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  userEmail?: string
}

export function BookingModal({ isOpen, onClose, userName = "", userEmail = "" }: BookingModalProps) {
  const [bookingStep, setBookingStep] = useState<"datetime" | "details">("datetime")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookingName, setBookingName] = useState(userName)
  const [bookingEmail, setBookingEmail] = useState(userEmail)
  const [bookingNotes, setBookingNotes] = useState("")
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)

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
    setBookingStep("details")
  }

  const handleSubmitBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingName || !bookingEmail) return
    
    setIsSubmittingBooking(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmittingBooking(false)
    handleClose()
    // Show success message or redirect
    alert("Konsultasi berhasil dijadwalkan! Kami akan menghubungi Anda segera.")
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
                      const isSelected = selectedDate?.getDate() === date
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(dateObj)}
                          className={`py-2 px-1 text-sm rounded-lg transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-bold"
                              : date >= 18
                                ? "hover:bg-slate-200 text-primary cursor-pointer"
                                : "text-slate-400 cursor-not-allowed"
                          }`}
                          disabled={date < 18}
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
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-slate-800">
                    {selectedDate?.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-sm text-slate-600">{selectedTime} • 30 menit • Via Google Meet</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="booking-name" className="text-sm font-medium">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="booking-name"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="mt-2"
                />
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
                  className="mt-2"
                />
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
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setBookingStep("datetime")}
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
