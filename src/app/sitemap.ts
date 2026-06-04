import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://youarepayingtoomuch.com';

  const routes = [
    '',
    '/faq',
    '/gallery',
    '/how-it-works',
    '/improve-your-tools',
    '/meaning',
    '/mobile-calculator',
    '/our-math',
    '/privacy',
    '/save',
    '/save-a-ton',
    '/upgrade-your-advice',
    '/mailer-audit',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
