import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto'

function getCustomerSession(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)customer_session=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body

  if (action === 'register') {
    return handleRegister(body)
  } else if (action === 'login') {
    return handleLogin(body)
  } else if (action === 'forgot-password') {
    return handleForgotPassword(body)
  } else if (action === 'reset-password') {
    return handleResetPassword(body)
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

async function handleRegister(body: any) {
  const { name, email, phone, password } = body
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }
  try {
    const existing = await db.customer.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    const passwordHash = hashPassword(password)
    const customer = await db.customer.create({
      data: { name, email, phone, passwordHash, authProvider: 'email' },
    })
    return NextResponse.json({ success: true, customer: { id: customer.id, name: customer.name, email: customer.email } })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}

async function handleLogin(body: any) {
  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  try {
    const customer = await db.customer.findUnique({ where: { email } })
    if (!customer || !customer.passwordHash) {
      await new Promise(r => setTimeout(r, 500))
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    const valid = verifyPassword(password, customer.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    const token = randomBytes(48).toString('hex')
    await db.customerSession.create({
      data: { token, customerId: customer.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    })
    const response = NextResponse.json({ success: true, customer: { id: customer.id, name: customer.name, email: customer.email } })
    response.cookies.set('customer_session', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 24 * 60 * 60,
    })
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

async function handleForgotPassword(body: any) {
  const { email } = body
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }
  try {
    const customer = await db.customer.findUnique({ where: { email } })
    if (!customer) {
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent' })
    }
    const resetToken = randomBytes(32).toString('hex')
    await db.customer.update({
      where: { id: customer.id },
      data: { resetToken, resetTokenExpiry: new Date(Date.now() + 3600000) },
    })
    console.log(`Password reset token for ${email}: ${resetToken}`)
    return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

async function handleResetPassword(body: any) {
  const { token, newPassword } = body
  if (!token || !newPassword) {
    return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }
  try {
    const customer = await db.customer.findFirst({ where: { resetToken: token } })
    if (!customer || !customer.resetTokenExpiry || customer.resetTokenExpiry < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
  }
    const passwordHash = hashPassword(newPassword)
    await db.customer.update({
      where: { id: customer.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    })
    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const token = getCustomerSession(request)
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  try {
    const session = await db.customerSession.findUnique({ where: { token }, include: { customer: true } })
    if (!session || session.expiresAt < new Date()) {
      if (session) await db.customerSession.delete({ where: { id: session.id } })
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    await db.customerSession.update({ where: { id: session.id }, data: { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
    return NextResponse.json({
      authenticated: true,
      customer: { id: session.customer.id, name: session.customer.name, email: session.customer.email, phone: session.customer.phone },
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

export async function DELETE(request: NextRequest) {
  const token = getCustomerSession(request)
  if (token) {
    try { await db.customerSession.deleteMany({ where: { token } }) } catch { /* ignore */ }
  }
  const response = NextResponse.json({ success: true })
  response.cookies.set('customer_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 })
  return response
}
