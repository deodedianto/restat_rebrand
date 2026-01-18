"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SeoPreviewProps {
  title: string
  description: string
  slug: string
}

export function SeoPreview({ title, description, slug }: SeoPreviewProps) {
  const siteUrl = "https://restat.id"
  const fullUrl = `${siteUrl}/artikel/${slug}`
  
  // Calculate character lengths with visual feedback
  const getDescriptionColor = (length: number) => {
    if (length === 0) return "text-slate-400"
    if (length < 120) return "text-yellow-600"
    if (length >= 120 && length <= 160) return "text-green-600"
    return "text-red-600"
  }

  const getTitleColor = (length: number) => {
    if (length === 0) return "text-slate-400"
    if (length > 60) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">SEO Preview</CardTitle>
        <p className="text-xs text-muted-foreground">
          Preview tampilan artikel di hasil pencarian Google
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Search Result Preview */}
        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-600">ReStat</span>
                <span className="text-xs text-slate-400">›</span>
                <span className="text-xs text-slate-600">Artikel</span>
              </div>
              <div className="text-xs text-slate-500 truncate">{fullUrl}</div>
            </div>
          </div>
          
          <h3 className="text-xl text-blue-600 font-normal mb-2 hover:underline cursor-pointer">
            {title || "Judul artikel akan muncul di sini"}
          </h3>
          
          <p className="text-sm text-slate-600 line-clamp-2">
            {description || "Deskripsi artikel akan muncul di sini. Pastikan deskripsi menarik dan informatif untuk meningkatkan click-through rate."}
          </p>
        </div>

        {/* Character Counters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Panjang Judul</span>
              <span className={getTitleColor(title.length)}>
                {title.length} / 60
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  title.length === 0 ? "bg-slate-300" :
                  title.length > 60 ? "bg-yellow-500" :
                  "bg-green-500"
                }`}
                style={{ width: `${Math.min((title.length / 60) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {title.length === 0 && "Belum ada judul"}
              {title.length > 0 && title.length <= 60 && "Panjang judul optimal"}
              {title.length > 60 && "Judul terlalu panjang, mungkin terpotong"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Panjang Deskripsi</span>
              <span className={getDescriptionColor(description.length)}>
                {description.length} / 160
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  description.length === 0 ? "bg-slate-300" :
                  description.length < 120 ? "bg-yellow-500" :
                  description.length <= 160 ? "bg-green-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${Math.min((description.length / 160) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {description.length === 0 && "Belum ada deskripsi"}
              {description.length > 0 && description.length < 120 && "Deskripsi terlalu pendek"}
              {description.length >= 120 && description.length <= 160 && "Panjang deskripsi optimal"}
              {description.length > 160 && "Deskripsi terlalu panjang, akan terpotong"}
            </p>
          </div>
        </div>

        {/* SEO Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-blue-900 mb-1">💡 Tips SEO</h4>
          <ul className="text-[11px] text-blue-800 space-y-1">
            <li>• Gunakan kata kunci utama di judul dan deskripsi</li>
            <li>• Buat judul yang menarik perhatian (50-60 karakter)</li>
            <li>• Deskripsi harus informatif dan mengajak klik (120-160 karakter)</li>
            <li>• Gunakan slug yang jelas dan mudah dibaca</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
