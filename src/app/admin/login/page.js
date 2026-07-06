"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

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
          setError('Password salah.')
        } else if (res.status === 400) {
          setError(data.error || 'Invalid request')
        } else {
          setError(data.error || 'Terjadi kesalahan')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Koneksi bermasalah, periksa internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-white">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Enter password to continue</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-400 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  aria-describedby={error ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}`} aria-hidden="true"></i>
                </button>
              </div>
            </div>
            
            {error && (
              <div 
                id="password-error"
                className="bg-red-950/50 border border-red-800/60 rounded-lg px-3 py-2"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
              aria-label="Login to admin panel"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin" aria-hidden="true"></i>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
