"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ==========================================
// 📂 DATA GALLERY (Desain & 7 Video Drive)
// ==========================================
const GALLERY_DATA = [
  // --- SECTION DESIGN ---
  {
    id: 1,
    title: "TPQ Al-Hikmah Branding",
    category: "design",
    image: "/image/TOKO TUNAI BGDARK mockup fix.png",
    desc: "Identitas visual lengkap untuk lembaga TPQ Al-Hikmah."
  },
  {
    id: 2,
    title: "HeartHorizon LMS UI",
    category: "design",
    image: "/image/Photo by Pankaj Patel on Unsplash.jpg",
    desc: "Perancangan antarmuka pengguna untuk platform Online Class."
  },
  {
    id: 3,
    title: "ThriftyFinds Identity",
    category: "design",
    image: "/image/thumbnail/download.jpg",
    desc: "Desain logo dan palet warna untuk platform e-commerce thrift."
  },

  // --- SECTION VIDEO ---
  {
    id: 4,
    title: "Creative Video Showcase 1",
    category: "video",
    image: "/image/kantor disnaker.jpg",
    videoUrl: "https://drive.google.com/file/d/18rl6oX3F_ZaaTaoSONB6v2hs-uxYESB5/preview",
    desc: "Project editing video dokumentasi profesional."
  },
  {
    id: 5,
    title: "Creative Video Showcase 2",
    category: "video",
    image: "/image/kantor disnaker.jpg",
    videoUrl: "https://drive.google.com/file/d/1gHHz2DmmbvNLucbE3djJp0Rgph151s60/preview",
    desc: "Editing video dengan teknik transisi modern."
  },
  {
    id: 6,
    title: "Creative Video Showcase 3",
    category: "video",
    image: "/image/kantor disnaker.jpg",
    videoUrl: "https://drive.google.com/file/d/1pevh5g-okN18hD9B5jdsfyIwu_6QxnJq/preview",
    desc: "Visual storytelling melalui color grading sinematik."
  },
  {
    id: 7,
    title: "Creative Video Showcase 4",
    category: "video",
    image: "/image/kantor disnaker.jpg",
    videoUrl: "https://drive.google.com/file/d/1EaQ2jKuZtgh5YVkbX4caAq7uXsrZrpQ2/preview",
    desc: "Motion graphics dan konten visual kreatif."
  },
  {
    id: 8,
    title: "Creative Video Showcase 5",
    category: "video",
    image: "/image/kantor disnaker.jpg",
    videoUrl: "https://drive.google.com/file/d/1b4sYM6GY88YfG4PhnjrJmeXN0nNendDf/preview",
    desc: "Video promosi institusi dengan VN/CapCut Pro."
  },
  {
    id: 9,
    title: "Creative Video Showcase 6",
    category: "video",
    image: "/image/kantor disnaker.jpg",
    videoUrl: "https://drive.google.com/file/d/1jAV6GxrbbN9sKAc9kypL21WKynx3cLfK/preview",
    desc: "Showcase final dari koleksi video editing."
  },
  {
    id: 10,
    title: "Creative Video Showcase 7",
    category: "video",
    image: "/image/kantor disnaker.jpg",
    videoUrl: "https://drive.google.com/file/d/1xBGPc8PI1z1wEkhTzwQ8mxUKMUyMl-nJ/preview", 
    desc: "Showcase tambahan dari koleksi video editing."
  }
];

export default function DesignGallery() {
  const [filter, setFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const filteredData = filter === "all" 
    ? GALLERY_DATA 
    : GALLERY_DATA.filter(item => item.category === filter);

  return (
    <main className="min-h-screen bg-bg-dark text-white p-6 md:p-16 relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute left-[-10%] top-[-10%] w-[40%] h-[40%] bg-accent blur-[120px] rounded-full"></div>
        <div className="absolute right-[-10%] bottom-[-10%] w-[40%] h-[40%] bg-primary blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-16 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-accent font-bold uppercase text-[10px] tracking-[0.2em] mb-12 hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center group-hover:bg-accent group-hover:text-bg-dark transition-all">
            <i className="ri-arrow-left-line"></i>
          </div>
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tighter uppercase">Creative <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">Archives</span></h1>
        <p className="text-gray-400 max-w-xl text-base font-light leading-relaxed">Eksplorasi estetika dalam desain grafis dan teknik pengolahan video profesional.</p>
      </div>

      {/* Modern Filter Pill */}
      <div className="max-w-6xl mx-auto flex gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar relative z-10">
        {["all", "design", "video"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === cat 
              ? "bg-accent text-bg-dark border-accent" 
              : "border-white/10 text-gray-500 hover:border-white/30 hover:text-white bg-white/5"
            }`}
          >
            {cat === "all" ? "All Works" : cat === "design" ? "Graphic Design" : "Video Editing"}
          </button>
        ))}
      </div>

      {/* 💎 MINIMALIST MASONRY GRID 💎 */}
      <div className="max-w-6xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 relative z-10">
        {filteredData.map((item) => (
          <div 
            key={item.id} 
            className="break-inside-avoid group relative rounded-[24px] overflow-hidden bg-[#111] border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer"
            onClick={() => item.category === "video" ? setSelectedVideo(item.videoUrl) : null}
          >
            <div className="relative w-full overflow-hidden aspect-auto bg-black">
              {/* Image dengan zoom yang sangat halus */}
              <Image 
                src={item.image} 
                alt={item.title} 
                width={600} 
                height={800} 
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />
              
              {/* Minimalist Video Overlay (Ganti bulat-bulat dengan teks simple) */}
              {item.category === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all duration-500">
                  <span className="opacity-0 group-hover:opacity-100 text-white font-bold uppercase tracking-[0.2em] text-[10px] border border-white/20 px-4 py-2 rounded-md backdrop-blur-sm transition-opacity duration-500">
                    Play Video
                  </span>
                </div>
              )}
              
              {/* Subtle Category Tag */}
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[9px] font-bold text-white/80 uppercase tracking-widest opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {item.category}
              </div>
            </div>
            
            {/* Detail Content */}
            <div className="p-6 bg-gradient-to-t from-[#111] to-transparent">
              <h3 className="text-lg font-bold mb-2 text-white/90 group-hover:text-white transition-colors">{item.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🎬 MODAL VIDEO PLAYER 🎬 */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedVideo(null)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 scale-in-center">
            <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center z-20 transition-all active:scale-90 border border-white/20">
              <i className="ri-close-line text-2xl"></i>
            </button>
            <iframe src={selectedVideo} className="w-full h-full border-none" allow="autoplay" allowFullScreen></iframe>
          </div>
        </div>
      )}

      {/* Footer Galeri */}
      <footer className="mt-32 pb-16 text-center border-t border-white/5 pt-10">
        <p className="text-gray-600 text-[9px] font-bold uppercase tracking-[0.4em]">
          Galang Arrauf Pramudito • Visual Archives 2026
        </p>
      </footer>
    </main>
  );
}