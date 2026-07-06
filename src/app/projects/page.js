"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TYPE_CONFIG = {
  website: { label: "Website", icon: "ri-global-line", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", gradient: "from-stone-900 via-neutral-900 to-zinc-950" },
  aplikasi: { label: "Aplikasi", icon: "ri-smartphone-line", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", gradient: "from-zinc-900 via-zinc-800 to-black" },
  desain: { label: "Desain", icon: "ri-palette-line", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", gradient: "from-amber-950 via-neutral-900 to-amber-950/40" },
  'video editing': { label: "Video Editing", icon: "ri-video-line", color: "bg-rose-500/20 text-rose-300 border-rose-500/30", gradient: "from-red-950 via-neutral-900 to-red-950/40" },
  // Legacy mappings:
  web: { label: "Website", icon: "ri-global-line", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", gradient: "from-stone-900 via-neutral-900 to-zinc-950" },
  bot: { label: "Aplikasi", icon: "ri-smartphone-line", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", gradient: "from-neutral-900 via-neutral-800 to-black" },
  android: { label: "Aplikasi", icon: "ri-smartphone-line", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", gradient: "from-zinc-900 via-zinc-800 to-black" },
  design: { label: "Desain", icon: "ri-palette-line", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", gradient: "from-amber-950 via-neutral-900 to-amber-950/40" },
  video: { label: "Video Editing", icon: "ri-video-line", color: "bg-rose-500/20 text-rose-300 border-rose-500/30", gradient: "from-red-950 via-neutral-900 to-red-950/40" },
  other: { label: "Lainnya", icon: "ri-code-s-slash-line", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", gradient: "from-slate-900 via-gray-900 to-black" },
};

function getTypeConfig(type) {
  const t = (type || "other").toLowerCase();
  if (TYPE_CONFIG[t]) return TYPE_CONFIG[t];
  return {
    label: type.charAt(0).toUpperCase() + type.slice(1),
    icon: "ri-code-box-line",
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    gradient: "from-cyan-950 via-neutral-900 to-cyan-950/40"
  };
}

const STATUS_BADGE = {
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  wip: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

function ProjectsPageContent() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [screenshotModal, setScreenshotModal] = useState(null); // { images, index, title }
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || searchParams.get("category");

  useEffect(() => {
    (async () => {
      setLoading(true);
      
      // Fetch all projects except private
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*, project_types(id, name, slug)")
        .neq("status", "private")
        .order("featured", { ascending: false })
        .order("sort_order")
        .order("created_at", { ascending: false });

      if (projectsData) {
        // Fetch all project images
        const { data: imagesData } = await supabase
          .from("project_images")
          .select("*")
          .order("sort_order");

        const processed = projectsData.map((p) => {
          let projectType = "website";
          if (p.project_types) {
            projectType = p.project_types.slug;
          } else {
            projectType = p.project_type || p.type || "website";
          }
          projectType = projectType.toLowerCase();
          
          // Unify legacy values
          if (projectType === "web") projectType = "website";
          if (projectType === "bot" || projectType === "android") projectType = "aplikasi";
          if (projectType === "design") projectType = "desain";
          if (projectType === "video" || projectType === "video-editing") projectType = "video editing";

          return {
            ...p,
            project_type: projectType,
            _images: imagesData ? imagesData.filter((img) => img.project_id === p.id) : [],
            tags: (p.tags || []).filter(t => !['web', 'bot', 'android'].includes(t.toLowerCase())),
          };
        });

        setProjects(processed);
      }
      setLoading(false);
    })();
  }, []);

  // Update filter based on URL category/type parameter once projects are loaded
  useEffect(() => {
    if (typeParam) {
      let cleanParam = typeParam.toLowerCase();
      if (cleanParam === "design") cleanParam = "desain";
      if (cleanParam === "video") cleanParam = "video editing";
      setFilter(cleanParam);
    }
  }, [typeParam]);

  // Handle keyboard events (Escape to close, Arrows to paginate screenshots)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setScreenshotModal(null);
        setSelectedVideo(null);
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

  // Dynamically get available types from loaded projects
  const availableTypes = [...new Set(projects.map((p) => p.project_type || "website"))];
  
  const filterTabs = [
    { key: "all", label: "Semua Project", icon: "ri-apps-line" },
    ...availableTypes.map((t) => {
      const config = getTypeConfig(t);
      return { key: t, label: config.label, icon: config.icon };
    }),
  ];

  const filtered = filter === "all" ? projects : projects.filter((p) => (p.project_type || "website").toLowerCase() === filter);

  return (
    <main className="min-h-[100dvh] bg-bg-dark p-4 sm:p-8 md:p-16 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute left-[-20%] top-[-10%] w-[60%] h-[40%] bg-accent blur-[120px] rounded-full"></div>
        <div className="absolute right-[-20%] bottom-[-10%] w-[60%] h-[40%] bg-primary blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-16 relative z-10 pt-4 md:pt-0">
        <Link href="/" className="inline-flex items-center gap-3 text-accent font-bold uppercase text-[10px] tracking-[0.2em] mb-8 md:mb-12 hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center group-hover:bg-accent group-hover:text-bg-dark transition-all">
            <i className="ri-arrow-left-line"></i>
          </div>
          Back to Home
        </Link>
        <h1 className="font-display text-4xl md:text-6xl font-normal mb-3 md:mb-4 tracking-tight leading-tight text-white">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Portfolio</span>
        </h1>
        <p className="text-gray-400 max-w-xl text-sm md:text-base font-light leading-relaxed">
          Katalog lengkap project, desain UI/UX, dan kreasi video. Gunakan filter di bawah untuk menelusuri kategori.
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
            <span className="ml-1 text-[10px] opacity-60">
              ({f.key === "all" ? projects.length : projects.filter((p) => (p.project_type || "website").toLowerCase() === f.key).length})
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
            const typeInfo = getTypeConfig(project.project_type);
            const statusInfo = STATUS_BADGE[project.status] || "";
            const isVideo = ['video editing', 'video'].includes(project.project_type?.toLowerCase() || '');
            const isDesign = ['desain', 'design'].includes(project.project_type?.toLowerCase() || '');
            
            return (
              <div key={project.id} className="group bg-card-bg border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col">
                {/* Thumbnail */}
                <div 
                  className={`relative w-full aspect-video bg-black overflow-hidden ${isVideo ? "cursor-pointer" : ""}`}
                  onClick={() => isVideo && project.video_url ? setSelectedVideo(project.video_url) : null}
                >
                  {project.thumbnail_url ? (
                    <Image src={project.thumbnail_url} alt={project.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" priority={idx < 3} />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center`}>
                      <i className={`${typeInfo.icon} text-5xl text-white/20`}></i>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Play Overlay for Video */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-1 bg-black/40 rounded-full group-hover:bg-accent/90 group-hover:scale-110 transition-all duration-300 border border-white/10">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center">
                          <i className="ri-play-fill text-white text-lg ml-0.5 group-hover:text-bg-dark transition-colors"></i>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[80%]">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1.5 backdrop-blur-md ${typeInfo.color}`}>
                      <i className={typeInfo.icon}></i> {typeInfo.label}
                    </span>
                    {project.status === "wip" && (
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${statusInfo}`}>WIP</span>
                    )}
                  </div>
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
                    {isVideo && project.video_url && (
                      <button onClick={() => setSelectedVideo(project.video_url)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-accent/20 border border-accent/35 px-4 py-2 rounded-xl hover:bg-accent hover:text-bg-dark transition-colors">
                        <i className="ri-play-circle-line"></i> Play Video
                      </button>
                    )}
                    {/* Screenshots / gallery button */}
                    {project._images && project._images.length > 0 && (
                      <button onClick={() => setScreenshotModal({ images: project._images, index: 0, title: project.title })}
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:border-accent/40 transition-colors">
                        <i className={isDesign ? "ri-image-line" : "ri-screenshot-2-line"}></i>
                        {isDesign ? "View Gallery" : "Screenshots"} ({project._images.length})
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

      {/* Video Lightbox */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedVideo(null)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-[201]">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center z-[202] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl"
            >
              <i className="ri-close-line text-xl md:text-2xl"></i>
            </button>
            <iframe src={selectedVideo} className="w-full h-full border-none" allow="autoplay" allowFullScreen></iframe>
          </div>
        </div>
      )}

      {/* Screenshot Lightbox */}
      {screenshotModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setScreenshotModal(null)}></div>
          <button onClick={() => setScreenshotModal(null)}
            className="fixed top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center z-[300] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none">
            <i className="ri-close-line text-xl md:text-2xl"></i>
          </button>
          {screenshotModal.images.length > 1 && (
            <>
              <button onClick={() => setScreenshotModal((s) => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }))}
                className="fixed left-4 md:left-10 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-white/20 text-white rounded-full flex items-center justify-center z-[300] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none">
                <i className="ri-arrow-left-s-line text-2xl md:text-3xl"></i>
              </button>
              <button onClick={() => setScreenshotModal((s) => ({ ...s, index: (s.index + 1) % s.images.length }))}
                className="fixed right-4 md:right-10 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-white/20 text-white rounded-full flex items-center justify-center z-[300] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none">
                <i className="ri-arrow-right-s-line text-2xl md:text-3xl"></i>
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
        <p className="text-gray-600 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em]">
          Galang Arrauf Pramudito • Portfolio 2026
        </p>
      </footer>
    </main>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-3xl text-gray-400"></i>
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  );
}
