"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ==========================================
// 📂 DATA SECTION (Database Proyek Kamu)
// ==========================================
const SKILLS_DATA = [
  {
    category: "BackEnd & Automation",
    icon: "ri-terminal-box-line",
    items: ["Node.js (Baileys)", "REST API", "PHP", "Laravel", "MySQL"],
    span: "md:col-span-2", 
    color: "from-accent to-emerald-400"
  },
  {
    category: "FrontEnd UI",
    icon: "ri-layout-3-line",
    items: ["React/Next.js", "Tailwind CSS", "JavaScript", "HTML/CSS"],
    span: "md:col-span-1",
    color: "from-primary to-purple-400"
  },
  {
    category: "Visual Design",
    icon: "ri-palette-line",
    items: ["Figma", "Canva", "UI/UX Prototyping"],
    span: "md:col-span-1",
    color: "from-pink-400 to-rose-400"
  },
  {
    category: "Video Production",
    icon: "ri-video-line",
    items: ["CapCut Pro", "VN Video Editor", "Motion Graphics"],
    span: "md:col-span-2",
    color: "from-blue-400 to-cyan-400"
  },
];

const DEV_PROJECTS = [
  {
    title: "Bot WA Reminder Absensi",
    image: "/image/thumbnail/download.jpg", 
    tags: ["Node.js", "Baileys API", "Automation"],
    desc: "Sistem automasi backend untuk memonitor jadwal dan mengirimkan pengingat absensi secara otomatis via WhatsApp.",
    link: "https://github.com/galangg22/bot-presensi", 
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  },
  {
    title: "Sistem Web TPQ Al-Hikmah",
    image: "/image/thumbnail/download.jpg", 
    tags: ["Web Dev", "HTML", "CSS"],
    desc: "Platform sistem informasi manajemen untuk digitalisasi administrasi santri dan guru di TPQ Al-Hikmah.",
    link: "https://github.com/galangg22/alhikmah", 
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  },
  {
    title: "ThriftyFinds E-Commerce",
    image: "/image/thumbnail/download.jpg", 
    tags: ["React/Next.js", "Tailwind", "E-Commerce"],
    desc: "Katalog e-commerce modern untuk produk thrifting dengan UI/UX intuitif dan performa pencarian cepat.",
    link: "https://github.com/galangg22/thriftyfinds", 
    actionText: "Live Demo",
    actionIcon: "ri-external-link-line"
  },
  {
    title: "HeartHorizon / Online Class",
    image: "/image/thumbnail/download.jpg", 
    tags: ["LMS", "Fullstack", "Database"],
    desc: "Aplikasi e-learning interaktif untuk manajemen materi kelas online, penugasan, dan interaksi pembelajaran.",
    link: "https://github.com/galangg22/hearthorizon", 
    actionText: "GitHub Repo",
    actionIcon: "ri-github-fill"
  }
];

// Cuma ambil 2 untuk showcase di Home
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

const navItems = [
  { id: "home", label: "Home", svg: <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { id: "about", label: "About", svg: <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
  { id: "skills", label: "Skills", svg: <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg> },
  { id: "projects", label: "Work", svg: <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg> },
  { id: "contact", label: "Contact", svg: <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg> }
];

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [isIslandHovered, setIsIslandHovered] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false); // 👈 TAMBAHKAN INI
  const mainRef = useRef(null);
  

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      gsap.from(".hero-text", { y: 50, opacity: 0, duration: 1.2, stagger: 0.2, ease: "power4.out", delay: 0.2 });

      gsap.utils.toArray("section").forEach((section) => {
        const title = section.querySelector(".section-title");
        if (title) {
          gsap.from(title, {
            opacity: 0, x: -50, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 80%" }
          });
        }
      });

      gsap.utils.toArray(".bento-card, .project-card, .creative-card").forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 50, scale: 0.95, duration: 0.7, ease: "back.out(1.2)",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    }, mainRef);

    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      let current = "home";
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 300) {
          current = section.getAttribute("id");
        }
      });
      // Anti-infinite loop fix
      setActiveSection((prev) => (prev !== current ? current : prev));
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      ctx.revert(); 
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsIslandHovered(false); 
  };

  return (
    
    <main ref={mainRef} className="bg-bg-dark selection:bg-accent selection:text-bg-dark relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>

      {/* 🍎 THE REAL DYNAMIC ISLAND NAVBAR 🍎 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex justify-center drop-shadow-2xl h-32 items-start pointer-events-none">
        <div 
          onMouseEnter={() => setIsIslandHovered(true)}
          onMouseLeave={() => setIsIslandHovered(false)}
          className={`bg-black pointer-events-auto cursor-pointer relative flex items-center justify-center overflow-visible transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isIslandHovered 
              ? 'w-[320px] md:w-[420px] h-[72px] rounded-[36px] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]' 
              : 'w-28 h-9 rounded-full border border-transparent shadow-lg'
          }`}
        >
          {/* STATE 1: COLLAPSED */}
          <div className={`absolute flex items-center justify-center gap-2 transition-all duration-300 w-full h-full ${isIslandHovered ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100 delay-150'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(79,255,163,0.8)] animate-pulse"></span>
            <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">Menu</span>
          </div>

          {/* STATE 2: EXPANDED */}
          <div className={`absolute flex items-center justify-between w-[280px] md:w-[380px] px-2 transition-all duration-500 ${isIslandHovered ? 'opacity-100 scale-100 delay-100 visible' : 'opacity-0 scale-50 invisible pointer-events-none'}`}>
            {navItems.map((item) => (
              <a 
                key={item.id} 
                href={`#${item.id}`} 
                onClick={(e) => scrollToSection(e, item.id)} 
                className="relative group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-transform hover:scale-110"
              >
                {activeSection === item.id && <div className="absolute inset-0 bg-accent/20 rounded-full blur-md"></div>}
                <div className={`relative z-10 transition-colors ${activeSection === item.id ? "text-accent" : "text-gray-400 group-hover:text-white"}`}>{item.svg}</div>
                <span className="absolute -bottom-10 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* HERO */}
      <section id="home" className="relative h-screen flex items-center justify-center text-center px-6 z-10 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="hero-text inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-accent text-sm font-semibold mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span> Sidoarjo, Indonesia
          </div>
          <h1 className="hero-text text-5xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-tight">
            Galang <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent text-glow">Arrauf</span>
          </h1>
          <p className="hero-text text-xl md:text-2xl text-gray-400 font-light mb-10 max-w-2xl mx-auto">
            Backend Developer & <span className="text-white">Creative Enthusiast</span>. Mahasiswa D3 Teknik Informatika A, PENS.
          </p>
          <div className="hero-text flex flex-wrap justify-center gap-4">
            <a href="#projects" onClick={(e) => scrollToSection(e, "projects")} className="px-8 py-4 bg-white text-bg-dark font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)]">View Work</a>
            <button onClick={() => setIsCvModalOpen(true)} className="px-8 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors cursor-pointer z-20 relative">Resume</button>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 relative group">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-card-bg shadow-2xl">
              <Image src="/image/gambar galang 2.jpg" alt="Profil Galang" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-all grayscale hover:grayscale-0 scale-105 group-hover:scale-100 duration-700" priority />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-black border border-white/10 p-5 rounded-2xl shadow-2xl">
                <p className="text-accent font-bold text-xl">3+</p>
                <p className="text-gray-400 text-[10px] uppercase tracking-widest">Years Experience</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <h2 className="section-title text-4xl md:text-5xl font-bold mb-6 tracking-tight">Membangun Logika,<br/><span className="text-gray-500">Menciptakan Visual.</span></h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Fokus utama saya adalah <span className="text-accent font-semibold">IT Automation & Backend Arsitektur</span>. Dengan pengalaman di bidang desain dan video editing, saya membangun produk yang fungsional secara logika dan menarik secara visual.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                <i className="ri-graduation-cap-line text-2xl text-accent"></i>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest">Education</p><p className="font-bold text-white text-sm">D3 IT PENS Surabaya</p></div>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                <i className="ri-briefcase-line text-2xl text-accent"></i>
                <div><p className="text-gray-400 text-xs uppercase tracking-widest">Current Status</p><p className="font-bold text-white text-sm">Student & Shift Worker</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="py-24 px-6 bg-black/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="section-title text-4xl font-bold mb-12 uppercase tracking-tighter">Tech Arsenal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SKILLS_DATA.map((skill, idx) => (
              <div key={idx} className={`bento-card group rounded-3xl bg-card-bg border border-white/10 p-8 transition-all hover:border-white/20 ${skill.span}`}>
                <div className={`text-3xl mb-6 bg-gradient-to-br ${skill.color} bg-clip-text text-transparent`}><i className={skill.icon}></i></div>
                <h3 className="text-xl font-bold mb-6 text-white">{skill.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map(item => <span key={item} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[11px] font-medium text-gray-300">{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS DEVELOPMENT */}
      <section id="projects" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="section-title text-4xl font-bold mb-12 uppercase tracking-tighter">Featured Development</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-24">
            {DEV_PROJECTS.map((project, idx) => (
              <div key={idx} className="project-card group bg-card-bg rounded-3xl overflow-hidden border border-white/10 flex flex-col hover:border-accent/30 transition-all duration-500 shadow-xl">
                <div className="relative h-56">
                  <Image src={project.image} alt={project.title} fill sizes="50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 to-transparent"></div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    {project.tags.map(tag => <span key={tag} className="px-3 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-full text-[10px] text-white font-bold uppercase">{tag}</span>)}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-accent transition-colors">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-8 flex-1 leading-relaxed">{project.desc}</p>
                  <a href={project.link} target="_blank" className="inline-flex items-center gap-3 text-white font-bold text-sm bg-white/5 w-fit px-6 py-3 rounded-xl hover:bg-accent hover:text-bg-dark transition-all">
                    <i className={project.actionIcon + " text-xl"}></i> {project.actionText}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* CREATIVE SHOWCASE LITE (ONLY 2 ITEMS) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="section-title text-4xl font-bold mb-3 uppercase tracking-tighter">Visual Works</h2>
              <p className="text-gray-400 text-sm max-w-md">Hanya cuplikan kecil. Lihat koleksi lengkap desain & video di galeri.</p>
            </div>
            <Link href="/design" className="px-6 py-3 bg-accent text-bg-dark font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-accent/20">
               Full Gallery <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {FEATURED_CREATIVE.map((item) => (
              <div 
                key={item.id} 
                onClick={() => item.type === "video" ? setSelectedVideo(item.videoUrl) : null}
                className={`creative-card group relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl ${item.type === "video" ? "cursor-pointer" : ""}`}
              >
                <Image src={item.image} alt={item.title} fill sizes="50vw" className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
                
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-[0_0_20px_rgba(79,255,163,0.5)]">
                      <i className="ri-play-fill text-bg-dark text-3xl ml-1"></i>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 block">{item.category}</span>
                  <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎬 VIDEO MODAL OVERLAY 🎬 */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedVideo(null)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-10">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center z-20 transition-all active:scale-90"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
            <iframe 
              src={selectedVideo} 
              className="w-full h-full border-none" 
              allow="autoplay"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto bg-card-bg/50 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 md:p-16 relative overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="section-title text-4xl md:text-5xl font-bold mb-4 uppercase">Let's Connect</h2>
            <p className="text-gray-400">Punya tawaran kerja atau ide kolaborasi?</p>
          </div>
          <form action="https://formspree.io/f/meoqzdan" method="POST" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nama Lengkap" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-accent transition-colors" />
              <input type="email" name="email" placeholder="Email Valid" required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-accent transition-colors" />
            </div>
            <textarea name="message" rows="4" placeholder="Pesan Anda..." required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-accent transition-colors resize-none"></textarea>
            <button type="submit" className="w-full py-5 bg-white text-bg-dark font-black uppercase tracking-widest rounded-2xl hover:bg-accent transition-all active:scale-95 shadow-xl">Send Message</button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center border-t border-white/5 mt-10">
        <div className="flex justify-center gap-8 mb-8">
            <a href="https://github.com/galangg22" target="_blank" className="text-gray-500 hover:text-white text-2xl transition-colors"><i className="ri-github-fill"></i></a>
            <a href="https://linkedin.com/in/galang-arrauf" target="_blank" className="text-gray-500 hover:text-white text-2xl transition-colors"><i className="ri-linkedin-fill"></i></a>
            <a href="mailto:emailkamu@gmail.com" className="text-gray-500 hover:text-white text-2xl transition-colors"><i className="ri-mail-line"></i></a>
        </div>
        <p className="text-gray-500 text-[10px] font-medium tracking-[0.3em] uppercase">© 2026 Galang Arrauf Pramudito • Built with Next.js</p>
      </footer>
      {/* 📄 MODAL KONFIRMASI RESUME 📄 */}
      {isCvModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsCvModalOpen(false)}></div>
          <div className="relative bg-card-bg border border-white/10 p-8 rounded-[32px] max-w-sm w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 scale-in-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-file-user-line text-accent text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Resume Galang</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Dokumen format PDF. Pilih tindakan yang ingin Anda lakukan.</p>
            
            <div className="flex flex-col gap-3">
              <a 
                href="/cv-galang.pdf" 
                target="_blank" 
                className="w-full py-4 bg-accent text-bg-dark font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform text-xs"
                onClick={() => setIsCvModalOpen(false)}
              >
                Buka di Tab Baru
              </a>
              <a 
                href="/cv-galang.pdf" 
                download="CV_Galang_Arrauf_Pramudito.pdf" 
                className="w-full py-4 border border-white/20 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors text-xs"
                onClick={() => setIsCvModalOpen(false)}
              >
                Unduh File
              </a>
              <button 
                onClick={() => setIsCvModalOpen(false)} 
                className="mt-3 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}