"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Fallback data
const FALLBACK_PROJECTS = [
  {
    id: "f1", title: "Bot WA Reminder Absensi", type: "bot", status: "completed",
    tags: ["Node.js", "Baileys API", "Automation"],
    description: "Sistem automasi backend untuk memonitor jadwal dan mengirimkan pengingat absensi secara otomatis via WhatsApp.",
    github_url: "https://github.com/galangpramudito/bot-presensi",
  },
  {
    id: "f2", title: "Sistem Web TPQ Al-Hikmah", type: "web", status: "completed",
    tags: ["Web Dev", "HTML", "CSS"],
    description: "Platform sistem informasi manajemen untuk digitalisasi administrasi santri dan guru.",
    github_url: "https://github.com/galangpramudito/alhikmah",
  },
  {
    id: "f3", title: "ThriftyFinds E-Commerce", type: "web", status: "completed",
    tags: ["React/Next.js", "Tailwind", "E-Commerce"],
    description: "Katalog e-commerce modern untuk produk thrifting.",
    thumbnail_url: "/image/TOKO TUNAI BGDARK mockup fix.png",
    github_url: "https://github.com/galangpramudito/thriftyfinds",
    demo_url: "#",
  },
  {
    id: "f4", title: "HeartHorizon / Online Class", type: "web", status: "completed",
    tags: ["LMS", "Fullstack", "Database"],
    description: "Aplikasi e-learning interaktif.",
    thumbnail_url: "/image/Photo by Pankaj Patel on Unsplash.jpg",
    github_url: "https://github.com/galangpramudito/hearthorizon",
  },
];

const TYPE_CONFIG = {
  web: { label: "Web Apps", icon: "ri-global-line", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30", gradient: "from-blue-900 via-indigo-800 to-purple-900" },
  bot: { label: "Service Automation", icon: "ri-robot-2-line", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", gradient: "from-emerald-900 via-green-800 to-teal-900" },
  android: { label: "Mobile Apps", icon: "ri-smartphone-line", color: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30", gradient: "from-purple-900 via-violet-800 to-indigo-900" },
  other: { label: "Other", icon: "ri-code-s-slash-line", color: "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30", gradient: "from-gray-800 via-gray-700 to-gray-900" },
};

const STATUS_BADGE = {
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  wip: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [filter, setFilter] = useState("all");
  const [screenshotModal, setScreenshotModal] = useState(null); // { images, index, title }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("projects").select("*")
        .neq("status", "private")
        .order("featured", { ascending: false })
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (data && data.length) setProjects(data);

      // Load project_images for android projects
      const { data: imgs } = await supabase.from("project_images").select("*").order("sort_order");
      if (imgs && imgs.length) {
        setProjects((prev) => prev.map((p) => ({
          ...p,
          _images: imgs.filter((im) => im.project_id === p.id),
        })));
      }
      setLoading(false);
    })();
  }, []);

  // Handle keyboard events (Escape to close, Arrows to paginate screenshots)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setScreenshotModal(null);
      }
      if (screenshotModal && screenshotModal.images.length > 1) {
        if (e.key === "ArrowLeft") {
          setScreenshotModal((s) => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }));
        } else if (e.key === "ArrowRight") {
          setScreenshotModal((s) => ({ ...s, index: (s.index + 1) % s.images.length }));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screenshotModal]);

  // Get available types from data
  const availableTypes = [...new Set(projects.map((p) => p.type || "web"))];
  const filterTabs = [
    { key: "all", label: "All Projects", icon: "ri-apps-line" },
    ...availableTypes.map((t) => ({ key: t, label: TYPE_CONFIG[t]?.label || t, icon: TYPE_CONFIG[t]?.icon || "ri-code-line" })),
  ];

  const filtered = filter === "all" ? projects : projects.filter((p) => (p.type || "web") === filter);

  return (
    <main className="min-h-screen bg-bg-dark text-white p-4 sm:p-8 md:p-16 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute left-[-20%] top-[-10%] w-[60%] h-[40%] bg-accent blur-[120px] rounded-full"></div>
        <div className="absolute right-[-20%] bottom-[-10%] w-[60%] h-[40%] bg-primary blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-16 relative z-10 pt-4 md:pt-0">
        <Link href="/" className="inline-flex items-center gap-3 text-accent font-bold uppercase text-[10px] tracking-[0.2em] mb-8 md:mb-12 hover:text-black dark:hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
            <i className="ri-arrow-left-line"></i>
          </div>
          Back to Home
        </Link>
        <h1 className="font-display text-4xl md:text-6xl font-normal mb-3 md:mb-4 tracking-tight leading-tight">
          Dev <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Projects</span>
        </h1>
        <p className="text-gray-400 max-w-xl text-sm md:text-base font-light leading-relaxed">
          Koleksi lengkap project development — web apps, service automation, bots, dan mobile apps.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-6xl mx-auto flex gap-2 md:gap-3 mb-10 md:mb-12 overflow-x-auto pb-4 relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filterTabs.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-5 md:px-6 py-2.5 rounded-full border text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
              filter === f.key
                ? "bg-accent text-bg-dark border-accent"
                : "border-white/10 text-gray-500 hover:border-white/30 hover:text-white bg-white/5"
            }`}
          >
            <i className={f.icon}></i> {f.label}
            <span className="ml-1 text-[9px] opacity-60">
              ({f.key === "all" ? projects.length : projects.filter((p) => (p.type || "web") === f.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden flex flex-col animate-pulse">
              <div className="relative w-full aspect-video bg-white/5"></div>
              <div className="p-5 flex flex-col flex-1 space-y-3">
                <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
                <div className="flex gap-1.5 flex-wrap">
                  <div className="h-4 bg-white/5 rounded-md w-12"></div>
                  <div className="h-4 bg-white/5 rounded-md w-16"></div>
                </div>
                <div className="h-4 bg-white/5 rounded-md w-full"></div>
                <div className="h-4 bg-white/5 rounded-md w-5/6"></div>
                <div className="h-10 bg-white/5 border border-white/10 rounded-xl w-1/3 mt-auto"></div>
              </div>
            </div>
          ))
        ) : (
          filtered.map((project, idx) => {
            const typeInfo = TYPE_CONFIG[project.type] || TYPE_CONFIG.other;
            const statusInfo = STATUS_BADGE[project.status] || "";
            return (
              <div key={project.id} className="group bg-card-bg border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col">
                {/* Thumbnail */}
                <div className="relative w-full aspect-video bg-black overflow-hidden">
                  {project.thumbnail_url ? (
                    <Image src={project.thumbnail_url} alt={project.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" priority={idx < 3} />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center`}>
                      <i className={`${typeInfo.icon} text-5xl text-white/20`}></i>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1 ${typeInfo.color}`}>
                      <i className={typeInfo.icon}></i> {typeInfo.label}
                    </span>
                    {project.status === "wip" && (
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${statusInfo}`}>WIP</span>
                    )}
                  </div>
                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-accent/20 text-accent border border-accent/30">
                        <i className="ri-star-fill mr-1"></i>Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-base md:text-lg text-white mb-2">{project.title}</h3>
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-bold text-gray-400 uppercase">{tag}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{project.description}</p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-accent/40 transition-colors">
                        <i className="ri-github-fill"></i> GitHub
                      </a>
                    )}
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-bg-dark bg-accent px-4 py-2 rounded-xl hover:scale-105 transition-transform">
                        <i className="ri-external-link-line"></i> Demo
                      </a>
                    )}
                    {project.play_store_url && (
                      <a href={project.play_store_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-accent/40 transition-colors">
                        <i className="ri-google-play-fill"></i> Play Store
                      </a>
                    )}
                    {project.apk_url && (
                      <a href={project.apk_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-accent/40 transition-colors">
                        <i className="ri-download-line"></i> APK
                      </a>
                    )}
                    {/* Screenshots button for android */}
                    {project._images && project._images.length > 0 && (
                      <button onClick={() => setScreenshotModal({ images: project._images, index: 0, title: project.title })}
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-accent/40 transition-colors">
                        <i className="ri-screenshot-2-line"></i> Screenshots ({project._images.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {!loading && !filtered.length && <p className="text-gray-500 text-sm col-span-full text-center py-12">Tidak ada project untuk kategori ini.</p>}
      </div>

      {/* Screenshot Lightbox */}
      {screenshotModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setScreenshotModal(null)}></div>
          <button onClick={() => setScreenshotModal(null)}
            className="fixed top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md hover:bg-red-500 text-white rounded-full flex items-center justify-center z-[300] transition-all active:scale-90 border border-white/20">
            <i className="ri-close-line text-xl md:text-2xl"></i>
          </button>
          {screenshotModal.images.length > 1 && (
            <>
              <button onClick={() => setScreenshotModal((s) => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }))}
                className="fixed left-4 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center z-[300]">
                <i className="ri-arrow-left-s-line text-2xl"></i>
              </button>
              <button onClick={() => setScreenshotModal((s) => ({ ...s, index: (s.index + 1) % s.images.length }))}
                className="fixed right-4 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center z-[300]">
                <i className="ri-arrow-right-s-line text-2xl"></i>
              </button>
            </>
          )}
          <div className="relative z-10 max-w-4xl w-full text-center">
            <div className="relative w-full max-h-[78vh] aspect-[9/16] md:aspect-[3/4] mx-auto">
              <Image src={screenshotModal.images[screenshotModal.index].image_url} alt={screenshotModal.images[screenshotModal.index].caption || screenshotModal.title} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="mt-4">
              <p className="text-white font-bold">{screenshotModal.title}
                {screenshotModal.images.length > 1 && <span className="text-gray-400 font-normal text-sm"> · {screenshotModal.index + 1}/{screenshotModal.images.length}</span>}
              </p>
              {screenshotModal.images[screenshotModal.index].caption && (
                <p className="text-accent text-sm mt-1">{screenshotModal.images[screenshotModal.index].caption}</p>
              )}
              {screenshotModal.images[screenshotModal.index].description && (
                <p className="text-gray-400 text-xs mt-1">{screenshotModal.images[screenshotModal.index].description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 md:mt-32 pb-8 md:pb-16 text-center border-t border-white/5 pt-8 md:pt-10">
        <p className="text-gray-600 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em]">
          Galang Arrauf Pramudito • Dev Projects 2026
        </p>
      </footer>
    </main>
  );
}
