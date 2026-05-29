'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) router.push('/admin');
    else setError('Password salah.');
  };

  return (
    <main className="min-h-screen bg-bg-dark flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-card-bg border border-white/10 rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent mb-4"
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-accent text-bg-dark font-black uppercase tracking-widest rounded-xl disabled:opacity-50"
        >
          {loading ? '...' : 'Masuk'}
        </button>
      </form>
    </main>
  );
}
