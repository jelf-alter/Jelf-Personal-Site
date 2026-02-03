import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// Sitemap data structure
interface SitemapUrl {
  url: string;
  lastmod: string;
  priority: string;
  changefreq: string;
}

// Generate sitemap data
const generateSitemapData = (): SitemapUrl[] => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' // Replace with actual domain
    : 'http://localhost:5173';
    
  const currentDate: string = new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10);
  
  return [
    {
      url: `${baseUrl}/`,
      lastmod: currentDate,
      priority: '1.0',
      changefreq: 'weekly'
    },
    {
      url: `${baseUrl}/demos`,
      lastmod: currentDate,
      priority: '0.9',
      changefreq: 'weekly'
    },
    {
      url: `${baseUrl}/demos/elt-pipeline`,
      lastmod: currentDate,
      priority: '0.8',
      changefreq: 'weekly'
    },
    {
      url: `${baseUrl}/testing`,
      lastmod: currentDate,
      priority: '0.8',
      changefreq: 'daily'
    },
    {
      url: `${baseUrl}/about`,
      lastmod: currentDate,
      priority: '0.7',
      changefreq: 'monthly'
    }
  ];
};

// Generate XML sitemap
const generateXMLSitemap = (urls: SitemapUrl[]): string => {
  const urlElements = urls.map(url => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
};

// Generate robots.txt content
const generateRobotsTxt = (): string => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' // Replace with actual domain
    : 'http://localhost:5173';

  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin or private areas (if any)
# Disallow: /admin/
# Disallow: /private/

# Allow all content for this portfolio site
Allow: /demos/
Allow: /testing/
Allow: /about/
`;
};

// GET /api/seo/sitemap.xml - XML sitemap
router.get('/sitemap.xml', (req: Request, res: Response) => {
  try {
    const urls = generateSitemapData();
    const xmlSitemap = generateXMLSitemap(urls);
    
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    res.send(xmlSitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// GET /api/seo/sitemap.json - JSON sitemap data
router.get('/sitemap.json', (req: Request, res: Response) => {
  try {
    const urls = generateSitemapData();
    
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    res.json({
      sitemap: urls,
      generated: new Date().toISOString(),
      totalUrls: urls.length
    });
  } catch (error) {
    console.error('Error generating sitemap data:', error);
    res.status(500).json({ error: 'Failed to generate sitemap data' });
  }
});

// GET /api/seo/robots.txt - robots.txt content
router.get('/robots.txt', (req: Request, res: Response) => {
  try {
    const robotsTxt = generateRobotsTxt();
    
    res.set({
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });
    
    res.send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).json({ error: 'Failed to generate robots.txt' });
  }
});

// GET /api/seo/meta - Get meta data for a specific path (using query parameter)
router.get('/meta', (req: Request, res: Response) => {
  try {
    const path: string = (req.query.path as string) || '';
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' // Replace with actual domain
      : 'http://localhost:5173';

    // Define meta data for different paths
    const metaData: Record<string, any> = {
      '': {
        title: 'Personal Website - Full-Stack Developer Portfolio',
        description: 'Professional portfolio showcasing full-stack development capabilities, data processing demos, and comprehensive testing practices',
        keywords: 'developer, portfolio, Vue.js, TypeScript, testing, data processing, ELT pipeline',
        type: 'website'
      },
      'demos': {
        title: 'Demos - Personal Website',
        description: 'Interactive demonstrations of various technologies and development capabilities',
        keywords: 'demos, applications, Vue.js, TypeScript, ELT pipeline, data processing',
        type: 'website'
      },
      'demos/elt-pipeline': {
        title: 'ELT Pipeline Demo - Personal Website',
        description: 'Interactive demonstration of Extract, Load, Transform data processing pipeline with real-time visualization',
        keywords: 'ELT pipeline, data processing, extract, load, transform, visualization',
        type: 'article'
      },
      'testing': {
        title: 'Testing Dashboard - Personal Website',
        description: 'Public visibility into code quality, test coverage, and testing practices',
        keywords: 'testing, code quality, coverage, unit tests, integration tests',
        type: 'website'
      },
      'about': {
        title: 'About - Personal Website',
        description: 'Learn more about the developer and the technologies used in this website',
        keywords: 'about, developer, technologies, Vue.js, TypeScript, full-stack',
        type: 'profile'
      }
    };

    const meta = metaData[path] || metaData[''];
    
    res.json({
      ...meta,
      url: `${baseUrl}/${path}`,
      image: `${baseUrl}/og-image.jpg`,
      siteName: 'Personal Website',
      author: 'Full-Stack Developer'
    });
  } catch (error) {
    console.error('Error generating meta data:', error);
    res.status(500).json({ error: 'Failed to generate meta data' });
  }
});

export { router as seoRoutes };