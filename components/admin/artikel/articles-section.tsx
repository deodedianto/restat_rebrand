"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, Pencil, Trash2, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface ArticlesSectionProps {
  articles: any[]
  authors: any[]
  categories: any[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterCategory: string
  setFilterCategory: (category: string) => void
  filterAuthor: string
  setFilterAuthor: (author: string) => void
  sortBy: "title" | "date"
  setSortBy: (sort: "title" | "date") => void
  sortOrder: "asc" | "desc"
  setSortOrder: (order: "asc" | "desc") => void
  selectedArticles: string[]
  setSelectedArticles: (ids: string[]) => void
  getAuthorName: (id: string) => string
  getCategoryName: (id: string) => string
  getCategoryColor: (id: string) => string
  onAdd: () => void
  onEdit: (article: any) => void
  onDelete: (id: string) => void
  onBulkDelete: () => void
  onToggleFeatured: () => void
  onToggleDraft: () => void
}

export function ArticlesSection({
  articles,
  authors,
  categories,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterAuthor,
  setFilterAuthor,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedArticles,
  setSelectedArticles,
  getAuthorName,
  getCategoryName,
  getCategoryColor,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onToggleFeatured,
  onToggleDraft,
}: ArticlesSectionProps) {
  const toggleArticleSelection = (id: string) => {
    setSelectedArticles(
      selectedArticles.includes(id)
        ? selectedArticles.filter(a => a !== id)
        : [...selectedArticles, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedArticles(
      selectedArticles.length === articles.length ? [] : articles.map(a => a.id)
    )
  }

  return (
    <>
      {/* Filters and Actions */}
      <Card className="mb-6 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Articles Management</h3>
              <Button onClick={onAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Article
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">All Authors</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "title" | "date")}
                className="h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedArticles.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-900 font-medium">
                  {selectedArticles.length} selected
                </span>
                <Button size="sm" variant="outline" onClick={onToggleFeatured}>
                  Toggle Featured
                </Button>
                <Button size="sm" variant="outline" onClick={onToggleDraft}>
                  Toggle Draft
                </Button>
                <Button size="sm" variant="destructive" onClick={onBulkDelete}>
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedArticles.length === articles.length}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedArticles.includes(article.id)}
                        onChange={() => toggleArticleSelection(article.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold">{article.title}</div>
                        <div className="text-xs text-muted-foreground">/{article.slug}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getCategoryColor(article.categoryId) }}
                      >
                        {getCategoryName(article.categoryId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{getAuthorName(article.authorId)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {article.featured && (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                        {article.draft && (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-green-50"
                          onClick={() => window.open(`/artikel/${article.slug}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                          onClick={() => onEdit(article)}
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => onDelete(article.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
