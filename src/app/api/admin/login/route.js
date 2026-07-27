import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const attempts = new Map() // ip → { count, resetAt }

// Timing-safe string comparison to prevent timing attacks
function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  
  const aBuffer = Buffer.from(a, 'utf8')
  const bBuffer = Buffer.from(b, 'utf8')
  
  // Ensure both buffers are the same length to prevent timing leaks
  if (aBuffer.length !== bBuffer.length) {
    // Perform a dummy comparison to maintain constant time
    crypto.timingSafeEqual(
      Buffer.alloc(32, 0),
      Buffer.alloc(32, 0)
    )
    return false
  }
  
  return crypto.timingSafeEqual(aBuffer, bBuffer)
}

// Cleanup old entries periodically to prevent memory leaks
function cleanupAttempts() {
  const now = Date.now()
  for (const [ip, record] of attempts.entries()) {
    if (now > record.resetAt) {
      attempts.delete(ip)
    }
  }
}

export async function POST(req) {
  try {
    // Get real IP address, considering various proxy headers
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || req.ip || 'unknown'
    
    const now = Date.now()
    const record = attempts.get(ip)

    // Rate limiting check
    if (record && now < record.resetAt && record.count >= 5) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000)
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    // Validate request body
    const body = await req.json().catch(() => ({}))
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Check password length to prevent huge payloads
    if (password.length > 1000) {
      return NextResponse.json(
        { error: 'Invalid password format' },
        { status: 400 }
      )
    }

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD is not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Use timing-safe comparison to prevent timing attacks
    if (!timingSafeCompare(password, adminPassword)) {
      const current = record && now < record.resetAt 
        ? record 
        : { count: 0, resetAt: now + 15 * 60 * 1000 }
      attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt })
      
      // Generic error message to prevent username enumeration
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Successful login - clear attempts and set session
    attempts.delete(ip)
    cleanupAttempts() // Periodic cleanup
    
    // Generate secure session token derived from admin password (HMAC)
    const sessionToken = crypto.createHmac('sha256', process.env.ADMIN_PASSWORD).update('admin_session_salt').digest('hex')
    
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day instead of 7 for better security
      path: '/',
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        error: 'An error occurred during login',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}