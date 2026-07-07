import { createClient } from "@supabase/supabase-js";
import HomeClient from "./HomeClient";

// 🚀 PERF OPTIMIZATION: Revalidate setiap 1 jam (ISR). 
// Data di-fetch dan di-build statis di server, 100% SEO-friendly & Instan LCP!
export const revalidate = 3600;

async function getPortfolioData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Gunakan Service Role Key jika ada untuk bypassing RLS, atau pakai Anon Key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return { skills: null, projects: null, certificates: null };

  const supabase = createClient(url, key);

  // Jalankan ketiga query secara paralel (Promise.all) agar jauh lebih cepat!
  const [skillsRes, projectsRes, certsRes, typesRes, profileRes] = await Promise.all([
    supabase.from("skills").select("*").order("sort_order"),
    
    supabase.from("projects")
      .select("*, project_types(id, name, slug)")
      .neq("status", "private")
      .eq("featured", true)
      .order("sort_order"),
      
    supabase.from("certificates")
      .select("*")
      .eq("featured", true)
      .order("sort_order")
      .limit(3),

    supabase.from("project_types").select("*").order("name"),
    
    supabase.from("profile").select("*").eq("id", 1).maybeSingle()
  ]);

  let projects = null;
  if (projectsRes.data) {
    projects = projectsRes.data.map((p) => {
      let typeSlug = "website";
      if (p.project_types) {
        typeSlug = p.project_types.slug;
      } else {
        typeSlug = p.project_type || p.type || "website";
      }
      
      // Unify type values
      typeSlug = typeSlug.toLowerCase();
      if (typeSlug === "web") typeSlug = "website";
      if (typeSlug === "bot" || typeSlug === "android") typeSlug = "aplikasi";
      if (typeSlug === "design") typeSlug = "desain";
      if (typeSlug === "video" || typeSlug === "video editing") typeSlug = "video-editing";

      const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

      return {
        id: p.id,
        slug,
        title: p.title,
        image: p.thumbnail_url || null,
        gradient: p.thumbnail_url ? null : "from-neutral-900 via-neutral-800 to-black",
        icon: p.thumbnail_url ? null : "ri-code-s-slash-line",
        tags: (p.tags || []).filter(t => !['web', 'bot', 'android'].includes(t.toLowerCase())),
        project_type: typeSlug,
        category: p.category || "",
        desc: p.description,
        github_url: p.github_url || null,
        demo_url: p.demo_url || null,
        play_store_url: p.play_store_url || null,
        apk_url: p.apk_url || null,
        video_url: p.video_url || null,
        platform: p.platform || null,
        featured: p.featured || false,
        link: p.demo_url || p.github_url || "#",
        actionText: p.demo_url ? "Live Demo" : "GitHub Repo",
        actionIcon: p.demo_url ? "ri-external-link-line" : "ri-github-fill",
      };
    });
  }

  return { 
    skills: skillsRes.data, 
    projects: projects, 
    certificates: certsRes.data,
    projectTypes: typesRes.data,
    profile: profileRes ? profileRes.data : null
  };
}

export async function generateMetadata() {
  const data = await getPortfolioData();
  const projectTypesStr = data.projectTypes ? data.projectTypes.map(t => t.name).join(', ') : '';
  const topProjectsStr = data.projects ? data.projects.slice(0, 3).map(p => p.title).join(', ') : '';
  
  return {
    title: 'Galang Arrauf — Web Developer',
    description: `Portfolio Galang Arrauf Pramudito — Web Developer. Categories: ${projectTypesStr}. Featured projects: ${topProjectsStr}. Open to internship & freelance.`,
    keywords: `web developer, laravel, php, postgresql, ai integration, ${projectTypesStr}`,
  };
}

export default async function HomePage() {
  const data = await getPortfolioData();

  return (
    <HomeClient 
      initialSkills={data.skills} 
      initialProjects={data.projects} 
      initialCertificates={data.certificates} 
      initialProjectTypes={data.projectTypes}
      initialProfile={data.profile}
    />
  );
}