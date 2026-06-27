'use client';

import Link from 'next/link';

export default function CVPage() {
  return (
    <div className="min-h-[100dvh] bg-bg-dark flex flex-col">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-white font-bold">CV - Galang Arrauf Pramudito</h1>
        <div className="flex items-center gap-4">
          <a href="/cv-galang.pdf" download="CV_Galang_Arrauf_Pramudito.pdf" className="text-accent text-sm hover:underline font-bold inline-flex items-center gap-1.5">
            <i className="ri-download-line"></i> Download
          </a>
          <Link href="/" className="text-accent text-sm hover:underline">← Back</Link>
        </div>
      </div>
      <iframe
        src="/cv-galang.pdf"
        className="w-full flex-1 border-0"
        title="CV Galang Arrauf Pramudito"
      />
    </div>
  );
}
