export default function sitemap() {
  const baseUrl = 'https://portofolang.web.id';

  return [
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
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/design`,
      lastModified: new Date().toISOString(),
      priority: 0.9,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/video`,
      lastModified: new Date().toISOString(),
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/certificates`,
      lastModified: new Date().toISOString(),
      priority: 0.7,
      changeFrequency: 'monthly',
    },
  ];
}
