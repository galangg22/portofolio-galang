'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CARDS = [
  { href: '/admin/projects', label: 'Dev Projects', icon: 'ri-code-s-slash-line' },
  { href: '/admin/design', label: 'Design Gallery', icon: 'ri-palette-line' },
  { href: '/admin/video', label: 'Video Gallery', icon: 'ri-video-line' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <main className="min-h-screen bg-bg-dark text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={logout} className="px-5 py-2.5 border border-white/20 rounded-xl text-sm">Logout</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {CARDS.map((c) => (
            <Link key={c.href} href={c.href}
              className="bg-card-bg border border-white/10 rounded-2xl p-8 hover:border-accent transition-colors">
              <i className={`${c.icon} text-3xl text-accent mb-4 block`}></i>
              <p className="font-bold">{c.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
