import { createClient } from "@supabase/supabase-js";
import AboutClient from "./AboutClient";

export const metadata = {
  title: "About Me & Journey",
  description:
    "Perjalanan lengkap, cerita latar belakang, pengalaman pendidikan di SMKN 2 Buduran & PENS, serta pengalaman kerja/magang di Dinas Tenaga Kerja Prov Jatim oleh Galang Arrauf Pramudito.",
  keywords: [
    "Galang Arrauf Pramudito",
    "About Galang",
    "Web Developer Sidoarjo",
    "Backend Developer",
    "D3 Teknik Informatika PENS",
    "SMKN 2 Buduran Sidoarjo",
    "Dinas Tenaga Kerja Jawa Timur",
    "IT Support & Multimedia Intern",
    "Full-Stack Web Developer",
    "AI Integration",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Me & Journey — Galang Arrauf Pramudito",
    description:
      "Perjalanan lengkap, cerita pengalaman di SMKN 2 Buduran, Disnaker Prov Jatim, hingga Politeknik Elektronika Negeri Surabaya (PENS).",
    url: "/about",
    type: "profile",
    images: [
      {
        url: "/image/gambar galang 2.jpg",
        width: 1200,
        height: 630,
        alt: "Galang Arrauf Pramudito Journey & Background",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Me & Journey — Galang Arrauf Pramudito",
    description:
      "Perjalanan lengkap, cerita pengalaman di SMKN 2 Buduran, Disnaker Prov Jatim, hingga Politeknik Elektronika Negeri Surabaya (PENS).",
    images: ["/image/gambar galang 2.jpg"],
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

  const fullName = profile?.full_name || "Galang Arrauf Pramudito";
  const bio = profile?.bio || "Web Developer dari Sidoarjo yang berfokus pada arsitektur backend tangguh, pengelolaan database efisien, dan integrasi Artificial Intelligence.";

  // Schema.org JSON-LD for rich Google Search indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": "https://galangpramudito.web.id/about#webpage",
        "url": "https://galangpramudito.web.id/about",
        "name": `About Me & Journey — ${fullName}`,
        "description": bio,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://galangpramudito.web.id/#website",
          "url": "https://galangpramudito.web.id",
          "name": "Portofolio Galang Arrauf Pramudito"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Beranda",
              "item": "https://galangpramudito.web.id"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "About Me & Journey",
              "item": "https://galangpramudito.web.id/about"
            }
          ]
        },
        "about": {
          "@type": "Person",
          "@id": "https://galangpramudito.web.id/#person",
          "name": fullName,
          "jobTitle": "Web Developer & Software Engineering Student",
          "description": bio,
          "image": "https://galangpramudito.web.id/image/gambar%20galang%202.jpg",
          "alumniOf": [
            {
              "@type": "EducationalOrganization",
              "name": "Politeknik Elektronika Negeri Surabaya (PENS)"
            },
            {
              "@type": "EducationalOrganization",
              "name": "SMKN 2 Buduran Sidoarjo"
            }
          ],
          "knowsAbout": [
            "Web Development",
            "PHP",
            "Laravel",
            "Next.js",
            "React.js",
            "PostgreSQL",
            "MySQL",
            "Artificial Intelligence",
            "IT Support"
          ]
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient initialTimeline={timeline} initialProfile={profile} />
    </>
  );
}
