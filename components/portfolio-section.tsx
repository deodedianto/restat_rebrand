const analysisTypes = [
  "Korelasi",
  "Chi-Square",
  "Validitas & Reliabilitas",
  "Anova/Ancova",
  "T-Test",
  "Regresi Berganda",
  "Regresi Logistik",
  "Regresi Data Panel",
  "Path Analisis",
  "Time Series",
  "SEM",
  "SEM PLS",
]

export function PortfolioSection() {
  return (
    <section id="portfolio" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-accent uppercase tracking-wider"></span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 text-balance">
            Apapun Analisisnya, Kita Pasti Bisa Bantu!
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {analysisTypes.map((type, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border border-border hover:border-accent hover:shadow-md transition-all cursor-pointer group text-center"
            >
              <span className="text-4xl font-bold text-accent/20 group-hover:text-accent/40 transition-colors">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-sm sm:text-base font-medium text-foreground mt-2">{type}</h3>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">Butuh analisis lain? Jangan khawatir, konsultasi dengan kami!</p>
          <a href="#contact" className="inline-flex items-center gap-2 text-accent font-medium hover:underline">
            konsultasi gratis
          </a>
        </div>
      </div>
    </section>
  )
}
