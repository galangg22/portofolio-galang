import Link from 'next/link';

export function FixedLogo() {
  return (
    <Link
      href="/"
      aria-label="Kembali ke Beranda"
      className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] group flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full p-1.5 bg-black/80 backdrop-blur-xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:border-accent/60 group-hover:shadow-[0_0_20px_rgba(79,255,163,0.3)] transition-all duration-300 flex items-center justify-center overflow-hidden">
        <img
          src="/favicon.ico"
          alt="Galang Arrauf Logo"
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    </Link>
  );
}

