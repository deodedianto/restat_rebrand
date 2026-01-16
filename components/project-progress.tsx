const projects = [
  { id: 993, date: "15 Jan 2026", analysis: "Uji T", package: "Standard", analyst: "Lani", status: "On Progress" },
  {
    id: 992,
    date: "14 Jan 2026",
    analysis: "Anova/Ancova",
    package: "Premium",
    analyst: "Lukman",
    status: "On Progress",
  },
  { id: 991, date: "14 Jan 2026", analysis: "ChiSquare", package: "Premium", analyst: "Hamka", status: "On Progress" },
  { id: 990, date: "13 Jan 2026", analysis: "Anova/Ancova", package: "Standard", analyst: "Lukman", status: "Done" },
  { id: 989, date: "12 Jan 2026", analysis: "SWOT", package: "Premium", analyst: "Lukman", status: "Done" },
  { id: 988, date: "12 Jan 2026", analysis: "Recoding", package: "Basic", analyst: "Lukman", status: "Done" },
]

export function ProjectProgress() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-accent uppercase tracking-wider"></span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">Ini yang Lagi Kami Handle. Kamu Berikutnya?</h2>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Analisis
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Paket
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tim ReStat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{project.id}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{project.date}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{project.analysis}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          project.package === "Premium"
                            ? "bg-accent/10 text-accent"
                            : project.package === "Standard"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {project.package}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{project.analyst}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          project.status === "Done" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
