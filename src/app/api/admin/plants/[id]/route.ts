import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const existing = await db.plant.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    const plant = await db.plant.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.scientificName !== undefined && { scientificName: body.scientificName ?? null }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.shortDesc !== undefined && { shortDesc: body.shortDesc ?? null }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.originalPrice !== undefined && { originalPrice: body.originalPrice ?? null }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.galleryImages !== undefined && { galleryImages: body.galleryImages ?? null }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.climate !== undefined && { climate: body.climate }),
        ...(body.elevation !== undefined && { elevation: body.elevation }),
        ...(body.season !== undefined && { season: body.season }),
        ...(body.sunlight !== undefined && { sunlight: body.sunlight }),
        ...(body.waterNeed !== undefined && { waterNeed: body.waterNeed }),
        ...(body.soilType !== undefined && { soilType: body.soilType }),
        ...(body.soilPH !== undefined && { soilPH: body.soilPH ?? null }),
        ...(body.temperature !== undefined && { temperature: body.temperature }),
        ...(body.humidity !== undefined && { humidity: body.humidity ?? null }),
        ...(body.matureHeight !== undefined && { matureHeight: body.matureHeight ?? null }),
        ...(body.spread !== undefined && { spread: body.spread ?? null }),
        ...(body.bloomTime !== undefined && { bloomTime: body.bloomTime ?? null }),
        ...(body.difficulty !== undefined && { difficulty: body.difficulty }),
        ...(body.nutrients !== undefined && { nutrients: body.nutrients }),
        ...(body.fertilizer !== undefined && { fertilizer: body.fertilizer ?? null }),
        ...(body.pruning !== undefined && { pruning: body.pruning ?? null }),
        ...(body.propagation !== undefined && { propagation: body.propagation ?? null }),
        ...(body.companionPlants !== undefined && { companionPlants: body.companionPlants ?? null }),
        ...(body.uses !== undefined && { uses: body.uses }),
        ...(body.medicinalUses !== undefined && { medicinalUses: body.medicinalUses ?? null }),
        ...(body.edible !== undefined && { edible: body.edible }),
        ...(body.indoor !== undefined && { indoor: body.indoor }),
        ...(body.outdoor !== undefined && { outdoor: body.outdoor }),
        ...(body.fragrance !== undefined && { fragrance: body.fragrance }),
        ...(body.airPurifying !== undefined && { airPurifying: body.airPurifying }),
        ...(body.petSafe !== undefined && { petSafe: body.petSafe }),
        ...(body.inStock !== undefined && { inStock: body.inStock }),
        ...(body.stockCount !== undefined && { stockCount: body.stockCount }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.reviewCount !== undefined && { reviewCount: body.reviewCount }),
        ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
        ...(body.tags !== undefined && { tags: body.tags ?? null }),
      },
      include: { category: true },
    })

    return NextResponse.json({ plant })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }
    console.error('Error updating plant:', error)
    return NextResponse.json(
      { error: 'Failed to update plant' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const existing = await db.plant.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    await db.plant.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Plant deleted successfully' })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }
    console.error('Error deleting plant:', error)
    return NextResponse.json(
      { error: 'Failed to delete plant' },
      { status: 500 }
    )
  }
}