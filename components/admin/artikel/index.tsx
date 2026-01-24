"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useArtikelData } from "./use-artikel-data"
import { ArticlesSection } from "./articles-section"
import { SeoPreview } from "@/components/admin/seo-preview"
import { ContentEditor } from "@/components/admin/content-editor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"

type ArtikelTab = "articles" | "authors" | "categories"

const tabs = [
  { id: "articles" as ArtikelTab, label: "Articles" },
  { id: "authors" as ArtikelTab, label: "Authors" },
  { id: "categories" as ArtikelTab, label: "Categories" },
]

export function ArtikelView() {
  const [activeTab, setActiveTab] = useState<ArtikelTab>("articles")
  const data = useArtikelData()

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Content Management</h2>
        <p className="text-slate-600 mt-1">Manage articles, authors, and categories</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Articles Tab */}
      {activeTab === "articles" && (
        <ArticlesSection
          articles={data.getFilteredArticles()}
          authors={data.authors}
          categories={data.categories}
          searchQuery={data.articleSearchQuery}
          setSearchQuery={data.setArticleSearchQuery}
          filterCategory={data.articleFilterCategory}
          setFilterCategory={data.setArticleFilterCategory}
          filterAuthor={data.articleFilterAuthor}
          setFilterAuthor={data.setArticleFilterAuthor}
          sortBy={data.articleSortBy}
          setSortBy={data.setArticleSortBy}
          sortOrder={data.articleSortOrder}
          setSortOrder={data.setArticleSortOrder}
          selectedArticles={data.selectedArticles}
          setSelectedArticles={data.setSelectedArticles}
          getAuthorName={data.getAuthorName}
          getCategoryName={data.getCategoryName}
          getCategoryColor={data.getCategoryColor}
          onAdd={() => data.handleOpenArticleDialog()}
          onEdit={(article) => data.handleOpenArticleDialog(article)}
          onDelete={data.handleDeleteArticle}
          onBulkDelete={data.handleBulkDelete}
          onToggleFeatured={data.handleToggleFeatured}
          onToggleDraft={data.handleToggleDraft}
        />
      )}

      {/* Authors Tab */}
      {activeTab === "authors" && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Authors Management</h3>
              <Button onClick={() => data.handleOpenAuthorDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Author
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {data.authors.map((author) => (
                <Card key={author.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Image
                        src={author.photo}
                        alt={author.name}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{author.name}</h4>
                        <p className="text-sm text-muted-foreground">{author.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{author.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => data.handleOpenAuthorDialog(author)}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => data.handleDeleteAuthor(author.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Categories Management</h3>
              <Button onClick={() => data.handleOpenCategoryDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Icon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Color</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.categories.map((category) => (
                    <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-2xl">{category.icon}</td>
                      <td className="px-4 py-3 font-semibold">{category.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{category.slug}</td>
                      <td className="px-4 py-3 text-sm">{category.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-200"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-xs">{category.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => data.handleOpenCategoryDialog(category)}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => data.handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
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
      )}

      {/* Article Dialog */}
      <Dialog open={data.isArticleDialogOpen} onOpenChange={data.setIsArticleDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{data.editingArticle ? "Edit Article" : "Add Article"}</DialogTitle>
            <DialogDescription>
              {data.editingArticle ? "Update article details" : "Create a new article"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={data.articleFormData.title || ""}
                  onChange={(e) => {
                    const newData = { ...data.articleFormData, title: e.target.value, slug: data.generateSlug(e.target.value) }
                    data.setArticleFormData(newData)
                  }}
                  className={data.articleValidationErrors.title ? "border-red-500" : ""}
                />
                {data.articleValidationErrors.title && (
                  <p className="text-sm text-red-600">{data.articleValidationErrors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={data.articleFormData.slug || ""}
                  onChange={(e) => data.setArticleFormData({ ...data.articleFormData, slug: e.target.value })}
                  className={data.articleValidationErrors.slug ? "border-red-500" : ""}
                />
                {data.articleValidationErrors.slug && (
                  <p className="text-sm text-red-600">{data.articleValidationErrors.slug}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={data.articleFormData.description || ""}
                onChange={(e) => data.setArticleFormData({ ...data.articleFormData, description: e.target.value })}
                rows={3}
                className={data.articleValidationErrors.description ? "border-red-500" : ""}
              />
              {data.articleValidationErrors.description && (
                <p className="text-sm text-red-600">{data.articleValidationErrors.description}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={data.articleFormData.categoryId || ""}
                  onChange={(e) => data.setArticleFormData({ ...data.articleFormData, categoryId: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {data.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <select
                  value={data.articleFormData.authorId || ""}
                  onChange={(e) => data.setArticleFormData({ ...data.articleFormData, authorId: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {data.authors.map(author => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.articleFormData.featured || false}
                  onChange={(e) => data.setArticleFormData({ ...data.articleFormData, featured: e.target.checked })}
                />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.articleFormData.draft || false}
                  onChange={(e) => data.setArticleFormData({ ...data.articleFormData, draft: e.target.checked })}
                />
                <span>Draft</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <ContentEditor
                value={data.articleFormData.bodyMarkdown || ""}
                onChange={(value) => data.setArticleFormData({ ...data.articleFormData, bodyMarkdown: value })}
              />
            </div>
            <SeoPreview
              title={data.articleFormData.title}
              description={data.articleFormData.description}
              slug={data.articleFormData.slug}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => data.setIsArticleDialogOpen(false)}>Cancel</Button>
            <Button onClick={data.handleSaveArticle}>
              {data.editingArticle ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Author Dialog */}
      <Dialog open={data.isAuthorDialogOpen} onOpenChange={data.setIsAuthorDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{data.editingAuthor ? "Edit Author" : "Add Author"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={data.authorFormData.name || ""}
                onChange={(e) => data.setAuthorFormData({ ...data.authorFormData, name: e.target.value, slug: data.generateSlug(e.target.value) })}
                className={data.authorValidationErrors.name ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={data.authorFormData.title || ""}
                onChange={(e) => data.setAuthorFormData({ ...data.authorFormData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={data.authorFormData.description || ""}
                onChange={(e) => data.setAuthorFormData({ ...data.authorFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input
                value={data.authorFormData.photo || ""}
                onChange={(e) => data.setAuthorFormData({ ...data.authorFormData, photo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => data.setIsAuthorDialogOpen(false)}>Cancel</Button>
            <Button onClick={data.handleSaveAuthor}>
              {data.editingAuthor ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={data.isCategoryDialogOpen} onOpenChange={data.setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{data.editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={data.categoryFormData.name || ""}
                onChange={(e) => data.setCategoryFormData({ ...data.categoryFormData, name: e.target.value, slug: data.generateSlug(e.target.value) })}
                className={data.categoryValidationErrors.name ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={data.categoryFormData.description || ""}
                onChange={(e) => data.setCategoryFormData({ ...data.categoryFormData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input
                  value={data.categoryFormData.icon || ""}
                  onChange={(e) => data.setCategoryFormData({ ...data.categoryFormData, icon: e.target.value })}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Color (hex)</Label>
                <Input
                  type="color"
                  value={data.categoryFormData.color || "#82c3ec"}
                  onChange={(e) => data.setCategoryFormData({ ...data.categoryFormData, color: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => data.setIsCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={data.handleSaveCategory}>
              {data.editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
