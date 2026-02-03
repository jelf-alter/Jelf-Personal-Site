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

// Demo registry data (simplified for server-side use)
const demoData = [
  {
    id: 'elt-pipeline',
    name: 'ELT Pipeline Visualization',
    description: 'Interactive demonstration of Extract, Load, Transform data processing with real-time visualization and transparent data flow monitoring',
    technologies: ['Vue.js', 'WebSockets', 'D3.js', 'Node.js', 'TypeScript'],
    category: 'data-processing',
    featured: true,
    lastUpdated: new Date()
  },
  {
    id: 'websocket-demo',
    name: 'WebSocket Communication',
    description: 'Real-time bidirectional communication demonstration with connection management and message broadcasting',
    technologies: ['Vue.js', 'WebSockets', 'Node.js', 'Socket.IO'],
    category: 'real-time',
    featured: false,
    lastUpdated: new Date()
  },
  {
    id: 'api-testing',
    name: 'API Testing Tool',
    description: 'Interactive API testing interface with request/response visualization and comprehensive HTTP method support',
    technologies: ['Vue.js', 'Axios', 'JSON', 'REST'],
    category: 'development-tools',
    featured: false,
    lastUpdated: new Date()
  },
  {
    id: 'realtime-dashboard',
    name: 'Real-time Dashboard',
    description: 'Live data dashboard with WebSocket connections, interactive charts, and performance monitoring',
    technologies: ['Vue.js', 'WebSockets', 'Chart.js', 'D3.js'],
    category: 'data-visualization',
    featured: false,
    lastUpdated: new Date()
  }
];

const categoryData = [
  { id: 'data-processing', name: 'Data Processing' },
  { id: 'real-time', name: 'Real-time Applications' },
  { id: 'data-visualization', name: 'Data Visualization' },
  { id: 'development-tools', name: 'Development Tools' },
  { id: 'testing', name: 'Testing & Quality' }
];

// Generate comprehensive sitemap data
const generateSitemapData = (): SitemapUrl[] => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' // Replace with actual domain
    : 'http://localhost:5173';
    
  const currentDate: string = new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10);
  
  // Static routes
  const staticRoutes: SitemapUrl[] = [
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

  // Dynamic demo routes
  const demoRoutes: SitemapUrl[] = demoData.map(demo => ({
    url: `${baseUrl}/demos/${demo.id}`,
    lastmod: demo.lastUpdated.toISOString().split('T')[0],
    priority: demo.featured ? '0.8' : '0.6',
    changefreq: 'monthly'
  }));

  // Category routes
  const categoryRoutes: SitemapUrl[] = categoryData.map(category => ({
    url: `${baseUrl}/demos/category/${category.id}`,
    lastmod: currentDate,
    priority: '0.7',
    changefreq: 'weekly'
  }));

  return [...staticRoutes, ...demoRoutes, ...categoryRoutes];
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
        title: 'Interactive Demos - Personal Website',
        description: 'Explore interactive demonstrations of various technologies including data processing, real-time applications, and development tools',
        keywords: 'demos, applications, Vue.js, TypeScript, ELT pipeline, data processing, real-time, WebSocket',
        type: 'website'
      },
      'testing': {
        title: 'Testing Dashboard - Personal Website',
        description: 'Public visibility into code quality, test coverage, and comprehensive testing practices including unit tests, integration tests, and property-based testing',
        keywords: 'testing, code quality, coverage, unit tests, integration tests, property-based testing, TDD, BDD',
        type: 'website'
      },
      'about': {
        title: 'About - Personal Website',
        description: 'Learn about the developer, technologies used, and the development approach behind this comprehensive portfolio website',
        keywords: 'about, developer, technologies, Vue.js, TypeScript, full-stack, architecture, methodology',
        type: 'profile'
      }
    };

    // Handle dynamic demo routes
    const demoMatch = path.match(/^demos\/([a-z0-9-]+)$/);
    if (demoMatch) {
      const demoId = demoMatch[1];
      const demo = demoData.find(d => d.id === demoId);
      
      if (demo) {
        metaData[path] = {
          title: `${demo.name} - Interactive Demo - Personal Website`,
          description: `${demo.description} Built with ${demo.technologies.join(', ')}.`,
          keywords: `${demo.name}, demo, ${demo.technologies.join(', ')}, ${demo.category}`,
          type: 'article'
        };
      }
    }

    // Handle category routes
    const categoryMatch = path.match(/^demos\/category\/([a-z0-9-]+)$/);
    if (categoryMatch) {
      const categoryId = categoryMatch[1];
      const category = categoryData.find(c => c.id === categoryId);
      
      if (category) {
        metaData[path] = {
          title: `${category.name} Demos - Personal Website`,
          description: `Explore interactive demonstrations in the ${category.name} category. Discover various technologies and development capabilities.`,
          keywords: `${category.name}, demos, ${categoryId}, interactive, development`,
          type: 'website'
        };
      }
    }

    // Handle test suite routes
    const testMatch = path.match(/^testing\/([a-z0-9-]+)$/);
    if (testMatch) {
      const suiteId = testMatch[1];
      metaData[path] = {
        title: `${suiteId} Test Suite - Testing Dashboard - Personal Website`,
        description: `Detailed test results and coverage for the ${suiteId} test suite`,
        keywords: `testing, ${suiteId}, test suite, coverage, results`,
        type: 'article'
      };
    }

    const meta = metaData[path] || metaData[''];
    
    res.json({
      ...meta,
      url: `${baseUrl}/${path}`,
      image: `${baseUrl}/og-image.jpg`,
      siteName: 'Personal Website',
      author: 'Full-Stack Developer',
      canonical: `${baseUrl}/${path}`
    });
  } catch (error) {
    console.error('Error generating meta data:', error);
    res.status(500).json({ error: 'Failed to generate meta data' });
  }
});

export { router as seoRoutes };