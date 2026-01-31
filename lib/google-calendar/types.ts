/**
 * Type definitions for Google Calendar integration
 */

export interface TimeSlot {
  time: string // Format: "HH:MM" (e.g., "09:00")
  available: boolean
  label?: string // Display label with timezone
}

export interface ConsultationEventData {
  userId: string
  userName: string
  userEmail: string
  date: string // Format: "YYYY-MM-DD"
  time: string // Format: "HH:MM"
  notes?: string
  duration?: number // Duration in minutes, default 30
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  meetLink?: string
  attendees?: Array<{
    email: string
    responseStatus?: string
  }>
}

export interface AvailabilityResponse {
  date: string
  timezone: string
  slots: TimeSlot[]
  totalAvailable: number
}

export interface BookingResponse {
  success: boolean
  event?: CalendarEvent
  meetLink?: string
  error?: string
}
