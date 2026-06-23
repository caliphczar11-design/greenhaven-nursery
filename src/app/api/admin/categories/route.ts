import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-guard'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const slug = slugify(body.name)

    const category = await db.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description ?? null,
        icon: body.icon ?? null,
        order: body.order ?? 0,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 409 }
      )
    }
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (!auth.authorized) return auth

  try {
    const body = await request.json()

    if (!body.orders || !Array.isArray(body.orders)) {
      return NextResponse.json(
        { error: 'Request body must contain an orders array' },
        { status: 400 }
      )
    }

    const updates = body.orders.map(
      (item: { id: string; order: number }) =>
        db.category.update({
          where: { id: item.id },
          data: { order: item.order },
        })
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering categories:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}