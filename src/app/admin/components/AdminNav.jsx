"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSafeNavigation } from '../hooks/useNavigation'

export default function AdminNav() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { navigate } = useSafeNavigation()

  if (pathname === '/admin/login') return null

  const handleLogout = async () => {
    if (!confirm('Yakin ingin logout?')) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' })
      if (res.ok) {
        navigate('/admin/login', { replace: true })
      } else {
        navigate('/admin/login', { replace: true })
      }
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/admin/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'ri-dashboard-3-line', exact: true },
    { href: '/admin/profile', label: 'Profile', icon: 'ri-user-settings-line' },
    { href: '/admin/projects', label: 'Projects', icon: 'ri-code-box-line' },
    { href: '/admin/project_types', label: 'Jenis Project', icon: 'ri-list-settings-line' },
    { href: '/admin/certificates', label: 'Certificates', icon: 'ri-award-line' },
  ]

  const isActive = (href, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href) && href !== '/admin'
  }

  return (
    <nav 
      className="sticky top-6 z-50 px-4 md:px-0"
      role="navigation"
      aria-label="Admin navigation"
    >
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-4 md:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            href="/admin" 
            className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2 group"
            aria-label="Admin Dashboard Home"
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ri-command-line text-accent"></i>
            </div>
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                    ${active 
                      ? 'bg-accent text-bg-dark shadow-[0_0_15px_rgba(var(--accent),0.5)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  <i className={`${item.icon} mr-1.5 ${active ? 'text-bg-dark' : ''}`}></i>
                  {item.label}
                </Link>
              )
            })}
            
            <div className="w-px h-5 bg-white/10 mx-2"></div>
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-4 py-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              aria-label="Logout from admin panel"
            >
              <i className="ri-logout-circle-r-line"></i>
              {loading ? 'Wait...' : 'Logout'}
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <i className={`${menuOpen ? 'ri-close-line' : 'ri-menu-4-line'} text-xl`} aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden mt-3 max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-4 duration-300"
          role="menu"
        >
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${active
                      ? 'bg-accent text-bg-dark shadow-[0_0_15px_rgba(var(--accent),0.3)]'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                >
                  <i className={`${item.icon} mr-3 text-lg ${active ? 'text-bg-dark' : 'text-gray-400'}`}></i>
                  {item.label}
                </Link>
              )
            })}
            
            <div className="h-px bg-white/10 my-2"></div>
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-colors disabled:opacity-50"
              role="menuitem"
              aria-label="Logout from admin panel"
            >
              <i className="ri-logout-circle-r-line mr-3 text-lg"></i>
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
