import { ref, watch, onMounted, onUnmounted, readonly } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { demoRegistry } from '@/services/demoRegistry'

export interface SEOData {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  siteName?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: any
}

const DEFAULT_SEO: SEOData = {
  title: 'Personal Website - Full-Stack Developer Portfolio',
  description: 'Professional portfolio showcasing full-stack development capabilities, data processing demos, and comprehensive testing practices',
  keywords: 'developer, portfolio, Vue.js, TypeScript, testing, data processing, ELT pipeline',
  image: '/og-image.jpg',
  type: 'website',
  siteName: 'Personal Website',
  author: 'Full-Stack Developer'
}

export function useSEO() {
  const route = useRoute()
  const currentSEO = ref<SEOData>({ ...DEFAULT_SEO })
  const structuredDataElements = ref<HTMLScriptElement[]>([])

  // Update meta tags in the document head
  const updateMetaTags = (seoData: SEOData) => {
    const head = document.head

    // Update title
    if (seoData.title) {
      document.title = seoData.title
    }

    // Update or create meta tags
    const metaTags = [
      { name: 'description', content: seoData.description },
      { name: 'keywords', content: seoData.keywords },
      { name: 'author', content: seoData.author },
      
      // Open Graph tags
      { property: 'og:title', content: seoData.title },
      { property: 'og:description', content: seoData.description },
      { property: 'og:image', content: seoData.image },
      { property: 'og:url', content: seoData.url || window.location.href },
      { property: 'og:type', content: seoData.type },
      { property: 'og:site_name', content: seoData.siteName },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seoData.title },
      { name: 'twitter:description', content: seoData.description },
      { name: 'twitter:image', content: seoData.image },
      
      // Article specific tags
      ...(seoData.publishedTime ? [{ property: 'article:published_time', content: seoData.publishedTime }] : []),
      ...(seoData.modifiedTime ? [{ property: 'article:modified_time', content: seoData.modifiedTime }] : []),
      ...(seoData.section ? [{ property: 'article:section', content: seoData.section }] : []),
      ...(seoData.tags ? seoData.tags.map(tag => ({ property: 'article:tag', content: tag })) : [])
    ]

    metaTags.forEach(({ name, property, content }) => {
      if (!content) return

      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
      let metaElement = head.querySelector(selector) as HTMLMetaElement

      if (!metaElement) {
        metaElement = document.createElement('meta')
        if (name) metaElement.name = name
        if (property) metaElement.setAttribute('property', property)
        head.appendChild(metaElement)
      }

      metaElement.content = content
    })

    // Update canonical URL
    let canonicalLink = head.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.rel = 'canonical'
      head.appendChild(canonicalLink)
    }
    canonicalLink.href = seoData.url || window.location.href
  }

  // Add structured data (JSON-LD) to the page
  const addStructuredData = (data: StructuredData | StructuredData[]) => {
    const head = document.head
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(Array.isArray(data) ? data : [data], null, 2)
    head.appendChild(script)
    structuredDataElements.value.push(script)
  }

  // Remove all structured data elements
  const clearStructuredData = () => {
    structuredDataElements.value.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    structuredDataElements.value = []
  }

  // Set SEO data for the current page
  const setSEO = (seoData: Partial<SEOData>) => {
    currentSEO.value = {
      ...DEFAULT_SEO,
      ...seoData,
      url: seoData.url || window.location.href
    }
    updateMetaTags(currentSEO.value)
  }

  // Generate default structured data for the website
  const generateWebsiteStructuredData = (): StructuredData => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: currentSEO.value.siteName || 'Personal Website',
    description: currentSEO.value.description || '',
    url: window.location.origin,
    author: {
      '@type': 'Person',
      name: currentSEO.value.author || 'Full-Stack Developer'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  })

  // Generate person structured data
  const generatePersonStructuredData = (): StructuredData => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: currentSEO.value.author || 'Full-Stack Developer',
    jobTitle: 'Full-Stack Developer',
    description: 'Experienced developer specializing in modern web technologies, data processing, and comprehensive testing practices',
    url: window.location.origin,
    sameAs: [
      // Add social media profiles here
    ],
    knowsAbout: [
      'Vue.js',
      'TypeScript',
      'Node.js',
      'Data Processing',
      'ELT Pipelines',
      'Testing',
      'Web Development'
    ]
  })

  // Generate breadcrumb structured data
  const generateBreadcrumbStructuredData = (route: RouteLocationNormalized): StructuredData | null => {
    const pathSegments = route.path.split('/').filter(segment => segment)
    
    if (pathSegments.length === 0) return null

    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: window.location.origin
      }
    ]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: index + 2,
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        item: `${window.location.origin}${currentPath}`
      })
    })

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems
    }
  }

  // Initialize SEO for the current route
  const initializeSEO = () => {
    // Clear existing structured data
    clearStructuredData()

    // Set SEO data from route meta or defaults
    const routeSEO: Partial<SEOData> = {
      title: route.meta?.title as string,
      description: route.meta?.description as string,
      url: window.location.href
    }

    setSEO(routeSEO)

    // Add structured data
    const structuredDataArray: StructuredData[] = [
      generateWebsiteStructuredData(),
      generatePersonStructuredData()
    ]

    // Add breadcrumb if not on home page
    if (route.path !== '/') {
      const breadcrumb = generateBreadcrumbStructuredData(route)
      if (breadcrumb) {
        structuredDataArray.push(breadcrumb)
      }
    }

    addStructuredData(structuredDataArray)
  }

  // Watch for route changes
  watch(() => route.path, initializeSEO, { immediate: true })

  onMounted(() => {
    initializeSEO()
  })

  onUnmounted(() => {
    clearStructuredData()
  })

  return {
    currentSEO: readonly(currentSEO),
    setSEO,
    addStructuredData,
    clearStructuredData,
    generateWebsiteStructuredData,
    generatePersonStructuredData,
    generateBreadcrumbStructuredData
  }
}

// Utility function to generate sitemap data
export function generateSitemapData() {
  const baseUrl = window.location.origin
  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/demos', priority: '0.9', changefreq: 'weekly' },
    { path: '/testing', priority: '0.8', changefreq: 'daily' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' }
  ]

  // Add dynamic demo routes
  const demoRoutes = demoRegistry.getAllDemos().map(demo => ({
    path: `/demos/${demo.id}`,
    priority: demo.featured ? '0.8' : '0.6',
    changefreq: 'monthly',
    lastmod: demo.lastUpdated.toISOString().split('T')[0]
  }))

  // Add category routes
  const categoryRoutes = demoRegistry.getAllCategories().map(category => ({
    path: `/demos/category/${category.id}`,
    priority: '0.7',
    changefreq: 'weekly'
  }))

  const allRoutes = [...staticRoutes, ...demoRoutes, ...categoryRoutes]

  return allRoutes.map(route => ({
    url: `${baseUrl}${route.path}`,
    lastmod: route.lastmod || new Date().toISOString().split('T')[0],
    priority: route.priority,
    changefreq: route.changefreq
  }))
}

// Generate robots.txt content
export function generateRobotsTxt(): string {
  const baseUrl = window.location.origin
  
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Allow all demo pages
Allow: /demos/
Allow: /testing/
Allow: /about/

# Disallow admin or private areas (if any)
# Disallow: /admin/
# Disallow: /private/

# Allow common assets
Allow: /assets/
Allow: /images/
Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.gif$
Allow: /*.svg$
Allow: /*.webp$
Allow: /*.woff$
Allow: /*.woff2$
`
}

// Generate XML sitemap content
export function generateXMLSitemap(): string {
  const sitemapData = generateSitemapData()
  
  const urlEntries = sitemapData.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}