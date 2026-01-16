import { BarChart3, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
          {/* Brand - Left */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-xl">ReStat</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Tutor statistik terpercaya untuk mahasiswa dan peneliti Indonesia.
            </p>
          </div>

          {/* Contact Information - Right */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary-foreground/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h5 className="font-bold text-primary-foreground mb-1">WhatsApp</h5>
                <p className="text-primary-foreground/70">+62 852 182 896 39</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary-foreground/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h5 className="font-bold text-primary-foreground mb-1">Alamat</h5>
                <p className="text-primary-foreground/70">
                  Jl. Ayub, Kecamatan Jatinegara, Kota Jakarta Timur, DKI Jakarta 13330
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center">
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} ReStat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
