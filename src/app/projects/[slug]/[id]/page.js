import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { transformProject, getTypeConfig } from "@/lib/project-utils";
import ProjectDetailClient from "./ProjectDetailClient";

export const revalidate = 3600;

async function getProject(id) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);

  const [projectRes, imagesRes] = await Promise.all([
    supabase
      .from("projects")
      .select("*, project_types(id, name, slug)")
      .eq("id", id)
      .neq("status", "private")
      .maybeSingle(),
    supabase.from("project_images").select("*").order("sort_order"),
  ]);

  if (projectRes.error || !projectRes.data) return null;

  return transformProject(projectRes.data, imagesRes.data);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project Not Found" };

  const typeInfo = getTypeConfig(project.project_type);
  return {
    title: `${project.title} — Galang Arrauf Pramudito`,
    description: project.description?.slice(0, 160) || `${project.title} — ${typeInfo.label} project by Galang Arrauf Pramudito.`,
    openGraph: {
      title: project.title,
      description: project.description?.slice(0, 160),
      type: "article",
      images: project.image ? [{ url: project.image }] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  return <ProjectDetailClient project={project} />;
}
