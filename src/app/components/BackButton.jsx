'use client';

import Link from 'next/link';

export function BackButton({ href, label = "Back" }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3 text-accent font-bold uppercase text-[10px] tracking-[0.2em] mb-6 md:mb-8 hover:text-black dark:hover:text-white transition-colors group"
    >
      <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
        <i className="ri-arrow-left-line" />
      </div>
      {label}
    </Link>
  );
}
