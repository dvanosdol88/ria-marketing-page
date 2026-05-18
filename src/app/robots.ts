import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: ['*', 'GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot', 'CCBot'],
      allow: '/',
    },
    sitemap: 'https://youarepayingtoomuch.com/sitemap.xml',
  };
}
