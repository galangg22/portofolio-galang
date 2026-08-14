-- ============================================================
-- Portofolang — Supabase Schema: Timeline & Timeline Images
-- Jalankan skrip ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. TABLE: timeline
CREATE TABLE IF NOT EXISTS public.timeline (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period      TEXT NOT NULL,                      -- contoh: "2022 — 2025", "Mei 2025 — Sekarang"
  status      TEXT DEFAULT 'Aktif',               -- contoh: "Lulus", "Selesai (6 Bulan)", "Aktif"
  role        TEXT NOT NULL,                      -- contoh: "Siswa RPL", "IT Support & Multimedia Intern"
  institution TEXT NOT NULL,                      -- contoh: "SMKN 2 Buduran Sidoarjo", "Dinas Tenaga Kerja"
  location    TEXT,                               -- contoh: "Sidoarjo, Jawa Timur"
  icon        TEXT DEFAULT 'ri-briefcase-line',   -- contoh: "ri-graduation-cap-line", "ri-building-line"
  category    TEXT DEFAULT 'Pendidikan',          -- contoh: "Pendidikan Menengah", "Pengalaman Kerja / Magang"
  summary     TEXT,                               -- ringkasan singkat kartu
  description TEXT[] DEFAULT '{}',                -- array paragraf cerita mendalam
  skills      TEXT[] DEFAULT '{}',                -- array keahlian/tags yang didapatkan
  highlights  TEXT[] DEFAULT '{}',                -- array poin kunci/pencapaian
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Trigger auto-update updated_at untuk timeline
DROP TRIGGER IF EXISTS trg_timeline_updated_at ON public.timeline;
CREATE TRIGGER trg_timeline_updated_at
  BEFORE UPDATE ON public.timeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. TABLE: timeline_images (Gambar/Media Penunjang per Milestone)
CREATE TABLE IF NOT EXISTS public.timeline_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_id  UUID NOT NULL REFERENCES public.timeline(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  caption      TEXT,                              -- judul singkat foto, misal: "Studi D3 Teknik Informatika PENS"
  description  TEXT,                              -- caption detail / cerita foto
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security (RLS) & Public Read Policy
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read timeline" ON public.timeline;
CREATE POLICY "public read timeline" ON public.timeline FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read timeline_images" ON public.timeline_images;
CREATE POLICY "public read timeline_images" ON public.timeline_images FOR SELECT USING (true);

-- 3b. Pastikan Storage Bucket 'thumbnails' ada dan dapat dibaca publik
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public read thumbnails bucket" ON storage.objects;
CREATE POLICY "public read thumbnails bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'thumbnails');


-- 4. SEED DATA AWAL (Migrasi dari data About Me saat ini)
DO $$
DECLARE
  v_smk_id UUID;
  v_disnaker_id UUID;
  v_freelance_id UUID;
  v_pens_id UUID;
BEGIN
  -- Hapus data lama jika ingin clean seeding (opsional, aman jika tabel baru)
  -- DELETE FROM public.timeline;

  -- 1. SMKN 2 Buduran Sidoarjo
  INSERT INTO public.timeline (
    period, status, role, institution, location, icon, category, summary, description, skills, highlights, sort_order
  ) VALUES (
    '2022 — 2025',
    'Lulus',
    'Siswa Rekayasa Perangkat Lunak (RPL)',
    'SMKN 2 Buduran Sidoarjo',
    'Sidoarjo, Jawa Timur',
    'ri-graduation-cap-line',
    'Pendidikan Menengah',
    'Fokus Utama: Pengembangan Fundamental & Algoritma — Membangun logika komputer yang kuat, algoritma efisien, dan dasar-dasar penulisan clean code.',
    ARRAY[
      'Dasar Pemrograman: Mempelajari dan memperkuat logika dasar komputer, penyusunan algoritma efisien, serta dasar-dasar penulisan kode program yang terstruktur dan mudah dikelola (clean code).',
      'Fondasi Rekayasa Perangkat Lunak: Mendalami konsep pemrograman berorientasi objek (OOP), perancangan basis data relasional MySQL, serta pengembangan aplikasi web dari dasar (HTML5, CSS3, JavaScript, PHP Native hingga framework modern).',
      'Kolaborasi & Version Control: Membiasakan diri dengan alur kerja git & GitHub dalam pengembangan proyek tim, membaca dokumentasi teknis, dan memecahkan kendala pemrograman secara sistematis.'
    ],
    ARRAY[
      'Logika Dasar Komputer',
      'Algoritma Efisien',
      'Clean Code Fundamentals',
      'Pemrograman Web (HTML/CSS/JS)',
      'PHP & MySQL Database',
      'Git & Version Control',
      'Rekayasa Perangkat Lunak'
    ],
    ARRAY[
      'Penguasaan logika dasar komputer dan penyusunan algoritma efisien.',
      'Penerapan prinsip clean code pada penulisan modul program web.',
      'Membangun dasar kerja tim, problem-solving, dan kedisiplinan standar industri software.'
    ],
    1
  ) RETURNING id INTO v_smk_id;

  -- Gambar Penunjang SMK
  INSERT INTO public.timeline_images (timeline_id, image_url, caption, description, sort_order) VALUES
    (v_smk_id, '/image/smk2buduran.jpg', 'Fundamental Coding & Logika Algoritma', 'Aktivitas pembelajaran pemrograman, penguatan logika komputer, dan penulisan clean code di SMKN 2 Buduran Sidoarjo.', 1),
    (v_smk_id, '/image/TOKO TUNAI BGDARK mockup fix.png', 'Pengembangan Perangkat Lunak Kejuruan', 'Salah satu rancangan arsitektur antarmuka dan sistem aplikasi yang dikembangkan selama masa studi kejuruan RPL.', 2);


  -- 2. Disnaker Prov. Jatim
  INSERT INTO public.timeline (
    period, status, role, institution, location, icon, category, summary, description, skills, highlights, sort_order
  ) VALUES (
    'September 2024 — Maret 2025',
    'Selesai (6 Bulan)',
    'IT Support & Multimedia Intern',
    'Dinas Tenaga Kerja (Disnaker) Prov. Jawa Timur',
    'Surabaya, Jawa Timur',
    'ri-building-line',
    'Pengalaman Kerja / Magang',
    'Menjalankan dukungan teknis hardware & software, perancangan media publikasi event resmi, produksi video, hingga administrasi data kedinasan.',
    ARRAY[
      'Dukungan Teknis & Hardware: Bertanggung jawab atas pemeliharaan dan reparasi hardware komputer kantor, instalasi periferal, serta melakukan penanganan dan perbaikan bug pada sistem software operasional dinas.',
      'Pengembangan Media & Desain: Merancang materi desain grafis untuk kebutuhan publisitas event resmi kedinasan, serta mengelola proses pengambilan gambar (videografer) dan penyuntingan video (video editor).',
      'Administrasi & Pelayanan: Mengelola entri data (data entry) dokumen kedinasan dengan akurat serta membangun komunikasi dan hubungan baik (guest relations) dengan para tamu dan mitra instansi.'
    ],
    ARRAY[
      'Hardware Maintenance & Repair',
      'Software Bug Fixing',
      'Graphic Design (Event Publikasi)',
      'Videography & Video Editing',
      'Data Entry & Manajemen Dokumen',
      'Guest Relations & Komunikasi',
      'IT Support Operasional'
    ],
    ARRAY[
      'Pemeliharaan dan perbaikan berkala pada perangkat hardware komputer dan bug sistem software dinas.',
      'Produksi konten visual publikasi event kedinasan (desain grafis, videografi, dan video editing).',
      'Pelaksanaan entri data dokumen resmi dan pelayanan tamu instansi dengan komunikasi profesional.'
    ],
    2
  ) RETURNING id INTO v_disnaker_id;

  -- Gambar Penunjang Disnaker
  INSERT INTO public.timeline_images (timeline_id, image_url, caption, description, sort_order) VALUES
    (v_disnaker_id, '/image/galangdisnaker.jpg', 'Kantor Disnaker Prov. Jawa Timur', 'Gedung operasional Dinas Tenaga Kerja Prov. Jawa Timur tempat pelaksanaan magang IT Support & Multimedia.', 1),
    (v_disnaker_id, '/image/Logo Provinsi Jawa Timur (Koleksilogo.com).png', 'Instansi Pemerintah Provinsi Jawa Timur', 'Pelayanan operasional sistem teknologi informasi dan multimedia di bawah naungan Pemprov Jawa Timur.', 2);


  -- 3. Freelance Full-Stack Developer
  INSERT INTO public.timeline (
    period, status, role, institution, location, icon, category, summary, description, skills, highlights, sort_order
  ) VALUES (
    'Mei 2025 — Sekarang',
    'Aktif',
    'Freelance Full-Stack Developer',
    'Client Projects & Independent',
    'Remote / Jawa Timur',
    'ri-code-box-line',
    'Pengalaman Kerja / Freelance',
    'Membangun berbagai solusi web interaktif dan sistem manajemen untuk klien nyata seperti TPQ Al Hikmah, HeartHorizon, MNG Group, dan lainnya.',
    ARRAY[
      'Full-Stack Web Development: Merancang dan mengembangkan solusi aplikasi web end-to-end dengan performa tinggi, keamanan teruji, dan antarmuka pengguna yang modern.',
      'Portofolio Proyek Klien:',
      '• TPQ Al Hikmah: Sistem informasi dan manajemen pembelajaran santri untuk pencatatan akademik dan administrasi terstruktur.',
      '• HeartHorizon: Platform konsultasi psikologi dan kesehatan mental dengan sistem booking layanan dan dashboard interaktif.',
      '• MNG Group Web App: Aplikasi web korporasi terintegrasi untuk portofolio bisnis dan pengelolaan layanan perusahaan.',
      '• Dan berbagai custom web application lainnya yang disesuaikan dengan kebutuhan proses bisnis klien.'
    ],
    ARRAY[
      'Full-Stack Web Development',
      'Laravel & PHP',
      'React.js & Next.js',
      'PostgreSQL & MySQL',
      'RESTful API Integration',
      'UI/UX Implementation',
      'Client Management & Delivery'
    ],
    ARRAY[
      'Berhasil mengembangkan dan meluncurkan sistem manajemen santri untuk TPQ Al Hikmah.',
      'Merancang dan mengimplementasikan platform kesehatan mental HeartHorizon.',
      'Membangun aplikasi web korporasi MNG Group Web App dengan arsitektur modern dan skalabel.'
    ],
    3
  ) RETURNING id INTO v_freelance_id;

  -- Gambar Penunjang Freelance
  INSERT INTO public.timeline_images (timeline_id, image_url, caption, description, sort_order) VALUES
    (v_freelance_id, '/image/TOKO TUNAI BGDARK mockup fix.png', 'Implementasi Proyek Aplikasi Web Klien', 'Contoh arsitektur antarmuka dan perancangan dashboard interaktif yang dibangun untuk solusi kebutuhan bisnis klien.', 1),
    (v_freelance_id, '/image/Photo by Pankaj Patel on Unsplash.jpg', 'Full-Stack Development Workflow', 'Penerapan standar modern dalam pengembangan backend Laravel/Node.js dan frontend React/Next.js.', 2);


  -- 4. PENS Surabaya
  INSERT INTO public.timeline (
    period, status, role, institution, location, icon, category, summary, description, skills, highlights, sort_order
  ) VALUES (
    'Agustus 2025 — Sekarang',
    'Aktif (Sedang Berjalan)',
    'Mahasiswa D3 Teknik Informatika',
    'Politeknik Elektronika Negeri Surabaya (PENS)',
    'Surabaya, Jawa Timur',
    'ri-terminal-box-line',
    'Pendidikan Tinggi',
    'Program Studi: D3 Teknik Informatika — Mendalami pengembangan perangkat lunak terapan, Algoritma & Struktur Data, serta Full-Stack Development.',
    ARRAY[
      'Pengembangan Perangkat Lunak: Mendalami arsitektur perangkat lunak dari tingkat fundamental hingga terapan, mencakup Algoritma & Struktur Data, Sistem Informasi, serta Pengelolaan Database tingkat lanjut.',
      'Full-Stack Development: Mengembangkan aplikasi web interaktif pada sisi Frontend menggunakan React.js, serta membangun arsitektur Backend Engineering yang andal dan terstruktur.',
      'Integrasi Teknologi Modern: Mengeksplorasi kecerdasan buatan (AI Integration & Automation) dan komputasi modern untuk menciptakan solusi perangkat lunak yang berdaya guna tinggi di dunia nyata.'
    ],
    ARRAY[
      'D3 Teknik Informatika',
      'Algoritma & Struktur Data',
      'Frontend React.js',
      'Backend Engineering',
      'Sistem Informasi',
      'Database Management',
      'AI Integration & Automation'
    ],
    ARRAY[
      'Studi di program studi D3 Teknik Informatika PENS dengan kurikulum vokasi teknologi terapan terdepan.',
      'Pendalaman arsitektur perangkat lunak, algoritma kompleks, dan sistem informasi.',
      'Pengembangan aplikasi web modern mengombinasikan React.js di sisi frontend dan backend engineering yang kokoh.'
    ],
    4
  ) RETURNING id INTO v_pens_id;

  -- Gambar Penunjang PENS
  INSERT INTO public.timeline_images (timeline_id, image_url, caption, description, sort_order) VALUES
    (v_pens_id, '/image/galangpens.jpg', 'Studi D3 Teknik Informatika PENS', 'Fokus mendalami keahlian rekayasa perangkat lunak terapan, sistem informasi, dan teknologi modern di PENS.', 1),
    (v_pens_id, '/image/Photo by Pankaj Patel on Unsplash.jpg', 'Eksplorasi Algoritma & Full-Stack', 'Pendalaman algoritma, struktur data, frontend React.js, dan arsitektur backend di lingkungan akademik PENS.', 2);

END $$;
