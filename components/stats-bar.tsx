const stats = [
  { value: "993+", label: "Klien Terlayani" },
  { value: "12+", label: "Jenis Analisis" },
  { value: "98%", label: "Tingkat Kepuasan" },
  { value: "24/7", label: "Support" },
]

export function StatsBar() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary-foreground">{stat.value}</div>
              <div className="text-sm text-primary-foreground/70 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
