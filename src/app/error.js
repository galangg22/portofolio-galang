'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error untuk debugging
    console.error('Global Error:', error);
  }, [error]);

  return (
    <main className="bg-bg-dark min-h-screen flex items-center justify-center px-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20">
          <i className="ri-alert-line text-4xl text-red-500"></i>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Terjadi Kesalahan
        </h1>
        
        <p className="text-lg text-gray-400 mb-8 leading-relaxed">
          Maaf, terjadi kesalahan yang tidak terduga. Tim teknis kami sedang menangani masalah ini.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => reset()}
            className="px-8 py-4 bg-white text-bg-dark font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            Coba Lagi
          </button>
          <a 
            href="/" 
            className="px-8 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors"
          >
            Kembali ke Beranda
          </a>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-left">
            <p className="text-sm text-red-400 font-mono break-all">
              {error?.message || 'Unknown error'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
