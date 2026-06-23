import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-guard'

const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: "GreenHaven Nursery",
  heroTitle: "Bring Nature\nHome With\nEvery Plant",
  heroSubtitle: "Discover handpicked plants perfect for Nepal's diverse climate. From vibrant flowers to healing herbs — grow with expert guidance.",
  heroBadge: "Premium Nursery — Nepal's Finest",
  footerDescription: "Nepal's premium online nursery. Handpicked plants matched to your climate, delivered with care to your doorstep.",
  footerAddress: "Balaju, Kathmandu, Nepal",
  footerPhone: "+977 98XXXXXXXX",
  footerEmail: "hello@greenhaven.com.np",
  primaryColor: "oklch(0.32 0.12 155)",
  goldColor: "oklch(0.72 0.13 80)",
  freeDeliveryThreshold: "2000",
  deliveryFee: "150",
}

async function ensureDefaultSettings() {
  const count = await db.siteSetting.count()
  if (count === 0) {
    await db.siteSetting.createMany({
      data: Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value })),
    })
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    await ensureDefaultSettings()

    const settings = await db.siteSetting.findMany()
    const flat: Record<string, string> = {}
    for (const s of settings) {
      flat[s.key] = s.value
    }

    return NextResponse.json(flat)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const body = await request.json()

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be a flat object of key-value pairs' },
        { status: 400 }
      )
    }

    const updates = Object.entries(body).map(
      ([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
    )

    await Promise.all(updates)

    const allSettings = await db.siteSetting.findMany()
    const flat: Record<string, string> = {}
    for (const s of allSettings) {
      flat[s.key] = s.value
    }

    return NextResponse.json(flat)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}