import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IDemoApplication } from '@/types'

export const useDemosStore = defineStore('demos', () => {
  // State
  const demos = ref<IDemoApplication[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentDemo = ref<IDemoApplication | null>(null)

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

  // Actions
  const loadDemos = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Mock data - will be replaced with API call
      const mockDemos: IDemoApplication[] = [
        {
          id: 'elt-pipeline',
          name: 'ELT Pipeline Visualization',
          description: 'Interactive demonstration of Extract, Load, Transform data processing with real-time visualization',
          category: 'Data Processing',
          technologies: ['Vue.js', 'WebSockets', 'D3.js', 'Node.js'],
          status: 'active',
          launchUrl: '/demos/elt-pipeline',
          testSuiteId: 'elt-pipeline-tests',
          featured: true,
          createdDate: new Date('2024-01-01'),
          lastUpdated: new Date()
        },
        {
          id: 'api-testing',
          name: 'API Testing Tool',
          description: 'Interactive API testing interface with request/response visualization',
          category: 'Development Tools',
          technologies: ['Vue.js', 'Axios', 'JSON'],
          status: 'maintenance',
          launchUrl: '/demos/api-testing',
          testSuiteId: 'api-testing-tests',
          featured: false,
          createdDate: new Date('2024-01-15'),
          lastUpdated: new Date()
        },
        {
          id: 'realtime-dashboard',
          name: 'Real-time Dashboard',
          description: 'Live data dashboard with WebSocket connections and interactive charts',
          category: 'Data Visualization',
          technologies: ['Vue.js', 'WebSockets', 'Chart.js'],
          status: 'active',
          launchUrl: '/demos/realtime-dashboard',
          testSuiteId: 'dashboard-tests',
          featured: false,
          createdDate: new Date('2024-02-01'),
          lastUpdated: new Date()
        }
      ]
      
      demos.value = mockDemos
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load demos'
    } finally {
      isLoading.value = false
    }
  }

  const getDemoById = (id: string) => {
    return demos.value.find(demo => demo.id === id) || null
  }

  const setCurrentDemo = (demo: IDemoApplication | null) => {
    currentDemo.value = demo
  }

  const updateDemoStatus = (id: string, status: IDemoApplication['status']) => {
    const demo = demos.value.find(d => d.id === id)
    if (demo) {
      demo.status = status
      demo.lastUpdated = new Date()
    }
  }

  return {
    // State
    demos,
    isLoading,
    error,
    currentDemo,
    
    // Getters
    featuredDemos,
    activeDemos,
    demosByCategory,
    
    // Actions
    loadDemos,
    getDemoById,
    setCurrentDemo,
    updateDemoStatus
  }
})