'use client';

import Link from 'next/link';

export default function CVPage() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-white font-bold">CV - Galang Arrauf Pramudito</h1>
        <Link href="/" className="text-accent text-sm hover:underline">← Back</Link>
      </div>
      <iframe 
        src="/api/cv"
        className="w-full flex-1 border-0"
        title="CV Galang Arrauf Pramudito"
      />
    </div>
  );
}
