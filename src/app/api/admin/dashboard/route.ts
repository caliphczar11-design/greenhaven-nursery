import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-guard'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    // Quick stats
    const [totalProducts, totalStockResult, revenueResult, pendingOrders, lowStockCount] = await Promise.all([
      db.plant.count(),
      db.plant.aggregate({ _sum: { stockCount: true } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
      db.order.count({ where: { orderStatus: 'pending' } }),
      db.plant.count({ where: { stockCount: { lt: 10 } } }),
    ])

    // Category-level stats
    const categories = await db.category.findMany({
      include: {
        _count: { select: { plants: true } },
        plants: {
          select: { id: true, stockCount: true, price: true, orderItems: { select: { quantity: true, price: true } } },
        },
      },
      orderBy: { order: 'asc' },
    })

    const categoryStats = categories.map((cat) => {
      const totalStock = cat.plants.reduce((sum, p) => sum + p.stockCount, 0)
      const totalSold = cat.plants.reduce((sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.quantity, 0), 0)
      const revenue = cat.plants.reduce((sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.price * oi.quantity, 0), 0)
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        plantCount: cat._count.plants,
        totalStock,
        totalSold,
        revenue,
      }
    })

    // Low stock plants
    const lowStockPlants = await db.plant.findMany({
      where: { stockCount: { lt: 10 } },
      select: {
        id: true,
        name: true,
        price: true,
        stockCount: true,
        inStock: true,
        category: { select: { name: true } },
      },
      orderBy: { stockCount: 'asc' },
    })

    // Recent orders for dashboard
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        orderStatus: true,
        createdAt: true,
        _count: { select: { orderItems: true } },
      },
    })

    return NextResponse.json({
      quickStats: {
        totalProducts,
        totalStock: totalStockResult._sum.stockCount ?? 0,
        totalRevenue: revenueResult._sum.total ?? 0,
        pendingOrders,
        lowStockCount,
      },
      categories: categoryStats,
      lowStockPlants: lowStockPlants.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stockCount: p.stockCount,
        inStock: p.inStock,
        category: p.category.name,
      })),
      recentOrders: recentOrders.map((o) => ({
        ...o,
        itemCount: o._count.orderItems,
      })),
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}