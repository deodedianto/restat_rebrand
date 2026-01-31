import { NextRequest, NextResponse } from 'next/server'
import { createConsultationEvent } from '@/lib/google-calendar/service'
import { supabase } from '@/lib/supabase/client'

interface BookingRequest {
  userId: string
  userName: string
  userEmail: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  notes?: string
}

/**
 * POST /api/calendar/book
 * 
 * Creates a consultation booking in Google Calendar and Supabase
 * Automatically generates Google Meet link and sends invitations
 */
export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json()

    // Validate required fields
    const { userId, userName, userEmail, date, time, notes } = body

    if (!userId || !userName || !userEmail || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName, userEmail, date, time' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM (24-hour format)' },
        { status: 400 }
      )
    }

    // Check if date/time is in the future
    const [hours, minutes] = time.split(':').map(Number)
    const consultationDateTime = new Date(date)
    consultationDateTime.setHours(hours, minutes, 0, 0)
    
    if (consultationDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book consultations in the past' },
        { status: 400 }
      )
    }

    // Create event in Google Calendar
    console.log('[Booking API] Creating calendar event for:', { userName, userEmail, date, time })
    
    const calendarResult = await createConsultationEvent({
      userId,
      userName,
      userEmail,
      date,
      time,
      notes,
      duration: 30,
    })

    if (!calendarResult.success) {
      console.error('[Booking API] Calendar event creation failed:', calendarResult.error)
      return NextResponse.json(
        { 
          error: 'Failed to create calendar event',
          details: calendarResult.error,
          suggestion: 'Please check: 1) Calendar is shared with service account, 2) Service account has "Make changes to events" permission, 3) Environment variables are correct'
        },
        { status: 500 }
      )
    }

    console.log('[Booking API] Calendar event created successfully')

    // Save consultation to Supabase with Meet link
    const { data: consultation, error: supabaseError } = await supabase
      .from('consultations')
      .insert({
        user_id: userId,
        scheduled_date: date,
        scheduled_time: time,
        notes: notes || 'Konsultasi gratis via Google Meet',
        status: 'Dijadwalkan',
        contact_name: userName,
        contact_email: userEmail,
        meet_link: calendarResult.meetLink || null,
      })
      .select()
      .single()

    if (supabaseError) {
      // Calendar event was created but database save failed
      // Log this for manual cleanup if needed
      console.error('Failed to save consultation to database:', supabaseError)
      console.error('Calendar event ID:', calendarResult.event?.id)
      
      return NextResponse.json(
        { 
          error: 'Consultation created in calendar but failed to save to database',
          meetLink: calendarResult.meetLink,
          calendarEventId: calendarResult.event?.id
        },
        { status: 500 }
      )
    }

    // Success - return consultation details with Meet link
    return NextResponse.json(
      {
        success: true,
        consultation: {
          id: consultation.id,
          scheduledDate: date,
          scheduledTime: time,
          meetLink: calendarResult.meetLink,
          status: 'Dijadwalkan',
        },
        message: 'Konsultasi berhasil dijadwalkan! Email undangan telah dikirim.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in booking API:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to book consultation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
