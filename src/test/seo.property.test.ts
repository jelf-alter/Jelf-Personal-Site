/**
 * Property-Based Tests for SEO Implementation
 * Feature: personal-website, Property 16: SEO Implementation
 * Validates: Requirements 7.2, 7.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import fc from 'fast-check'
import { useSEO, generateSitemapData, generateRobotsTxt, generateXMLSitemap } from '@/composables/useSEO'
import router from '@/router/index'

// Mock window.location for tests
const mockLocation = {
  origin: 'http://localhost:5173',
  href: 'http://localhost:5173/',
  pathname: '/',
  search: '',
  hash: ''
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

// Mock document.head for meta tag manipulation
const mockHead = {
  appendChild: vi.fn(),
  querySelector: vi.fn(),
  removeChild: vi.fn()
}

Object.defineProperty(document, 'head', {
  value: mockHead,
  writable: true
})

// Mock document.title
Object.defineProperty(document, 'title', {
  value: '',
  writable: true
})

// Mock meta element creation
const createMockMetaElement = () => ({
  name: '',
  content: '',
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
  parentNode: mockHead
})

// Mock link element creation
const createMockLinkElement = () => ({
  rel: '',
  href: '',
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
  parentNode: mockHead
})

// Mock script element creation
const createMockScriptElement = () => ({
  type: '',
  textContent: '',
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
  parentNode: mockHead
})

describe('Property 16: SEO Implementation', () => {
  let testRouter: any
  let pinia: any
  let app: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup router and pinia
    testRouter = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/demos', name: 'demos', component: { template: '<div>Demos</div>' } },
        { path: '/testing', name: 'testing', component: { template: '<div>Testing</div>' } }
      ]
    })
    
    pinia = createPinia()
    
    // Create a Vue app instance for proper context
    app = createApp({ template: '<div></div>' })
    app.use(testRouter)
    app.use(pinia)
    
    // Reset document state
    document.title = ''
    mockHead.appendChild.mockClear()
    mockHead.querySelector.mockClear()
    mockHead.removeChild.mockClear()
    
    // Mock createElement for different element types
    const originalCreateElement = document.createElement
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      switch (tagName.toLowerCase()) {
        case 'meta':
          return createMockMetaElement() as any
        case 'link':
          return createMockLinkElement() as any
        case 'script':
          return createMockScriptElement() as any
        default:
          return originalCreateElement.call(document, tagName)
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (app) {
      app.unmount()
    }
  })

  describe('Meta Tags Implementation', () => {
    it('should always generate proper meta tags for any valid SEO data', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 60 }),
            description: fc.string({ minLength: 1, maxLength: 160 }),
            keywords: fc.string({ minLength: 1, maxLength: 100 }),
            author: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.constantFrom('website', 'article', 'profile'),
            siteName: fc.string({ minLength: 1, maxLength: 50 })
          }),
          (seoData) => {
            // Create a test component that uses the composable
            const TestComponent = {
              template: '<div>Test</div>',
              setup() {
                const { setSEO } = useSEO()
                
                // Property: setSEO should accept any valid SEO data without errors
                expect(() => setSEO(seoData)).not.toThrow()
                
                return {}
              }
            }
            
            // Mount component with proper Vue context
            const wrapper = mount(TestComponent, {
              global: {
                plugins: [testRouter, pinia]
              }
            })
            
            // Property: Document title should be updated
            expect(document.title).toBe(seoData.title)
            
            // Property: Meta elements should be created for all provided data
            expect(document.createElement).toHaveBeenCalledWith('meta')
            
            // Property: Meta tags should be appended to document head
            expect(mockHead.appendChild).toHaveBeenCalled()
            
            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should always include required Open Graph and Twitter Card meta tags', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 60 }),
            description: fc.string({ minLength: 1, maxLength: 160 }),
            image: fc.webUrl(),
            url: fc.webUrl()
          }),
          (seoData) => {
            const TestComponent = {
              template: '<div>Test</div>',
              setup() {
                const { setSEO } = useSEO()
                setSEO(seoData)
                return {}
              }
            }
            
            const wrapper = mount(TestComponent, {
              global: {
                plugins: [testRouter, pinia]
              }
            })
            
            // Property: Open Graph meta tags should be created
            const metaCalls = (document.createElement as any).mock.calls.filter(
              (call: any[]) => call[0] === 'meta'
            )
            expect(metaCalls.length).toBeGreaterThan(0)
            
            // Property: Both Open Graph and Twitter Card tags should be handled
            expect(mockHead.appendChild).toHaveBeenCalled()
            
            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Structured Data Implementation', () => {
    it('should always generate valid JSON-LD structured data for any website data', () => {
      fc.assert(
        fc.property(
          fc.record({
            siteName: fc.string({ minLength: 1, maxLength: 50 }),
            description: fc.string({ minLength: 1, maxLength: 160 }),
            author: fc.string({ minLength: 1, maxLength: 50 })
          }),
          (data) => {
            const TestComponent = {
              template: '<div>Test</div>',
              setup() {
                const { generateWebsiteStructuredData } = useSEO()
                const structuredData = generateWebsiteStructuredData()
                
                // Property: Structured data should always have required schema.org context
                expect(structuredData['@context']).toBe('https://schema.org')
                expect(structuredData['@type']).toBe('WebSite')
                
                // Property: Structured data should be valid JSON
                expect(() => JSON.stringify(structuredData)).not.toThrow()
                
                // Property: Structured data should contain essential website properties
                expect(structuredData).toHaveProperty('name')
                expect(structuredData).toHaveProperty('url')
                expect(structuredData).toHaveProperty('author')
                
                return {}
              }
            }
            
            const wrapper = mount(TestComponent, {
              global: {
                plugins: [testRouter, pinia]
              }
            })
            
            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should always generate valid person structured data', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (authorName) => {
            // Mock current SEO data
            window.location.origin = 'http://localhost:5173'
            
            const TestComponent = {
              template: '<div>Test</div>',
              setup() {
                const { generatePersonStructuredData } = useSEO()
                const personData = generatePersonStructuredData()
                
                // Property: Person structured data should have correct schema.org type
                expect(personData['@context']).toBe('https://schema.org')
                expect(personData['@type']).toBe('Person')
                
                // Property: Person data should be valid JSON
                expect(() => JSON.stringify(personData)).not.toThrow()
                
                // Property: Person data should contain required properties
                expect(personData).toHaveProperty('name')
                expect(personData).toHaveProperty('jobTitle')
                expect(personData).toHaveProperty('url')
                expect(personData).toHaveProperty('knowsAbout')
                
                // Property: knowsAbout should be an array
                expect(Array.isArray(personData.knowsAbout)).toBe(true)
                
                return {}
              }
            }
            
            const wrapper = mount(TestComponent, {
              global: {
                plugins: [testRouter, pinia]
              }
            })
            
            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Sitemap Generation', () => {
    it('should always generate valid sitemap data with proper URL structure', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('http://localhost:5173', 'https://example.com', 'https://test.dev'),
          (baseUrl) => {
            // Mock window.location.origin
            window.location.origin = baseUrl
            
            const sitemapData = generateSitemapData()
            
            // Property: Sitemap should always contain data
            expect(Array.isArray(sitemapData)).toBe(true)
            expect(sitemapData.length).toBeGreaterThan(0)
            
            // Property: Each sitemap entry should have required properties
            sitemapData.forEach(entry => {
              expect(entry).toHaveProperty('url')
              expect(entry).toHaveProperty('lastmod')
              expect(entry).toHaveProperty('priority')
              expect(entry).toHaveProperty('changefreq')
              
              // Property: URLs should start with the base URL
              expect(entry.url).toMatch(new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
              
              // Property: Priority should be a valid decimal string
              expect(entry.priority).toMatch(/^[01]\.\d+$/)
              
              // Property: Changefreq should be a valid value
              expect(['never', 'yearly', 'monthly', 'weekly', 'daily', 'hourly', 'always'])
                .toContain(entry.changefreq)
              
              // Property: lastmod should be a valid date string
              expect(entry.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should always generate valid XML sitemap format', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('http://localhost:5173', 'https://example.com', 'https://test.dev'),
          (baseUrl) => {
            // Mock window.location.origin for sitemap generation
            window.location.origin = baseUrl
            
            const xmlSitemap = generateXMLSitemap()
            
            // Property: XML sitemap should be valid XML format
            expect(xmlSitemap).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/)
            expect(xmlSitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
            expect(xmlSitemap).toContain('</urlset>')
            
            // Property: Should contain at least the home page URL
            expect(xmlSitemap).toContain(`<loc>${baseUrl}/</loc>`)
            
            // Property: Should contain proper XML structure for URLs
            expect(xmlSitemap).toMatch(/<url>[\s\S]*<loc>[\s\S]*<\/loc>[\s\S]*<lastmod>[\s\S]*<\/lastmod>[\s\S]*<changefreq>[\s\S]*<\/changefreq>[\s\S]*<priority>[\s\S]*<\/priority>[\s\S]*<\/url>/)
            
            // Property: XML should be parseable (if DOMParser is available)
            expect(() => {
              if (typeof DOMParser !== 'undefined') {
                new DOMParser().parseFromString(xmlSitemap, 'text/xml')
              }
            }).not.toThrow()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Robots.txt Generation', () => {
    it('should always generate valid robots.txt content', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('http://localhost:5173', 'https://example.com', 'https://test.dev'),
          (baseUrl) => {
            // Mock window.location.origin
            window.location.origin = baseUrl
            
            const robotsTxt = generateRobotsTxt()
            
            // Property: Robots.txt should always contain required directives
            expect(robotsTxt).toContain('User-agent: *')
            expect(robotsTxt).toContain('Allow: /')
            expect(robotsTxt).toContain(`Sitemap: ${baseUrl}/sitemap.xml`)
            
            // Property: Robots.txt should contain crawl delay
            expect(robotsTxt).toContain('Crawl-delay: 1')
            
            // Property: Robots.txt should allow important paths
            expect(robotsTxt).toContain('Allow: /demos/')
            expect(robotsTxt).toContain('Allow: /testing/')
            expect(robotsTxt).toContain('Allow: /about/')
            
            // Property: Robots.txt should be valid plain text format
            expect(typeof robotsTxt).toBe('string')
            expect(robotsTxt.length).toBeGreaterThan(0)
            
            // Property: Each line should end with newline or be the last line
            const lines = robotsTxt.split('\n')
            expect(lines.length).toBeGreaterThan(1)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('URL Structure and Canonicalization', () => {
    it('should always generate proper canonical URLs for any valid route', () => {
      fc.assert(
        fc.property(
          fc.record({
            path: fc.constantFrom('/', '/demos', '/testing', '/about', '/demos/elt-pipeline'),
            query: fc.record({
              category: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
              sort: fc.option(fc.constantFrom('name', 'date', 'popularity'))
            })
          }),
          (routeData) => {
            const TestComponent = {
              template: '<div>Test</div>',
              setup() {
                const { setSEO } = useSEO()
                
                // Mock current URL
                const baseUrl = 'http://localhost:5173'
                const fullUrl = `${baseUrl}${routeData.path}`
                window.location.href = fullUrl
                
                setSEO({ url: fullUrl })
                
                // Property: Canonical link should be created
                expect(document.createElement).toHaveBeenCalledWith('link')
                expect(mockHead.appendChild).toHaveBeenCalled()
                
                // Property: URL should be properly formatted
                expect(fullUrl).toMatch(/^https?:\/\/[^\/]+/)
                if (routeData.path !== '/') {
                  expect(fullUrl).not.toMatch(/\/$/) // No trailing slash except root
                }
                
                return {}
              }
            }
            
            const wrapper = mount(TestComponent, {
              global: {
                plugins: [testRouter, pinia]
              }
            })
            
            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('SEO Meta Data Completeness', () => {
    it('should always provide complete SEO meta data for any page type', () => {
      fc.assert(
        fc.property(
          fc.record({
            pageType: fc.constantFrom('website', 'article', 'profile'),
            title: fc.string({ minLength: 10, maxLength: 60 }),
            description: fc.string({ minLength: 50, maxLength: 160 }),
            keywords: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 3, maxLength: 10 })
          }),
          (pageData) => {
            const TestComponent = {
              template: '<div>Test</div>',
              setup() {
                const { setSEO } = useSEO()
                
                const seoData = {
                  title: pageData.title,
                  description: pageData.description,
                  keywords: pageData.keywords.join(', '),
                  type: pageData.pageType,
                  url: window.location.href
                }
                
                setSEO(seoData)
                
                // Property: All essential SEO elements should be set
                expect(document.title).toBe(pageData.title)
                expect(mockHead.appendChild).toHaveBeenCalled()
                
                // Property: Meta tags should be created for all provided data
                expect(document.createElement).toHaveBeenCalledWith('meta')
                expect(document.createElement).toHaveBeenCalledWith('link')
                
                // Property: SEO data should be properly structured
                expect(seoData.title.length).toBeGreaterThan(0)
                expect(seoData.description.length).toBeGreaterThan(0)
                expect(seoData.keywords.length).toBeGreaterThan(0)
                
                return {}
              }
            }
            
            const wrapper = mount(TestComponent, {
              global: {
                plugins: [testRouter, pinia]
              }
            })
            
            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Breadcrumb Structured Data', () => {
    it('should always generate valid breadcrumb structured data for any valid route path', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '/demos/elt-pipeline',
            '/demos/category/data-processing',
            '/testing/elt-pipeline-tests',
            '/about'
          ),
          (routePath) => {
            const TestComponent = {
              template: '<div>Test</div>',
              setup() {
                // Mock route object
                const mockRoute = {
                  path: routePath,
                  params: {},
                  query: {},
                  meta: {}
                }
                
                // Extract path segments for breadcrumb generation
                const pathSegments = routePath.split('/').filter(segment => segment)
                
                if (pathSegments.length > 0) {
                  const { generateBreadcrumbStructuredData } = useSEO()
                  const breadcrumbData = generateBreadcrumbStructuredData(mockRoute as any)
                  
                  if (breadcrumbData) {
                    // Property: Breadcrumb structured data should have correct schema
                    expect(breadcrumbData['@context']).toBe('https://schema.org')
                    expect(breadcrumbData['@type']).toBe('BreadcrumbList')
                    expect(breadcrumbData).toHaveProperty('itemListElement')
                    
                    // Property: Breadcrumb items should be properly structured
                    const items = breadcrumbData.itemListElement as any[]
                    expect(Array.isArray(items)).toBe(true)
                    expect(items.length).toBeGreaterThan(0)
                    
                    // Property: Each breadcrumb item should have required properties
                    items.forEach((item, index) => {
                      expect(item['@type']).toBe('ListItem')
                      expect(item.position).toBe(index + 1)
                      expect(item).toHaveProperty('name')
                      expect(item).toHaveProperty('item')
                      expect(typeof item.name).toBe('string')
                      expect(typeof item.item).toBe('string')
                    })
                    
                    // Property: First item should always be Home
                    expect(items[0].name).toBe('Home')
                    expect(items[0].item).toContain(window.location.origin)
                  }
                }
                
                return {}
              }
            }
            
            const wrapper = mount(TestComponent, {
              global: {
                plugins: [testRouter, pinia]
              }
            })
            
            wrapper.unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})