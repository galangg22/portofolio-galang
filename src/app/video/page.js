'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// Fallback: video lama dari data statis (dipakai bila Supabase belum aktif).
const FALLBACK_VIDEOS = [
  {
    id: 'f1',
    title: 'Dokumentasi Profesional Disnaker',
    thumbnail_url: '/image/kantor disnaker.jpg',
    video_url: 'https://drive.google.com/file/d/18rl6oX3F_ZaaTaoSONB6v2hs-uxYESB5/preview',
    platform: 'drive',
    description: 'Video dokumentasi kegiatan resmi di kantor Disnaker — editing profesional dengan VN Editor.',
  },
  {
    id: 'f2',
    title: 'Video Transisi Modern',
    thumbnail_url: '/image/kantor disnaker.jpg',
    video_url: 'https://drive.google.com/file/d/1gHHz2DmmbvNLucbE3djJp0Rgph151s60/preview',
    platform: 'drive',
    description: 'Project editing video dengan teknik transisi modern dan smooth cuts menggunakan CapCut Pro.',
  },
  {
    id: 'f3',
    title: 'Color Grading Sinematik',
    thumbnail_url: '/image/kantor disnaker.jpg',
    video_url: 'https://drive.google.com/file/d/1pevh5g-okN18hD9B5jdsfyIwu_6QxnJq/preview',
    platform: 'drive',
    description: 'Visual storytelling melalui color grading sinematik — warm tones dan cinematic look.',
  },
  {
    id: 'f4',
    title: 'Motion Graphics Kreatif',
    thumbnail_url: '/image/kantor disnaker.jpg',
    video_url: 'https://drive.google.com/file/d/1EaQ2jKuZtgh5YVkbX4caAq7uXsrZrpQ2/preview',
    platform: 'drive',
    description: 'Konten motion graphics dan visual kreatif untuk kebutuhan promosi institusi.',
  },
  {
    id: 'f5',
    title: 'Video Promosi Institusi',
    thumbnail_url: '/image/kantor disnaker.jpg',
    video_url: 'https://drive.google.com/file/d/1b4sYM6GY88YfG4PhnjrJmeXN0nNendDf/preview',
    platform: 'drive',
    description: 'Video promosi institusi dengan editing profesional menggunakan VN dan CapCut Pro.',
  },
  {
    id: 'f6',
    title: 'Showreel Video Editing',
    thumbnail_url: '/image/kantor disnaker.jpg',
    video_url: 'https://drive.google.com/file/d/1jAV6GxrbbN9sKAc9kypL21WKynx3cLfK/preview',
    platform: 'drive',
    description: 'Kompilasi showcase dari berbagai project video editing selama 2025-2026.',
  },
  {
    id: 'f7',
    title: 'Highlight Reel Kegiatan',
    thumbnail_url: '/image/kantor disnaker.jpg',
    video_url: 'https://drive.google.com/file/d/1xBGPc8PI1z1wEkhTzwQ8mxUKMUyMl-nJ/preview',
    platform: 'drive',
    description: 'Highlight reel dari berbagai kegiatan kampus dan organisasi — fast-paced editing style.',
  },
];

function getEmbedUrl(videoUrl, platform) {
  if (!videoUrl) return '';
  try {
    if (platform === 'youtube') {
      const id = new URL(videoUrl).searchParams.get('v') || videoUrl.split('/').pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    if (platform === 'drive') {
      if (videoUrl.includes('/preview')) return videoUrl;
      const id = videoUrl.match(/\/d\/([^/]+)/)?.[1];
      return id ? `https://drive.google.com/file/d/${id}/preview` : videoUrl;
    }
    if (platform === 'vimeo') {
      const id = videoUrl.split('/').pop();
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return videoUrl;
  }
  return videoUrl;
}

export default function VideoGallery() {
  const [videos, setVideos] = useState(FALLBACK_VIDEOS);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase.from('videos').select('*').order('sort_order').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length) setVideos(data);
      setLoading(false);
    });
  }, []);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelected(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-bg-dark text-white p-4 sm:p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-3 text-accent font-bold uppercase text-[10px] tracking-[0.2em] mb-8 md:mb-12 hover:text-black dark:hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
            <i className="ri-arrow-left-line"></i>
          </div>
          Back to Home
        </Link>
        <h1 className="font-display text-4xl md:text-6xl font-normal mb-4 tracking-tight">
          Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Showcase</span>
        </h1>
        <p className="text-gray-400 max-w-xl text-sm md:text-base font-light leading-relaxed mb-10">
          Koleksi video editing — dokumentasi, promosi, motion graphics, dan showreel.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden bg-card-bg border border-white/10 animate-pulse">
                <div className="relative aspect-video bg-white/5"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded-md w-5/6"></div>
                </div>
              </div>
            ))
          ) : (
            videos.map((v) => (
              <div 
                key={v.id} 
                role="button"
                tabIndex={0}
                aria-label={`Play video: ${v.title}`}
                onClick={() => setSelected(getEmbedUrl(v.video_url, v.platform))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(getEmbedUrl(v.video_url, v.platform));
                  }
                }}
                className="group relative rounded-2xl overflow-hidden bg-card-bg border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="relative aspect-video bg-black">
                  {v.thumbnail_url && (
                    <Image src={v.thumbnail_url} alt={v.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-focus:scale-110">
                      <i className="ri-play-fill text-white text-2xl ml-1"></i>
                    </div>
                  </div>
                  {/* Platform badge */}
                  {v.platform && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[8px] font-bold text-white/80 uppercase tracking-widest">
                      {v.platform === 'youtube' && <><i className="ri-youtube-line mr-1"></i>YouTube</>}
                      {v.platform === 'drive' && <><i className="ri-drive-line mr-1"></i>Drive</>}
                      {v.platform === 'vimeo' && <><i className="ri-vimeo-line mr-1"></i>Vimeo</>}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold mb-1">{v.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2">{v.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelected(null)}></div>
          <button onClick={() => setSelected(null)}
            className="fixed top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center z-[300] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none">
            <i className="ri-close-line text-xl md:text-2xl"></i>
          </button>
          <div className="relative w-full max-w-6xl aspect-video bg-black md:rounded-2xl overflow-hidden z-10">
            <iframe src={selected} className="w-full h-full border-none" allow="autoplay; fullscreen" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <footer className="mt-20 md:mt-32 pb-8 md:pb-16 text-center border-t border-white/5 pt-8 md:pt-10">
        <p className="text-gray-600 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em]">
          Galang Arrauf Pramudito • Video Showcase 2026
        </p>
      </footer>
    </main>
  );
}
