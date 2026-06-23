import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-guard'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const [plants, categories, orders, revenueResult] = await Promise.all([
      db.plant.count(),
      db.category.count(),
      db.order.count(),
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'paid' },
      }),
    ])

    return NextResponse.json({
      plants,
      categories,
      orders,
      revenue: revenueResult._sum.total ?? 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}