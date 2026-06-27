"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (pathname === '/admin/login') return null;

  const handleLogout = async () => {
    setLoading(true)
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login';
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { href: '/admin/projects', label: 'Projects', icon: 'ri-code-box-line' },
    { href: '/admin/design', label: 'Designs', icon: 'ri-palette-line' },
    { href: '/admin/video', label: 'Videos', icon: 'ri-video-line' },
    { href: '/admin/certificates', label: 'Certificates', icon: 'ri-award-line' },
  ]

  return (
    <nav className="bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo/Title */}
        <Link href="/admin" className="text-xl md:text-2xl font-bold text-primary">
          Admin Panel
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`py-2 px-3 rounded-md transition duration-200 flex items-center gap-2 text-sm
                  ${pathname === item.href
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <i className={item.icon}></i>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50 text-sm"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-white bg-gray-700 rounded-md hover:bg-gray-600 transition"
          aria-label="Toggle menu"
        >
          <i className={menuOpen ? 'ri-close-line text-xl' : 'ri-menu-line text-xl'}></i>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-gray-700 border-t border-gray-600">
          <ul className="py-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 transition duration-200
                    ${pathname === item.href
                    ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                >
                  <i className={`${item.icon} text-lg`}></i>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
            <li className="border-t border-gray-600 mt-2 pt-2 px-4">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <i className="ri-logout-box-line"></i>
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}