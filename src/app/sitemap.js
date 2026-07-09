export default function sitemap() {
  const baseUrl = 'https://galangpramudito.web.id';

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
      url: `${baseUrl}/certificates`,
      lastModified: new Date().toISOString(),
      priority: 0.7,
      changeFrequency: 'monthly',
    },
  ];
}
