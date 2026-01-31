import { google } from 'googleapis'
import type {
  TimeSlot,
  ConsultationEventData,
  CalendarEvent,
  AvailabilityResponse,
  BookingResponse,
} from './types'

const TIMEZONE = 'Asia/Jakarta' // WIB
const BUSINESS_HOURS_START = 8 // 08:00
const BUSINESS_HOURS_END = 22 // 22:00 (last slot is 21:30-22:00)
const SLOT_DURATION = 30 // minutes

/**
 * Initialize Google Calendar client with service account authentication
 */
function getCalendarClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  const projectId = process.env.GOOGLE_PROJECT_ID

  if (!clientEmail || !privateKey || !projectId) {
    throw new Error('Missing Google Calendar credentials in environment variables')
  }

  // Create JWT client for service account authentication
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  return google.calendar({ version: 'v3', auth })
}

/**
 * Get the admin calendar ID (email)
 */
function getAdminCalendarId(): string {
  const calendarId = process.env.ADMIN_CALENDAR_EMAIL
  if (!calendarId) {
    throw new Error('ADMIN_CALENDAR_EMAIL not configured')
  }
  return calendarId
}

/**
 * Generate time slots for a given date
 */
function generateTimeSlots(date: string): TimeSlot[] {
  const slots: TimeSlot[] = []
  
  for (let hour = BUSINESS_HOURS_START; hour < BUSINESS_HOURS_END; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push({
        time,
        available: true,
        label: `${time} WIB`,
      })
    }
  }
  
  return slots
}

/**
 * Check if a time slot overlaps with a busy period
 */
function isSlotBusy(
  slotStart: Date,
  slotEnd: Date,
  busyPeriods: Array<{ start: Date; end: Date }>
): boolean {
  return busyPeriods.some((busy) => {
    // Check if slot overlaps with busy period
    return slotStart < busy.end && slotEnd > busy.start
  })
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailableTimeSlots(date: string): Promise<AvailabilityResponse> {
  try {
    const calendar = getCalendarClient()
    const calendarId = getAdminCalendarId()

    // Parse the date and set timezone
    const dateObj = new Date(`${date}T00:00:00`)
    const timeMin = new Date(dateObj)
    timeMin.setHours(BUSINESS_HOURS_START, 0, 0, 0)
    
    const timeMax = new Date(dateObj)
    timeMax.setHours(BUSINESS_HOURS_END, 0, 0, 0)

    // Query calendar for busy times
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: TIMEZONE,
        items: [{ id: calendarId }],
      },
    })

    const busyPeriods = (response.data.calendars?.[calendarId]?.busy || []).map((busy) => ({
      start: new Date(busy.start!),
      end: new Date(busy.end!),
    }))

    // Generate all possible slots
    const allSlots = generateTimeSlots(date)

    // Mark slots as unavailable if they overlap with busy periods
    const slots = allSlots.map((slot) => {
      const [hours, minutes] = slot.time.split(':').map(Number)
      const slotStart = new Date(dateObj)
      slotStart.setHours(hours, minutes, 0, 0)
      
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + SLOT_DURATION)

      const isBusy = isSlotBusy(slotStart, slotEnd, busyPeriods)

      return {
        ...slot,
        available: !isBusy,
      }
    })

    const totalAvailable = slots.filter((s) => s.available).length

    return {
      date,
      timezone: TIMEZONE,
      slots,
      totalAvailable,
    }
  } catch (error) {
    console.error('Error fetching calendar availability:', error)
    throw new Error('Failed to fetch calendar availability')
  }
}

/**
 * Create a consultation event in Google Calendar with Meet link
 */
export async function createConsultationEvent(
  data: ConsultationEventData
): Promise<BookingResponse> {
  try {
    console.log('[Google Calendar] Creating consultation event:', {
      userName: data.userName,
      userEmail: data.userEmail,
      date: data.date,
      time: data.time,
    })

    const calendar = getCalendarClient()
    const calendarId = getAdminCalendarId()

    console.log('[Google Calendar] Using calendar ID:', calendarId)

    const { userId, userName, userEmail, date, time, notes, duration = 30 } = data

    // Parse date and time
    const [hours, minutes] = time.split(':').map(Number)
    const startDateTime = new Date(`${date}T${time}:00`)
    
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + duration)

    console.log('[Google Calendar] Event time:', {
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      timezone: TIMEZONE,
    })

    // Create event with Google Meet conference
    const event = {
      summary: `Konsultasi Gratis - ${userName}`,
      description: notes
        ? `Catatan dari ${userName}:\n\n${notes}\n\n---\nUser ID: ${userId}`
        : `Konsultasi gratis dengan ${userName}\n\nUser ID: ${userId}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: TIMEZONE,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: TIMEZONE,
      },
      attendees: [
        { email: userEmail },
        { email: getAdminCalendarId() },
      ],
      conferenceData: {
        createRequest: {
          requestId: `${userId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'email', minutes: 60 }, // 1 hour before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
      sendUpdates: 'all', // Send email invitations to all attendees
    }

    console.log('[Google Calendar] Attempting to create event...')

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: 1, // Required for Google Meet
      sendUpdates: 'all', // Send invitations
    })

    console.log('[Google Calendar] Event created successfully:', response.data.id)

    const createdEvent = response.data
    const meetLink = createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri

    console.log('[Google Calendar] Meet link:', meetLink || 'No Meet link generated')

    return {
      success: true,
      event: {
        id: createdEvent.id!,
        summary: createdEvent.summary!,
        description: createdEvent.description,
        start: {
          dateTime: createdEvent.start?.dateTime!,
          timeZone: createdEvent.start?.timeZone!,
        },
        end: {
          dateTime: createdEvent.end?.dateTime!,
          timeZone: createdEvent.end?.timeZone!,
        },
        meetLink,
        attendees: createdEvent.attendees,
      },
      meetLink,
    }
  } catch (error: any) {
    console.error('[Google Calendar] Error creating consultation event:', {
      message: error.message,
      code: error.code,
      errors: error.errors,
      response: error.response?.data,
    })
    
    let errorMessage = 'Failed to create consultation event'
    
    // Provide specific error messages
    if (error.code === 403) {
      errorMessage = 'Permission denied: Calendar not shared with service account or insufficient permissions'
    } else if (error.code === 404) {
      errorMessage = 'Calendar not found: Please verify ADMIN_CALENDAR_EMAIL is correct'
    } else if (error.code === 401) {
      errorMessage = 'Authentication failed: Please check Google service account credentials'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Cancel/delete a consultation event
 */
export async function cancelConsultationEvent(eventId: string): Promise<boolean> {
  try {
    const calendar = getCalendarClient()
    const calendarId = getAdminCalendarId()

    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all', // Notify all attendees
    })

    return true
  } catch (error) {
    console.error('Error canceling consultation event:', error)
    return false
  }
}

/**
 * Update a consultation event
 */
export async function updateConsultationEvent(
  eventId: string,
  updates: Partial<ConsultationEventData>
): Promise<BookingResponse> {
  try {
    const calendar = getCalendarClient()
    const calendarId = getAdminCalendarId()

    // Get existing event
    const existingEvent = await calendar.events.get({
      calendarId,
      eventId,
    })

    // Prepare updates
    const updatedEvent: any = {
      ...existingEvent.data,
    }

    if (updates.userName) {
      updatedEvent.summary = `Konsultasi Gratis - ${updates.userName}`
    }

    if (updates.notes) {
      updatedEvent.description = `Catatan dari ${updates.userName || 'User'}:\n\n${updates.notes}`
    }

    if (updates.date && updates.time) {
      const [hours, minutes] = updates.time.split(':').map(Number)
      const startDateTime = new Date(`${updates.date}T${updates.time}:00`)
      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + (updates.duration || 30))

      updatedEvent.start = {
        dateTime: startDateTime.toISOString(),
        timeZone: TIMEZONE,
      }
      updatedEvent.end = {
        dateTime: endDateTime.toISOString(),
        timeZone: TIMEZONE,
      }
    }

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: updatedEvent,
      sendUpdates: 'all',
    })

    const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri

    return {
      success: true,
      meetLink,
    }
  } catch (error) {
    console.error('Error updating consultation event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update consultation event',
    }
  }
}
