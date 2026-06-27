"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ==========================================
// 📂 DATA GALLERY — Design only (videos moved to /video)
// ==========================================
const GALLERY_DATA = [
  {
    id: 1,
    title: "TPQ Al-Hikmah Branding",
    category: "design",
    image: "/image/TOKO TUNAI BGDARK mockup fix.png",
    desc: "Identitas visual lengkap untuk lembaga TPQ Al-Hikmah — logo, color palette, dan material promosi.",
    images: ["/image/TOKO TUNAI BGDARK mockup fix.png"],
  },
  {
    id: 2,
    title: "HeartHorizon LMS UI",
    category: "design",
    image: "/image/Photo by Pankaj Patel on Unsplash.jpg",
    desc: "Perancangan antarmuka pengguna untuk platform Online Class — wireframe, mockup, dan user flow.",
    images: ["/image/Photo by Pankaj Patel on Unsplash.jpg"],
  },
  {
    id: 3,
    title: "ThriftyFinds Identity",
    category: "design",
    image: "/image/TOKO TUNAI MOCKUP FIXX.png",
    desc: "Desain logo, palet warna, dan panduan brand untuk platform e-commerce thrift modern.",
    images: ["/image/TOKO TUNAI MOCKUP FIXX.png"],
  },
];

export default function DesignGallery() {
  const [gallery, setGallery] = useState(GALLERY_DATA);
  const [lightbox, setLightbox] = useState(null); // { images: [url], index, title }
  const [loading, setLoading] = useState(!!supabase);

  // Hydrate designs + galeri gambar dari Supabase bila aktif.
  useEffect(() => {
    if (!supabase) return;
    
    (async () => {
      const { data: designs } = await supabase
        .from("designs").select("*")
        .order("sort_order").order("created_at", { ascending: false });
      if (!designs || !designs.length) {
        setLoading(false);
        return;
      }
      const { data: imgs } = await supabase
        .from("design_images").select("*").order("sort_order");
      const byDesign = (imgs || []).reduce((acc, im) => {
        (acc[im.design_id] ||= []).push(im.image_url);
        return acc;
      }, {});
      setGallery(designs.map((d) => ({
        id: d.id,
        title: d.title,
        category: "design",
        image: d.cover_image_url,
        desc: d.description,
        images: byDesign[d.id] || (d.cover_image_url ? [d.cover_image_url] : []),
      })));
      setLoading(false);
    })();
  }, []);

  // Handle keyboard events (Escape to close, Arrows to paginate)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightbox(null);
      }
      if (lightbox && lightbox.images.length > 1) {
        if (e.key === "ArrowLeft") {
          setLightbox((l) => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length }));
        } else if (e.key === "ArrowRight") {
          setLightbox((l) => ({ ...l, index: (l.index + 1) % l.images.length }));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  const openItem = (item) => {
    if (item.images && item.images.length) setLightbox({ images: item.images, index: 0, title: item.title });
  };

  return (
    <main className="min-h-[100dvh] bg-bg-dark text-white p-4 sm:p-8 md:p-16 relative overflow-x-hidden">
      
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
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-3 md:mb-4 tracking-tighter uppercase leading-tight">
          Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">Gallery</span>
        </h1>
        <p className="text-gray-400 max-w-xl text-sm md:text-base font-light leading-relaxed">
          Eksplorasi estetika dalam desain grafis — branding, UI/UX, dan identitas visual.
        </p>

        {/* Link to Video page */}
        <div className="flex gap-3 mt-6">
          <Link href="/video" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:border-accent hover:text-accent transition-all bg-white/5">
            <i className="ri-video-line"></i> Lihat Video Works
          </Link>
        </div>
      </div>

      {/* 💎 MASONRY GRID 💎 */}
      <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-6 relative z-10">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="break-inside-avoid mb-6 rounded-[24px] overflow-hidden bg-[#111] border border-white/5 animate-pulse">
              <div className="w-full aspect-[4/5] bg-white/5"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
                <div className="h-4 bg-white/5 rounded-md w-5/6"></div>
              </div>
            </div>
          ))
        ) : (
          gallery.map((item) => (
            <div 
              key={item.id} 
              role="button"
              tabIndex={0}
              aria-label={`${item.title} - Desain`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openItem(item);
                }
              }}
              className="break-inside-avoid mb-6 group relative rounded-[20px] md:rounded-[24px] overflow-hidden bg-[#111] border border-white/5 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-500 cursor-pointer"
              onClick={() => openItem(item)}
            >
              <div className="relative w-full overflow-hidden aspect-auto bg-black">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  width={600} 
                  height={800} 
                  className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                
                {/* Category Tag */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] md:text-[11px] font-bold text-white/80 uppercase tracking-widest transition-all duration-300">
                  design
                </div>

                {/* Gallery indicator */}
                {item.images && item.images.length > 1 && (
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-[10px] md:text-[11px] font-bold text-white/80 flex items-center gap-1">
                    <i className="ri-image-line"></i> {item.images.length}
                  </div>
                )}
              </div>
              
              <div className="p-5 md:p-6 bg-gradient-to-t from-[#111] to-transparent">
                <h3 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 text-white/90 group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-gray-500 text-[11px] md:text-xs leading-relaxed line-clamp-2">{item.desc}</p>
              </div>
            </div>
          ))
        )}
        {!loading && !gallery.length && (
          <p className="text-gray-500 text-sm col-span-full text-center py-12">Belum ada desain.</p>
        )}
      </div>

      {/* 🖼️ DESIGN LIGHTBOX (slideshow design_images) 🖼️ */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setLightbox(null)}></div>
          <button onClick={() => setLightbox(null)}
            className="fixed top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center z-[300] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none">
            <i className="ri-close-line text-xl md:text-2xl"></i>
          </button>
          {lightbox.images.length > 1 && (
            <>
              <button onClick={() => setLightbox((l) => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length }))}
                className="fixed left-4 md:left-10 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-white/20 text-white rounded-full flex items-center justify-center z-[300] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none">
                <i className="ri-arrow-left-s-line text-2xl md:text-3xl"></i>
              </button>
              <button onClick={() => setLightbox((l) => ({ ...l, index: (l.index + 1) % l.images.length }))}
                className="fixed right-4 md:right-10 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-white/20 text-white rounded-full flex items-center justify-center z-[300] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none">
                <i className="ri-arrow-right-s-line text-2xl md:text-3xl"></i>
              </button>
            </>
          )}
          <div className="relative z-10 max-w-5xl w-full text-center">
            <div className="relative w-full max-h-[78vh] aspect-[4/3]">
              <Image src={lightbox.images[lightbox.index]} alt={lightbox.title} fill sizes="100vw" className="object-contain" />
            </div>
            <p className="text-white font-bold mt-4">{lightbox.title}
              {lightbox.images.length > 1 && <span className="text-gray-400 font-normal text-sm"> · {lightbox.index + 1}/{lightbox.images.length}</span>}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 md:mt-32 pb-8 md:pb-16 text-center border-t border-white/5 pt-8 md:pt-10">
        <p className="text-gray-600 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em]">
          Galang Arrauf Pramudito • Design Gallery 2026
        </p>
      </footer>
    </main>
  );
}