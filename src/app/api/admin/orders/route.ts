import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-guard'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) {
      where.orderStatus = status
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            plant: { select: { name: true, imageUrl: true } },
          },
        },
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}