import type { 
  ITestResult, 
  ITestSuite, 
  ICoverageMetrics, 
  ITestFile,
  IApiResponse 
} from '@/types'

// Extended interfaces for test metrics collection
export interface ITestMetricsSnapshot {
  id: string
  timestamp: Date
  suiteId: string
  coverage: ICoverageMetrics
  testCounts: {
    total: number
    passed: number
    failed: number
    skipped: number
  }
  duration: number
  status: 'passing' | 'failing' | 'unknown'
}

export interface ITestTrend {
  suiteId: string
  period: 'hour' | 'day' | 'week' | 'month'
  snapshots: ITestMetricsSnapshot[]
  averageCoverage: ICoverageMetrics
  averageDuration: number
  successRate: number
  trendDirection: 'improving' | 'declining' | 'stable'
}

export interface ITestMetricsStorage {
  suites: Map<string, ITestSuite>
  results: Map<string, ITestResult[]>
  snapshots: Map<string, ITestMetricsSnapshot[]>
  trends: Map<string, ITestTrend>
  lastUpdated: Date
}

class TestMetricsService {
  private storage: ITestMetricsStorage = {
    suites: new Map(),
    results: new Map(),
    snapshots: new Map(),
    trends: new Map(),
    lastUpdated: new Date()
  }

  private readonly STORAGE_KEY = 'test-metrics-storage'
  private readonly MAX_RESULTS_PER_SUITE = 1000
  private readonly MAX_SNAPSHOTS_PER_SUITE = 100

  constructor() {
    this.loadFromStorage()
  }

  // Storage persistence
  private saveToStorage(): void {
    try {
      const serializedData = {
        suites: Array.from(this.storage.suites.entries()),
        results: Array.from(this.storage.results.entries()),
        snapshots: Array.from(this.storage.snapshots.entries()),
        trends: Array.from(this.storage.trends.entries()),
        lastUpdated: this.storage.lastUpdated.toISOString()
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializedData))
    } catch (error) {
      console.warn('Failed to save test metrics to storage:', error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return

      const data = JSON.parse(stored)
      this.storage = {
        suites: new Map(data.suites || []),
        results: new Map(data.results || []),
        snapshots: new Map(data.snapshots || []),
        trends: new Map(data.trends || []),
        lastUpdated: new Date(data.lastUpdated || Date.now())
      }

      // Convert date strings back to Date objects
      this.storage.suites.forEach(suite => {
        suite.lastRun = new Date(suite.lastRun)
        suite.results.forEach(result => {
          result.timestamp = new Date(result.timestamp)
        })
      })

      this.storage.results.forEach(results => {
        results.forEach(result => {
          result.timestamp = new Date(result.timestamp)
        })
      })

      this.storage.snapshots.forEach(snapshots => {
        snapshots.forEach(snapshot => {
          snapshot.timestamp = new Date(snapshot.timestamp)
        })
      })
    } catch (error) {
      console.warn('Failed to load test metrics from storage:', error)
      this.storage = {
        suites: new Map(),
        results: new Map(),
        snapshots: new Map(),
        trends: new Map(),
        lastUpdated: new Date()
      }
    }
  }

  // Test suite management
  addTestSuite(suite: ITestSuite): void {
    this.storage.suites.set(suite.id, { ...suite })
    this.storage.results.set(suite.id, [...suite.results])
    this.createSnapshot(suite.id)
    this.updateTrends(suite.id)
    this.storage.lastUpdated = new Date()
    this.saveToStorage()
  }

  updateTestSuite(suiteId: string, updates: Partial<ITestSuite>): void {
    const existing = this.storage.suites.get(suiteId)
    if (!existing) return

    const updated = { ...existing, ...updates, lastRun: new Date() }
    this.storage.suites.set(suiteId, updated)
    
    if (updates.results) {
      this.storage.results.set(suiteId, [...updates.results])
    }

    this.createSnapshot(suiteId)
    this.updateTrends(suiteId)
    this.storage.lastUpdated = new Date()
    this.saveToStorage()
  }

  getTestSuite(suiteId: string): ITestSuite | null {
    return this.storage.suites.get(suiteId) || null
  }

  getAllTestSuites(): ITestSuite[] {
    return Array.from(this.storage.suites.values())
  }

  // Test result management
  addTestResult(suiteId: string, result: ITestResult): void {
    const results = this.storage.results.get(suiteId) || []
    results.unshift(result)

    // Keep only the most recent results
    if (results.length > this.MAX_RESULTS_PER_SUITE) {
      results.splice(this.MAX_RESULTS_PER_SUITE)
    }

    this.storage.results.set(suiteId, results)

    // Update the suite's results array
    const suite = this.storage.suites.get(suiteId)
    if (suite) {
      suite.results = results.slice(0, 100) // Keep last 100 in suite object
      this.updateSuiteMetrics(suiteId)
    }

    this.storage.lastUpdated = new Date()
    this.saveToStorage()
  }

  getTestResults(suiteId: string, limit?: number): ITestResult[] {
    const results = this.storage.results.get(suiteId) || []
    return limit ? results.slice(0, limit) : results
  }

  getRecentResults(limit: number = 50): ITestResult[] {
    const allResults: ITestResult[] = []
    
    this.storage.results.forEach(results => {
      allResults.push(...results)
    })

    return allResults
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Coverage calculation and aggregation
  calculateOverallCoverage(): ICoverageMetrics {
    const suites = Array.from(this.storage.suites.values())
    
    if (suites.length === 0) {
      return this.createEmptyCoverage()
    }

    const totals = suites.reduce((acc, suite) => {
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
        percentage: this.calculatePercentage(totals.lines.covered, totals.lines.total)
      },
      branches: {
        ...totals.branches,
        percentage: this.calculatePercentage(totals.branches.covered, totals.branches.total)
      },
      functions: {
        ...totals.functions,
        percentage: this.calculatePercentage(totals.functions.covered, totals.functions.total)
      },
      statements: {
        ...totals.statements,
        percentage: this.calculatePercentage(totals.statements.covered, totals.statements.total)
      }
    }
  }

  private calculatePercentage(covered: number, total: number): number {
    return total > 0 ? Math.round((covered / total) * 100 * 100) / 100 : 0
  }

  private createEmptyCoverage(): ICoverageMetrics {
    return {
      lines: { covered: 0, total: 0, percentage: 0 },
      branches: { covered: 0, total: 0, percentage: 0 },
      functions: { covered: 0, total: 0, percentage: 0 },
      statements: { covered: 0, total: 0, percentage: 0 }
    }
  }

  // Historical tracking and snapshots
  private createSnapshot(suiteId: string): void {
    const suite = this.storage.suites.get(suiteId)
    if (!suite) return

    const snapshot: ITestMetricsSnapshot = {
      id: `${suiteId}-${Date.now()}`,
      timestamp: new Date(),
      suiteId,
      coverage: { ...suite.coverage },
      testCounts: {
        total: suite.totalTests,
        passed: suite.passedTests,
        failed: suite.failedTests,
        skipped: suite.skippedTests
      },
      duration: this.calculateSuiteDuration(suiteId),
      status: suite.status
    }

    const snapshots = this.storage.snapshots.get(suiteId) || []
    snapshots.unshift(snapshot)

    // Keep only recent snapshots
    if (snapshots.length > this.MAX_SNAPSHOTS_PER_SUITE) {
      snapshots.splice(this.MAX_SNAPSHOTS_PER_SUITE)
    }

    this.storage.snapshots.set(suiteId, snapshots)
  }

  private calculateSuiteDuration(suiteId: string): number {
    const results = this.storage.results.get(suiteId) || []
    if (results.length === 0) return 0

    const recentResults = results.slice(0, 10) // Last 10 test runs
    const totalDuration = recentResults.reduce((sum, result) => sum + result.duration, 0)
    return Math.round(totalDuration / recentResults.length)
  }

  getSnapshots(suiteId: string, limit?: number): ITestMetricsSnapshot[] {
    const snapshots = this.storage.snapshots.get(suiteId) || []
    return limit ? snapshots.slice(0, limit) : snapshots
  }

  // Trend analysis
  private updateTrends(suiteId: string): void {
    const snapshots = this.storage.snapshots.get(suiteId) || []
    if (snapshots.length < 2) return

    const trend: ITestTrend = {
      suiteId,
      period: 'day',
      snapshots: snapshots.slice(0, 24), // Last 24 snapshots
      averageCoverage: this.calculateAverageCoverage(snapshots.slice(0, 10)),
      averageDuration: this.calculateAverageDuration(snapshots.slice(0, 10)),
      successRate: this.calculateSuccessRate(snapshots.slice(0, 10)),
      trendDirection: this.calculateTrendDirection(snapshots.slice(0, 10))
    }

    this.storage.trends.set(suiteId, trend)
  }

  private calculateAverageCoverage(snapshots: ITestMetricsSnapshot[]): ICoverageMetrics {
    if (snapshots.length === 0) return this.createEmptyCoverage()

    const totals = snapshots.reduce((acc, snapshot) => {
      acc.lines += snapshot.coverage.lines.percentage
      acc.branches += snapshot.coverage.branches.percentage
      acc.functions += snapshot.coverage.functions.percentage
      acc.statements += snapshot.coverage.statements.percentage
      return acc
    }, { lines: 0, branches: 0, functions: 0, statements: 0 })

    const count = snapshots.length
    return {
      lines: { covered: 0, total: 0, percentage: Math.round(totals.lines / count * 100) / 100 },
      branches: { covered: 0, total: 0, percentage: Math.round(totals.branches / count * 100) / 100 },
      functions: { covered: 0, total: 0, percentage: Math.round(totals.functions / count * 100) / 100 },
      statements: { covered: 0, total: 0, percentage: Math.round(totals.statements / count * 100) / 100 }
    }
  }

  private calculateAverageDuration(snapshots: ITestMetricsSnapshot[]): number {
    if (snapshots.length === 0) return 0
    const totalDuration = snapshots.reduce((sum, snapshot) => sum + snapshot.duration, 0)
    return Math.round(totalDuration / snapshots.length)
  }

  private calculateSuccessRate(snapshots: ITestMetricsSnapshot[]): number {
    if (snapshots.length === 0) return 0
    const passingCount = snapshots.filter(s => s.status === 'passing').length
    return Math.round((passingCount / snapshots.length) * 100 * 100) / 100
  }

  private calculateTrendDirection(snapshots: ITestMetricsSnapshot[]): 'improving' | 'declining' | 'stable' {
    if (snapshots.length < 3) return 'stable'

    const recent = snapshots.slice(0, 3)
    const older = snapshots.slice(-3)

    const recentAvg = recent.reduce((sum, s) => sum + s.coverage.lines.percentage, 0) / recent.length
    const olderAvg = older.reduce((sum, s) => sum + s.coverage.lines.percentage, 0) / older.length

    const difference = recentAvg - olderAvg
    
    if (difference > 2) return 'improving'
    if (difference < -2) return 'declining'
    return 'stable'
  }

  getTrend(suiteId: string): ITestTrend | null {
    return this.storage.trends.get(suiteId) || null
  }

  getAllTrends(): ITestTrend[] {
    return Array.from(this.storage.trends.values())
  }

  // Suite metrics update
  private updateSuiteMetrics(suiteId: string): void {
    const suite = this.storage.suites.get(suiteId)
    const results = this.storage.results.get(suiteId)
    
    if (!suite || !results) return

    // Update test counts based on recent results
    const recentResults = results.slice(0, 50) // Last 50 results
    const testCounts = recentResults.reduce((acc, result) => {
      acc.total++
      switch (result.status) {
        case 'pass': acc.passed++; break
        case 'fail': acc.failed++; break
        case 'skip': acc.skipped++; break
      }
      return acc
    }, { total: 0, passed: 0, failed: 0, skipped: 0 })

    suite.totalTests = testCounts.total
    suite.passedTests = testCounts.passed
    suite.failedTests = testCounts.failed
    suite.skippedTests = testCounts.skipped
    suite.status = testCounts.failed > 0 ? 'failing' : 'passing'

    // Update coverage based on most recent result
    if (recentResults.length > 0) {
      suite.coverage = { ...recentResults[0].coverage }
    }

    this.storage.suites.set(suiteId, suite)
  }

  // Utility methods
  getOverallStats() {
    const suites = Array.from(this.storage.suites.values())
    
    return {
      totalSuites: suites.length,
      totalTests: suites.reduce((sum, suite) => sum + suite.totalTests, 0),
      passedTests: suites.reduce((sum, suite) => sum + suite.passedTests, 0),
      failedTests: suites.reduce((sum, suite) => sum + suite.failedTests, 0),
      overallCoverage: this.calculateOverallCoverage(),
      lastUpdated: this.storage.lastUpdated,
      suitesStatus: {
        passing: suites.filter(s => s.status === 'passing').length,
        failing: suites.filter(s => s.status === 'failing').length,
        unknown: suites.filter(s => s.status === 'unknown').length
      }
    }
  }

  clearStorage(): void {
    this.storage = {
      suites: new Map(),
      results: new Map(),
      snapshots: new Map(),
      trends: new Map(),
      lastUpdated: new Date()
    }
    localStorage.removeItem(this.STORAGE_KEY)
  }

  exportData(): string {
    return JSON.stringify({
      suites: Array.from(this.storage.suites.entries()),
      results: Array.from(this.storage.results.entries()),
      snapshots: Array.from(this.storage.snapshots.entries()),
      trends: Array.from(this.storage.trends.entries()),
      lastUpdated: this.storage.lastUpdated.toISOString()
    }, null, 2)
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      this.storage = {
        suites: new Map(data.suites || []),
        results: new Map(data.results || []),
        snapshots: new Map(data.snapshots || []),
        trends: new Map(data.trends || []),
        lastUpdated: new Date(data.lastUpdated || Date.now())
      }
      this.saveToStorage()
      return true
    } catch (error) {
      console.error('Failed to import test metrics data:', error)
      return false
    }
  }
}

export const testMetricsService = new TestMetricsService()