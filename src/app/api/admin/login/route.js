import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Rate limit sederhana in-memory: max 5 percobaan gagal per IP / 15 menit.
// Cukup untuk single-instance; untuk multi-instance gunakan store eksternal (mis. Upstash).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map(); // ip -> { count, resetAt }

function checkLimit(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return { limited: false };
  }
  if (rec.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  }
  return { limited: false };
}

function recordFailure(ip) {
  const rec = attempts.get(ip);
  if (rec) rec.count += 1;
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

  const { limited, retryAfter } = checkLimit(ip);
  if (limited) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan. Coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const { password } = await req.json();

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    recordFailure(ip);
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  // Sukses → reset hitungan untuk IP ini.
  attempts.delete(ip);

  const cookieStore = await cookies();
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/',
  });

  return NextResponse.json({ ok: true });
}
