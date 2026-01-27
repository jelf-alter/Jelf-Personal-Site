import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTestingStore } from '@/stores/testing'
import { testMetricsService } from '@/services/testMetrics'
import type { 
  ITestSuite, 
  ITestResult, 
  ICoverageMetrics,
  ITestMetricsSnapshot,
  ITestTrend,
  IOverallTestStats
} from '@/types'

export function useTestMetrics() {
  const testingStore = useTestingStore()
  
  // Reactive state
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const refreshInterval = ref<number | null>(null)

  // Computed properties
  const overallStats = computed((): IOverallTestStats => {
    return testingStore.overallStats
  })

  const recentResults = computed((): ITestResult[] => {
    return testingStore.recentResults
  })

  const overallCoverage = computed((): ICoverageMetrics => {
    return testingStore.overallCoverage
  })

  const testSuites = computed((): ITestSuite[] => {
    return testingStore.testSuites
  })

  const isRunningTests = computed((): boolean => {
    return testingStore.isRunningTests
  })

  const currentTestRun = computed((): string | null => {
    return testingStore.currentTestRun
  })

  // Methods
  const loadTestMetrics = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      await testingStore.loadTestSuites()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load test metrics'
    } finally {
      isLoading.value = false
    }
  }

  const runTests = async (suiteId?: string) => {
    try {
      await testingStore.runTests(suiteId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to run tests'
    }
  }

  const getTestSuite = (suiteId: string): ITestSuite | null => {
    return testingStore.getTestSuiteById(suiteId)
  }

  const getTestResults = (suiteId: string, limit?: number): ITestResult[] => {
    return testingStore.getTestResults(suiteId, limit)
  }

  const getSnapshots = (suiteId: string, limit?: number): ITestMetricsSnapshot[] => {
    return testingStore.getSnapshots(suiteId, limit)
  }

  const getTrend = (suiteId: string): ITestTrend | null => {
    return testingStore.getTrend(suiteId)
  }

  const getAllTrends = (): ITestTrend[] => {
    return testingStore.getAllTrends()
  }

  const getCoverageForSuite = (suiteId: string): ICoverageMetrics | null => {
    const suite = getTestSuite(suiteId)
    return suite ? suite.coverage : null
  }

  const getSuccessRate = (suiteId: string): number => {
    const trend = getTrend(suiteId)
    return trend ? trend.successRate : 0
  }

  const getCoverageTrend = (suiteId: string): 'improving' | 'declining' | 'stable' => {
    const trend = getTrend(suiteId)
    return trend ? trend.trendDirection : 'stable'
  }

  const getAverageDuration = (suiteId: string): number => {
    const trend = getTrend(suiteId)
    return trend ? trend.averageDuration : 0
  }

  const getTestCountsForSuite = (suiteId: string) => {
    const suite = getTestSuite(suiteId)
    if (!suite) return null

    return {
      total: suite.totalTests,
      passed: suite.passedTests,
      failed: suite.failedTests,
      skipped: suite.skippedTests,
      successRate: suite.totalTests > 0 ? (suite.passedTests / suite.totalTests) * 100 : 0
    }
  }

  const getRecentResultsForSuite = (suiteId: string, limit: number = 10): ITestResult[] => {
    return getTestResults(suiteId, limit)
  }

  const getFailedTests = (suiteId?: string): ITestResult[] => {
    if (suiteId) {
      return getTestResults(suiteId).filter(result => result.status === 'fail')
    }
    
    return recentResults.value.filter(result => result.status === 'fail')
  }

  const getPassingTests = (suiteId?: string): ITestResult[] => {
    if (suiteId) {
      return getTestResults(suiteId).filter(result => result.status === 'pass')
    }
    
    return recentResults.value.filter(result => result.status === 'pass')
  }

  const getCoveragePercentage = (coverage: ICoverageMetrics, type: 'lines' | 'branches' | 'functions' | 'statements'): number => {
    return coverage[type].percentage
  }

  const getCoverageStatus = (percentage: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (percentage >= 90) return 'excellent'
    if (percentage >= 80) return 'good'
    if (percentage >= 70) return 'fair'
    return 'poor'
  }

  const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`
    } else {
      const minutes = Math.floor(milliseconds / 60000)
      const seconds = Math.floor((milliseconds % 60000) / 1000)
      return `${minutes}m ${seconds}s`
    }
  }

  const formatCoveragePercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`
  }

  const exportTestData = (): string => {
    return testingStore.exportTestData()
  }

  const importTestData = (jsonData: string): boolean => {
    return testingStore.importTestData(jsonData)
  }

  const clearTestData = (): void => {
    testingStore.clearTestData()
  }

  // Auto-refresh functionality
  const startAutoRefresh = (intervalMs: number = 30000) => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
    }
    
    refreshInterval.value = window.setInterval(() => {
      if (!isRunningTests.value) {
        loadTestMetrics()
      }
    }, intervalMs)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    loadTestMetrics()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // State
    isLoading,
    error,
    
    // Computed
    overallStats,
    recentResults,
    overallCoverage,
    testSuites,
    isRunningTests,
    currentTestRun,
    
    // Methods
    loadTestMetrics,
    runTests,
    getTestSuite,
    getTestResults,
    getSnapshots,
    getTrend,
    getAllTrends,
    getCoverageForSuite,
    getSuccessRate,
    getCoverageTrend,
    getAverageDuration,
    getTestCountsForSuite,
    getRecentResultsForSuite,
    getFailedTests,
    getPassingTests,
    getCoveragePercentage,
    getCoverageStatus,
    formatDuration,
    formatCoveragePercentage,
    exportTestData,
    importTestData,
    clearTestData,
    
    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh
  }
}

// Utility functions for test metrics analysis
export const testMetricsUtils = {
  calculateCoverageChange: (current: ICoverageMetrics, previous: ICoverageMetrics): number => {
    const currentAvg = (current.lines.percentage + current.branches.percentage + 
                      current.functions.percentage + current.statements.percentage) / 4
    const previousAvg = (previous.lines.percentage + previous.branches.percentage + 
                        previous.functions.percentage + previous.statements.percentage) / 4
    return currentAvg - previousAvg
  },

  calculateSuccessRateChange: (currentSnapshots: ITestMetricsSnapshot[]): number => {
    if (currentSnapshots.length < 2) return 0
    
    const recent = currentSnapshots.slice(0, 5)
    const older = currentSnapshots.slice(-5)
    
    const recentSuccess = recent.filter(s => s.status === 'passing').length / recent.length
    const olderSuccess = older.filter(s => s.status === 'passing').length / older.length
    
    return (recentSuccess - olderSuccess) * 100
  },

  getCoverageColor: (percentage: number): string => {
    if (percentage >= 90) return '#22c55e' // green
    if (percentage >= 80) return '#84cc16' // lime
    if (percentage >= 70) return '#eab308' // yellow
    if (percentage >= 60) return '#f97316' // orange
    return '#ef4444' // red
  },

  getStatusColor: (status: 'passing' | 'failing' | 'unknown'): string => {
    switch (status) {
      case 'passing': return '#22c55e'
      case 'failing': return '#ef4444'
      case 'unknown': return '#6b7280'
      default: return '#6b7280'
    }
  },

  getTrendIcon: (direction: 'improving' | 'declining' | 'stable'): string => {
    switch (direction) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      case 'stable': return '➡️'
      default: return '➡️'
    }
  }
}