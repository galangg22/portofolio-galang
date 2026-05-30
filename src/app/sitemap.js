export default function sitemap() {
  const baseUrl = 'https://galang-arrauf.com';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      priority: 1,
      changeFrequency: 'weekly',
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
  ];
}
