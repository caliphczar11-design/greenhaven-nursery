import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/orders?email=xxx — Get orders by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'email query parameter is required' },
        { status: 400 }
      )
    }

    const orders = await db.order.findMany({
      where: { customerEmail: email },
      include: {
        orderItems: {
          include: { plant: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders — Create order from cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sessionId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      notes,
      paymentMethod,
    } = body

    // Validate required fields
    if (!sessionId || !customerName || !customerEmail || !customerPhone || !address || !city || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, customerName, customerEmail, customerPhone, address, city, paymentMethod' },
        { status: 400 }
      )
    }

    if (!['esewa', 'khalti', 'cod'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'paymentMethod must be one of: esewa, khalti, cod' },
        { status: 400 }
      )
    }

    // Fetch cart items for the session
    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: { plant: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.plant.price * item.quantity,
      0
    )

    // Delivery fee: 0 if subtotal > 2000, else 150
    const deliveryFee = subtotal > 2000 ? 0 : 150
    const total = subtotal + deliveryFee

    // Generate order number
    const orderNumber = `GH-${Date.now()}`

    // Create order with order items in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerEmail,
          customerPhone,
          address,
          city,
          notes: notes || null,
          subtotal,
          deliveryFee,
          total,
          paymentMethod,
          orderItems: {
            create: cartItems.map((item) => ({
              plantId: item.plantId,
              plantName: item.plant.name,
              price: item.plant.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          orderItems: {
            include: { plant: true },
          },
        },
      })

      // Clear cart items for this session
      await tx.cartItem.deleteMany({
        where: { sessionId },
      })

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}