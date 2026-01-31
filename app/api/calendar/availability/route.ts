import { NextRequest, NextResponse } from 'next/server'
import { getAvailableTimeSlots } from '@/lib/google-calendar/service'

/**
 * GET /api/calendar/availability
 * 
 * Query parameters:
 * - date: YYYY-MM-DD format (required)
 * 
 * Returns available time slots (08:00-22:00 WIB) for the specified date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')

    // Validate date parameter
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required (format: YYYY-MM-DD)' },
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

    // Check if date is in the past
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Cannot check availability for past dates' },
        { status: 400 }
      )
    }

    // Fetch availability from Google Calendar
    const availability = await getAvailableTimeSlots(date)

    return NextResponse.json(availability, { status: 200 })
  } catch (error) {
    console.error('Error in availability API:', error)
    
    // Return generic error to client
    return NextResponse.json(
      { 
        error: 'Failed to fetch calendar availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
