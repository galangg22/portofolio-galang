import Link from 'next/link';

export function BackButton({ href, label = "Back" }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-full text-[11px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 mb-6 md:mb-8 backdrop-blur-md hover:shadow-lg hover:shadow-black/5"
    >
      <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
        <i className="ri-arrow-left-line text-xs md:text-sm group-hover:-translate-x-0.5 transition-transform duration-300" />
      </div>
      {label}
    </Link>
  );
}
