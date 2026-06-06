import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ✅ OPTIMASI #2: Rate limiter dengan auto-cleanup stale entries.
// ⚠️ CATATAN: In-memory Map hanya andal di single-instance (e.g. Node/VPS).
// Di serverless (Vercel/Lambda), setiap cold start membuat Map baru.
// Untuk produksi multi-instance, ganti dengan Upstash Redis:
//   import { Ratelimit } from '@upstash/ratelimit';
//   import { Redis } from '@upstash/redis';
//   const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, '15 m') });

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Bersihkan entri kedaluwarsa tiap 5 menit.
const attempts = new Map(); // ip -> { count, resetAt }

// Periodic cleanup agar Map tidak membengkak tanpa batas (memory leak prevention).
let lastCleanup = Date.now();
function cleanupStale() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [ip, rec] of attempts) {
    if (now > rec.resetAt) attempts.delete(ip);
  }
}

function checkLimit(ip) {
  cleanupStale();
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
