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
      className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50"
      role="navigation"
      aria-label="Admin navigation"
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            href="/admin" 
            className="text-sm font-semibold text-gray-200 tracking-wide uppercase"
            aria-label="Admin Dashboard Home"
          >
            Admin
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
                    px-3 py-1.5 rounded-md text-sm transition-colors
                    ${active 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
            
            <div className="w-px h-5 bg-gray-800 mx-2"></div>
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-3 py-1.5 text-gray-500 hover:text-red-400 text-sm transition-colors disabled:opacity-50"
              aria-label="Logout from admin panel"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <i className={`${menuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`} aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t border-gray-800"
          role="menu"
        >
          <div className="max-w-5xl mx-auto px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    block px-3 py-2 rounded-md text-sm transition-colors
                    ${active
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }
                  `}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full text-left px-3 py-2 text-gray-500 hover:text-red-400 text-sm transition-colors disabled:opacity-50"
              role="menuitem"
              aria-label="Logout from admin panel"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
