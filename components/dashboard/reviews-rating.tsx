"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { MessageSquare, ChevronDown, ChevronUp, Star, Pencil } from "lucide-react"

interface Review {
  orderId: string
  rating: number
  comment: string
  submitted: boolean
}

interface ReviewsRatingProps {
  orders?: Array<{ id: string; title: string }>
  onSubmitReview?: (orderId: string, rating: number, comment: string) => Promise<void>
  onSubmitFeedback?: (rating: number, comment: string) => Promise<void>
}

export function ReviewsRating({ orders = [], onSubmitReview, onSubmitFeedback }: ReviewsRatingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reviews, setReviews] = useState<Record<string, Review>>({})
  const [submittingReview, setSubmittingReview] = useState<string | null>(null)
  
  // General feedback state
  const [generalRating, setGeneralRating] = useState(0)
  const [generalComment, setGeneralComment] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [isEditingFeedback, setIsEditingFeedback] = useState(false)
  const [submittedFeedback, setSubmittedFeedback] = useState<{ rating: number; comment: string } | null>(null)

  const handleRatingChange = (orderId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        orderId,
        rating,
        comment: prev[orderId]?.comment || "",
        submitted: false,
      },
    }))
  }

  const handleCommentChange = (orderId: string, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        orderId,
        rating: prev[orderId]?.rating || 0,
        comment,
        submitted: false,
      },
    }))
  }

  const handleSubmitReview = async (orderId: string) => {
    const review = reviews[orderId]
    if (!review || review.rating === 0) {
      alert("Mohon berikan rating terlebih dahulu")
      return
    }

    setSubmittingReview(orderId)
    try {
      if (onSubmitReview) {
        await onSubmitReview(orderId, review.rating, review.comment)
      }
      setReviews((prev) => ({
        ...prev,
        [orderId]: { ...review, submitted: true },
      }))
    } catch (error) {
      console.error("Failed to submit review:", error)
      alert("Gagal mengirim ulasan")
    } finally {
      setSubmittingReview(null)
    }
  }

  const handleSubmitFeedback = async () => {
    if (generalRating === 0) {
      setFeedbackMessage({ type: "error", text: "Mohon berikan rating terlebih dahulu" })
      return
    }

    setIsSubmittingFeedback(true)
    setFeedbackMessage(null)

    try {
      if (onSubmitFeedback) {
        await onSubmitFeedback(generalRating, generalComment)
      }
      // Save submitted feedback and hide form
      setSubmittedFeedback({ rating: generalRating, comment: generalComment })
      setFeedbackSubmitted(true)
      setIsEditingFeedback(false)
      setFeedbackMessage({ type: "success", text: "Terima kasih atas feedback Anda!" })
    } catch (error) {
      setFeedbackMessage({ type: "error", text: "Gagal mengirim feedback" })
    } finally {
      setIsSubmittingFeedback(false)
      setTimeout(() => setFeedbackMessage(null), 3000)
    }
  }

  const handleEditFeedback = () => {
    if (submittedFeedback) {
      setGeneralRating(submittedFeedback.rating)
      setGeneralComment(submittedFeedback.comment)
    }
    setIsEditingFeedback(true)
    setFeedbackSubmitted(false)
  }

  const StarRating = ({ rating, onChange }: { rating: number; onChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6 sm:mb-8">
      <Card className="border-0 shadow-sm bg-white p-0">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors py-3 sm:py-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                <div>
                  <CardTitle className="text-sm sm:text-base text-slate-800 leading-tight mb-0.5">Ulasan & Rating</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">Berikan feedback untuk layanan kami</CardDescription>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 sm:space-y-6 py-4 sm:py-6 px-4 sm:px-6">
            {/* Order Reviews */}
            {orders.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs sm:text-sm font-medium text-slate-800">Ulasan untuk Pesanan</h4>
                {orders.map((order) => {
                  const review = reviews[order.id]
                  const isSubmitted = review?.submitted

                  return (
                    <Card key={order.id} className="border border-slate-200 shadow-none">
                      <CardContent className="p-3 sm:p-4 space-y-3">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-800">{order.title}</p>
                          <p className="text-[10px] sm:text-xs text-slate-600">Order ID: {order.id}</p>
                        </div>

                        {!isSubmitted ? (
                          <>
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm text-slate-700">Rating:</p>
                              <StarRating
                                rating={review?.rating || 0}
                                onChange={(rating) => handleRatingChange(order.id, rating)}
                              />
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm text-slate-700">Komentar (opsional):</p>
                              <Textarea
                                value={review?.comment || ""}
                                onChange={(e) => handleCommentChange(order.id, e.target.value)}
                                placeholder="Bagaimana pengalaman Anda?"
                                rows={3}
                                className="text-xs sm:text-sm"
                              />
                            </div>

                            <Button
                              onClick={() => handleSubmitReview(order.id)}
                              disabled={submittingReview === order.id || !review?.rating}
                              className="w-full sm:w-auto text-xs sm:text-sm"
                            >
                              {submittingReview === order.id ? "Mengirim..." : "Kirim Ulasan"}
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <Star className="w-4 h-4 fill-green-600" />
                            <span className="text-xs sm:text-sm font-medium">Ulasan Terkirim - Terima kasih!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* General Feedback */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xs sm:text-sm font-medium text-slate-800">Feedback Umum</h4>
              
              {feedbackSubmitted && submittedFeedback ? (
                // Show submitted feedback with edit button
                <Card className="border border-slate-200 shadow-none">
                  <CardContent className="p-3 sm:p-4 space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-slate-700">Rating Keseluruhan:</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 sm:w-6 sm:h-6 ${
                              star <= submittedFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-slate-700">Feedback:</p>
                      <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-line">
                        {submittedFeedback.comment || "Tidak ada komentar"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-600">
                        <Star className="w-4 h-4 fill-green-600" />
                        <span className="text-xs sm:text-sm font-medium">Feedback Terkirim</span>
                      </div>
                      <Button
                        onClick={handleEditFeedback}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm gap-2"
                      >
                        <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Show feedback form
                <>
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-slate-700">Rating Keseluruhan:</p>
                    <StarRating rating={generalRating} onChange={setGeneralRating} />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-slate-700">Feedback:</p>
                    <Textarea
                      value={generalComment}
                      onChange={(e) => setGeneralComment(e.target.value)}
                      placeholder="Bagaimana pengalaman Anda dengan layanan kami secara keseluruhan?"
                      rows={4}
                      className="text-xs sm:text-sm"
                    />
                  </div>

                  {feedbackMessage && (
                    <div
                      className={`p-3 rounded-lg text-xs sm:text-sm ${
                        feedbackMessage.type === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {feedbackMessage.text}
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmittingFeedback || generalRating === 0}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    {isSubmittingFeedback ? "Mengirim..." : isEditingFeedback ? "Update Feedback" : "Kirim Feedback"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
