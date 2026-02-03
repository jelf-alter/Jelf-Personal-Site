import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IDemoApplication } from '@/types'
import { demoRegistry, type IDemoConfig, type IDemoCategory } from '@/services/demoRegistry'

export const useDemosStore = defineStore('demos', () => {
  // State
  const demos = ref<IDemoApplication[]>([])
  const demoConfigs = ref<IDemoConfig[]>([])
  const categories = ref<IDemoCategory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentDemo = ref<IDemoApplication | null>(null)
  const currentDemoConfig = ref<IDemoConfig | null>(null)

  // Getters
  const featuredDemos = computed(() => 
    demos.value.filter(demo => demo.featured && demo.status === 'active')
  )

  const activeDemos = computed(() => 
    demos.value.filter(demo => demo.status === 'active')
  )

  const demosByCategory = computed(() => {
    return demos.value.reduce((acc, demo) => {
      if (!acc[demo.category]) {
        acc[demo.category] = []
      }
      acc[demo.category].push(demo)
      return acc
    }, {} as Record<string, IDemoApplication[]>)
  })

  const demoStatistics = computed(() => {
    return demoRegistry.getStatistics()
  })

  // Actions
  const loadDemos = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Load from demo registry
      demoConfigs.value = demoRegistry.getAllDemos()
      demos.value = demoRegistry.getAllDemoApplications()
      categories.value = demoRegistry.getAllCategories()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load demos'
    } finally {
      isLoading.value = false
    }
  }

  const getDemoById = (id: string) => {
    return demos.value.find(demo => demo.id === id) || null
  }

  const getDemoConfigById = (id: string) => {
    return demoRegistry.getDemo(id) || null
  }

  const getDemoByRoute = (route: string) => {
    const config = demoRegistry.getDemoByRoute(route)
    return config ? demoRegistry.configToApplication(config) : null
  }

  const setCurrentDemo = (demo: IDemoApplication | null) => {
    currentDemo.value = demo
    currentDemoConfig.value = demo ? demoRegistry.getDemo(demo.id) || null : null
  }

  const updateDemoStatus = (id: string, status: IDemoApplication['status']) => {
    const demo = demos.value.find(d => d.id === id)
    if (demo) {
      demo.status = status
      demo.lastUpdated = new Date()
    }
  }

  const searchDemos = (query: string) => {
    const configs = demoRegistry.searchDemos(query)
    return configs.map(config => demoRegistry.configToApplication(config))
  }

  const getDemosByCategory = (categoryId: string) => {
    const configs = demoRegistry.getDemosByCategory(categoryId)
    return configs.map(config => demoRegistry.configToApplication(config))
  }

  const getCategories = () => {
    return demoRegistry.getAllCategories()
  }

  return {
    // State
    demos,
    demoConfigs,
    categories,
    isLoading,
    error,
    currentDemo,
    currentDemoConfig,
    
    // Getters
    featuredDemos,
    activeDemos,
    demosByCategory,
    demoStatistics,
    
    // Actions
    loadDemos,
    getDemoById,
    getDemoConfigById,
    getDemoByRoute,
    setCurrentDemo,
    updateDemoStatus,
    searchDemos,
    getDemosByCategory,
    getCategories
  }
})