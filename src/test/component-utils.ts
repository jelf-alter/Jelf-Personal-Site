// Component testing utilities
import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { createPinia, Pinia } from 'pinia'
import { Component } from 'vue'

// Default test router configuration
export const createTestRouter = (routes: any[] = []): Router => {
  const defaultRoutes = [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/demos', component: { template: '<div>Demos</div>' } },
    { path: '/testing', component: { template: '<div>Testing</div>' } },
    { path: '/about', component: { template: '<div>About</div>' } },
    ...routes
  ]

  return createRouter({
    history: createWebHistory(),
    routes: defaultRoutes
  })
}

// Default test store configuration
export const createTestPinia = (): Pinia => {
  return createPinia()
}

// Enhanced mount function with common test setup
export const mountComponent = <T extends Component>(
  component: T,
  options: MountingOptions<any> = {}
): VueWrapper<any> => {
  const router = createTestRouter()
  const pinia = createTestPinia()

  const defaultOptions: MountingOptions<any> = {
    global: {
      plugins: [router, pinia],
      stubs: {
        RouterLink: {
          template: '<a><slot /></a>',
          props: ['to']
        },
        RouterView: {
          template: '<div><slot /></div>'
        }
      }
    }
  }

  // Merge options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global,
      plugins: [
        ...(defaultOptions.global?.plugins || []),
        ...(options.global?.plugins || [])
      ],
      stubs: {
        ...defaultOptions.global?.stubs,
        ...options.global?.stubs
      }
    }
  }

  return mount(component, mergedOptions)
}

// Utility to wait for Vue's reactivity system
export const nextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Utility to trigger events and wait for updates
export const triggerAndWait = async (wrapper: VueWrapper<any>, selector: string, event: string) => {
  await wrapper.find(selector).trigger(event)
  await nextTick()
  await wrapper.vm.$nextTick()
}

// Utility to simulate user input
export const setInputValue = async (wrapper: VueWrapper<any>, selector: string, value: string) => {
  const input = wrapper.find(selector)
  await input.setValue(value)
  await input.trigger('input')
  await nextTick()
}

// Utility to simulate form submission
export const submitForm = async (wrapper: VueWrapper<any>, formSelector = 'form') => {
  await wrapper.find(formSelector).trigger('submit')
  await nextTick()
}

// Utility to check if element is visible
export const isElementVisible = (wrapper: VueWrapper<any>, selector: string): boolean => {
  const element = wrapper.find(selector)
  return element.exists() && element.isVisible()
}

// Utility to wait for element to appear
export const waitForElement = async (
  wrapper: VueWrapper<any>, 
  selector: string, 
  timeout = 1000
): Promise<boolean> => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    if (isElementVisible(wrapper, selector)) {
      return true
    }
    await nextTick()
  }
  
  return false
}

// Utility to simulate window resize for responsive testing
export const simulateResize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

// Utility to simulate media query changes
export const simulateMediaQuery = (query: string, matches: boolean) => {
  const mockMatchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q === query ? matches : false,
    media: q,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  })
}

// Utility to mock intersection observer
export const mockIntersectionObserver = (isIntersecting = true) => {
  const mockObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: mockObserver,
  })

  // Simulate intersection
  if (isIntersecting) {
    setTimeout(() => {
      const callback = mockObserver.mock.calls[0]?.[0]
      if (callback) {
        callback([{ isIntersecting: true }])
      }
    }, 0)
  }
}

// Utility to test accessibility
export const checkAccessibility = (wrapper: VueWrapper<any>) => {
  const results = {
    hasProperHeadings: false,
    hasAltText: false,
    hasAriaLabels: false,
    hasKeyboardNavigation: false,
    hasSemanticHTML: false
  }

  // Check for proper heading structure
  const headings = wrapper.findAll('h1, h2, h3, h4, h5, h6')
  results.hasProperHeadings = headings.length > 0

  // Check for alt text on images
  const images = wrapper.findAll('img')
  results.hasAltText = images.every(img => img.attributes('alt') !== undefined)

  // Check for ARIA labels
  const interactiveElements = wrapper.findAll('button, input, select, textarea, a')
  results.hasAriaLabels = interactiveElements.some(el => 
    el.attributes('aria-label') || el.attributes('aria-labelledby')
  )

  // Check for semantic HTML
  const semanticElements = wrapper.findAll('main, nav, header, footer, section, article, aside')
  results.hasSemanticHTML = semanticElements.length > 0

  return results
}

// Utility to test keyboard navigation
export const testKeyboardNavigation = async (wrapper: VueWrapper<any>) => {
  const focusableElements = wrapper.findAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const results = {
    canFocusElements: false,
    canNavigateWithTab: false,
    canActivateWithEnter: false,
    canActivateWithSpace: false
  }

  if (focusableElements.length > 0) {
    results.canFocusElements = true

    // Test Tab navigation
    for (const element of focusableElements) {
      await element.trigger('keydown', { key: 'Tab' })
      results.canNavigateWithTab = true
    }

    // Test Enter activation
    const firstButton = focusableElements.find(el => el.element.tagName === 'BUTTON')
    if (firstButton) {
      await firstButton.trigger('keydown', { key: 'Enter' })
      results.canActivateWithEnter = true
    }

    // Test Space activation
    if (firstButton) {
      await firstButton.trigger('keydown', { key: ' ' })
      results.canActivateWithSpace = true
    }
  }

  return results
}

// Utility to test responsive behavior
export const testResponsiveBehavior = async (
  wrapper: VueWrapper<any>,
  breakpoints: { width: number; height: number; name: string }[]
) => {
  const results: Record<string, boolean> = {}

  for (const breakpoint of breakpoints) {
    simulateResize(breakpoint.width, breakpoint.height)
    await nextTick()
    
    // Check if layout adapts properly
    const hasResponsiveClasses = wrapper.classes().some(cls => 
      cls.includes('mobile') || cls.includes('tablet') || cls.includes('desktop')
    )
    
    results[breakpoint.name] = hasResponsiveClasses || wrapper.element.offsetWidth <= breakpoint.width
  }

  return results
}

// Utility for performance testing
export const measureRenderTime = async (component: Component, props: any = {}) => {
  const startTime = performance.now()
  
  const wrapper = mountComponent(component, { props })
  await nextTick()
  
  const endTime = performance.now()
  
  wrapper.unmount()
  
  return endTime - startTime
}

// Utility to test error boundaries
export const testErrorHandling = async (
  wrapper: VueWrapper<any>,
  errorTrigger: () => Promise<void>
) => {
  const originalConsoleError = console.error
  const errors: string[] = []
  
  console.error = (message: string) => {
    errors.push(message)
  }

  try {
    await errorTrigger()
    await nextTick()
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  } finally {
    console.error = originalConsoleError
  }

  return {
    hasErrors: errors.length > 0,
    errors,
    hasErrorBoundary: wrapper.find('[data-error-boundary]').exists()
  }
}