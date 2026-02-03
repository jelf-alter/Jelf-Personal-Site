import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { demoRegistry } from '@/services/demoRegistry'

// SEO-friendly route configuration with proper URL patterns
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Personal Website - Full-Stack Developer Portfolio',
      description: 'Professional portfolio showcasing full-stack development capabilities, data processing demos, and comprehensive testing practices',
      keywords: 'developer, portfolio, Vue.js, TypeScript, testing, data processing, ELT pipeline',
      type: 'website',
      priority: '1.0',
      changefreq: 'weekly'
    }
  },
  {
    path: '/demos',
    name: 'demos',
    component: () => import('../views/DemosView.vue'),
    meta: {
      title: 'Interactive Demos - Personal Website',
      description: 'Explore interactive demonstrations of various technologies including data processing, real-time applications, and development tools',
      keywords: 'demos, applications, Vue.js, TypeScript, ELT pipeline, data processing, real-time, WebSocket',
      type: 'website',
      priority: '0.9',
      changefreq: 'weekly'
    }
  },
  {
    path: '/demos/:demoId([a-z0-9-]+)',
    name: 'demo-detail',
    component: () => import('../views/DemoDetailView.vue'),
    meta: {
      title: 'Demo Detail - Personal Website',
      description: 'Detailed view of a specific demo application',
      type: 'article',
      priority: '0.8',
      changefreq: 'monthly'
    },
    beforeEnter: validateDemoRoute,
    props: route => ({ demoId: route.params.demoId })
  },
  // Category-based demo routes for better SEO
  {
    path: '/demos/category/:categoryId([a-z0-9-]+)',
    name: 'demos-category',
    component: () => import('../views/DemosView.vue'),
    meta: {
      title: 'Demo Category - Personal Website',
      description: 'Browse demos by category',
      type: 'website',
      priority: '0.7',
      changefreq: 'weekly'
    },
    beforeEnter: validateCategoryRoute,
    props: route => ({ categoryFilter: route.params.categoryId })
  },
  {
    path: '/testing',
    name: 'testing',
    component: () => import('../views/TestingView.vue'),
    meta: {
      title: 'Testing Dashboard - Personal Website',
      description: 'Public visibility into code quality, test coverage, and comprehensive testing practices including unit tests, integration tests, and property-based testing',
      keywords: 'testing, code quality, coverage, unit tests, integration tests, property-based testing, TDD, BDD',
      type: 'website',
      priority: '0.8',
      changefreq: 'daily'
    }
  },
  {
    path: '/testing/:suiteId([a-z0-9-]+)',
    name: 'testing-suite',
    component: () => import('../views/TestingView.vue'),
    meta: {
      title: 'Test Suite Details - Personal Website',
      description: 'Detailed test results and coverage for a specific test suite',
      type: 'article',
      priority: '0.6',
      changefreq: 'daily'
    },
    props: route => ({ suiteId: route.params.suiteId })
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'About - Personal Website',
      description: 'Learn about the developer, technologies used, and the development approach behind this comprehensive portfolio website',
      keywords: 'about, developer, technologies, Vue.js, TypeScript, full-stack, architecture, methodology',
      type: 'profile',
      priority: '0.7',
      changefreq: 'monthly'
    }
  },
  // Redirect old demo URLs to new format
  {
    path: '/demo/:id',
    redirect: to => `/demos/${to.params.id}`
  },
  // Handle legacy routes
  {
    path: '/portfolio',
    redirect: '/'
  },
  {
    path: '/projects',
    redirect: '/demos'
  },
  // 404 catch-all route
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found - Personal Website',
      description: 'The requested page could not be found. Explore our demos, testing dashboard, or return to the homepage.',
      keywords: '404, not found, error, page not found',
      type: 'website',
      priority: '0.1',
      changefreq: 'never'
    }
  }
]

// Route validation functions
function validateDemoRoute(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const demoId = to.params.demoId as string
  
  // Validate demo ID format
  if (!/^[a-z0-9-]+$/.test(demoId)) {
    next({ name: 'not-found' })
    return
  }
  
  const demo = demoRegistry.getDemo(demoId)
  
  if (!demo) {
    // Demo not found, redirect to 404
    next({ name: 'not-found' })
    return
  }
  
  // Update meta tags with demo-specific information
  to.meta.title = `${demo.name} - Interactive Demo - Personal Website`
  to.meta.description = `${demo.description} Built with ${demo.technologies.join(', ')}.`
  to.meta.keywords = `${demo.name}, demo, ${demo.technologies.join(', ')}, ${demo.category}`
  to.meta.canonical = `${window.location.origin}/demos/${demoId}`
  
  next()
}

function validateCategoryRoute(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const categoryId = to.params.categoryId as string
  
  // Validate category ID format
  if (!/^[a-z0-9-]+$/.test(categoryId)) {
    next({ name: 'not-found' })
    return
  }
  
  const category = demoRegistry.getCategory(categoryId)
  
  if (!category) {
    // Category not found, redirect to demos page
    next({ name: 'demos' })
    return
  }
  
  // Update meta tags with category-specific information
  to.meta.title = `${category.name} Demos - Personal Website`
  to.meta.description = `${category.description} Explore interactive demonstrations in the ${category.name} category.`
  to.meta.keywords = `${category.name}, demos, ${categoryId}, interactive, development`
  to.meta.canonical = `${window.location.origin}/demos/category/${categoryId}`
  
  next()
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Handle scroll behavior for better UX
    if (savedPosition) {
      // Return to saved position when using browser back/forward
      return savedPosition
    } else if (to.hash) {
      // Scroll to anchor if hash is present
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80 // Account for fixed header
      }
    } else if (to.name !== from.name) {
      // Scroll to top when navigating to different pages
      return { top: 0, behavior: 'smooth' }
    }
    // Keep current scroll position for same-page navigation
    return false
  },
  // Strict mode for better route matching
  strict: true,
  // Enable trailing slash handling
  end: true
})

// Enhanced global navigation guards
router.beforeEach(async (to, from, next) => {
  // Start loading indicator if available
  if (typeof window !== 'undefined' && window.NProgress) {
    window.NProgress.start()
  }

  // Validate route parameters
  if (!validateRouteParams(to)) {
    next({ name: 'not-found' })
    return
  }

  // Handle canonical URLs and redirects
  const canonicalPath = getCanonicalPath(to)
  if (canonicalPath && canonicalPath !== to.path) {
    next({ path: canonicalPath, replace: true })
    return
  }

  // Update document title with proper formatting
  updateDocumentTitle(to)
  
  // Update meta description and other SEO tags
  updateMetaTags(to)
  
  // Handle analytics or tracking if needed
  trackPageView(to, from)
  
  next()
})

router.afterEach((to, from) => {
  // Complete loading indicator
  if (typeof window !== 'undefined' && window.NProgress) {
    window.NProgress.done()
  }

  // Update canonical URL
  updateCanonicalUrl(to)
  
  // Handle focus management for accessibility
  handleFocusManagement(to, from)
  
  // Update breadcrumb navigation if available
  updateBreadcrumbs(to)
})

// Route parameter validation
function validateRouteParams(route: RouteLocationNormalized): boolean {
  // Validate demo ID format
  if (route.name === 'demo-detail' && route.params.demoId) {
    const demoId = route.params.demoId as string
    if (!/^[a-z0-9-]+$/.test(demoId)) {
      return false
    }
  }
  
  // Validate category ID format
  if (route.name === 'demos-category' && route.params.categoryId) {
    const categoryId = route.params.categoryId as string
    if (!/^[a-z0-9-]+$/.test(categoryId)) {
      return false
    }
  }
  
  // Validate test suite ID format
  if (route.name === 'testing-suite' && route.params.suiteId) {
    const suiteId = route.params.suiteId as string
    if (!/^[a-z0-9-]+$/.test(suiteId)) {
      return false
    }
  }
  
  return true
}

// Get canonical path for SEO
function getCanonicalPath(route: RouteLocationNormalized): string | null {
  // Remove trailing slashes except for root
  if (route.path !== '/' && route.path.endsWith('/')) {
    return route.path.slice(0, -1)
  }
  
  // Convert query parameters to lowercase for consistency
  if (Object.keys(route.query).length > 0) {
    const normalizedQuery = Object.entries(route.query)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key.toLowerCase()}=${value}`)
      .join('&')
    
    return `${route.path}?${normalizedQuery}`
  }
  
  return null
}

// Update document title with proper formatting
function updateDocumentTitle(route: RouteLocationNormalized): void {
  const title = route.meta?.title as string
  if (title) {
    document.title = title
    
    // Update Open Graph title
    updateMetaTag('property', 'og:title', title)
    updateMetaTag('name', 'twitter:title', title)
  }
}

// Update meta tags for SEO
function updateMetaTags(route: RouteLocationNormalized): void {
  const { description, keywords, type } = route.meta || {}
  
  if (description) {
    updateMetaTag('name', 'description', description as string)
    updateMetaTag('property', 'og:description', description as string)
    updateMetaTag('name', 'twitter:description', description as string)
  }
  
  if (keywords) {
    updateMetaTag('name', 'keywords', keywords as string)
  }
  
  if (type) {
    updateMetaTag('property', 'og:type', type as string)
  }
  
  // Update URL
  const currentUrl = window.location.href
  updateMetaTag('property', 'og:url', currentUrl)
  updateMetaTag('name', 'twitter:url', currentUrl)
}

// Helper function to update meta tags
function updateMetaTag(attribute: string, name: string, content: string): void {
  const selector = `meta[${attribute}="${name}"]`
  let metaElement = document.querySelector(selector) as HTMLMetaElement
  
  if (!metaElement) {
    metaElement = document.createElement('meta')
    metaElement.setAttribute(attribute, name)
    document.head.appendChild(metaElement)
  }
  
  metaElement.content = content
}

// Update canonical URL
function updateCanonicalUrl(route: RouteLocationNormalized): void {
  const canonicalUrl = route.meta?.canonical as string || window.location.href
  
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
  if (!canonicalLink) {
    canonicalLink = document.createElement('link')
    canonicalLink.rel = 'canonical'
    document.head.appendChild(canonicalLink)
  }
  
  canonicalLink.href = canonicalUrl
}

// Handle focus management for accessibility
function handleFocusManagement(to: RouteLocationNormalized, from: RouteLocationNormalized): void {
  // Skip focus management for same-page navigation
  if (to.name === from.name) return
  
  // Focus on main content area after navigation
  setTimeout(() => {
    const mainContent = document.querySelector('main, [role="main"], #main-content')
    if (mainContent && mainContent instanceof HTMLElement) {
      mainContent.focus({ preventScroll: true })
    } else {
      // Fallback: focus on the first heading
      const firstHeading = document.querySelector('h1, h2')
      if (firstHeading && firstHeading instanceof HTMLElement) {
        firstHeading.focus({ preventScroll: true })
      }
    }
  }, 100)
}

// Update breadcrumbs for navigation
function updateBreadcrumbs(route: RouteLocationNormalized): void {
  // This would integrate with a breadcrumb component if available
  const breadcrumbs = generateBreadcrumbs(route)
  
  // Dispatch custom event for breadcrumb components to listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('breadcrumb-update', {
      detail: { breadcrumbs, route }
    }))
  }
}

// Generate breadcrumb data
function generateBreadcrumbs(route: RouteLocationNormalized) {
  const breadcrumbs = [{ name: 'Home', path: '/', current: false }]
  
  const pathSegments = route.path.split('/').filter(segment => segment)
  let currentPath = ''
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1
    
    let name = segment.charAt(0).toUpperCase() + segment.slice(1)
    
    // Customize names for specific routes
    if (route.name === 'demo-detail' && segment === route.params.demoId) {
      const demo = demoRegistry.getDemo(segment)
      name = demo?.name || name
    } else if (route.name === 'demos-category' && segment === route.params.categoryId) {
      const category = demoRegistry.getCategory(segment)
      name = category?.name || name
    }
    
    breadcrumbs.push({
      name,
      path: currentPath,
      current: isLast
    })
  })
  
  return breadcrumbs
}

// Track page views for analytics
function trackPageView(to: RouteLocationNormalized, from: RouteLocationNormalized): void {
  // Skip tracking for same-page navigation
  if (to.name === from.name) return
  
  // This would integrate with analytics services like Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: to.meta?.title,
      page_location: window.location.href,
      page_path: to.path
    })
  }
  
  // Custom analytics event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('page-view', {
      detail: { to, from, timestamp: Date.now() }
    }))
  }
}

// Error handling for navigation failures
router.onError((error) => {
  console.error('Router navigation error:', error)
  
  // Handle chunk loading errors (common in SPA deployments)
  if (error.message.includes('Loading chunk')) {
    // Reload the page to get the latest chunks
    window.location.reload()
    return
  }
  
  // Handle other navigation errors
  router.push({ name: 'not-found' })
})

export default router

// Export utility functions for use in components
export {
  generateBreadcrumbs,
  validateRouteParams,
  getCanonicalPath
}