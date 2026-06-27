"use client";

import { useState, useEffect } from "react";

const navItems = [
  { id: "home", label: "Home", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { id: "about", label: "About", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { id: "skills", label: "Skills", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
  { id: "projects", label: "Work", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  { id: "certificates", label: "Certificates", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
  { id: "contact", label: "Contact", svg: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> }
];

const navMeta = {
  home: "Back to top",
  about: "Who I am",
  skills: "Tech stack",
  projects: "Selected projects",
  certificates: "Credentials",
  contact: "Get in touch",
};

export function DynamicIsland({ activeSection }) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isExpanded) setIsExpanded(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isExpanded]);

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsExpanded(false);
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-none">
      <nav
        role="navigation"
        aria-label="Main navigation"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setIsExpanded(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setIsExpanded(false);
        }}
        onClick={() => setIsExpanded((v) => !v)}
        onFocus={() => setIsExpanded(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setIsExpanded(false);
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded((v) => !v);
          }
        }}
        style={{ willChange: isExpanded ? "width, height" : "auto" }}
        className={`bg-black/90 backdrop-blur-xl pointer-events-auto cursor-pointer relative flex items-center justify-center transition-all duration-[400ms] ease-out focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-transparent ${
          isExpanded
            ? "w-[340px] sm:w-[400px] md:w-[520px] h-16 sm:h-[68px] md:h-20 rounded-[28px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]"
            : "w-32 sm:w-36 h-10 sm:h-11 rounded-full border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
        }`}
      >
        {/* Collapsed state - pill */}
        <div
          className={`absolute inset-0 flex items-center justify-center gap-2.5 transition-all duration-300 ${
            isExpanded ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100 delay-75"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_12px_rgba(79,255,163,0.7)] animate-pulse" />
          <span className="text-white text-xs sm:text-sm font-bold tracking-[0.15em] uppercase">Menu</span>
        </div>

        {/* Expanded state - nav items */}
        <div
          className={`absolute inset-0 flex items-center justify-between px-3 sm:px-4 md:px-5 transition-all duration-300 ${
            isExpanded ? "opacity-100 scale-100 delay-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
          }`}
        >
          {navItems.map((item, idx) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              aria-label={`Navigate to ${item.label}`}
              aria-current={activeSection === item.id ? "page" : undefined}
              style={{ transitionDelay: isExpanded ? `${idx * 30}ms` : "0ms" }}
              className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 ease-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/70"
            >
              {/* Active state glow */}
              <div
                className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-300 ${
                  activeSection === item.id ? "opacity-30 bg-accent" : "opacity-0 group-hover:opacity-20 group-hover:bg-accent"
                }`}
              />
              
              {/* Border ring */}
              <div
                className={`absolute inset-0.5 sm:inset-1 rounded-full border transition-all duration-300 ${
                  activeSection === item.id ? "border-accent/40 bg-accent/5" : "border-transparent group-hover:border-accent/25 group-hover:bg-white/5"
                }`}
              />
              
              {/* Active dot indicator */}
              <div
                className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 ${
                  activeSection === item.id ? "scale-100 bg-accent" : "scale-0 bg-accent/60 group-hover:scale-100"
                }`}
              />
              
              {/* Icon */}
              <div
                className={`relative z-10 transition-all duration-300 ${
                  activeSection === item.id ? "text-accent scale-105" : "text-gray-400 group-hover:text-white group-hover:scale-110"
                }`}
                aria-hidden="true"
              >
                {item.svg}
              </div>

              {/* Label text below icon - outside island */}
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 pointer-events-none z-50">
                <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-1.5 shadow-lg">
                  <p className="text-white text-xs font-semibold whitespace-nowrap">{item.label}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

      </nav>
    </div>
  );
}
