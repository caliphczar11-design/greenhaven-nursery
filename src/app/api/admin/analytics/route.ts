import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-guard'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    // ========== INVENTORY OVERVIEW ==========
    const [
      totalPlants,
      totalStockResult,
      totalDamagedResult,
      outOfStockCount,
      lowStockCount,
      inventoryValueResult,
    ] = await Promise.all([
      db.plant.count(),
      db.plant.aggregate({ _sum: { stockCount: true } }),
      db.plant.aggregate({ _sum: { damagedCount: true } }),
      db.plant.count({ where: { inStock: false } }),
      db.plant.count({ where: { stockCount: { lt: 10, gt: 0 } } }),
      db.plant.aggregate({ _sum: { stockCount: true }, where: { inStock: true } }),
    ])

    // ========== REVENUE OVERVIEW ==========
    const [
      totalRevenueResult,
      paidRevenueResult,
      pendingRevenueResult,
      totalOrders,
      paidOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      db.order.aggregate({ _sum: { total: true } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'pending' } }),
      db.order.count(),
      db.order.count({ where: { paymentStatus: 'paid' } }),
      db.order.count({ where: { orderStatus: 'delivered' } }),
      db.order.count({ where: { orderStatus: 'cancelled' } }),
    ])

    // ========== CATEGORY-LEVEL ANALYTICS ==========
    const categories = await db.category.findMany({
      include: {
        _count: { select: { plants: true } },
        plants: {
          select: {
            id: true,
            name: true,
            price: true,
            stockCount: true,
            damagedCount: true,
            inStock: true,
            orderItems: {
              select: { quantity: true, price: true, order: { select: { orderStatus: true, paymentStatus: true } } },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    const categoryAnalytics = categories.map((cat) => {
      const totalStock = cat.plants.reduce((sum, p) => sum + p.stockCount, 0)
      const totalDamaged = cat.plants.reduce((sum, p) => sum + (p.damagedCount || 0), 0)
      const inStockCount = cat.plants.filter((p) => p.inStock).length
      const outOfStockCount = cat.plants.filter((p) => !p.inStock).length

      // Sales calculations
      const orderItems = cat.plants.flatMap((p) => p.orderItems)
      const totalSold = orderItems.reduce((sum, oi) => sum + oi.quantity, 0)
      const revenue = orderItems.reduce((sum, oi) => sum + oi.price * oi.quantity, 0)
      const paidRevenue = orderItems
        .filter((oi) => oi.order?.paymentStatus === 'paid')
        .reduce((sum, oi) => sum + oi.price * oi.quantity, 0)
      const avgOrderValue = totalSold > 0 ? revenue / totalSold : 0

      // Inventory value = stock * price for in-stock items
      const inventoryValue = cat.plants
        .filter((p) => p.inStock)
        .reduce((sum, p) => sum + p.stockCount * p.price, 0)

      // Top selling plant in this category
      const plantSales = cat.plants.map((p) => ({
        id: p.id,
        name: p.name,
        totalSold: p.orderItems.reduce((s, oi) => s + oi.quantity, 0),
        revenue: p.orderItems.reduce((s, oi) => s + oi.price * oi.quantity, 0),
      })).sort((a, b) => b.totalSold - a.totalSold)

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        plantCount: cat._count.plants,
        inStockCount,
        outOfStockCount,
        totalStock,
        totalDamaged,
        totalSold,
        revenue,
        paidRevenue,
        avgOrderValue: Math.round(avgOrderValue),
        inventoryValue,
        topPlant: plantSales[0] || null,
        allPlantSales: plantSales,
      }
    })

    // ========== TOP SELLING PLANTS (overall) ==========
    const allPlantsWithSales = await db.plant.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stockCount: true,
        damagedCount: true,
        inStock: true,
        category: { select: { name: true } },
        orderItems: {
          select: { quantity: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const topSellingPlants = allPlantsWithSales
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stockCount: p.stockCount,
        damagedCount: p.damagedCount,
        inStock: p.inStock,
        category: p.category.name,
        totalSold: p.orderItems.reduce((s, oi) => s + oi.quantity, 0),
        revenue: p.orderItems.reduce((s, oi) => s + oi.price * oi.quantity, 0),
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10)

    // ========== PAYMENT METHOD BREAKDOWN ==========
    const paymentMethods = await db.order.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      _sum: { total: true },
    })

    const paymentBreakdown = paymentMethods.map((pm) => ({
      method: pm.paymentMethod,
      count: pm._count.id,
      total: pm._sum.total ?? 0,
    }))

    // ========== ORDER STATUS BREAKDOWN ==========
    const orderStatuses = await db.order.groupBy({
      by: ['orderStatus'],
      _count: { id: true },
      _sum: { total: true },
    })

    const statusBreakdown = orderStatuses.map((os) => ({
      status: os.orderStatus,
      count: os._count.id,
      total: os._sum.total ?? 0,
    }))

    // ========== STOCK HEALTH DISTRIBUTION ==========
    const healthyStock = await db.plant.count({ where: { stockCount: { gte: 50 } } })
    const moderateStock = await db.plant.count({ where: { stockCount: { gte: 10, lt: 50 } } })
    const lowStock = lowStockCount
    const outOfStock = outOfStockCount

    // ========== REVENUE BY CATEGORY (sorted) ==========
    const revenueByCategory = [...categoryAnalytics]
      .sort((a, b) => b.paidRevenue - a.paidRevenue)

    return NextResponse.json({
      inventory: {
        totalPlants,
        totalStock: totalStockResult._sum.stockCount ?? 0,
        totalDamaged: totalDamagedResult._sum.damagedCount ?? 0,
        outOfStockCount,
        lowStockCount,
        availableStock: totalStockResult._sum.stockCount ?? 0,
      },
      revenue: {
        total: totalRevenueResult._sum.total ?? 0,
        paid: paidRevenueResult._sum.total ?? 0,
        pending: pendingRevenueResult._sum.total ?? 0,
        totalOrders,
        paidOrders,
        deliveredOrders,
        cancelledOrders,
        avgOrderValue: totalOrders > 0 ? ((totalRevenueResult._sum.total ?? 0) / totalOrders) : 0,
      },
      categories: categoryAnalytics,
      revenueByCategory,
      topSellingPlants,
      paymentBreakdown,
      statusBreakdown,
      stockHealth: {
        healthy: healthyStock,
        moderate: moderateStock,
        low: lowStock,
        outOfStock,
        total: totalPlants,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}