'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// Fallback: video lama dari data statis (dipakai bila Supabase belum aktif).
const FALLBACK_VIDEOS = [
  { id: 'f1', title: 'Creative Video Showcase 1', thumbnail_url: '/image/kantor disnaker.jpg', video_url: 'https://drive.google.com/file/d/18rl6oX3F_ZaaTaoSONB6v2hs-uxYESB5/preview', platform: 'drive', description: 'Project editing video dokumentasi profesional.' },
  { id: 'f2', title: 'Creative Video Showcase 2', thumbnail_url: '/image/kantor disnaker.jpg', video_url: 'https://drive.google.com/file/d/1gHHz2DmmbvNLucbE3djJp0Rgph151s60/preview', platform: 'drive', description: 'Editing video dengan teknik transisi modern.' },
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

  useEffect(() => {
    if (!supabase) return;
    supabase.from('videos').select('*').order('sort_order').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length) setVideos(data);
    });
  }, []);

  return (
    <main className="min-h-screen bg-bg-dark text-white p-4 sm:p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-accent text-sm uppercase tracking-widest mb-8 inline-block">← Back to Home</Link>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-10 tracking-tighter uppercase">
          Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">Showcase</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => (
            <div key={v.id} onClick={() => setSelected(getEmbedUrl(v.video_url, v.platform))}
              className="group relative rounded-2xl overflow-hidden bg-[#111] border border-white/10 cursor-pointer">
              <div className="relative aspect-video bg-black">
                {v.thumbnail_url && (
                  <Image src={v.thumbnail_url} alt={v.title} fill sizes="33vw" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center">
                    <i className="ri-play-fill text-bg-dark text-2xl ml-1"></i>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold mb-1">{v.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2">{v.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelected(null)}></div>
          <button onClick={() => setSelected(null)}
            className="fixed top-4 right-4 w-10 h-10 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center z-[300]">
            <i className="ri-close-line text-xl"></i>
          </button>
          <div className="relative w-full max-w-6xl aspect-video bg-black md:rounded-2xl overflow-hidden z-10">
            <iframe src={selected} className="w-full h-full border-none" allow="autoplay; fullscreen" allowFullScreen></iframe>
          </div>
        </div>
      )}
    </main>
  );
}
