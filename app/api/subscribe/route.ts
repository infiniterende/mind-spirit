import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check for existing subscriber
    const existing = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ message: 'You\'re already subscribed — thank you.' }, { status: 200 })
      }
      // Reactivate
      await prisma.subscriber.update({
        where: { email: normalizedEmail },
        data: { active: true, name: name?.trim() || existing.name },
      })
      return NextResponse.json({ message: 'Welcome back. You\'re resubscribed.' }, { status: 200 })
    }

    await prisma.subscriber.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        active: true,
      },
    })

    return NextResponse.json({ message: 'You\'re subscribed. Welcome.' }, { status: 201 })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
