import { NextResponse } from 'next/server'
import { getAllAuthors } from '@/lib/authors'

export async function GET() {
  try {
    const authors = getAllAuthors()
    return NextResponse.json(authors)
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json([])
  }
}
