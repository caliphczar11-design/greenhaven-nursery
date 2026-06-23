import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-guard'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const { id } = await context.params
    const body = await request.json()

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description ?? null }),
        ...(body.icon !== undefined && { icon: body.icon ?? null }),
        ...(body.order !== undefined && { order: body.order }),
      },
    })

    return NextResponse.json({ category })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const { id } = await context.params

    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { plants: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (existing._count.plants > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with linked plants. Remove or reassign plants first.' },
        { status: 400 }
      )
    }

    await db.category.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}