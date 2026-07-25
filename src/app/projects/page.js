import { createClient } from "@supabase/supabase-js";
import { normalizeProjectType, generateSlug } from "@/lib/project-utils";
import ProjectsClient from "./ProjectsClient";

export const metadata = {
  title: "Projects",
  description: "Daftar proyek dan portofolio yang pernah dikerjakan oleh Galang Arrauf Pramudito, meliputi website, API, dan integrasi AI.",
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    title: "Projects — Galang Arrauf Pramudito",
    description: "Daftar proyek dan portofolio yang pernah dikerjakan oleh Galang Arrauf Pramudito, meliputi website, API, dan integrasi AI.",
    url: '/projects',
  },
};

export const revalidate = 3600; // 🚀 PERF: Revalidate 1 jam (ISR) agar tidak memberatkan server

async function getProjects() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const supabase = createClient(url, key);

  const { data: projectsData } = await supabase
    .from("projects")
    .select("*, project_types(id, name, slug)")
    .neq("status", "private")
    .order("featured", { ascending: false })
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (!projectsData) return [];

  return projectsData.map((p) => {
    const projectType = normalizeProjectType(
      p.project_types?.slug || p.project_type || p.type
    );
    const slug = p.slug || generateSlug(p.title);

    return {
      id: p.id,
      slug,
      title: p.title,
      description: p.description,
      project_type: projectType,
      tags: (p.tags || []).filter(
        (t) => !["web", "bot", "android"].includes(t.toLowerCase())
      ),
      thumbnail_url: p.thumbnail_url,
      status: p.status,
      github_url: p.github_url,
      demo_url: p.demo_url,
      play_store_url: p.play_store_url,
      apk_url: p.apk_url,
      video_url: p.video_url,
      featured: p.featured,
    };
  });
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsClient initialProjects={projects} />;
}
