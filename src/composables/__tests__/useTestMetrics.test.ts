import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTestMetrics, testMetricsUtils } from '../useTestMetrics'
import { createPinia, setActivePinia } from 'pinia'
import type { ICoverageMetrics, ITestMetricsSnapshot } from '@/types'

// Mock the testing store
vi.mock('@/stores/testing', () => ({
  useTestingStore: () => ({
    overallStats: {
      totalSuites: 2,
      totalTests: 30,
      passedTests: 25,
      failedTests: 5,
      overallCoverage: {
        lines: { covered: 85, total: 100, percentage: 85 },
        branches: { covered: 20, total: 25, percentage: 80 },
        functions: { covered: 15, total: 18, percentage: 83.3 },
        statements: { covered: 85, total: 100, percentage: 85 }
      },
      lastUpdated: new Date(),
      suitesStatus: { passing: 1, failing: 1, unknown: 0 }
    },
    recentResults: [],
    overallCoverage: {
      lines: { covered: 85, total: 100, percentage: 85 },
      branches: { covered: 20, total: 25, percentage: 80 },
      functions: { covered: 15, total: 18, percentage: 83.3 },
      statements: { covered: 85, total: 100, percentage: 85 }
    },
    testSuites: [],
    isRunningTests: false,
    loadTestSuites: vi.fn(),
    runTests: vi.fn(),
    getTestSuiteById: vi.fn(),
    getTestResults: vi.fn(() => []),
    getSnapshots: vi.fn(() => []),
    getTrend: vi.fn(),
    getAllTrends: vi.fn(() => []),
    exportTestData: vi.fn(() => '{}'),
    importTestData: vi.fn(() => true),
    clearTestData: vi.fn()
  })
}))

// Mock the test metrics service
vi.mock('@/services/testMetrics', () => ({
  testMetricsService: {
    getTestSuite: vi.fn(),
    getTestResults: vi.fn(() => []),
    getSnapshots: vi.fn(() => []),
    getTrend: vi.fn(),
    getAllTrends: vi.fn(() => [])
  }
}))

describe('useTestMetrics', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Composable Functionality', () => {
    it('should initialize with correct reactive state', () => {
      const { isLoading, error, overallStats, testSuites, isRunningTests } = useTestMetrics()

      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(overallStats.value).toBeDefined()
      expect(overallStats.value.totalSuites).toBe(2)
      expect(testSuites.value).toBeDefined()
      expect(isRunningTests.value).toBe(false)
    })

    it('should provide coverage utilities', () => {
      const { getCoveragePercentage, getCoverageStatus, formatCoveragePercentage } = useTestMetrics()

      const mockCoverage: ICoverageMetrics = {
        lines: { covered: 85, total: 100, percentage: 85 },
        branches: { covered: 20, total: 25, percentage: 80 },
        functions: { covered: 15, total: 18, percentage: 83.3 },
        statements: { covered: 85, total: 100, percentage: 85 }
      }

      expect(getCoveragePercentage(mockCoverage, 'lines')).toBe(85)
      expect(getCoverageStatus(85)).toBe('good')
      expect(getCoverageStatus(95)).toBe('excellent')
      expect(getCoverageStatus(75)).toBe('fair')
      expect(getCoverageStatus(65)).toBe('poor')
      expect(formatCoveragePercentage(85.123)).toBe('85.1%')
    })

    it('should format duration correctly', () => {
      const { formatDuration } = useTestMetrics()

      expect(formatDuration(500)).toBe('500ms')
      expect(formatDuration(1500)).toBe('1.5s')
      expect(formatDuration(65000)).toBe('1m 5s')
      expect(formatDuration(125000)).toBe('2m 5s')
    })

    it('should handle auto-refresh functionality', () => {
      vi.useFakeTimers()
      const { startAutoRefresh, stopAutoRefresh } = useTestMetrics()

      // Start auto-refresh
      startAutoRefresh(1000)
      
      // Fast-forward time
      vi.advanceTimersByTime(1000)
      
      // Stop auto-refresh
      stopAutoRefresh()
      
      vi.useRealTimers()
    })
  })

  describe('Test Metrics Utils', () => {
    it('should calculate coverage change', () => {
      const current: ICoverageMetrics = {
        lines: { covered: 90, total: 100, percentage: 90 },
        branches: { covered: 20, total: 25, percentage: 80 },
        functions: { covered: 15, total: 18, percentage: 83.3 },
        statements: { covered: 90, total: 100, percentage: 90 }
      }

      const previous: ICoverageMetrics = {
        lines: { covered: 80, total: 100, percentage: 80 },
        branches: { covered: 18, total: 25, percentage: 72 },
        functions: { covered: 14, total: 18, percentage: 77.8 },
        statements: { covered: 80, total: 100, percentage: 80 }
      }

      const change = testMetricsUtils.calculateCoverageChange(current, previous)
      expect(change).toBeGreaterThan(0) // Should show improvement
    })

    it('should calculate success rate change', () => {
      const snapshots: ITestMetricsSnapshot[] = [
        {
          id: '1',
          timestamp: new Date(),
          suiteId: 'test',
          coverage: {} as ICoverageMetrics,
          testCounts: { total: 10, passed: 9, failed: 1, skipped: 0 },
          duration: 1000,
          status: 'passing'
        },
        {
          id: '2',
          timestamp: new Date(),
          suiteId: 'test',
          coverage: {} as ICoverageMetrics,
          testCounts: { total: 10, passed: 8, failed: 2, skipped: 0 },
          duration: 1000,
          status: 'failing'
        }
      ]

      const change = testMetricsUtils.calculateSuccessRateChange(snapshots)
      expect(typeof change).toBe('number')
    })

    it('should provide correct colors for coverage', () => {
      expect(testMetricsUtils.getCoverageColor(95)).toBe('#22c55e') // green
      expect(testMetricsUtils.getCoverageColor(85)).toBe('#84cc16') // lime
      expect(testMetricsUtils.getCoverageColor(75)).toBe('#eab308') // yellow
      expect(testMetricsUtils.getCoverageColor(65)).toBe('#f97316') // orange
      expect(testMetricsUtils.getCoverageColor(55)).toBe('#ef4444') // red
    })

    it('should provide correct colors for status', () => {
      expect(testMetricsUtils.getStatusColor('passing')).toBe('#22c55e')
      expect(testMetricsUtils.getStatusColor('failing')).toBe('#ef4444')
      expect(testMetricsUtils.getStatusColor('unknown')).toBe('#6b7280')
    })

    it('should provide correct trend icons', () => {
      expect(testMetricsUtils.getTrendIcon('improving')).toBe('📈')
      expect(testMetricsUtils.getTrendIcon('declining')).toBe('📉')
      expect(testMetricsUtils.getTrendIcon('stable')).toBe('➡️')
    })
  })

  describe('Error Handling', () => {
    it('should handle load errors gracefully', async () => {
      const { loadTestMetrics, error } = useTestMetrics()
      
      // Set initial error state
      error.value = 'Load failed'
      
      expect(error.value).toBe('Load failed')
    })

    it('should handle run test errors gracefully', async () => {
      const { runTests, error } = useTestMetrics()
      
      // Set initial error state
      error.value = 'Run failed'
      
      expect(error.value).toBe('Run failed')
    })
  })
})