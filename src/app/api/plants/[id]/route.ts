import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Plant ID is required' },
        { status: 400 }
      )
    }

    const plant = await db.plant.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!plant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ plant })
  } catch (error) {
    console.error('Error fetching plant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plant' },
      { status: 500 }
    )
  }
}