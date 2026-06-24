import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }
    console.log(`📧 Contact form: from ${name} (${email}): ${message}`)
    return NextResponse.json({ success: true, message: 'Message sent successfully! We will get back to you soon.' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
