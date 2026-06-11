'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

const CARDS = [
  { href: '/admin/projects', label: 'Dev Projects', icon: 'ri-code-s-slash-line', table: 'projects', color: 'from-blue-500/20 to-indigo-500/20' },
  { href: '/admin/design', label: 'Design Gallery', icon: 'ri-palette-line', table: 'designs', color: 'from-pink-500/20 to-rose-500/20' },
  { href: '/admin/video', label: 'Video Gallery', icon: 'ri-video-line', table: 'videos', color: 'from-purple-500/20 to-violet-500/20' },
  { href: '/admin/certificates', label: 'Certificates', icon: 'ri-award-line', table: 'certificates', color: 'from-amber-500/20 to-yellow-500/20' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const loadCounts = useCallback(async () => {
    setLoading(true);
    const results = {};
    await Promise.all(
      CARDS.map(async (c) => {
        try {
          const res = await fetch(`/api/admin/${c.table}`);
          if (res.ok) {
            const data = await res.json();
            results[c.table] = data.length;
          }
        } catch { /* ignore */ }
      })
    );
    setCounts(results);
    setLoading(false);
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <main className="min-h-screen bg-bg-dark text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={logout} className="px-5 py-2.5 border border-white/20 rounded-xl text-sm hover:bg-white/5 hover:border-red-500/30 hover:text-red-400 transition-all">
            <i className="ri-logout-box-r-line mr-2"></i>Logout
          </button>
        </div>

        {/* Stats */}
        <div className="bg-card-bg border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
              <i className="ri-database-2-line text-accent text-lg"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Total Konten</p>
              <p className="text-2xl font-bold text-white">{loading ? '...' : total}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {CARDS.map((c) => (
              <div key={c.table} className="text-center">
                <p className="text-lg font-bold text-white">{loading ? '-' : (counts[c.table] ?? 0)}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {CARDS.map((c) => (
            <Link key={c.href} href={c.href}
              className={`bg-gradient-to-br ${c.color} border border-white/10 rounded-2xl p-8 hover:border-accent/50 hover:scale-[1.02] transition-all group`}>
              <i className={`${c.icon} text-3xl text-accent mb-4 block group-hover:scale-110 transition-transform`}></i>
              <p className="font-bold">{c.label}</p>
              <p className="text-xs text-gray-400 mt-1">{loading ? '...' : `${counts[c.table] ?? 0} item`}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
