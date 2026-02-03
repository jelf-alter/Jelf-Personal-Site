/**
 * Routing tests for SEO-friendly URL structure
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import router, { validateRouteParams, getCanonicalPath } from '../router/index'
import { normalizeUrl, generateBreadcrumbs, validateDemoId, validateCategoryId } from '../utils/navigation'

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:5173',
    href: 'http://localhost:5173/'
  },
  writable: true
})

// Mock gtag for analytics tests
Object.defineProperty(window, 'gtag', {
  value: vi.fn(),
  writable: true
})

describe('SEO-friendly Routing', () => {
  beforeEach(() => {
    // Reset router state if needed
    vi.clearAllMocks()
  })

  describe('Route Validation', () => {
    it('should validate demo ID format', () => {
      expect(validateDemoId('elt-pipeline')).toBe(true)
      expect(validateDemoId('websocket-demo')).toBe(true)
      expect(validateDemoId('invalid_demo')).toBe(false)
      expect(validateDemoId('INVALID')).toBe(false)
      expect(validateDemoId('nonexistent-demo')).toBe(false) // Valid format but doesn't exist
      expect(validateDemoId('')).toBe(false)
    })

    it('should validate category ID format', () => {
      expect(validateCategoryId('data-processing')).toBe(true)
      expect(validateCategoryId('real-time')).toBe(true)
      expect(validateCategoryId('invalid_category')).toBe(false)
      expect(validateCategoryId('INVALID')).toBe(false)
      expect(validateCategoryId('')).toBe(false)
    })

    it('should validate route parameters', () => {
      const validDemoRoute = {
        name: 'demo-detail',
        params: { demoId: 'elt-pipeline' },
        path: '/demos/elt-pipeline',
        meta: {}
      }

      const invalidDemoRoute = {
        name: 'demo-detail',
        params: { demoId: 'Invalid_Demo' },
        path: '/demos/Invalid_Demo',
        meta: {}
      }

      expect(validateRouteParams(validDemoRoute as any)).toBe(true)
      expect(validateRouteParams(invalidDemoRoute as any)).toBe(false)
    })
  })

  describe('URL Normalization', () => {
    it('should normalize URLs correctly', () => {
      expect(normalizeUrl('/demos/')).toBe('/demos')
      expect(normalizeUrl('demos')).toBe('/demos')
      expect(normalizeUrl('/')).toBe('/')
      expect(normalizeUrl('/demos/elt-pipeline/')).toBe('/demos/elt-pipeline')
    })

    it('should generate canonical paths', () => {
      const routeWithTrailingSlash = {
        path: '/demos/',
        query: {},
        meta: {}
      }

      const routeWithQuery = {
        path: '/demos',
        query: { category: 'data-processing', sort: 'name' },
        meta: {}
      }

      const routeWithoutTrailingSlash = {
        path: '/demos',
        query: {},
        meta: {}
      }

      expect(getCanonicalPath(routeWithTrailingSlash as any)).toBe('/demos')
      expect(getCanonicalPath(routeWithQuery as any)).toBe('/demos?category=data-processing&sort=name')
      expect(getCanonicalPath(routeWithoutTrailingSlash as any)).toBeNull()
    })
  })

  describe('Breadcrumb Generation', () => {
    it('should generate breadcrumbs for demo detail page', () => {
      const breadcrumbs = generateBreadcrumbs('/demos/elt-pipeline')
      
      expect(breadcrumbs).toHaveLength(3)
      expect(breadcrumbs[0]).toEqual({ name: 'Home', path: '/', current: false })
      expect(breadcrumbs[1]).toEqual({ name: 'Demos', path: '/demos', current: false })
      expect(breadcrumbs[2]).toEqual({ 
        name: 'ELT Pipeline Visualization', 
        path: '/demos/elt-pipeline', 
        current: true 
      })
    })

    it('should generate breadcrumbs for category page', () => {
      const breadcrumbs = generateBreadcrumbs('/demos/category/data-processing')
      
      expect(breadcrumbs).toHaveLength(3)
      expect(breadcrumbs[0]).toEqual({ name: 'Home', path: '/', current: false })
      expect(breadcrumbs[1]).toEqual({ name: 'Demos', path: '/demos', current: false })
      expect(breadcrumbs[2]).toEqual({ 
        name: 'Data Processing', 
        path: '/demos/category/data-processing', 
        current: true 
      })
    })

    it('should generate breadcrumbs for testing suite page', () => {
      const breadcrumbs = generateBreadcrumbs('/testing/elt-pipeline-tests')
      
      expect(breadcrumbs).toHaveLength(3)
      expect(breadcrumbs[0]).toEqual({ name: 'Home', path: '/', current: false })
      expect(breadcrumbs[1]).toEqual({ name: 'Testing', path: '/testing', current: false })
      expect(breadcrumbs[2]).toEqual({ 
        name: 'elt-pipeline-tests Suite', 
        path: '/testing/elt-pipeline-tests', 
        current: true 
      })
    })

    it('should generate breadcrumbs for simple pages', () => {
      const breadcrumbs = generateBreadcrumbs('/about')
      
      expect(breadcrumbs).toHaveLength(2)
      expect(breadcrumbs[0]).toEqual({ name: 'Home', path: '/', current: false })
      expect(breadcrumbs[1]).toEqual({ name: 'About', path: '/about', current: true })
    })

    it('should generate breadcrumbs for demos page', () => {
      const breadcrumbs = generateBreadcrumbs('/demos')
      
      expect(breadcrumbs).toHaveLength(2)
      expect(breadcrumbs[0]).toEqual({ name: 'Home', path: '/', current: false })
      expect(breadcrumbs[1]).toEqual({ name: 'Demos', path: '/demos', current: true })
    })
  })

  describe('Route Patterns', () => {
    it('should match demo routes with correct pattern', () => {
      const demoRoute = router.resolve('/demos/elt-pipeline')
      expect(demoRoute.name).toBe('demo-detail')
      expect(demoRoute.params.demoId).toBe('elt-pipeline')
    })

    it('should match category routes with correct pattern', () => {
      const categoryRoute = router.resolve('/demos/category/data-processing')
      expect(categoryRoute.name).toBe('demos-category')
      expect(categoryRoute.params.categoryId).toBe('data-processing')
    })

    it('should match testing suite routes with correct pattern', () => {
      const testRoute = router.resolve('/testing/elt-pipeline-tests')
      expect(testRoute.name).toBe('testing-suite')
      expect(testRoute.params.suiteId).toBe('elt-pipeline-tests')
    })

    it('should have legacy route redirects configured', () => {
      // Check that legacy routes exist in the router configuration
      const routes = router.getRoutes()
      
      const legacyDemoRoute = routes.find(r => r.path === '/demo/:id')
      expect(legacyDemoRoute).toBeDefined()
      expect(legacyDemoRoute?.redirect).toBeDefined()
      
      const legacyPortfolioRoute = routes.find(r => r.path === '/portfolio')
      expect(legacyPortfolioRoute).toBeDefined()
      expect(legacyPortfolioRoute?.redirect).toBe('/')
      
      const legacyProjectsRoute = routes.find(r => r.path === '/projects')
      expect(legacyProjectsRoute).toBeDefined()
      expect(legacyProjectsRoute?.redirect).toBe('/demos')
    })

    it('should handle 404 for invalid routes', () => {
      const invalidRoute = router.resolve('/invalid-route')
      expect(invalidRoute.name).toBe('not-found')
    })

    it('should reject invalid demo IDs', () => {
      const invalidDemoRoute = router.resolve('/demos/Invalid_Demo')
      expect(invalidDemoRoute.name).toBe('not-found')
    })

    it('should reject invalid category IDs', () => {
      const invalidCategoryRoute = router.resolve('/demos/category/Invalid_Category')
      expect(invalidCategoryRoute.name).toBe('not-found')
    })
  })

  describe('SEO Meta Data', () => {
    it('should have proper meta data for static routes', () => {
      const homeRoute = router.resolve('/')
      expect(homeRoute.meta?.title).toContain('Personal Website')
      expect(homeRoute.meta?.description).toBeTruthy()
      expect(homeRoute.meta?.priority).toBe('1.0')

      const demosRoute = router.resolve('/demos')
      expect(demosRoute.meta?.title).toContain('Interactive Demos')
      expect(demosRoute.meta?.priority).toBe('0.9')

      const testingRoute = router.resolve('/testing')
      expect(testingRoute.meta?.title).toContain('Testing Dashboard')
      expect(testingRoute.meta?.priority).toBe('0.8')
    })

    it('should have proper changefreq values', () => {
      const homeRoute = router.resolve('/')
      expect(homeRoute.meta?.changefreq).toBe('weekly')

      const testingRoute = router.resolve('/testing')
      expect(testingRoute.meta?.changefreq).toBe('daily')
    })
  })
})

describe('Navigation Utilities', () => {
  describe('URL Validation', () => {
    it('should validate demo IDs correctly', () => {
      expect(validateDemoId('elt-pipeline')).toBe(true)
      expect(validateDemoId('websocket-demo')).toBe(true)
      expect(validateDemoId('api-testing')).toBe(true)
      expect(validateDemoId('realtime-dashboard')).toBe(true)
      
      // Invalid formats
      expect(validateDemoId('Invalid_Demo')).toBe(false)
      expect(validateDemoId('UPPERCASE')).toBe(false)
      expect(validateDemoId('demo with spaces')).toBe(false)
      expect(validateDemoId('')).toBe(false)
      expect(validateDemoId('nonexistent-demo')).toBe(false)
    })

    it('should validate category IDs correctly', () => {
      expect(validateCategoryId('data-processing')).toBe(true)
      expect(validateCategoryId('real-time')).toBe(true)
      expect(validateCategoryId('data-visualization')).toBe(true)
      expect(validateCategoryId('development-tools')).toBe(true)
      expect(validateCategoryId('testing')).toBe(true)
      
      // Invalid formats
      expect(validateCategoryId('Invalid_Category')).toBe(false)
      expect(validateCategoryId('UPPERCASE')).toBe(false)
      expect(validateCategoryId('category with spaces')).toBe(false)
      expect(validateCategoryId('')).toBe(false)
      expect(validateCategoryId('nonexistent-category')).toBe(false)
    })
  })

  describe('URL Generation', () => {
    it('should generate correct demo URLs', () => {
      expect(normalizeUrl('/demos/elt-pipeline')).toBe('/demos/elt-pipeline')
      expect(normalizeUrl('/demos/websocket-demo')).toBe('/demos/websocket-demo')
    })

    it('should generate correct category URLs', () => {
      expect(normalizeUrl('/demos/category/data-processing')).toBe('/demos/category/data-processing')
      expect(normalizeUrl('/demos/category/real-time')).toBe('/demos/category/real-time')
    })

    it('should generate correct test suite URLs', () => {
      expect(normalizeUrl('/testing/elt-pipeline-tests')).toBe('/testing/elt-pipeline-tests')
      expect(normalizeUrl('/testing/websocket-tests')).toBe('/testing/websocket-tests')
    })
  })
})