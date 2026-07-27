"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client-side validation
    if (!password || password.length === 0) {
      setError('Password wajib diisi')
      setLoading(false)
      return
    }

    if (password.length > 1000) {
      setError('Password terlalu panjang')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setPassword('')
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        
        if (res.status === 429) {
          const retryAfter = res.headers.get('Retry-After')
          const minutes = Math.ceil(retryAfter / 60)
          setError(`Terlalu banyak percobaan. Coba lagi dalam ${retryAfter} detik (±${minutes} menit).`)
        } else if (res.status === 401) {
          setError('Akses Ditolak. Password salah.')
        } else if (res.status === 400) {
          setError(data.error || 'Invalid request')
        } else {
          setError(data.error || 'Terjadi kesalahan internal')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Koneksi bermasalah, periksa jaringan internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] p-4 overflow-hidden selection:bg-indigo-500/30">
      {/* Background Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-10 md:left-10 text-gray-500 hover:text-white flex items-center gap-2 text-sm font-semibold transition-all hover:-translate-x-1 z-20 px-4 py-2 rounded-xl hover:bg-white/5"
      >
        <i className="ri-arrow-left-line text-lg"></i>
        <span className="hidden sm:inline">Kembali ke Beranda</span>
      </Link>

      <div className={`w-full max-w-[420px] relative z-10 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
        
        {/* Glassmorphism Card */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.5)] shadow-indigo-500/10">
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25 border border-white/10 ring-4 ring-indigo-500/10">
              <i className="ri-fingerprint-line text-3xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Admin Gateway</h1>
            <p className="text-gray-400 text-sm leading-relaxed px-4">Authorized personnel only. Please verify your identity to continue.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <label 
                htmlFor="password" 
                className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1"
              >
                Passcode
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ri-key-2-line text-gray-500 group-focus-within:text-indigo-400 transition-colors text-lg"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all focus:bg-indigo-950/20 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your secret key"
                  aria-describedby={error ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-lg`} aria-hidden="true"></i>
                </button>
              </div>
            </div>
            
            {error && (
              <div 
                id="password-error"
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 flex items-start gap-3"
                role="alert"
                aria-live="assertive"
              >
                <i className="ri-error-warning-fill text-red-400 mt-0.5 text-lg"></i>
                <p className="text-red-300 text-sm leading-relaxed">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="group w-full bg-white text-black hover:bg-indigo-50 py-3.5 px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-[0.98]"
              disabled={loading || !password}
              aria-label="Login to admin panel"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-lg" aria-hidden="true"></i>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Unlock Gateway</span>
                  <i className="ri-arrow-right-line text-lg group-hover:translate-x-1 transition-transform"></i>
                </>
              )}
            </button>
          </form>

        </div>
        
        {/* Footer text */}
        <p className="text-center text-gray-600 text-xs mt-8 font-medium">
          &copy; {new Date().getFullYear()} Galang Arrauf Pramudito. All rights reserved.
        </p>
      </div>
    </div>
  )
}
