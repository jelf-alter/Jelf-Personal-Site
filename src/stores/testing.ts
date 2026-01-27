import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ITestSuite, ITestResult, ICoverageMetrics } from '@/types'
import { testMetricsService, type ITestMetricsSnapshot, type ITestTrend } from '@/services/testMetrics'
import { api } from '@/services/api'

export const useTestingStore = defineStore('testing', () => {
  // State
  const testSuites = ref<ITestSuite[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isRunningTests = ref(false)
  const currentTestRun = ref<string | null>(null)
  const lastUpdated = ref<Date>(new Date())

  // Getters
  const overallCoverage = computed((): ICoverageMetrics => {
    return testMetricsService.calculateOverallCoverage()
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
    return testMetricsService.getRecentResults(10)
  })

  const overallStats = computed(() => {
    return testMetricsService.getOverallStats()
  })

  // Actions
  const loadTestSuites = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Try to load from API first
      const response = await api.getTestSuites()
      
      if (response.success && response.data) {
        // Update local storage with API data
        response.data.forEach((suite: ITestSuite) => {
          testMetricsService.addTestSuite(suite)
        })
        testSuites.value = response.data
      } else {
        // Fall back to local storage
        testSuites.value = testMetricsService.getAllTestSuites()
        
        // If no data exists, create mock data for development
        if (testSuites.value.length === 0) {
          await createMockTestData()
        }
      }
      
      lastUpdated.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load test suites'
      // Fall back to local storage on error
      testSuites.value = testMetricsService.getAllTestSuites()
    } finally {
      isLoading.value = false
    }
  }

  const createMockTestData = async () => {
    const mockTestSuites: ITestSuite[] = [
      {
        id: 'elt-pipeline-tests',
        applicationId: 'elt-pipeline',
        name: 'ELT Pipeline Tests',
        testFiles: [
          {
            id: 'elt-pipeline-unit',
            filePath: 'src/components/demos/__tests__/ELTPipeline.property.test.ts',
            testCount: 15,
            passCount: 14,
            failCount: 1,
            skipCount: 0,
            coverage: {
              lines: { covered: 85, total: 100, percentage: 85 },
              branches: { covered: 20, total: 25, percentage: 80 },
              functions: { covered: 15, total: 18, percentage: 83.3 },
              statements: { covered: 85, total: 100, percentage: 85 }
            },
            lastRun: new Date()
          }
        ],
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
        id: 'landing-page-tests',
        applicationId: 'landing-page',
        name: 'Landing Page Tests',
        testFiles: [
          {
            id: 'landing-page-unit',
            filePath: 'src/components/landing/__tests__/LandingPage.property.test.ts',
            testCount: 12,
            passCount: 12,
            failCount: 0,
            skipCount: 0,
            coverage: {
              lines: { covered: 92, total: 100, percentage: 92 },
              branches: { covered: 18, total: 20, percentage: 90 },
              functions: { covered: 14, total: 15, percentage: 93.3 },
              statements: { covered: 92, total: 100, percentage: 92 }
            },
            lastRun: new Date()
          }
        ],
        coverage: {
          lines: { covered: 92, total: 100, percentage: 92 },
          branches: { covered: 18, total: 20, percentage: 90 },
          functions: { covered: 14, total: 15, percentage: 93.3 },
          statements: { covered: 92, total: 100, percentage: 92 }
        },
        lastRun: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'passing',
        results: [],
        totalTests: 18,
        passedTests: 18,
        failedTests: 0,
        skippedTests: 0
      },
      {
        id: 'api-integration-tests',
        applicationId: 'api-integration',
        name: 'API Integration Tests',
        testFiles: [
          {
            id: 'api-integration-unit',
            filePath: 'server/__tests__/api-integration.test.ts',
            testCount: 20,
            passCount: 19,
            failCount: 1,
            skipCount: 0,
            coverage: {
              lines: { covered: 78, total: 95, percentage: 82.1 },
              branches: { covered: 15, total: 22, percentage: 68.2 },
              functions: { covered: 12, total: 16, percentage: 75 },
              statements: { covered: 78, total: 95, percentage: 82.1 }
            },
            lastRun: new Date()
          }
        ],
        coverage: {
          lines: { covered: 78, total: 95, percentage: 82.1 },
          branches: { covered: 15, total: 22, percentage: 68.2 },
          functions: { covered: 12, total: 16, percentage: 75 },
          statements: { covered: 78, total: 95, percentage: 82.1 }
        },
        lastRun: new Date(Date.now() - 1800000), // 30 minutes ago
        status: 'failing',
        results: [],
        totalTests: 20,
        passedTests: 19,
        failedTests: 1,
        skippedTests: 0
      }
    ]
    
    // Add mock test suites to the metrics service
    mockTestSuites.forEach(suite => {
      testMetricsService.addTestSuite(suite)
    })
    
    testSuites.value = mockTestSuites
  }

  const runTests = async (suiteId?: string) => {
    isRunningTests.value = true
    currentTestRun.value = suiteId || 'all'
    error.value = null
    
    try {
      // Use the new test execution API
      const response = suiteId 
        ? await api.runTestSuite(suiteId)
        : await api.runAllTests()
      
      if (response.success) {
        console.log('Test execution started:', response.data)
        // The WebSocket will handle real-time updates
        // We don't need to refresh immediately as updates will come via WebSocket
      } else {
        throw new Error(response.error || 'Failed to start test execution')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to run tests'
      console.error('Test execution error:', err)
    } finally {
      // Don't set isRunningTests to false immediately
      // Let the WebSocket 'test_completed' event handle this
      setTimeout(() => {
        if (isRunningTests.value) {
          isRunningTests.value = false
          currentTestRun.value = null
        }
      }, 30000) // Timeout after 30 seconds if no completion event
    }
  }

  const mockTestExecution = async (suiteId?: string) => {
    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const now = new Date()
    const suitesToUpdate = suiteId 
      ? testSuites.value.filter(suite => suite.id === suiteId)
      : testSuites.value

    suitesToUpdate.forEach(suite => {
      // Simulate test results
      const mockResult: ITestResult = {
        id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        testName: `Mock Test Run - ${suite.name}`,
        suite: suite.name,
        status: Math.random() > 0.1 ? 'pass' : 'fail',
        duration: Math.floor(Math.random() * 5000) + 1000, // 1-6 seconds
        coverage: {
          lines: { 
            covered: Math.floor(Math.random() * 20) + 80, 
            total: 100, 
            percentage: 0 
          },
          branches: { 
            covered: Math.floor(Math.random() * 10) + 15, 
            total: 25, 
            percentage: 0 
          },
          functions: { 
            covered: Math.floor(Math.random() * 5) + 15, 
            total: 20, 
            percentage: 0 
          },
          statements: { 
            covered: Math.floor(Math.random() * 20) + 80, 
            total: 100, 
            percentage: 0 
          }
        },
        timestamp: now,
        testType: 'unit'
      }

      // Calculate percentages
      mockResult.coverage.lines.percentage = 
        Math.round((mockResult.coverage.lines.covered / mockResult.coverage.lines.total) * 100 * 100) / 100
      mockResult.coverage.branches.percentage = 
        Math.round((mockResult.coverage.branches.covered / mockResult.coverage.branches.total) * 100 * 100) / 100
      mockResult.coverage.functions.percentage = 
        Math.round((mockResult.coverage.functions.covered / mockResult.coverage.functions.total) * 100 * 100) / 100
      mockResult.coverage.statements.percentage = 
        Math.round((mockResult.coverage.statements.covered / mockResult.coverage.statements.total) * 100 * 100) / 100

      // Add result to metrics service
      testMetricsService.addTestResult(suite.id, mockResult)
      
      // Update suite status
      suite.lastRun = now
      suite.status = mockResult.status === 'fail' ? 'failing' : 'passing'
      suite.coverage = { ...mockResult.coverage }
      
      testMetricsService.updateTestSuite(suite.id, suite)
    })

    // Refresh local test suites
    testSuites.value = testMetricsService.getAllTestSuites()
    lastUpdated.value = now
  }

  const getTestSuiteById = (id: string) => {
    return testMetricsService.getTestSuite(id)
  }

  const updateTestResult = (suiteId: string, result: ITestResult) => {
    testMetricsService.addTestResult(suiteId, result)
    
    // Update local state
    const suite = testSuites.value.find(s => s.id === suiteId)
    if (suite) {
      suite.results.unshift(result)
      if (suite.results.length > 100) {
        suite.results = suite.results.slice(0, 100)
      }
    }
  }

  const getTestResults = (suiteId: string, limit?: number) => {
    return testMetricsService.getTestResults(suiteId, limit)
  }

  const getSnapshots = (suiteId: string, limit?: number) => {
    return testMetricsService.getSnapshots(suiteId, limit)
  }

  const getTrend = (suiteId: string) => {
    return testMetricsService.getTrend(suiteId)
  }

  const getAllTrends = () => {
    return testMetricsService.getAllTrends()
  }

  const exportTestData = () => {
    return testMetricsService.exportData()
  }

  const importTestData = (jsonData: string) => {
    const success = testMetricsService.importData(jsonData)
    if (success) {
      testSuites.value = testMetricsService.getAllTestSuites()
      lastUpdated.value = new Date()
    }
    return success
  }

  const clearTestData = () => {
    testMetricsService.clearStorage()
    testSuites.value = []
    lastUpdated.value = new Date()
  }

  // WebSocket event handlers for real-time test updates
  const handleTestStarted = (testSuiteId: string, executionId: string) => {
    isRunningTests.value = true
    currentTestRun.value = testSuiteId === 'all-tests' ? 'all' : testSuiteId
    console.log('Test execution started:', { testSuiteId, executionId })
  }

  const handleTestCompleted = (testSuiteId: string, executionId: string) => {
    isRunningTests.value = false
    currentTestRun.value = null
    console.log('Test execution completed:', { testSuiteId, executionId })
    
    // Refresh test data after completion
    setTimeout(() => {
      loadTestSuites()
    }, 1000)
  }

  const handleTestError = (testSuiteId: string, executionId: string, errorMessage: string) => {
    isRunningTests.value = false
    currentTestRun.value = null
    error.value = errorMessage
    console.error('Test execution error:', { testSuiteId, executionId, errorMessage })
  }

  return {
    // State
    testSuites,
    isLoading,
    error,
    isRunningTests,
    currentTestRun,
    lastUpdated,
    
    // Getters
    overallCoverage,
    totalTests,
    passedTests,
    failedTests,
    overallStatus,
    recentResults,
    overallStats,
    
    // Actions
    loadTestSuites,
    runTests,
    getTestSuiteById,
    updateTestResult,
    getTestResults,
    getSnapshots,
    getTrend,
    getAllTrends,
    exportTestData,
    importTestData,
    clearTestData,
    
    // WebSocket event handlers
    handleTestStarted,
    handleTestCompleted,
    handleTestError
  }
})