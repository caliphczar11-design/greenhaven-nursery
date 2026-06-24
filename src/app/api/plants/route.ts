import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const inStock = searchParams.get('inStock')
    const climate = searchParams.get('climate')
    const indoor = searchParams.get('indoor')
    const sort = searchParams.get('sort')

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { scientificName: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (inStock === 'true') {
      where.inStock = true
    }

    if (climate) {
      where.climate = climate
    }

    if (indoor === 'true') {
      where.indoor = true
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' }

    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
    }

    const plants = await db.plant.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
    })

    return NextResponse.json({ plants })
  } catch (error) {
    console.error('Error fetching plants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plants' },
      { status: 500 }
    )
  }
}