import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ITestSuite, ITestResult, ICoverageMetrics } from '@/types'

export const useTestingStore = defineStore('testing', () => {
  // State
  const testSuites = ref<ITestSuite[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isRunningTests = ref(false)
  const currentTestRun = ref<string | null>(null)

  // Getters
  const overallCoverage = computed((): ICoverageMetrics => {
    if (testSuites.value.length === 0) {
      return {
        lines: { covered: 0, total: 0, percentage: 0 },
        branches: { covered: 0, total: 0, percentage: 0 },
        functions: { covered: 0, total: 0, percentage: 0 },
        statements: { covered: 0, total: 0, percentage: 0 }
      }
    }

    const totals = testSuites.value.reduce((acc, suite) => {
      acc.lines.covered += suite.coverage.lines.covered
      acc.lines.total += suite.coverage.lines.total
      acc.branches.covered += suite.coverage.branches.covered
      acc.branches.total += suite.coverage.branches.total
      acc.functions.covered += suite.coverage.functions.covered
      acc.functions.total += suite.coverage.functions.total
      acc.statements.covered += suite.coverage.statements.covered
      acc.statements.total += suite.coverage.statements.total
      return acc
    }, {
      lines: { covered: 0, total: 0 },
      branches: { covered: 0, total: 0 },
      functions: { covered: 0, total: 0 },
      statements: { covered: 0, total: 0 }
    })

    return {
      lines: {
        ...totals.lines,
        percentage: totals.lines.total > 0 ? (totals.lines.covered / totals.lines.total) * 100 : 0
      },
      branches: {
        ...totals.branches,
        percentage: totals.branches.total > 0 ? (totals.branches.covered / totals.branches.total) * 100 : 0
      },
      functions: {
        ...totals.functions,
        percentage: totals.functions.total > 0 ? (totals.functions.covered / totals.functions.total) * 100 : 0
      },
      statements: {
        ...totals.statements,
        percentage: totals.statements.total > 0 ? (totals.statements.covered / totals.statements.total) * 100 : 0
      }
    }
  })

  const totalTests = computed(() => 
    testSuites.value.reduce((sum, suite) => sum + suite.totalTests, 0)
  )

  const passedTests = computed(() => 
    testSuites.value.reduce((sum, suite) => sum + suite.passedTests, 0)
  )

  const failedTests = computed(() => 
    testSuites.value.reduce((sum, suite) => sum + suite.failedTests, 0)
  )

  const overallStatus = computed(() => {
    if (testSuites.value.length === 0) return 'unknown'
    if (testSuites.value.some(suite => suite.status === 'failing')) return 'failing'
    if (testSuites.value.every(suite => suite.status === 'passing')) return 'passing'
    return 'unknown'
  })

  const recentResults = computed(() => {
    const allResults = testSuites.value.flatMap(suite => suite.results)
    return allResults
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)
  })

  // Actions
  const loadTestSuites = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Mock data - will be replaced with API call
      const mockTestSuites: ITestSuite[] = [
        {
          id: 'elt-pipeline-tests',
          applicationId: 'elt-pipeline',
          name: 'ELT Pipeline Tests',
          testFiles: [],
          coverage: {
            lines: { covered: 85, total: 100, percentage: 85 },
            branches: { covered: 20, total: 25, percentage: 80 },
            functions: { covered: 15, total: 18, percentage: 83.3 },
            statements: { covered: 85, total: 100, percentage: 85 }
          },
          lastRun: new Date(),
          status: 'passing',
          results: [],
          totalTests: 25,
          passedTests: 24,
          failedTests: 1,
          skippedTests: 0
        },
        {
          id: 'api-testing-tests',
          applicationId: 'api-testing',
          name: 'API Testing Tool Tests',
          testFiles: [],
          coverage: {
            lines: { covered: 70, total: 90, percentage: 77.8 },
            branches: { covered: 15, total: 20, percentage: 75 },
            functions: { covered: 12, total: 15, percentage: 80 },
            statements: { covered: 70, total: 90, percentage: 77.8 }
          },
          lastRun: new Date(Date.now() - 3600000), // 1 hour ago
          status: 'passing',
          results: [],
          totalTests: 18,
          passedTests: 18,
          failedTests: 0,
          skippedTests: 0
        }
      ]
      
      testSuites.value = mockTestSuites
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load test suites'
    } finally {
      isLoading.value = false
    }
  }

  const runTests = async (suiteId?: string) => {
    isRunningTests.value = true
    currentTestRun.value = suiteId || 'all'
    
    try {
      // Mock test execution - will be replaced with actual test runner
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update test results
      const now = new Date()
      testSuites.value.forEach(suite => {
        if (!suiteId || suite.id === suiteId) {
          suite.lastRun = now
          suite.status = Math.random() > 0.1 ? 'passing' : 'failing'
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to run tests'
    } finally {
      isRunningTests.value = false
      currentTestRun.value = null
    }
  }

  const getTestSuiteById = (id: string) => {
    return testSuites.value.find(suite => suite.id === id) || null
  }

  const updateTestResult = (suiteId: string, result: ITestResult) => {
    const suite = testSuites.value.find(s => s.id === suiteId)
    if (suite) {
      suite.results.unshift(result)
      // Keep only the last 100 results
      if (suite.results.length > 100) {
        suite.results = suite.results.slice(0, 100)
      }
    }
  }

  return {
    // State
    testSuites,
    isLoading,
    error,
    isRunningTests,
    currentTestRun,
    
    // Getters
    overallCoverage,
    totalTests,
    passedTests,
    failedTests,
    overallStatus,
    recentResults,
    
    // Actions
    loadTestSuites,
    runTests,
    getTestSuiteById,
    updateTestResult
  }
})