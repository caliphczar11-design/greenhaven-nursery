import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-guard'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const body = await request.json()

    if (!body.name || !body.description || !body.imageUrl || !body.categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, imageUrl, categoryId' },
        { status: 400 }
      )
    }

    const count = await db.plant.count()
    const slug = slugify(body.name)

    const plant = await db.plant.create({
      data: {
        name: body.name,
        slug,
        scientificName: body.scientificName ?? null,
        description: body.description,
        shortDesc: body.shortDesc ?? null,
        price: body.price,
        originalPrice: body.originalPrice ?? null,
        imageUrl: body.imageUrl,
        galleryImages: body.galleryImages ?? null,
        categoryId: body.categoryId,
        climate: body.climate,
        elevation: body.elevation,
        season: body.season,
        sunlight: body.sunlight,
        waterNeed: body.waterNeed,
        soilType: body.soilType,
        soilPH: body.soilPH ?? null,
        temperature: body.temperature,
        humidity: body.humidity ?? null,
        matureHeight: body.matureHeight ?? null,
        spread: body.spread ?? null,
        bloomTime: body.bloomTime ?? null,
        difficulty: body.difficulty,
        nutrients: body.nutrients,
        fertilizer: body.fertilizer ?? null,
        pruning: body.pruning ?? null,
        propagation: body.propagation ?? null,
        companionPlants: body.companionPlants ?? null,
        uses: body.uses,
        medicinalUses: body.medicinalUses ?? null,
        edible: body.edible ?? false,
        indoor: body.indoor ?? false,
        outdoor: body.outdoor ?? true,
        fragrance: body.fragrance ?? false,
        airPurifying: body.airPurifying ?? false,
        petSafe: body.petSafe ?? true,
        inStock: body.inStock ?? true,
        stockCount: body.stockCount ?? 50,
        featured: body.featured ?? false,
        displayOrder: count,
        tags: body.tags ?? null,
      },
      include: { category: true },
    })

    return NextResponse.json({ plant }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'A plant with this slug already exists' },
        { status: 409 }
      )
    }
    console.error('Error creating plant:', error)
    return NextResponse.json(
      { error: 'Failed to create plant' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const body = await request.json()

    if (!body.orders || !Array.isArray(body.orders)) {
      return NextResponse.json(
        { error: 'Request body must contain an orders array' },
        { status: 400 }
      )
    }

    const updates = body.orders.map(
      (item: { id: string; displayOrder: number }) =>
        db.plant.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering plants:', error)
    return NextResponse.json(
      { error: 'Failed to reorder plants' },
      { status: 500 }
    )
  }
}