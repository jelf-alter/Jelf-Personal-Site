// Core TypeScript interfaces for the Personal Website application
// Based on the design document data models

// =============================================================================
// User Profile and Personal Information
// =============================================================================

export interface ISkill {
  id: string
  name: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
  description?: string
}

export interface IAchievement {
  id: string
  title: string
  description: string
  date: Date
  category: 'project' | 'certification' | 'award' | 'milestone'
  url?: string
}

export interface ISocialLink {
  id: string
  platform: 'github' | 'linkedin' | 'twitter' | 'email' | 'website' | 'other'
  url: string
  displayName: string
  icon?: string
}

export interface IUserProfile {
  name: string
  title: string
  email: string
  location: string
  summary: string
  skills: ISkill[]
  achievements: IAchievement[]
  socialLinks: ISocialLink[]
}

// =============================================================================
// Demo Applications
// =============================================================================

export interface IDemoApplication {
  id: string
  name: string
  description: string
  category: string
  technologies: string[]
  status: 'active' | 'maintenance' | 'archived'
  launchUrl: string
  sourceUrl?: string
  testSuiteId: string
  featured?: boolean
  screenshots?: string[]
  createdDate: Date
  lastUpdated: Date
}

// =============================================================================
// ELT Pipeline Models
// =============================================================================

export interface IPipelineStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startTime?: Date
  endTime?: Date
  inputData?: any
  outputData?: any
  errorMessage?: string
  stepType: 'extract' | 'load' | 'transform'
  metadata?: Record<string, any>
}

export interface IDataset {
  id: string
  name: string
  description: string
  format: 'json' | 'csv' | 'xml' | 'text'
  size: number
  sampleData: any
  schema?: Record<string, any>
}

export interface IPipelineConfig {
  id: string
  name: string
  description: string
  extractConfig: Record<string, any>
  loadConfig: Record<string, any>
  transformConfig: Record<string, any>
  timeout: number
  retryAttempts: number
}

export interface IPipelineExecution {
  id: string
  pipelineId: string
  startTime: Date
  endTime?: Date
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  steps: IPipelineStep[]
  inputDataset: IDataset
  outputData?: any
  errorMessage?: string
  executionTime?: number
}

export interface IELTPipeline {
  id: string
  name: string
  description: string
  steps: IPipelineStep[]
  sampleDatasets: IDataset[]
  configuration: IPipelineConfig
  executionHistory: IPipelineExecution[]
  isActive: boolean
  createdDate: Date
  lastRun?: Date
}

// =============================================================================
// Testing and Coverage Models
// =============================================================================

export interface ICoverageMetrics {
  lines: { covered: number; total: number; percentage: number }
  branches: { covered: number; total: number; percentage: number }
  functions: { covered: number; total: number; percentage: number }
  statements: { covered: number; total: number; percentage: number }
}

export interface ITestResult {
  id: string
  testName: string
  suite: string
  status: 'pass' | 'fail' | 'skip'
  duration: number
  coverage: ICoverageMetrics
  timestamp: Date
  errorDetails?: string
  stackTrace?: string
  errorContext?: Record<string, any>
  testType: 'unit' | 'integration' | 'e2e' | 'property'
}

export interface ITestFile {
  id: string
  filePath: string
  testCount: number
  passCount: number
  failCount: number
  skipCount: number
  coverage: ICoverageMetrics
  lastRun: Date
}

export interface ITestSuite {
  id: string
  applicationId: string
  name: string
  testFiles: ITestFile[]
  coverage: ICoverageMetrics
  lastRun: Date
  status: 'passing' | 'failing' | 'unknown'
  results: ITestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
}

// =============================================================================
// Performance and Monitoring
// =============================================================================

export interface ILighthouseScore {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa?: number
}

export interface IPerformanceMetrics {
  pageId: string
  timestamp: Date
  coreWebVitals: {
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
  }
  loadTime: number
  bundleSize: number
  lighthouse: ILighthouseScore
  url: string
  userAgent?: string
}

// =============================================================================
// API and WebSocket Models
// =============================================================================

export interface IApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface IWebSocketMessage {
  type: 'pipeline_update' | 'test_result' | 'coverage_update' | 'error'
  payload: any
  timestamp: Date
  id: string
}

// =============================================================================
// UI and Component Props
// =============================================================================

export interface INavigationItem {
  id: string
  label: string
  path: string
  icon?: string
  external?: boolean
  children?: INavigationItem[]
}

export interface ILoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

export interface IErrorState {
  hasError: boolean
  message?: string
  code?: string
  details?: any
}

// =============================================================================
// Form and Validation
// =============================================================================

export interface IValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface IFormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox'
  value: any
  rules?: IValidationRule[]
  error?: string
  disabled?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: any }>
}

// =============================================================================
// Configuration and Settings
// =============================================================================

export interface IAppConfig {
  apiBaseUrl: string
  websocketUrl: string
  environment: 'development' | 'staging' | 'production'
  features: {
    enableTesting: boolean
    enablePipeline: boolean
    enableAnalytics: boolean
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    animations: boolean
    compactMode: boolean
  }
}

// =============================================================================
// Type Guards and Utilities
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// =============================================================================
// Event Types
// =============================================================================

export interface IPipelineEvent {
  type: 'started' | 'step_completed' | 'completed' | 'failed' | 'cancelled'
  pipelineId: string
  stepId?: string
  data?: any
  timestamp: Date
}

export interface ITestEvent {
  type: 'test_started' | 'test_completed' | 'suite_completed' | 'coverage_updated'
  suiteId: string
  testId?: string
  data?: any
  timestamp: Date
}

// Test metrics and historical tracking interfaces
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

export interface IOverallTestStats {
  totalSuites: number
  totalTests: number
  passedTests: number
  failedTests: number
  overallCoverage: ICoverageMetrics
  lastUpdated: Date
  suitesStatus: {
    passing: number
    failing: number
    unknown: number
  }
}

// =============================================================================
// Component Event Emitters
// =============================================================================

export interface IPipelineEvents {
  'pipeline-started': [pipelineId: string]
  'pipeline-completed': [pipelineId: string, result: any]
  'pipeline-error': [pipelineId: string, error: string]
  'step-progress': [stepId: string, progress: number]
}

export interface ITestingEvents {
  'test-started': [suiteId: string]
  'test-completed': [suiteId: string, results: ITestResult[]]
  'coverage-updated': [suiteId: string, coverage: ICoverageMetrics]
}

export interface INavigationEvents {
  'navigate-to-demos': []
  'navigate-to-testing': []
  'contact-clicked': []
}