import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-guard'

type RouteContext = {
  params: Promise<{ id: string }>
}

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const { id } = await context.params
    const body = await request.json()

    if (!body.orderStatus || !VALID_STATUSES.includes(body.orderStatus)) {
      return NextResponse.json(
        { error: `Invalid order status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const existing = await db.order.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = await db.order.update({
      where: { id },
      data: { orderStatus: body.orderStatus },
      include: { orderItems: true },
    })

    return NextResponse.json({ order })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    console.error('Order update error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}