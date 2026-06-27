"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/lib/supabase";
import PdfThumbnail from "@/app/components/PdfThumbnail";
import EntranceAnimation from "@/app/components/EntranceAnimation";
import { DynamicIsland } from "@/app/components/DynamicIsland";

const SKILLS_DATA = [
  {
    category: "Backend & Architecture",
    icon: "ri-server-line",
    items: ["PHP Laravel", "Routing & State Management", "System Architecture", "Scalable Backend"],
    color: "from-accent to-emerald-400",
    highlight: true,
    desc: "Keahlian utama — membangun arsitektur aplikasi web tangguh dan dapat diskalakan."
  },
  {
    category: "Database & Optimization",
    icon: "ri-database-2-line",
    items: ["PostgreSQL", "SQLite", "Schema Design", "Query Optimization", "Connection Pooling"],
    color: "from-emerald-400 to-teal-400",
    highlight: true,
    desc: "Perancangan skema relasional dan optimalisasi kueri untuk performa tinggi."
  },
  {
    category: "AI Integration",
    icon: "ri-brain-line",
    items: ["Ollama / DeepSeek", "Cloud AI API", "Custom AI Assistants", "Prompt Engineering"],
    color: "from-amber-400 to-orange-400",
    desc: "Menanamkan AI ke dalam ekosistem aplikasi — lokal maupun cloud."
  },
  {
    category: "Frontend & Visual",
    icon: "ri-layout-3-line",
    items: ["Blade Templates", "Tailwind CSS", "Livewire", "UI/UX Awareness"],
    color: "from-primary to-purple-400",
    desc: "Interface yang fungsional sekaligus visual — gabungan kode dan estetika."
  },
  {
    category: "DevOps & Automation",
    icon: "ri-git-branch-line",
    items: ["GitHub Actions CI/CD", "API Integration", "Local Tunneling", "Environment Config"],
    color: "from-blue-400 to-cyan-400",
    desc: "Workflow profesional — otomasi, deploy, dan integrasi layanan pihak ketiga."
  },
  {
    category: "Technical Documentation",
    icon: "ri-file-text-line",
    items: ["Technical Writing", "Data Architecture Docs", "Project Reporting"],
    color: "from-gray-400 to-slate-400",
    desc: "Dokumentasi teknis terstruktur agar proyek mudah dipelihara."
  },
];

const DEV_PROJECTS = [
  {
    title: "Bot WA Reminder Absensi",
    image: null,
    gradient: "from-neutral-900 via-neutral-800 to-black",
    icon: "ri-whatsapp-line",
    tags: ["Node.js", "Baileys API", "Automation"],
    type: "bot",
    desc: "Sistem automasi backend untuk memonitor jadwal dan mengirimkan pengingat absensi secara otomatis via WhatsApp. Menggunakan library Baileys untuk integrasi langsung dengan WhatsApp tanpa API resmi.",
    github_url: "https://github.com/galangpramudito/bot-presensi",
    link: "https://github.com/galangpramudito/bot-presensi",
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  },
  {
    title: "Sistem Web TPQ Al-Hikmah",
    image: null,
    gradient: "from-stone-900 via-neutral-900 to-zinc-950",
    icon: "ri-graduation-cap-line",
    tags: ["Web Dev", "HTML", "CSS"],
    type: "web",
    desc: "Platform sistem informasi manajemen untuk digitalisasi administrasi santri dan guru di TPQ Al-Hikmah. Menangani data absensi, nilai, dan profil santri.",
    github_url: "https://github.com/galangpramudito/alhikmah",
    link: "https://github.com/galangpramudito/alhikmah",
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  },
  {
    title: "ThriftyFinds E-Commerce",
    image: "/image/TOKO TUNAI BGDARK mockup fix.png",
    gradient: null,
    icon: null,
    tags: ["React/Next.js", "Tailwind", "E-Commerce"],
    type: "web",
    desc: "Katalog e-commerce modern untuk produk thrifting dengan UI/UX intuitif dan performa pencarian cepat. Dibangun dengan Next.js dan Tailwind CSS.",
    github_url: "https://github.com/galangpramudito/thriftyfinds",
    link: "https://github.com/galangpramudito/thriftyfinds",
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  },
  {
    title: "HeartHorizon / Online Class",
    image: "/image/Photo by Pankaj Patel on Unsplash.jpg",
    gradient: null,
    icon: null,
    tags: ["LMS", "Fullstack", "Database"],
    type: "web",
    desc: "Aplikasi e-learning interaktif untuk manajemen materi kelas online, penugasan, dan interaksi pembelajaran. Full-stack dengan backend database MySQL.",
    github_url: "https://github.com/galangpramudito/hearthorizon",
    link: "https://github.com/galangpramudito/hearthorizon",
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  }
];

const TYPE_LABELS = {
  web: { label: "Web Apps", icon: "ri-global-line", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  bot: { label: "Service Automation", icon: "ri-robot-2-line", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  android: { label: "Mobile Apps", icon: "ri-smartphone-line", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  other: { label: "Other", icon: "ri-code-s-slash-line", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
};

const PROJECT_FILTERS = [
  { key: "all", label: "All Projects", icon: "ri-apps-line" },
  { key: "web", label: "Web Apps", icon: "ri-global-line" },
  { key: "bot", label: "Service Automation", icon: "ri-robot-2-line" },
  { key: "android", label: "Mobile Apps", icon: "ri-smartphone-line" },
];

const FEATURED_CREATIVE = [
  {
    id: 1,
    title: "UI/UX HeartHorizon",
    category: "Design",
    image: "/image/TOKO TUNAI BGDARK mockup fix.png",
    desc: "Proses perancangan antarmuka pengguna untuk platform e-learning.",
    type: "image"
  },
  {
    id: 2,
    title: "Video Editing Showcase",
    category: "Video",
    image: "/image/kantor disnaker.jpg",
    videoUrl: "https://drive.google.com/file/d/18rl6oX3F_ZaaTaoSONB6v2hs-uxYESB5/preview",
    desc: "Editing video dokumentasi panjang dengan VN/CapCut.",
    type: "video"
  }
];

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [showEntrance, setShowEntrance] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [skills, setSkills] = useState(SKILLS_DATA);
  const [projects, setProjects] = useState(DEV_PROJECTS);
  const [projectFilter, setProjectFilter] = useState("all");
  const [certificates, setCertificates] = useState([]);
  const [certsLoading, setCertsLoading] = useState(!!supabase);
  const [skillsLoading, setSkillsLoading] = useState(!!supabase);
  const [projectsLoading, setProjectsLoading] = useState(!!supabase);
  const mainRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("skills").select("*").order("sort_order").then(({ data }) => {
      if (data && data.length) setSkills(data);
      setSkillsLoading(false);
    });
    supabase
      .from("projects")
      .select("*")
      .neq("status", "private")
      .order("featured", { ascending: false })
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length) {
          setProjects(
            data.map((p) => ({
              title: p.title,
              image: p.thumbnail_url || null,
              gradient: p.thumbnail_url ? null : "from-neutral-900 via-neutral-800 to-black",
              icon: p.thumbnail_url ? null : "ri-code-s-slash-line",
              tags: p.tags || [],
              type: p.type || "web",
              desc: p.description,
              github_url: p.github_url || null,
              demo_url: p.demo_url || null,
              play_store_url: p.play_store_url || null,
              apk_url: p.apk_url || null,
              link: p.demo_url || p.github_url || "#",
              actionText: p.demo_url ? "Live Demo" : "GitHub Repo",
              actionIcon: p.demo_url ? "ri-external-link-line" : "ri-github-fill",
            }))
          );
        }
        setProjectsLoading(false);
      });
    supabase.from("certificates").select("*").eq("featured", true).order("sort_order").limit(3).then(({ data }) => {
      if (data) setCertificates(data);
      setCertsLoading(false);
    });
  }, []);

  useEffect(() => {
    const sectionIds = ["home", "about", "skills", "projects", "certificates", "contact"];
    const observers = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedVideo(null);
        setIsCvModalOpen(false);
        setSelectedCert(null);
        setIsPreviewModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();
    let ctx = gsap.context(() => {
      gsap.from(".hero-el", { y: 40, opacity: 0, duration: 1.2, stagger: 0.2, ease: "power4.out", delay: 0.2 });
      gsap.utils.toArray("section").forEach((section) => {
        const title = section.querySelector(".section-title");
        if (title) {
          gsap.from(title, {
            opacity: 0, x: -50, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 80%" }
          });
        }
      });
      gsap.utils.toArray(".bento-card, .work-card, .visual-card").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
          delay: i * 0.06,
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
    }, mainRef);
    return () => ctx.revert();
  }, [skillsLoading, projectsLoading, certsLoading]);

  return (
    <main ref={mainRef} className="bg-bg-dark selection:bg-accent selection:text-bg-dark relative overflow-x-hidden">

      {showEntrance && <EntranceAnimation onComplete={() => setShowEntrance(false)} />}

      <DynamicIsland activeSection={activeSection} />

      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>

      <section id="home" className="relative min-h-[100dvh] flex items-center px-6 md:px-12 lg:px-20 z-10 overflow-hidden pt-20 md:pt-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-5 md:space-y-8">
            <div className="hero-el inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-gray-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Available for Internship & Freelance
            </div>
            <h1 className="hero-el text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] leading-[1.05]">
              Galang <span className="text-accent">Pramudito</span>
            </h1>
            <p className="hero-el text-base md:text-lg text-gray-400 font-light max-w-xl leading-relaxed">
              Crafting robust web solutions &amp; intelligent automation from Sidoarjo.
            </p>
            <div className="hero-el flex flex-wrap gap-3 md:gap-4 pt-2">
              <a href="#projects" className="px-6 md:px-8 py-3 md:py-3.5 bg-accent text-bg-dark font-bold text-sm rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20">View My Work</a>
              <button onClick={() => setIsCvModalOpen(true)} className="group px-6 md:px-8 py-3 md:py-3.5 border border-white/10 text-white text-sm font-medium rounded-full hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer z-20 relative inline-flex items-center gap-2">
                <i className="ri-file-user-line text-lg group-hover:text-accent transition-colors"></i>
                My Resume
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="hero-el relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px]">
              <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/10 bg-card-bg shadow-2xl">
                <Image src="/image/gambar galang 2.jpg" alt="Galang Pramudito" fill sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 380px" className="object-cover scale-105 hover:scale-100 transition-transform duration-700" priority />
              </div>
              <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border border-white/[0.04] -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-card-bg via-card-bg to-accent/5 shadow-xl p-8">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-6">Tech Stack</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Laravel', slug: 'laravel' },
                      { name: 'PHP', slug: 'php' },
                      { name: 'PostgreSQL', slug: 'postgresql' },
                      { name: 'Tailwind', slug: 'tailwindcss' },
                      { name: 'Next.js', slug: 'nextdotjs' },
                      { name: 'React', slug: 'react' },
                    ].map((tech) => (
                      <div key={tech.name} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://cdn.simpleicons.org/${tech.slug}/ffffff`} alt={tech.name} className="w-6 h-6" loading="lazy" />
                        <span className="text-[9px] text-gray-400 font-medium text-center leading-tight">{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-6 border-t border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Also Work With</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Git', slug: 'git' },
                      { name: 'Docker', slug: 'docker' },
                      { name: 'Node.js', slug: 'nodedotjs' },
                      { name: 'Supabase', slug: 'supabase' },
                    ].map((tech) => (
                      <div key={tech.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://cdn.simpleicons.org/${tech.slug}/ffffff`} alt={tech.name} className="w-3.5 h-3.5" loading="lazy" />
                        <span className="text-[9px] text-gray-400">{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-black border border-white/10 p-5 rounded-2xl shadow-2xl">
              <p className="text-accent font-bold text-xl">10+</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest">Projects Completed</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <h2 className="section-title text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-[1.15]">
              Halo, saya <span className="text-accent">Galang</span>
            </h2>
            <p className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed">
              Web developer yang fokus di backend — <span className="text-accent font-semibold">Laravel, PHP, PostgreSQL</span>. Sehari-hari saya merancang arsitektur aplikasi, mengelola database relasional, dan mengintegrasikan AI ke dalam sistem produksi.
            </p>
            <p className="text-sm md:text-base text-gray-400 mb-8 leading-relaxed">
              Sisi kuat saya: logika sistem yang terstruktur, dokumentasi teknis yang rapi, dan kemampuan menghubungkan teknologi yang berbeda menjadi satu kesatuan yang fungsional. Setiap project adalah solusi, bukan sekadar kumpulan fitur.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="info-card p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] flex items-center gap-3">
                <i className="ri-server-line text-2xl text-accent"></i>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest">Core Stack</p><p className="font-bold text-white text-sm">Laravel + PHP + PostgreSQL</p></div>
              </div>
              <div className="info-card p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] flex items-center gap-3">
                <i className="ri-brain-line text-2xl text-accent"></i>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest">Differentiator</p><p className="font-bold text-white text-sm">AI Integration &amp; Automation</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="py-24 px-6 bg-black/20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="skills-header mb-12">
            <h2 className="section-title text-3xl md:text-4xl font-bold tracking-tight">Core Expertise</h2>
            <p className="skills-desc text-gray-400 text-sm md:text-base mt-3 max-w-lg leading-relaxed">
              Teknologi dan keahlian yang saya kuasai dalam pengembangan web, arsitektur sistem, dan otomasi.
            </p>
          </div>
          {skillsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className={`rounded-2xl bg-card-bg border border-white/10 p-6 animate-pulse ${idx < 2 ? 'md:col-span-2' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-white/5 mb-4"></div>
                  <div className="h-5 bg-white/10 rounded-md w-2/3 mb-3"></div>
                  <div className="h-3 bg-white/5 rounded-md w-full mb-4"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span key={i} className="h-5 w-16 bg-white/5 border border-white/5 rounded-lg"></span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="skills-grid grid grid-cols-1 md:grid-cols-2 gap-5">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`skill-card rounded-2xl border p-6 transition-all duration-300 ${
                    skill.highlight
                      ? 'is-highlighted border-accent/20 bg-gradient-to-br from-card-bg via-card-bg to-accent/5 ring-1 ring-accent/20'
                      : 'border-white/10 bg-card-bg hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center shrink-0`}>
                      <i className={`${skill.icon} text-lg text-white`}></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white">{skill.category}</h3>
                        {skill.highlight && (
                          <span className="keep-accent px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-semibold uppercase tracking-wider rounded-full">Core</span>
                        )}
                      </div>
                      {skill.desc && (
                        <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">{skill.desc}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.items.map(item => (
                      <span key={item} className="skill-tag px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[11px] font-medium text-gray-300 leading-relaxed">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="projects" className="py-32 px-6 relative z-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-40 top-1/4 w-[500px] h-[500px] rounded-full bg-accent/3 blur-[140px]"></div>
          <div className="absolute -right-40 bottom-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[120px]"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <p className="work-eyebrow text-[11px] uppercase tracking-[0.22em] text-gray-500 font-mono mb-4">Featured Work</p>
              <h2 className="section-title text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]">
                Selected <span className="text-accent">Projects</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base mt-4 max-w-lg leading-relaxed">
                Project development, service automation, dan arsitektur aplikasi.
              </p>
            </div>
            <Link
              href="/projects"
              className="group work-viewall-btn px-6 py-3.5 bg-white/[0.04] border border-white/[0.10] text-white font-bold text-xs tracking-wider rounded-full hover:bg-accent hover:border-accent hover:text-bg-dark active:scale-[0.96] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-3"
            >
              <span>View All</span>
              <span className="w-7 h-7 rounded-full bg-white/10 dark:bg-white/10 group-hover:bg-black/10 flex items-center justify-center transition-all duration-500">
                <i className="ri-arrow-right-line text-sm group-hover:translate-x-0.5 transition-transform duration-300"></i>
              </span>
            </Link>
          </div>

          <div className="flex gap-2 mb-16 overflow-x-auto pb-2 no-scrollbar">
            {PROJECT_FILTERS.filter(f => f.key === 'all' || projects.some(p => p.type === f.key)).map((f) => (
              <button
                key={f.key}
                onClick={() => setProjectFilter(f.key)}
                className={`shrink-0 relative px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap flex items-center gap-2.5 ${
                  projectFilter === f.key
                    ? "text-white"
                    : "text-gray-500 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                {projectFilter === f.key && (
                  <span className="absolute inset-0 rounded-full bg-accent/20 border border-accent/30"></span>
                )}
                <i className={`${f.icon} relative z-10 ${projectFilter === f.key ? 'text-accent' : ''}`}></i>
                <span className="relative z-10">{f.label}</span>
              </button>
            ))}
          </div>

          {projectsLoading ? (
            <div className="space-y-8 mb-28">
              <div className="p-1.5 bg-white/[0.03] rounded-[2rem] border border-white/[0.06]">
                <div className="h-80 lg:h-[420px] bg-card-bg rounded-[calc(2rem-0.375rem)] animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-1 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                    <div className="h-72 bg-card-bg rounded-[calc(1.5rem-0.25rem)] animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (() => {
            const filtered = projects.filter(p => projectFilter === 'all' || p.type === projectFilter);
            const spotlight = filtered[0];
            const rest = filtered.slice(1);
            if (!spotlight) return <p className="text-gray-500 text-sm text-center py-20">No projects found.</p>;
            const spotlightType = TYPE_LABELS[spotlight.type] || TYPE_LABELS.other;
            return (
              <div className="space-y-8 mb-28">

                <div className="work-card p-1.5 bg-white/[0.03] rounded-[2rem] border border-white/[0.06] group/card hover:border-accent/25 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <div className="rounded-[calc(2rem-0.375rem)] overflow-hidden bg-card-bg grid lg:grid-cols-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                    <div className="lg:col-span-7 relative h-64 lg:h-[420px] overflow-hidden">
                      {spotlight.image ? (
                        <Image src={spotlight.image} alt={spotlight.title} fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover group-hover/card:scale-[1.04] transition-transform duration-1000 ease-out" priority />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${spotlight.gradient} flex items-center justify-center relative`}>
                          <i className={`${spotlight.icon} text-8xl text-white/15`}></i>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent"></div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_30%,rgba(17,17,17,0.4)_65%,#111111_88%)] hidden lg:block"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-card-bg via-card-bg/40 to-transparent lg:hidden"></div>
                      <div className="absolute top-5 left-5">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1.5 backdrop-blur-md ${spotlightType.color}`}>
                          <i className={spotlightType.icon}></i> {spotlightType.label}
                        </span>
                      </div>
                    </div>
                    <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex flex-wrap gap-2 mb-5">
                        {spotlight.tags.map(tag => (
                          <span key={tag} className="work-tag px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-white tracking-tight leading-tight">{spotlight.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-md">{spotlight.desc}</p>
                      <div className="flex flex-wrap gap-3">
                        {spotlight.github_url && (
                          <a href={spotlight.github_url} target="_blank" rel="noopener noreferrer" className="work-btn-ghost group/btn inline-flex items-center gap-2 text-white font-bold text-sm bg-white/[0.06] px-5 py-2.5 rounded-full active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.12] border border-white/[0.08]">
                            <i className="ri-github-fill text-base"></i> Source
                          </a>
                        )}
                        {spotlight.demo_url && (
                          <a href={spotlight.demo_url} target="_blank" rel="noopener noreferrer" className="group/btn inline-flex items-center gap-3 bg-accent text-bg-dark font-bold text-sm px-6 py-2.5 rounded-full hover:scale-[1.02] active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                            <span>Live Demo</span>
                            <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-[0.5px] group-hover/btn:scale-105 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                              <i className="ri-external-link-line text-sm"></i>
                            </span>
                          </a>
                        )}
                        {!spotlight.github_url && !spotlight.demo_url && spotlight.link && spotlight.link !== '#' && (
                          <a href={spotlight.link} target="_blank" rel="noopener noreferrer" className="work-btn-ghost group/btn inline-flex items-center gap-2 text-white font-bold text-sm bg-white/[0.06] px-5 py-2.5 rounded-full active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.12] border border-white/[0.08]">
                            <i className={`${spotlight.actionIcon} text-base`}></i> {spotlight.actionText}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {rest.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {rest.map((project, idx) => {
                      const typeInfo = TYPE_LABELS[project.type] || TYPE_LABELS.other;
                      return (
                        <div key={idx} className="work-card p-1 bg-white/[0.02] rounded-2xl border border-white/[0.06] group/card hover:border-accent/20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                          <div className="rounded-[calc(1.5rem-0.25rem)] overflow-hidden bg-card-bg flex flex-col h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
                            <div className="relative h-48 overflow-hidden">
                              {project.image ? (
                                <Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover/card:scale-[1.05] transition-transform duration-800 ease-out" />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${project.gradient} flex items-center justify-center relative`}>
                                  <i className={`${project.icon} text-5xl text-white/20`}></i>
                                  <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.06] to-transparent"></div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-card-bg via-card-bg/20 to-transparent"></div>
                              <div className="absolute top-4 left-4">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1.5 backdrop-blur-md ${typeInfo.color}`}>
                                  <i className={typeInfo.icon}></i> {typeInfo.label}
                                </span>
                              </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {project.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="work-tag px-2.5 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[9px] text-gray-500 font-semibold uppercase tracking-wider">{tag}</span>
                                ))}
                              </div>
                              <h3 className="text-base font-bold mb-2 text-white tracking-tight">{project.title}</h3>
                              <p className="text-gray-400 text-xs mb-5 flex-1 leading-relaxed line-clamp-2">{project.desc}</p>
                              <div className="flex flex-wrap gap-2 mt-auto">
                                {project.github_url && (
                                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="work-btn-ghost group/btn inline-flex items-center gap-1.5 text-gray-300 font-semibold text-xs bg-white/[0.04] px-4 py-2 rounded-full active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.10] hover:text-white border border-white/[0.06]">
                                    <i className="ri-github-fill text-sm"></i> Source
                                  </a>
                                )}
                                {project.demo_url && (
                                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="group/btn inline-flex items-center gap-2 bg-accent text-bg-dark font-semibold text-xs px-4 py-2 rounded-full hover:scale-[1.02] active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                                    <span>Demo</span>
                                    <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-[0.5px] group-hover/btn:scale-105 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                                      <i className="ri-external-link-line text-[10px]"></i>
                                    </span>
                                  </a>
                                )}
                                {project.play_store_url && (
                                  <a href={project.play_store_url} target="_blank" rel="noopener noreferrer" className="work-btn-ghost group/btn inline-flex items-center gap-1.5 text-gray-300 font-semibold text-xs bg-white/[0.04] px-4 py-2 rounded-full active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.10] hover:text-white border border-white/[0.06]">
                                    <i className="ri-google-play-fill text-sm"></i> Play Store
                                  </a>
                                )}
                                {project.apk_url && (
                                  <a href={project.apk_url} target="_blank" rel="noopener noreferrer" className="work-btn-ghost group/btn inline-flex items-center gap-1.5 text-gray-300 font-semibold text-xs bg-white/[0.04] px-4 py-2 rounded-full active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.10] hover:text-white border border-white/[0.06]">
                                    <i className="ri-android-fill text-sm"></i> APK
                                  </a>
                                )}
                                {!project.github_url && !project.demo_url && !project.play_store_url && !project.apk_url && project.link && project.link !== '#' && (
                                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="work-btn-ghost group/btn inline-flex items-center gap-1.5 text-gray-300 font-semibold text-xs bg-white/[0.04] px-4 py-2 rounded-full active:scale-[0.97] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.10]">
                                    <i className={`${project.actionIcon} text-sm`}></i> {project.actionText}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h2 className="section-title text-3xl md:text-4xl font-bold tracking-tight leading-[1.08]">Visual Works</h2>
              <p className="text-gray-400 text-sm mt-4 max-w-md leading-relaxed">Cuplikan desain &amp; video. Lihat koleksi lengkap di galeri.</p>
            </div>
            <Link
              href="/design"
              className="group work-viewall-btn px-6 py-3.5 bg-white/[0.04] border border-white/[0.10] text-white font-bold text-xs tracking-wider rounded-full hover:bg-accent hover:border-accent hover:text-bg-dark active:scale-[0.96] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center gap-3"
            >
              <span>Full Gallery</span>
              <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-black/10 flex items-center justify-center transition-colors duration-500">
                <i className="ri-arrow-right-line text-sm group-hover:translate-x-0.5 transition-transform duration-300"></i>
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURED_CREATIVE.map((item) => (
              <div
                key={item.id}
                onClick={() => item.type === "video" ? setSelectedVideo(item.videoUrl) : null}
                className={`visual-card group relative aspect-[16/10] rounded-[1.75rem] overflow-hidden border border-white/[0.06] hover:border-accent/25 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${item.type === "video" ? "cursor-pointer" : ""}`}
              >
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-[1.06] transition-transform duration-1000 ease-out" loading="eager" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700"></div>
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-1 bg-black/30 rounded-full group-hover:bg-accent/90 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-white/20 group-hover:border-accent/50">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <i className="ri-play-fill text-white text-xl ml-0.5 group-hover:text-bg-dark transition-colors duration-500"></i>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider rounded-full mb-3 border border-accent/20">{item.category}</span>
                  <h4 className="text-white font-bold text-lg mb-1.5">{item.title}</h4>
                  <p className="text-gray-300 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 max-w-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {selectedVideo && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedVideo(null)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-[1001]">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-black/60 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center z-[1002] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none"
            >
              <i className="ri-close-line text-xl md:text-2xl"></i>
            </button>
            <iframe src={selectedVideo} className="w-full h-full border-none" allow="autoplay" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <section id="certificates" className="py-24 px-6 bg-black/20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="section-title text-3xl md:text-4xl font-bold mb-3 tracking-tight">Certificates</h2>
              <p className="text-gray-400 text-sm max-w-md">Sertifikat dan pencapaian dari berbagai pelatihan dan kompetisi.</p>
            </div>
            <Link href="/certificates" className="px-6 py-3 bg-accent text-bg-dark font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-accent/20">
              View All <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certsLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden flex flex-col animate-pulse">
                  <div className="w-full aspect-[4/3] bg-white/5"></div>
                  <div className="p-6 flex flex-col flex-1 space-y-3">
                    <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded-md w-1/2"></div>
                    <div className="h-4 bg-white/5 rounded-md w-5/6"></div>
                    <div className="h-8 bg-white/5 border border-white/10 rounded-xl w-1/3 mt-auto"></div>
                  </div>
                </div>
              ))
            ) : (
              certificates.map((cert) => (
                <div key={cert.id} onClick={() => setSelectedCert(cert)} className="bento-card group bg-card-bg border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col cursor-pointer">
                  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center overflow-hidden">
                    {cert.verify_url?.endsWith('.pdf') ? (
                      <PdfThumbnail url={cert.verify_url} width={600} />
                    ) : (
                      <i className="ri-award-fill text-6xl text-white/40"></i>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                        <i className="ri-eye-line text-white text-xl"></i>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-base text-white mb-2 line-clamp-2">{cert.title}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2 mb-1"><i className="ri-award-line text-accent"></i> {cert.issuer}</p>
                    {cert.issue_date && <p className="text-xs text-gray-500">{cert.issue_date}</p>}
                    <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold mt-3 group-hover:gap-2.5 transition-all">
                      View Credential <i className="ri-arrow-right-line"></i>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {!certsLoading && !certificates.length && <p className="text-gray-500 text-sm text-center">Belum ada sertifikat.</p>}
        </div>
      </section>

      {selectedCert && (
        <div className="fixed inset-0 z-[1000] flex md:items-center md:justify-center md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedCert(null)}></div>
          <div className="relative z-10 w-full md:max-w-4xl bg-card-bg md:border border-white/10 md:rounded-2xl overflow-y-auto md:max-h-[90vh] grid md:grid-cols-2">
            <button onClick={() => setSelectedCert(null)} className="fixed md:absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-11 md:h-11 bg-black/80 md:bg-white/10 backdrop-blur-md md:hover:bg-red-500 text-white rounded-full flex items-center justify-center z-[1001] transition-all active:scale-90 border border-white/20 md:border-transparent shadow-xl md:shadow-none">
              <i className="ri-close-line text-xl md:text-2xl"></i>
            </button>
            <div className="bg-white/5 flex items-start justify-center overflow-y-auto">
              {selectedCert.verify_url?.endsWith('.pdf') ? (
                <PdfThumbnail url={selectedCert.verify_url} width={900} />
              ) : (
                <div className="w-full aspect-[1/1.414] bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center">
                  <i className="ri-award-fill text-8xl text-white/40"></i>
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col">
              <h4 className="font-bold text-xl text-white mb-4 pr-10">{selectedCert.title}</h4>
              <dl className="space-y-3 text-sm flex-1">
                <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Penerbit</dt><dd className="text-white">{selectedCert.issuer}</dd></div>
                {selectedCert.credential_id && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Credential ID</dt><dd className="text-white break-all">{selectedCert.credential_id}</dd></div>}
                {selectedCert.credential_url && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Credential Link</dt><dd><a href={selectedCert.credential_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors break-all">{selectedCert.credential_url} <i className="ri-external-link-line text-xs"></i></a></dd></div>}
                {selectedCert.issue_date && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Tanggal Terbit</dt><dd className="text-white">{selectedCert.issue_date}</dd></div>}
                {selectedCert.description && <div><dt className="text-gray-500 text-xs uppercase tracking-widest">Deskripsi</dt><dd className="text-gray-300 leading-relaxed">{selectedCert.description}</dd></div>}
              </dl>
              <div className="flex flex-wrap gap-3 mt-6">
                {selectedCert.verify_url && (
                  <a href={selectedCert.verify_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-accent px-5 py-2.5 rounded-xl hover:scale-105 transition-transform">
                    View PDF <i className="ri-file-pdf-2-line"></i>
                  </a>
                )}
                {selectedCert.credential_url && (
                  <a href={selectedCert.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-accent/80 px-5 py-2.5 rounded-xl hover:scale-105 transition-transform">
                    Verify Credential <i className="ri-external-link-line"></i>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <section id="contact" className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto bg-card-bg/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-14 relative overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="section-title text-4xl md:text-5xl font-bold mb-4 uppercase">Let&apos;s Connect</h2>
            <p className="text-gray-400">Punya tawaran kerja atau ide kolaborasi?</p>
          </div>
          <form action="https://formspree.io/f/meoqzdan" method="POST" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nama Lengkap" aria-label="Nama Lengkap" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
              <input type="email" name="email" placeholder="Email Valid" aria-label="Email Valid" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
            </div>
            <textarea name="message" rows="4" placeholder="Pesan Anda..." aria-label="Pesan Anda" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all resize-none"></textarea>
            <button type="submit" className="w-full py-4 bg-white text-bg-dark font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-accent transition-all active:scale-[0.98] shadow-lg">Send Message</button>
          </form>
        </div>
      </section>

      <footer className="py-10 text-center border-t border-white/5">
        <div className="flex justify-center gap-8 mb-8">
          <a href="https://github.com/galangpramudito" target="_blank" rel="noopener noreferrer" aria-label="GitHub Galang Arrauf" className="text-gray-500 hover:text-white text-2xl transition-colors"><i className="ri-github-fill"></i></a>
          <a href="https://www.linkedin.com/in/galang-arrauf-pramudito/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Galang Arrauf" className="text-gray-500 hover:text-white text-2xl transition-colors"><i className="ri-linkedin-fill"></i></a>
          <a href="mailto:galangarrauf22@gmail.com" aria-label="Email Galang Arrauf" className="text-gray-500 hover:text-white text-2xl transition-colors"><i className="ri-mail-line"></i></a>
        </div>
        <p className="text-gray-500 text-[10px] md:text-[11px] font-medium tracking-[0.3em] uppercase">© 2026 Galang Arrauf Pramudito</p>
      </footer>

      {isCvModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsCvModalOpen(false)}></div>
          <div className="relative bg-card-bg border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 scale-in-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-file-user-line text-accent text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Resume</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Curriculum Vitae Galang Arrauf Pramudito dalam format PDF.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsCvModalOpen(false);
                  setIsPreviewModalOpen(true);
                }}
                className="w-full py-4 bg-accent text-bg-dark font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform text-xs inline-flex items-center justify-center gap-2"
              >
                <i className="ri-eye-line text-base"></i>
                Preview CV
              </button>
              <a href="/api/cv" target="_blank" rel="noopener noreferrer" className="w-full py-4 border border-white/20 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors text-xs inline-flex items-center justify-center gap-2">
                <i className="ri-download-line text-base"></i>
                Download CV
              </a>
              <button onClick={() => setIsCvModalOpen(false)} className="mt-3 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsPreviewModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl h-[90vh] bg-card-bg border border-white/10 rounded-2xl overflow-hidden flex flex-col scale-in-center">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
              <h3 className="text-white font-bold">CV - Galang Arrauf Pramudito</h3>
              <button onClick={() => setIsPreviewModalOpen(false)} className="w-10 h-10 md:w-11 md:h-11 bg-black/60 md:bg-white/10 border border-white/20 md:border-transparent md:hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all active:scale-90">
                <i className="ri-close-line text-xl md:text-2xl"></i>
              </button>
            </div>
            <iframe src="/cv-galang.pdf" className="w-full flex-1 border-0"></iframe>
          </div>
        </div>
      )}
    </main>
  );
}