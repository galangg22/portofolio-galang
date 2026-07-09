import { createClient } from "@supabase/supabase-js";
import CertificatesClient from "./CertificatesClient";

export const metadata = {
  title: "Certificates — Galang Arrauf Pramudito",
  description:
    "Sertifikat dan pencapaian dari berbagai program, pelatihan, dan kompetisi oleh Galang Arrauf Pramudito.",
  openGraph: {
    title: "Certificates — Galang Arrauf Pramudito",
    description:
      "Koleksi sertifikat dan pencapaian dari berbagai program, pelatihan, dan kompetisi.",
    url: "https://galangpramudito.web.id/certificates",
    type: "website",
  },
};

// Revalidate every 1 hour — ISR for SEO with fresh data
export const revalidate = 3600;

async function getCertificates() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export default async function CertificatesPage() {
  const certs = await getCertificates();

  return <CertificatesClient certs={certs} />;
}
