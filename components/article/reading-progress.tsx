"use client"

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      // Get the scroll position
      const scrollTop = window.scrollY
      // Get the total scrollable height (document height - viewport height)
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      // Calculate progress percentage
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      
      setProgress(scrollPercent)
    }

    // Update on scroll
    window.addEventListener('scroll', updateProgress)
    // Update on resize (in case content height changes)
    window.addEventListener('resize', updateProgress)
    // Initial calculation
    updateProgress()

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
