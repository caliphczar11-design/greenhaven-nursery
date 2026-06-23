import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/cart?sessionId=xxx — Get cart items by sessionId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId query parameter is required' },
        { status: 400 }
      )
    }

    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: { plant: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart items' },
      { status: 500 }
    )
  }
}

// POST /api/cart — Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, plantId, quantity } = body

    if (!sessionId || !plantId) {
      return NextResponse.json(
        { error: 'sessionId and plantId are required' },
        { status: 400 }
      )
    }

    const parsedQuantity = typeof quantity === 'number' && quantity > 0 ? quantity : 1

    // Check if plant exists
    const plant = await db.plant.findUnique({ where: { id: plantId } })
    if (!plant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      )
    }

    // Upsert: if same plant+session exists, increment quantity
    const existingItem = await db.cartItem.findFirst({
      where: { sessionId, plantId },
    })

    if (existingItem) {
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parsedQuantity },
        include: { plant: true },
      })
      return NextResponse.json(updated, { status: 200 })
    }

    const cartItem = await db.cartItem.create({
      data: {
        sessionId,
        plantId,
        quantity: parsedQuantity,
      },
      include: { plant: true },
    })

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

// PUT /api/cart — Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, quantity } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Cart item id is required' },
        { status: 400 }
      )
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'quantity must be a non-negative number' },
        { status: 400 }
      )
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await db.cartItem.delete({ where: { id } })
      return NextResponse.json({ message: 'Item removed' })
    }

    const updated = await db.cartItem.update({
      where: { id },
      data: { quantity },
      include: { plant: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart?id=xxx or /api/cart?sessionId=xxx — Remove item or clear session cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const sessionId = searchParams.get('sessionId')

    if (id) {
      await db.cartItem.delete({ where: { id } })
      return NextResponse.json({ message: 'Cart item removed' })
    }

    if (sessionId) {
      const result = await db.cartItem.deleteMany({ where: { sessionId } })
      return NextResponse.json({
        message: 'All cart items cleared for session',
        count: result.count,
      })
    }

    return NextResponse.json(
      { error: 'Either id or sessionId query parameter is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error deleting cart item:', error)
    return NextResponse.json(
      { error: 'Failed to delete cart item(s)' },
      { status: 500 }
    )
  }
}