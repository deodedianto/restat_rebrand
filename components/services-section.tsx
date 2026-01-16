import { MessageCircle, Users, GraduationCap, DollarSign } from "lucide-react"

const services = [
  {
    icon: DollarSign,
    title: "Garansi Uang Kembali",
    description: "Kami akan mengembalikan biaya jika hasil analisa yang kami berikan salah",
  },
  {
    icon: GraduationCap,
    title: "Bimbingan Sampai Selesai",
    description: "Kami akan selalu siap membantu sampai penelitian Anda benar-benar selesai",
  },
  {
    icon: MessageCircle,
    title: "Konsultasi Tanpa Batas",
    description: "Bingung cara olah data? Kami siap menerima konsultasi GRATIS 24/7",
  },
  {
    icon: Users,
    title: "Konsultasi Private",
    description: "Butuh mentor untuk konsultasi sesuai penelitianmu? Kami siap membantu",
  },
  
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent uppercase tracking-wider"></span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 text-balance">
            Tidak Bakal Menyesal Dibantu ReStat, Ini Alasannya!
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow group"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <service.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
