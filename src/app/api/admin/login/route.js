import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const attempts = new Map() // ip → { count, resetAt }

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const now = Date.now()
  const record = attempts.get(ip)

  if (record && now < record.resetAt && record.count >= 5) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many attempts' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    const current = record && now < record.resetAt ? record : { count: 0, resetAt: now + 15 * 60 * 1000 }
    attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt })
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  attempts.delete(ip)
  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}