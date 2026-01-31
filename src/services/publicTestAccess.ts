import type { 
  ITestSuite, 
  ITestResult, 
  ICoverageMetrics,
  IPublicTestAccess 
} from '@/types'

/**
 * Service for managing public access to test results and coverage data
 * Ensures all test information is publicly accessible without authentication
 * while providing appropriate categorization and organization
 */
class PublicTestAccessService {
  private config: IPublicTestAccess = {
    enabled: true,
    accessLevel: 'full',
    allowedCategories: [
      'demo-application',
      'core-feature', 
      'backend',
      'quality-assurance',
      'utilities',
      'end-to-end'
    ],
    allowedTypes: ['unit', 'integration', 'e2e', 'property'],
    hideFailureDetails: false,
    anonymizeData: false,
    rateLimiting: {
      enabled: false,
      requestsPerMinute: 100
    }
  }

  /**
   * Get public access configuration
   */
  getPublicAccessConfig(): IPublicTestAccess {
    return { ...this.config }
  }

  /**
   * Update public access configuration
   */
  updatePublicAccessConfig(updates: Partial<IPublicTestAccess>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Check if a test suite should be publicly accessible
   */
  isTestSuitePublic(suite: ITestSuite): boolean {
    if (!this.config.enabled) return false
    if (!suite.isPublic) return false
    
    return this.config.allowedCategories.includes(suite.category) &&
           this.config.allowedTypes.includes(suite.testType)
  }

  /**
   * Check if a test result should be publicly accessible
   */
  isTestResultPublic(result: ITestResult): boolean {
    if (!this.config.enabled) return false
    if (!result.isPublic) return false
    
    return this.config.allowedCategories.includes(result.category) &&
           this.config.allowedTypes.includes(result.testType)
  }

  /**
   * Filter test suites for public access
   */
  filterPublicTestSuites(suites: ITestSuite[]): ITestSuite[] {
    return suites
      .filter(suite => this.isTestSuitePublic(suite))
      .map(suite => this.sanitizeTestSuiteForPublic(suite))
  }

  /**
   * Filter test results for public access
   */
  filterPublicTestResults(results: ITestResult[]): ITestResult[] {
    return results
      .filter(result => this.isTestResultPublic(result))
      .map(result => this.sanitizeTestResultForPublic(result))
  }

  /**
   * Sanitize test suite data for public consumption
   */
  private sanitizeTestSuiteForPublic(suite: ITestSuite): ITestSuite {
    const sanitized = { ...suite }
    
    // Apply access level restrictions
    if (this.config.accessLevel === 'summary') {
      // Remove detailed test files and results for summary access
      sanitized.testFiles = []
      sanitized.results = []
    } else if (this.config.accessLevel === 'restricted') {
      // Remove sensitive information for restricted access
      sanitized.testFiles = sanitized.testFiles.map(file => ({
        ...file,
        filePath: this.anonymizePath(file.filePath)
      }))
    }

    // Anonymize data if configured
    if (this.config.anonymizeData) {
      sanitized.name = this.anonymizeName(sanitized.name)
      sanitized.description = this.anonymizeDescription(sanitized.description)
    }

    return sanitized
  }

  /**
   * Sanitize test result data for public consumption
   */
  private sanitizeTestResultForPublic(result: ITestResult): ITestResult {
    const sanitized = { ...result }
    
    // Hide failure details if configured
    if (this.config.hideFailureDetails && result.status === 'fail') {
      sanitized.errorDetails = 'Error details hidden for public access'
      sanitized.stackTrace = undefined
      sanitized.errorContext = undefined
    }

    // Apply access level restrictions
    if (this.config.accessLevel === 'summary') {
      // Remove detailed error information for summary access
      sanitized.errorDetails = undefined
      sanitized.stackTrace = undefined
      sanitized.errorContext = undefined
    }

    // Anonymize data if configured
    if (this.config.anonymizeData) {
      sanitized.testName = this.anonymizeName(sanitized.testName)
      sanitized.suite = this.anonymizeName(sanitized.suite)
    }

    return sanitized
  }

  /**
   * Get comprehensive test categorization summary for public access
   */
  getPublicTestCategorization(suites: ITestSuite[]): {
    byType: Record<string, { suites: number; tests: number; coverage: number }>
    byCategory: Record<string, { suites: number; tests: number; coverage: number }>
    byApplication: Record<string, { suites: number; tests: number; coverage: number }>
    totalPublicSuites: number
    totalPublicTests: number
    publicAccessLevel: string
  } {
    const publicSuites = this.filterPublicTestSuites(suites)
    
    const byType: Record<string, { suites: number; tests: number; coverage: number }> = {}
    const byCategory: Record<string, { suites: number; tests: number; coverage: number }> = {}
    const byApplication: Record<string, { suites: number; tests: number; coverage: number }> = {}

    publicSuites.forEach(suite => {
      // Group by test type
      if (!byType[suite.testType]) {
        byType[suite.testType] = { suites: 0, tests: 0, coverage: 0 }
      }
      byType[suite.testType].suites++
      byType[suite.testType].tests += suite.totalTests
      byType[suite.testType].coverage += suite.coverage.lines.percentage

      // Group by category
      if (!byCategory[suite.category]) {
        byCategory[suite.category] = { suites: 0, tests: 0, coverage: 0 }
      }
      byCategory[suite.category].suites++
      byCategory[suite.category].tests += suite.totalTests
      byCategory[suite.category].coverage += suite.coverage.lines.percentage

      // Group by application
      if (!byApplication[suite.applicationId]) {
        byApplication[suite.applicationId] = { suites: 0, tests: 0, coverage: 0 }
      }
      byApplication[suite.applicationId].suites++
      byApplication[suite.applicationId].tests += suite.totalTests
      byApplication[suite.applicationId].coverage += suite.coverage.lines.percentage
    })

    // Calculate average coverage for each group
    Object.keys(byType).forEach(type => {
      const data = byType[type]
      data.coverage = data.suites > 0 ? data.coverage / data.suites : 0
    })

    Object.keys(byCategory).forEach(category => {
      const data = byCategory[category]
      data.coverage = data.suites > 0 ? data.coverage / data.suites : 0
    })

    Object.keys(byApplication).forEach(app => {
      const data = byApplication[app]
      data.coverage = data.suites > 0 ? data.coverage / data.suites : 0
    })

    return {
      byType,
      byCategory,
      byApplication,
      totalPublicSuites: publicSuites.length,
      totalPublicTests: publicSuites.reduce((sum, suite) => sum + suite.totalTests, 0),
      publicAccessLevel: this.config.accessLevel
    }
  }

  /**
   * Get public access metadata for transparency
   */
  getPublicAccessMetadata(): {
    accessEnabled: boolean
    accessLevel: string
    allowedCategories: string[]
    allowedTypes: string[]
    dataAnonymized: boolean
    failureDetailsHidden: boolean
    lastUpdated: string
    disclaimer: string
  } {
    return {
      accessEnabled: this.config.enabled,
      accessLevel: this.config.accessLevel,
      allowedCategories: [...this.config.allowedCategories],
      allowedTypes: [...this.config.allowedTypes],
      dataAnonymized: this.config.anonymizeData,
      failureDetailsHidden: this.config.hideFailureDetails,
      lastUpdated: new Date().toISOString(),
      disclaimer: 'All test results and coverage metrics are publicly accessible to demonstrate code quality and testing practices. This data is provided for transparency and educational purposes.'
    }
  }

  /**
   * Generate public test report
   */
  generatePublicTestReport(suites: ITestSuite[], results: ITestResult[]): {
    summary: {
      totalSuites: number
      totalTests: number
      passedTests: number
      failedTests: number
      skippedTests: number
      overallSuccessRate: number
      averageCoverage: ICoverageMetrics
    }
    categorization: ReturnType<typeof this.getPublicTestCategorization>
    recentResults: ITestResult[]
    metadata: ReturnType<typeof this.getPublicAccessMetadata>
  } {
    const publicSuites = this.filterPublicTestSuites(suites)
    const publicResults = this.filterPublicTestResults(results)

    const totalTests = publicSuites.reduce((sum, suite) => sum + suite.totalTests, 0)
    const passedTests = publicSuites.reduce((sum, suite) => sum + suite.passedTests, 0)
    const failedTests = publicSuites.reduce((sum, suite) => sum + suite.failedTests, 0)
    const skippedTests = publicSuites.reduce((sum, suite) => sum + suite.skippedTests, 0)

    // Calculate average coverage across all public suites
    const averageCoverage = this.calculateAverageCoverage(publicSuites)

    return {
      summary: {
        totalSuites: publicSuites.length,
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        overallSuccessRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
        averageCoverage
      },
      categorization: this.getPublicTestCategorization(suites),
      recentResults: publicResults.slice(0, 50), // Last 50 public results
      metadata: this.getPublicAccessMetadata()
    }
  }

  /**
   * Calculate average coverage across multiple test suites
   */
  private calculateAverageCoverage(suites: ITestSuite[]): ICoverageMetrics {
    if (suites.length === 0) {
      return {
        lines: { covered: 0, total: 0, percentage: 0 },
        branches: { covered: 0, total: 0, percentage: 0 },
        functions: { covered: 0, total: 0, percentage: 0 },
        statements: { covered: 0, total: 0, percentage: 0 }
      }
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
  }

  /**
   * Anonymize sensitive names for public access
   */
  private anonymizeName(name: string): string {
    if (!this.config.anonymizeData) return name
    
    // Simple anonymization - replace with generic names
    return name.replace(/\b[A-Z][a-z]+\b/g, 'Component')
               .replace(/\b[a-z]+[A-Z][a-z]*\b/g, 'module')
  }

  /**
   * Anonymize file paths for public access
   */
  private anonymizePath(path: string): string {
    if (!this.config.anonymizeData) return path
    
    // Replace specific file names with generic ones
    return path.replace(/\/[^\/]+\.test\.(ts|js)$/, '/test-file.test.ts')
               .replace(/\/[^\/]+\.(ts|js|vue)$/, '/source-file.ts')
  }

  /**
   * Anonymize descriptions for public access
   */
  private anonymizeDescription(description: string): string {
    if (!this.config.anonymizeData) return description
    
    // Replace specific terms with generic ones
    return description.replace(/\b[A-Z][a-z]+\b/g, 'Component')
                     .replace(/specific/gi, 'general')
  }

  /**
   * Validate public access request (for rate limiting)
   */
  validatePublicAccess(clientId?: string): { allowed: boolean; reason?: string } {
    if (!this.config.enabled) {
      return { allowed: false, reason: 'Public access is disabled' }
    }

    if (this.config.rateLimiting.enabled) {
      // In a real implementation, you would check rate limits here
      // For now, we'll always allow access
      return { allowed: true }
    }

    return { allowed: true }
  }
}

export const publicTestAccessService = new PublicTestAccessService()