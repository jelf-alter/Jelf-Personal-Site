/**
 * Navigation composable for SEO-friendly routing
 */

import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  createNavigationHelper, 
  generateBreadcrumbs,
  getCanonicalUrl,
  normalizeUrl,
  isExternalUrl,
  handleExternalLink,
  preloadRoute
} from '@/utils/navigation'

export function useNavigation() {
  const router = useRouter()
  const route = useRoute()
  
  // Create navigation helper instance
  const navigationHelper = createNavigationHelper(router)
  
  // Current route information
  const currentPath = computed(() => route.path)
  const currentName = computed(() => route.name as string)
  const currentParams = computed(() => route.params)
  const currentQuery = computed(() => route.query)
  
  // Breadcrumb navigation
  const breadcrumbs = computed(() => generateBreadcrumbs(currentPath.value))
  
  // Canonical URL
  const canonicalUrl = computed(() => getCanonicalUrl(currentPath.value))
  
  // Navigation state
  const isNavigating = ref(false)
  
  // Enhanced navigation methods
  const navigateToDemo = async (demoId: string) => {
    isNavigating.value = true
    try {
      await navigationHelper.navigateToDemo(demoId)
    } finally {
      isNavigating.value = false
    }
  }
  
  const navigateToCategory = async (categoryId: string | null) => {
    isNavigating.value = true
    try {
      await navigationHelper.navigateToCategory(categoryId)
    } finally {
      isNavigating.value = false
    }
  }
  
  const navigateToTestSuite = async (suiteId: string) => {
    isNavigating.value = true
    try {
      await navigationHelper.navigateToTestSuite(suiteId)
    } finally {
      isNavigating.value = false
    }
  }
  
  const navigateTo = async (path: string, replace = false) => {
    isNavigating.value = true
    try {
      if (replace) {
        await router.replace(path)
      } else {
        await router.push(path)
      }
    } finally {
      isNavigating.value = false
    }
  }
  
  const goBack = (fallbackRoute = '/') => {
    navigationHelper.goBackOrFallback(fallbackRoute)
  }
  
  // URL utilities
  const getDemoUrl = (demoId: string) => navigationHelper.getDemoUrl(demoId)
  const getCategoryUrl = (categoryId: string) => navigationHelper.getCategoryUrl(categoryId)
  const getTestSuiteUrl = (suiteId: string) => navigationHelper.getTestSuiteUrl(suiteId)
  
  // External link handling
  const openExternalLink = (url: string, target = '_blank') => {
    handleExternalLink(url, target)
  }
  
  // Route preloading for performance
  const preloadDemoRoute = () => preloadRoute(router, 'demo-detail')
  const preloadTestingRoute = () => preloadRoute(router, 'testing')
  const preloadAboutRoute = () => preloadRoute(router, 'about')
  
  // Check if current route matches
  const isCurrentRoute = (routeName: string) => currentName.value === routeName
  const isCurrentPath = (path: string) => normalizeUrl(currentPath.value) === normalizeUrl(path)
  
  // Check if URL is external
  const checkIsExternalUrl = (url: string) => isExternalUrl(url)
  
  // Navigation guards helpers
  const canNavigateToDemo = (demoId: string) => {
    return /^[a-z0-9-]+$/.test(demoId)
  }
  
  const canNavigateToCategory = (categoryId: string) => {
    return /^[a-z0-9-]+$/.test(categoryId)
  }
  
  // History management
  const hasHistory = computed(() => window.history.length > 1)
  
  return {
    // Navigation helper
    navigationHelper,
    
    // Current route info
    currentPath,
    currentName,
    currentParams,
    currentQuery,
    breadcrumbs,
    canonicalUrl,
    
    // Navigation state
    isNavigating,
    hasHistory,
    
    // Navigation methods
    navigateToDemo,
    navigateToCategory,
    navigateToTestSuite,
    navigateTo,
    goBack,
    
    // URL utilities
    getDemoUrl,
    getCategoryUrl,
    getTestSuiteUrl,
    
    // External links
    openExternalLink,
    checkIsExternalUrl,
    
    // Route preloading
    preloadDemoRoute,
    preloadTestingRoute,
    preloadAboutRoute,
    
    // Route checking
    isCurrentRoute,
    isCurrentPath,
    
    // Validation
    canNavigateToDemo,
    canNavigateToCategory
  }
}

// Navigation event types for TypeScript
export interface NavigationEvent {
  from: string
  to: string
  timestamp: number
}

// Navigation analytics helper
export function useNavigationAnalytics() {
  const navigationEvents = ref<NavigationEvent[]>([])
  
  const trackNavigation = (from: string, to: string) => {
    navigationEvents.value.push({
      from,
      to,
      timestamp: Date.now()
    })
    
    // Keep only last 50 events to prevent memory leaks
    if (navigationEvents.value.length > 50) {
      navigationEvents.value = navigationEvents.value.slice(-50)
    }
    
    // Dispatch custom event for external analytics
    window.dispatchEvent(new CustomEvent('navigation-tracked', {
      detail: { from, to, timestamp: Date.now() }
    }))
  }
  
  const getNavigationHistory = () => [...navigationEvents.value]
  
  const clearNavigationHistory = () => {
    navigationEvents.value = []
  }
  
  return {
    navigationEvents: computed(() => navigationEvents.value),
    trackNavigation,
    getNavigationHistory,
    clearNavigationHistory
  }
}