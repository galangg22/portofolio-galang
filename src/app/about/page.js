import { createClient } from "@supabase/supabase-js";
import AboutClient from "./AboutClient";

export const metadata = {
  title: "About Me & Journey",
  description:
    "Perjalanan lengkap, cerita latar belakang, pengalaman pendidikan di SMKN 2 Buduran & PENS, serta pengalaman kerja/magang di Dinas Tenaga Kerja Prov Jatim oleh Galang Arrauf Pramudito.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Me & Journey — Galang Arrauf Pramudito",
    description:
      "Perjalanan lengkap, cerita pengalaman di SMKN 2 Buduran, Disnaker Prov Jatim, hingga Politeknik Elektronika Negeri Surabaya (PENS).",
    url: "/about",
    type: "website",
    images: [
      {
        url: "/image/gambar galang 2.jpg",
        width: 1200,
        height: 630,
        alt: "Galang Arrauf Pramudito Journey",
      },
    ],
  },
};

// Revalidate every 60 seconds — ISR for fresh data
export const revalidate = 60;

async function getTimelineData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  try {
    const supabase = createClient(url, key);

    // Fetch timeline entries and images concurrently for 100% reliable data merging
    const [timelineRes, imagesRes] = await Promise.all([
      supabase
        .from("timeline")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("timeline_images")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

    if (timelineRes.error) {
      console.warn("Could not fetch timeline data from Supabase:", timelineRes.error.message);
      return [];
    }

    const timelineItems = timelineRes.data || [];
    const allImages = imagesRes.data || [];

    // Map and link related images to each timeline item by timeline_id
    return timelineItems.map((item) => {
      const itemImages = allImages
        .filter((img) => String(img.timeline_id) === String(item.id))
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      return {
        ...item,
        timeline_images: itemImages,
      };
    });
  } catch (err) {
    console.error("Error in getTimelineData:", err);
    return [];
  }
}

async function getProfileData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("profile")
      .select("*")
      .eq("id", 1)
      .single();

    return data || null;
  } catch (err) {
    return null;
  }
}

export default async function AboutPage() {
  const [timeline, profile] = await Promise.all([
    getTimelineData(),
    getProfileData(),
  ]);

  return <AboutClient initialTimeline={timeline} initialProfile={profile} />;
}
