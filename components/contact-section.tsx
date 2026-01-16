import { Button } from "@/components/ui/button"
import { Phone, MapPin, MessageCircle } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Info */}
          <div>
            <span className="text-sm font-medium text-accent uppercase tracking-wider">Kontak</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-6">Hubungi Kami</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Punya pertanyaan atau butuh bantuan dengan analisis data Anda? Tim kami siap membantu Anda 24/7. Jangan
              ragu untuk menghubungi kami!
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">WhatsApp</h3>
                  <p className="text-muted-foreground">+62 852 182 896 39</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Alamat</h3>
                  <p className="text-muted-foreground">
                    Jl. Ayub, Kecamatan Jatinegara,
                    <br />
                    Kota Jakarta Timur, DKI Jakarta 13330
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - CTA Card */}
          <div className="bg-primary rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">Siap Konsultasi?</h3>
            <p className="text-primary-foreground/80 mb-8 leading-relaxed">
              Punya pertanyaan atau butuh bantuan dengan analisis data Anda? Tim kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami!
            </p>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8">
              Konsultasi via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
