/**
 * Navigation utilities for SEO-friendly routing and URL handling
 */

import type { Router, RouteLocationRaw } from 'vue-router'
import { demoRegistry } from '@/services/demoRegistry'

// URL validation patterns
export const URL_PATTERNS = {
  DEMO_ID: /^[a-z0-9-]+$/,
  CATEGORY_ID: /^[a-z0-9-]+$/,
  SUITE_ID: /^[a-z0-9-]+$/
} as const

// Navigation helper class
export class NavigationHelper {
  private router: Router

  constructor(router: Router) {
    this.router = router
  }

  /**
   * Navigate to a demo with proper URL structure
   */
  async navigateToDemo(demoId: string): Promise<void> {
    if (!URL_PATTERNS.DEMO_ID.test(demoId)) {
      console.warn(`Invalid demo ID format: ${demoId}`)
      await this.router.push({ name: 'not-found' })
      return
    }

    const demo = demoRegistry.getDemo(demoId)
    if (!demo) {
      console.warn(`Demo not found: ${demoId}`)
      await this.router.push({ name: 'not-found' })
      return
    }

    await this.router.push(`/demos/${demoId}`)
  }

  /**
   * Navigate to a demo category with proper URL structure
   */
  async navigateToCategory(categoryId: string | null): Promise<void> {
    if (categoryId === null) {
      await this.router.push('/demos')
      return
    }

    if (!URL_PATTERNS.CATEGORY_ID.test(categoryId)) {
      console.warn(`Invalid category ID format: ${categoryId}`)
      await this.router.push('/demos')
      return
    }

    const category = demoRegistry.getCategory(categoryId)
    if (!category) {
      console.warn(`Category not found: ${categoryId}`)
      await this.router.push('/demos')
      return
    }

    await this.router.push(`/demos/category/${categoryId}`)
  }

  /**
   * Navigate to a test suite with proper URL structure
   */
  async navigateToTestSuite(suiteId: string): Promise<void> {
    if (!URL_PATTERNS.SUITE_ID.test(suiteId)) {
      console.warn(`Invalid suite ID format: ${suiteId}`)
      await this.router.push({ name: 'not-found' })
      return
    }

    await this.router.push(`/testing/${suiteId}`)
  }

  /**
   * Get SEO-friendly URL for a demo
   */
  getDemoUrl(demoId: string): string {
    return `/demos/${demoId}`
  }

  /**
   * Get SEO-friendly URL for a category
   */
  getCategoryUrl(categoryId: string): string {
    return `/demos/category/${categoryId}`
  }

  /**
   * Get SEO-friendly URL for a test suite
   */
  getTestSuiteUrl(suiteId: string): string {
    return `/testing/${suiteId}`
  }

  /**
   * Navigate with proper history handling
   */
  async navigateWithHistory(to: RouteLocationRaw, replace = false): Promise<void> {
    if (replace) {
      await this.router.replace(to)
      return
    }
    await this.router.push(to)
  }

  /**
   * Go back in history or fallback to a default route
   */
  goBackOrFallback(fallbackRoute: RouteLocationRaw = '/'): void {
    if (window.history.length > 1) {
      this.router.go(-1)
    } else {
      this.router.push(fallbackRoute)
    }
  }
}

// URL normalization utilities
export const normalizeUrl = (url: string): string => {
  // Remove trailing slashes except for root
  if (url !== '/' && url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  
  // Ensure leading slash
  if (!url.startsWith('/')) {
    url = `/${url}`
  }
  
  return url
}

// Generate canonical URL
export const getCanonicalUrl = (path: string): string => {
  const baseUrl = window.location.origin
  const normalizedPath = normalizeUrl(path)
  return `${baseUrl}${normalizedPath}`
}

// Check if URL is external
export const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin)
    return urlObj.origin !== window.location.origin
  } catch {
    return false
  }
}

// Generate breadcrumb data from route
export const generateBreadcrumbs = (path: string) => {
  const breadcrumbs = [{ name: 'Home', path: '/', current: false }]
  
  const segments = path.split('/').filter(segment => segment)
  let currentPath = ''
  
  // Handle special cases first
  if (segments.length >= 2 && segments[0] === 'demos' && segments[1] !== 'category') {
    // This is a demo detail page
    const demo = demoRegistry.getDemo(segments[1])
    if (demo) {
      breadcrumbs.push({
        name: 'Demos',
        path: '/demos',
        current: false
      })
      breadcrumbs.push({
        name: demo.name,
        path: `/demos/${demo.id}`,
        current: true
      })
      return breadcrumbs
    }
  }
  
  if (segments.length >= 3 && segments[0] === 'demos' && segments[1] === 'category') {
    // This is a category page
    const category = demoRegistry.getCategory(segments[2])
    if (category) {
      breadcrumbs.push({
        name: 'Demos',
        path: '/demos',
        current: false
      })
      breadcrumbs.push({
        name: category.name,
        path: `/demos/category/${category.id}`,
        current: true
      })
      return breadcrumbs
    }
  }
  
  if (segments.length >= 2 && segments[0] === 'testing') {
    // This is a testing suite page
    breadcrumbs.push({
      name: 'Testing',
      path: '/testing',
      current: false
    })
    breadcrumbs.push({
      name: `${segments[1]} Suite`,
      path: `/testing/${segments[1]}`,
      current: true
    })
    return breadcrumbs
  }
  
  // Default breadcrumb generation for other pages
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1
    
    let name = segment.charAt(0).toUpperCase() + segment.slice(1)
    
    breadcrumbs.push({
      name,
      path: currentPath,
      current: isLast
    })
  })
  
  return breadcrumbs
}

// Preload route component
export const preloadRoute = async (router: Router, routeName: string): Promise<void> => {
  try {
    const route = router.getRoutes().find(r => r.name === routeName)
    if (route && route.components?.default) {
      const component = route.components.default
      // Only call if it's a lazy-loaded function that returns a promise
      if (typeof component === 'function') {
        try {
          const result = (component as any)()
          if (result && typeof result.then === 'function') {
            await result
          }
        } catch {
          // Ignore errors for non-async components
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to preload route ${routeName}:`, error)
  }
}

// Handle external links
export const handleExternalLink = (url: string, target = '_blank'): void => {
  if (isExternalUrl(url)) {
    window.open(url, target, 'noopener,noreferrer')
  } else {
    console.warn(`URL is not external: ${url}`)
  }
}

// URL query parameter utilities
export const getQueryParam = (key: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(key)
}

export const setQueryParam = (key: string, value: string): void => {
  const url = new URL(window.location.href)
  url.searchParams.set(key, value)
  window.history.replaceState({}, '', url.toString())
}

export const removeQueryParam = (key: string): void => {
  const url = new URL(window.location.href)
  url.searchParams.delete(key)
  window.history.replaceState({}, '', url.toString())
}

// Route validation utilities
export const validateDemoId = (demoId: string): boolean => {
  return URL_PATTERNS.DEMO_ID.test(demoId) && !!demoRegistry.getDemo(demoId)
}

export const validateCategoryId = (categoryId: string): boolean => {
  return URL_PATTERNS.CATEGORY_ID.test(categoryId) && !!demoRegistry.getCategory(categoryId)
}

export const validateSuiteId = (suiteId: string): boolean => {
  return URL_PATTERNS.SUITE_ID.test(suiteId)
}

// Create navigation helper instance
export const createNavigationHelper = (router: Router): NavigationHelper => {
  return new NavigationHelper(router)
}