import { describe, it, expect, beforeEach, vi } from 'vitest'
import { testMetricsService } from '../testMetrics'
import type { ITestSuite, ITestResult, ICoverageMetrics } from '@/types'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

describe('TestMetricsService', () => {
  beforeEach(() => {
    // Clear all mocks and reset service state
    vi.clearAllMocks()
    testMetricsService.clearStorage()
  })

  const createMockTestSuite = (): ITestSuite => ({
    id: 'test-suite-1',
    applicationId: 'test-app',
    name: 'Test Suite 1',
    testFiles: [],
    coverage: {
      lines: { covered: 80, total: 100, percentage: 80 },
      branches: { covered: 15, total: 20, percentage: 75 },
      functions: { covered: 10, total: 12, percentage: 83.3 },
      statements: { covered: 80, total: 100, percentage: 80 }
    },
    lastRun: new Date(),
    status: 'passing',
    results: [],
    totalTests: 10,
    passedTests: 9,
    failedTests: 1,
    skippedTests: 0
  })

  const createMockTestResult = (): ITestResult => ({
    id: 'test-result-1',
    testName: 'Mock Test',
    suite: 'Test Suite 1',
    status: 'pass',
    duration: 1500,
    coverage: {
      lines: { covered: 85, total: 100, percentage: 85 },
      branches: { covered: 18, total: 20, percentage: 90 },
      functions: { covered: 11, total: 12, percentage: 91.7 },
      statements: { covered: 85, total: 100, percentage: 85 }
    },
    timestamp: new Date(),
    testType: 'unit'
  })

  describe('Test Suite Management', () => {
    it('should add a test suite', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      const retrieved = testMetricsService.getTestSuite(suite.id)
      expect(retrieved).toEqual(suite)
    })

    it('should update a test suite', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      const updates = { status: 'failing' as const, totalTests: 15 }
      testMetricsService.updateTestSuite(suite.id, updates)

      const updated = testMetricsService.getTestSuite(suite.id)
      expect(updated?.status).toBe('failing')
      expect(updated?.totalTests).toBe(15)
    })

    it('should get all test suites', () => {
      const suite1 = createMockTestSuite()
      const suite2 = { ...createMockTestSuite(), id: 'test-suite-2', name: 'Test Suite 2' }

      testMetricsService.addTestSuite(suite1)
      testMetricsService.addTestSuite(suite2)

      const allSuites = testMetricsService.getAllTestSuites()
      expect(allSuites).toHaveLength(2)
      expect(allSuites.map(s => s.id)).toContain(suite1.id)
      expect(allSuites.map(s => s.id)).toContain(suite2.id)
    })

    it('should return null for non-existent test suite', () => {
      const result = testMetricsService.getTestSuite('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('Test Result Management', () => {
    it('should add test results', () => {
      const suite = createMockTestSuite()
      const result = createMockTestResult()

      testMetricsService.addTestSuite(suite)
      testMetricsService.addTestResult(suite.id, result)

      const results = testMetricsService.getTestResults(suite.id)
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual(result)
    })

    it('should limit test results per suite', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      // Add more results than the limit (1000)
      for (let i = 0; i < 1005; i++) {
        const result = { ...createMockTestResult(), id: `test-result-${i}` }
        testMetricsService.addTestResult(suite.id, result)
      }

      const results = testMetricsService.getTestResults(suite.id)
      expect(results.length).toBeLessThanOrEqual(1000)
    })

    it('should get recent results across all suites', () => {
      const suite1 = createMockTestSuite()
      const suite2 = { ...createMockTestSuite(), id: 'test-suite-2' }

      testMetricsService.addTestSuite(suite1)
      testMetricsService.addTestSuite(suite2)

      const result1 = createMockTestResult()
      const result2 = { ...createMockTestResult(), id: 'test-result-2', suite: 'Test Suite 2' }

      testMetricsService.addTestResult(suite1.id, result1)
      testMetricsService.addTestResult(suite2.id, result2)

      const recentResults = testMetricsService.getRecentResults(10)
      expect(recentResults).toHaveLength(2)
    })

    it('should limit recent results', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      // Add multiple results
      for (let i = 0; i < 10; i++) {
        const result = { ...createMockTestResult(), id: `test-result-${i}` }
        testMetricsService.addTestResult(suite.id, result)
      }

      const recentResults = testMetricsService.getRecentResults(5)
      expect(recentResults).toHaveLength(5)
    })
  })

  describe('Coverage Calculation', () => {
    it('should calculate overall coverage for single suite', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      const coverage = testMetricsService.calculateOverallCoverage()
      expect(coverage.lines.percentage).toBe(80)
      expect(coverage.branches.percentage).toBe(75)
      expect(coverage.functions.percentage).toBe(83.33)
      expect(coverage.statements.percentage).toBe(80)
    })

    it('should calculate overall coverage for multiple suites', () => {
      const suite1 = createMockTestSuite()
      const suite2 = {
        ...createMockTestSuite(),
        id: 'test-suite-2',
        coverage: {
          lines: { covered: 90, total: 100, percentage: 90 },
          branches: { covered: 20, total: 25, percentage: 80 },
          functions: { covered: 12, total: 15, percentage: 80 },
          statements: { covered: 90, total: 100, percentage: 90 }
        }
      }

      testMetricsService.addTestSuite(suite1)
      testMetricsService.addTestSuite(suite2)

      const coverage = testMetricsService.calculateOverallCoverage()
      expect(coverage.lines.covered).toBe(170) // 80 + 90
      expect(coverage.lines.total).toBe(200) // 100 + 100
      expect(coverage.lines.percentage).toBe(85) // 170/200 * 100
    })

    it('should return empty coverage when no suites exist', () => {
      const coverage = testMetricsService.calculateOverallCoverage()
      expect(coverage.lines.percentage).toBe(0)
      expect(coverage.branches.percentage).toBe(0)
      expect(coverage.functions.percentage).toBe(0)
      expect(coverage.statements.percentage).toBe(0)
    })
  })

  describe('Snapshots and Historical Tracking', () => {
    it('should create snapshots when adding test suites', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      const snapshots = testMetricsService.getSnapshots(suite.id)
      expect(snapshots).toHaveLength(1)
      expect(snapshots[0].suiteId).toBe(suite.id)
      expect(snapshots[0].coverage).toEqual(suite.coverage)
    })

    it('should create snapshots when updating test suites', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      // Update the suite
      testMetricsService.updateTestSuite(suite.id, { status: 'failing' })

      const snapshots = testMetricsService.getSnapshots(suite.id)
      expect(snapshots).toHaveLength(2) // Initial + update
    })

    it('should limit snapshots per suite', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      // Create many updates to generate snapshots
      for (let i = 0; i < 105; i++) {
        testMetricsService.updateTestSuite(suite.id, { totalTests: i + 10 })
      }

      const snapshots = testMetricsService.getSnapshots(suite.id)
      expect(snapshots.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Trend Analysis', () => {
    it('should calculate trends after multiple snapshots', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      // Create multiple updates to generate trend data
      for (let i = 0; i < 5; i++) {
        testMetricsService.updateTestSuite(suite.id, { 
          totalTests: i + 10,
          status: i % 2 === 0 ? 'passing' : 'failing'
        })
      }

      const trend = testMetricsService.getTrend(suite.id)
      expect(trend).toBeDefined()
      expect(trend?.suiteId).toBe(suite.id)
      expect(trend?.period).toBe('day')
      expect(typeof trend?.successRate).toBe('number')
      expect(['improving', 'declining', 'stable']).toContain(trend?.trendDirection)
    })

    it('should get all trends', () => {
      const suite1 = createMockTestSuite()
      const suite2 = { ...createMockTestSuite(), id: 'test-suite-2' }

      testMetricsService.addTestSuite(suite1)
      testMetricsService.addTestSuite(suite2)

      // Generate some trend data
      testMetricsService.updateTestSuite(suite1.id, { status: 'passing' })
      testMetricsService.updateTestSuite(suite2.id, { status: 'failing' })

      const trends = testMetricsService.getAllTrends()
      expect(trends).toHaveLength(2)
    })
  })

  describe('Overall Statistics', () => {
    it('should calculate overall stats', () => {
      const suite1 = createMockTestSuite()
      const suite2 = {
        ...createMockTestSuite(),
        id: 'test-suite-2',
        status: 'failing' as const,
        totalTests: 20,
        passedTests: 15,
        failedTests: 5
      }

      testMetricsService.addTestSuite(suite1)
      testMetricsService.addTestSuite(suite2)

      const stats = testMetricsService.getOverallStats()
      expect(stats.totalSuites).toBe(2)
      expect(stats.totalTests).toBe(30) // 10 + 20
      expect(stats.passedTests).toBe(24) // 9 + 15
      expect(stats.failedTests).toBe(6) // 1 + 5
      expect(stats.suitesStatus.passing).toBe(1)
      expect(stats.suitesStatus.failing).toBe(1)
      expect(stats.suitesStatus.unknown).toBe(0)
    })
  })

  describe('Data Persistence', () => {
    it('should export data as JSON', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      const exported = testMetricsService.exportData()
      expect(typeof exported).toBe('string')
      
      const parsed = JSON.parse(exported)
      expect(parsed.suites).toBeDefined()
      expect(parsed.results).toBeDefined()
      expect(parsed.snapshots).toBeDefined()
      expect(parsed.trends).toBeDefined()
    })

    it('should import data from JSON', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)
      
      const exported = testMetricsService.exportData()
      testMetricsService.clearStorage()
      
      const success = testMetricsService.importData(exported)
      expect(success).toBe(true)
      
      const imported = testMetricsService.getTestSuite(suite.id)
      expect(imported).toBeDefined()
      expect(imported?.name).toBe(suite.name)
    })

    it('should handle invalid JSON during import', () => {
      const success = testMetricsService.importData('invalid json')
      expect(success).toBe(false)
    })
  })

  describe('Storage Management', () => {
    it('should clear all storage', () => {
      const suite = createMockTestSuite()
      testMetricsService.addTestSuite(suite)

      expect(testMetricsService.getAllTestSuites()).toHaveLength(1)

      testMetricsService.clearStorage()

      expect(testMetricsService.getAllTestSuites()).toHaveLength(0)
      expect(localStorageMock.removeItem).toHaveBeenCalled()
    })
  })
})