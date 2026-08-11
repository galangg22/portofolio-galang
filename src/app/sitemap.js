import { createClient } from '@supabase/supabase-js';

export default async function sitemap() {
  const baseUrl = 'https://galangpramudito.web.id';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      priority: 1,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date().toISOString(),
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/certificates`,
      lastModified: new Date().toISOString(),
      priority: 0.7,
      changeFrequency: 'monthly',
    },
  ];

  // Dynamically fetch all public projects from Supabase
  let projectPages = [];
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key) {
      const supabase = createClient(url, key);
      const { data: projects } = await supabase
        .from('projects')
        .select('id, slug, updated_at, created_at')
        .neq('status', 'private')
        .order('created_at', { ascending: false });

      if (projects) {
        projectPages = projects.map((p) => ({
          url: `${baseUrl}/projects/${p.slug || p.id}/${p.id}`,
          lastModified: (p.updated_at || p.created_at || new Date().toISOString()),
          priority: 0.8,
          changeFrequency: 'monthly',
        }));
      }
    }
  } catch (error) {
    // Graceful fallback — static pages still work if DB is unavailable
    console.error('Sitemap: failed to fetch projects', error);
  }

  return [...staticPages, ...projectPages];
}
