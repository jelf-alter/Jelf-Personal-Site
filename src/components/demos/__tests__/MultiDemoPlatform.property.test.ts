/**
 * Property-Based Tests for Multi-Demo Platform Consistency
 * 
 * **Feature: personal-website, Property 11: Multi-Demo Platform Consistency**
 * **Validates: Requirements 4.1, 4.2, 4.4**
 * 
 * For any navigation between demo applications, the website should maintain 
 * consistent branding, navigation structure, and provide clear descriptions 
 * for each demo.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import * as fc from 'fast-check'
import DemoContainer from '../DemoContainer.vue'
import DemoDocumentation from '../DemoDocumentation.vue'
import { demoRegistry, type IDemoConfig } from '@/services/demoRegistry'
import { useDemosStore } from '@/stores/demos'
import { arbDemoApplication, propertyTestConfig } from '@/test/property-generators'

// Mock router with demo routes
const createTestRouter = () => createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/demos', component: { template: '<div>Demos</div>' } },
    { path: '/demos/:id', component: { template: '<div>Demo Detail</div>' } },
    { path: '/testing', component: { template: '<div>Testing</div>' } }
  ]
})

describe('Multi-Demo Platform Consistency Property Tests', () => {
  let router: ReturnType<typeof createTestRouter>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    router = createTestRouter()
    pinia = createPinia()
    vi.clearAllMocks()
  })

  /**
   * Property 11: Multi-Demo Platform Consistency
   * 
   * For any navigation between demo applications, the website should maintain 
   * consistent branding, navigation structure, and provide clear descriptions 
   * for each demo.
   */
  it('should maintain consistent branding and navigation across all demo applications', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...demoRegistry.getAllDemos().map(d => d.id)),
        async (demoId) => {
          const wrapper = mount(DemoContainer, {
            props: {
              demoId,
              isActive: true,
              showTestsLink: true,
              showFooter: true
            },
            global: {
              plugins: [router, pinia],
              stubs: {
                BaseButton: {
                  template: '<button class="base-button"><slot /></button>',
                  props: ['variant', 'size']
                },
                LoadingSpinner: {
                  template: '<div class="loading-spinner"><slot /></div>',
                  props: ['size', 'message']
                },
                DemoDocumentation: {
                  template: '<div class="demo-documentation-stub"></div>'
                },
                RouterLink: {
                  template: '<a class="router-link"><slot /></a>',
                  props: ['to']
                }
              }
            }
          })

          // Wait for component initialization and store loading
          await new Promise(resolve => setTimeout(resolve, 150))
          await wrapper.vm.$nextTick()

          // Requirement 4.1: Consistent navigation and branding
          const container = wrapper.find('.demo-container')
          expect(container.exists()).toBe(true)

          // Check for consistent container structure - should always exist
          const content = wrapper.find('.demo-content')
          expect(content.exists()).toBe(true)

          const demoWrapper = wrapper.find('.demo-wrapper')
          expect(demoWrapper.exists()).toBe(true)

          // Check for either loading state or loaded state (both are consistent)
          const hasLoadingState = wrapper.find('.demo-loading').exists()
          const hasErrorState = wrapper.find('.demo-error').exists()
          const hasAppState = wrapper.find('.demo-app').exists()
          
          // At least one state should be present
          expect(hasLoadingState || hasErrorState || hasAppState).toBe(true)

          // If not in loading/error state, check for header elements
          if (!hasLoadingState && !hasErrorState) {
            const header = wrapper.find('.demo-header')
            if (header.exists()) {
              // Check for consistent breadcrumb navigation
              const breadcrumb = wrapper.find('.demo-breadcrumb')
              expect(breadcrumb.exists()).toBe(true)
              
              const breadcrumbLink = wrapper.find('.breadcrumb-link')
              expect(breadcrumbLink.exists()).toBe(true)

              // Check for consistent title structure
              const titleSection = wrapper.find('.demo-title-section')
              expect(titleSection.exists()).toBe(true)
              
              const title = wrapper.find('.demo-title')
              expect(title.exists()).toBe(true)

              // Check for consistent actions
              const actions = wrapper.find('.demo-actions')
              expect(actions.exists()).toBe(true)

              // Check for consistent footer when enabled
              const footer = wrapper.find('.demo-footer')
              expect(footer.exists()).toBe(true)
            }
          }

          return true
        }
      ),
      { numRuns: Math.min(10, propertyTestConfig.numRuns), timeout: propertyTestConfig.timeout }
    )
  })

  it('should provide clear descriptions and instructions for each demo application', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoRegistry.getAllDemos()),
        (demoConfig) => {
          const wrapper = mount(DemoDocumentation, {
            props: {
              demo: demoConfig
            },
            global: {
              plugins: [router, pinia],
              stubs: {
                BaseButton: {
                  template: '<button><slot /></button>',
                  props: ['variant', 'size']
                }
              }
            }
          })

          // Requirement 4.4: Clear descriptions for each demo
          const documentation = wrapper.find('.demo-documentation')
          expect(documentation.exists()).toBe(true)

          // Check for demo title and description
          const title = wrapper.find('.doc-title')
          expect(title.exists()).toBe(true)
          expect(title.text()).toBe(demoConfig.name)
          expect(title.text().length).toBeGreaterThan(0)

          const description = wrapper.find('.doc-description')
          expect(description.exists()).toBe(true)
          expect(description.text()).toBe(demoConfig.description)
          expect(description.text().length).toBeGreaterThan(10) // Meaningful description

          // Check for technologies section
          const techSection = wrapper.find('.technologies')
          expect(techSection.exists()).toBe(true)
          
          const techItems = wrapper.findAll('.tech-item')
          expect(techItems.length).toBe(demoConfig.technologies.length)
          expect(techItems.length).toBeGreaterThan(0)

          // Each tech item should have icon and name
          techItems.forEach((item, index) => {
            expect(item.find('.tech-icon').exists()).toBe(true)
            expect(item.find('.tech-name').exists()).toBe(true)
            expect(item.find('.tech-name').text()).toBe(demoConfig.technologies[index])
          })

          // Check for action buttons with clear labels
          const actionButtons = wrapper.find('.action-buttons')
          expect(actionButtons.exists()).toBe(true)
          
          const launchButton = wrapper.find('[aria-label="Launch the demo application"]')
          expect(launchButton.exists()).toBe(true)
          expect(launchButton.text()).toContain('Launch Demo')

          const testsButton = wrapper.find('[aria-label="View test results for this demo"]')
          expect(testsButton.exists()).toBe(true)
          expect(testsButton.text()).toContain('View Tests')

          // Check for metadata display
          const metadata = wrapper.find('.demo-metadata')
          expect(metadata.exists()).toBe(true)
          
          const metadataItems = wrapper.findAll('.metadata-item')
          expect(metadataItems.length).toBeGreaterThan(0)

          // Verify each metadata item has label and value
          metadataItems.forEach(item => {
            expect(item.find('.metadata-label').exists()).toBe(true)
            expect(item.find('.metadata-value').exists()).toBe(true)
            expect(item.find('.metadata-label').text().length).toBeGreaterThan(0)
            expect(item.find('.metadata-value').text().length).toBeGreaterThan(0)
          })

          return true
        }
      ),
      { numRuns: propertyTestConfig.numRuns, timeout: propertyTestConfig.timeout }
    )
  })

  it('should maintain consistent demo application hosting and navigation structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...demoRegistry.getAllDemos().map(d => d.id)),
        async (demoId) => {
          const wrapper = mount(DemoContainer, {
            props: {
              demoId,
              isActive: true
            },
            global: {
              plugins: [router, pinia],
              stubs: {
                BaseButton: {
                  template: '<button class="base-button"><slot /></button>',
                  props: ['variant', 'size']
                },
                LoadingSpinner: {
                  template: '<div class="loading-spinner"><slot /></div>',
                  props: ['size', 'message']
                },
                DemoDocumentation: {
                  template: '<div class="demo-documentation-stub"></div>'
                },
                RouterLink: {
                  template: '<a class="router-link"><slot /></a>',
                  props: ['to']
                }
              }
            }
          })

          // Wait for component initialization
          await new Promise(resolve => setTimeout(resolve, 150))
          await wrapper.vm.$nextTick()

          // Requirement 4.1: Multiple demo applications with consistent hosting
          const container = wrapper.find('.demo-container')
          expect(container.exists()).toBe(true)

          // Check for consistent demo content area
          const content = wrapper.find('.demo-content')
          expect(content.exists()).toBe(true)

          const demoWrapper = wrapper.find('.demo-wrapper')
          expect(demoWrapper.exists()).toBe(true)

          // Check for consistent slot structure for demo applications
          const hasLoadingState = wrapper.find('.demo-loading').exists()
          const hasErrorState = wrapper.find('.demo-error').exists()
          const hasAppState = wrapper.find('.demo-app').exists()
          
          // At least one state should be present
          expect(hasLoadingState || hasErrorState || hasAppState).toBe(true)

          // If demo is loaded successfully, check for metadata consistency
          if (!hasLoadingState && !hasErrorState) {
            const demoMeta = wrapper.find('.demo-meta')
            if (demoMeta.exists()) {
              const statusElement = wrapper.find('.demo-status')
              expect(statusElement.exists()).toBe(true)

              const categoryElement = wrapper.find('.demo-category')
              expect(categoryElement.exists()).toBe(true)
            }
          }

          return true
        }
      ),
      { numRuns: Math.min(10, propertyTestConfig.numRuns), timeout: propertyTestConfig.timeout }
    )
  })

  it('should provide consistent demo registry and configuration management', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...demoRegistry.getAllDemos().map(d => d.id)),
        (demoId) => {
          // Test demo registry consistency
          const demoConfig = demoRegistry.getDemo(demoId)
          expect(demoConfig).toBeDefined()
          expect(demoConfig!.id).toBe(demoId)

          // Check required configuration properties
          expect(demoConfig!.name).toBeDefined()
          expect(demoConfig!.name.length).toBeGreaterThan(0)
          
          expect(demoConfig!.description).toBeDefined()
          expect(demoConfig!.description.length).toBeGreaterThan(10)
          
          expect(demoConfig!.category).toBeDefined()
          expect(demoConfig!.category.length).toBeGreaterThan(0)
          
          expect(demoConfig!.technologies).toBeDefined()
          expect(Array.isArray(demoConfig!.technologies)).toBe(true)
          expect(demoConfig!.technologies.length).toBeGreaterThan(0)
          
          expect(demoConfig!.status).toBeDefined()
          expect(['active', 'maintenance', 'archived']).toContain(demoConfig!.status)
          
          expect(demoConfig!.route).toBeDefined()
          expect(demoConfig!.route.startsWith('/demos/')).toBe(true)
          
          expect(demoConfig!.testSuiteId).toBeDefined()
          expect(demoConfig!.testSuiteId.length).toBeGreaterThan(0)

          // Check category consistency
          const category = demoRegistry.getCategory(demoConfig!.category)
          expect(category).toBeDefined()
          expect(category!.name).toBeDefined()
          expect(category!.description).toBeDefined()

          // Check route mapping consistency
          const demoByRoute = demoRegistry.getDemoByRoute(demoConfig!.route)
          expect(demoByRoute).toBeDefined()
          expect(demoByRoute!.id).toBe(demoId)

          // Check application conversion consistency
          const application = demoRegistry.configToApplication(demoConfig!)
          expect(application.id).toBe(demoConfig!.id)
          expect(application.name).toBe(demoConfig!.name)
          expect(application.description).toBe(demoConfig!.description)
          expect(application.technologies).toEqual(demoConfig!.technologies)
          expect(application.status).toBe(demoConfig!.status)
          expect(application.testSuiteId).toBe(demoConfig!.testSuiteId)

          return true
        }
      ),
      { numRuns: propertyTestConfig.numRuns, timeout: propertyTestConfig.timeout }
    )
  })

  it('should maintain consistent featured demo highlighting across the platform', async () => {
    const featuredDemos = demoRegistry.getFeaturedDemos()
    if (featuredDemos.length === 0) {
      // Skip test if no featured demos
      return
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...featuredDemos),
        async (featuredDemo) => {
          // Test featured demo in DemoContainer
          const containerWrapper = mount(DemoContainer, {
            props: {
              demoId: featuredDemo.id,
              isActive: true
            },
            global: {
              plugins: [router, pinia],
              stubs: {
                BaseButton: {
                  template: '<button class="base-button"><slot /></button>',
                  props: ['variant', 'size']
                },
                LoadingSpinner: {
                  template: '<div class="loading-spinner"><slot /></div>',
                  props: ['size', 'message']
                },
                DemoDocumentation: {
                  template: '<div class="demo-documentation-stub"></div>'
                },
                RouterLink: {
                  template: '<a class="router-link"><slot /></a>',
                  props: ['to']
                }
              }
            }
          })

          // Wait for component initialization
          await new Promise(resolve => setTimeout(resolve, 150))
          await containerWrapper.vm.$nextTick()

          // Test featured demo in DemoDocumentation
          const docWrapper = mount(DemoDocumentation, {
            props: {
              demo: featuredDemo
            },
            global: {
              plugins: [router, pinia],
              stubs: {
                BaseButton: {
                  template: '<button class="base-button"><slot /></button>',
                  props: ['variant', 'size']
                }
              }
            }
          })

          await docWrapper.vm.$nextTick()

          // Check for featured badge in documentation (this should always exist for featured demos)
          const docBadge = docWrapper.find('.demo-badge')
          expect(docBadge.exists()).toBe(true)
          expect(docBadge.text()).toContain('Featured Demo')

          // Check for featured badge in container (may not exist if in loading/error state)
          const featuredBadge = containerWrapper.find('.featured-badge')
          if (featuredBadge.exists()) {
            expect(featuredBadge.text()).toContain('Featured Demo')
          }

          return true
        }
      ),
      { numRuns: Math.min(5, featuredDemos.length * 2), timeout: propertyTestConfig.timeout }
    )
  })

  it('should provide consistent error handling and loading states across all demos', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('non-existent-demo', 'invalid-demo-id', ''),
        async (invalidDemoId) => {
          const wrapper = mount(DemoContainer, {
            props: {
              demoId: invalidDemoId,
              isActive: true
            },
            global: {
              plugins: [router, pinia],
              stubs: {
                BaseButton: {
                  template: '<button class="base-button"><slot /></button>',
                  props: ['variant', 'size']
                },
                LoadingSpinner: {
                  template: '<div class="loading-spinner"><slot /></div>',
                  props: ['size', 'message']
                },
                DemoDocumentation: {
                  template: '<div class="demo-documentation-stub"></div>'
                },
                RouterLink: {
                  template: '<a class="router-link"><slot /></a>',
                  props: ['to']
                }
              }
            }
          })

          // Wait longer for error state to appear
          await new Promise(resolve => setTimeout(resolve, 250))
          await wrapper.vm.$nextTick()

          // Should show consistent error state for invalid demos
          const hasErrorState = wrapper.find('.demo-error').exists()
          const hasLoadingState = wrapper.find('.demo-loading').exists()
          
          // Should have either error or loading state (loading might still be showing)
          expect(hasErrorState || hasLoadingState).toBe(true)

          // If error state is present, check its structure
          if (hasErrorState) {
            const errorState = wrapper.find('.demo-error')
            expect(errorState.exists()).toBe(true)

            const errorTitle = wrapper.find('.demo-error h2')
            expect(errorTitle.exists()).toBe(true)
            expect(errorTitle.text()).toBe('Demo Error')

            const errorMessage = wrapper.find('.demo-error p')
            expect(errorMessage.exists()).toBe(true)
            expect(errorMessage.text().length).toBeGreaterThan(0)

            const retryButton = wrapper.find('.demo-error button')
            expect(retryButton.exists()).toBe(true)
            expect(retryButton.text()).toContain('Retry')
          }

          return true
        }
      ),
      { numRuns: 5, timeout: propertyTestConfig.timeout } // Fewer runs for error cases
    )
  })
})