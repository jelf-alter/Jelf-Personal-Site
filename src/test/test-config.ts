// Test configuration and constants
export const TEST_CONFIG = {
  // Property-based testing configuration
  PROPERTY_TEST_RUNS: 100,
  PROPERTY_TEST_TIMEOUT: 5000,
  
  // Component testing configuration
  COMPONENT_TEST_TIMEOUT: 3000,
  
  // API testing configuration
  API_TEST_TIMEOUT: 10000,
  
  // Performance testing thresholds
  PERFORMANCE_THRESHOLDS: {
    RENDER_TIME_MS: 100,
    BUNDLE_SIZE_KB: 500,
    LIGHTHOUSE_PERFORMANCE: 90,
    LIGHTHOUSE_ACCESSIBILITY: 95,
    LIGHTHOUSE_BEST_PRACTICES: 90,
    LIGHTHOUSE_SEO: 90
  },
  
  // Coverage thresholds (matching vitest.config.ts)
  COVERAGE_THRESHOLDS: {
    BRANCHES: 80,
    FUNCTIONS: 80,
    LINES: 80,
    STATEMENTS: 80
  },
  
  // Responsive design breakpoints for testing
  BREAKPOINTS: [
    { name: 'mobile', width: 320, height: 568 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1024, height: 768 },
    { name: 'large-desktop', width: 1920, height: 1080 }
  ],
  
  // Test data limits
  DATA_LIMITS: {
    MAX_STRING_LENGTH: 1000,
    MAX_ARRAY_LENGTH: 100,
    MAX_OBJECT_DEPTH: 5,
    MAX_NUMBER_VALUE: 1000000
  },
  
  // Mock data configuration
  MOCK_DATA: {
    USER_PROFILE: {
      SKILLS_COUNT: { min: 1, max: 20 },
      ACHIEVEMENTS_COUNT: { min: 1, max: 10 },
      SOCIAL_LINKS_COUNT: { min: 1, max: 5 }
    },
    DEMO_APPLICATIONS: {
      COUNT: { min: 1, max: 10 },
      TECHNOLOGIES_COUNT: { min: 1, max: 8 }
    },
    TEST_SUITES: {
      COUNT: { min: 1, max: 5 },
      TESTS_PER_SUITE: { min: 5, max: 50 }
    }
  }
}

// Test categories for organization
export const TEST_CATEGORIES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  PROPERTY: 'property',
  PERFORMANCE: 'performance',
  ACCESSIBILITY: 'accessibility',
  VISUAL: 'visual'
} as const

// Test tags for filtering
export const TEST_TAGS = {
  SMOKE: 'smoke',
  REGRESSION: 'regression',
  CRITICAL: 'critical',
  SLOW: 'slow',
  FLAKY: 'flaky'
} as const

// Common test patterns
export const TEST_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  KEBAB_CASE: /^[a-z0-9-]+$/,
  CAMEL_CASE: /^[a-z][a-zA-Z0-9]*$/,
  PERCENTAGE: /^\d+(\.\d+)?%$/,
  FILE_SIZE: /^\d+(\.\d+)?\s(B|KB|MB|GB|TB)$/,
  DURATION_MS: /^\d+ms$/,
  DURATION_S: /^\d+(\.\d+)?s$/,
  DURATION_M: /^\d+m\s\d+s$/
}

// Error messages for testing
export const TEST_ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  MIN_LENGTH: 'Minimum length not met',
  MAX_LENGTH: 'Maximum length exceeded',
  INVALID_FORMAT: 'Invalid format',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timed out',
  VALIDATION_ERROR: 'Validation failed'
}

// Test utilities configuration
export const UTILITY_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  ANIMATION_DURATION: 300,
  LOADING_DELAY: 1000,
  ERROR_DISPLAY_DURATION: 5000
}

// Property-based test generators configuration
export const GENERATOR_CONFIG = {
  STRING: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    ALPHANUMERIC_ONLY: true
  },
  NUMBER: {
    MIN_VALUE: -1000000,
    MAX_VALUE: 1000000,
    PRECISION: 2
  },
  ARRAY: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 50
  },
  DATE: {
    MIN_YEAR: 2000,
    MAX_YEAR: 2030
  }
}

// Test environment detection
export const isTestEnvironment = () => process.env.NODE_ENV === 'test'
export const isCI = () => process.env.CI === 'true'
export const isCoverageEnabled = () => process.env.COVERAGE === 'true'

// Test helper functions
export const skipInCI = (reason: string) => {
  if (isCI()) {
    return { skip: true, reason }
  }
  return { skip: false }
}

export const skipIfNoCoverage = (reason: string) => {
  if (!isCoverageEnabled()) {
    return { skip: true, reason }
  }
  return { skip: false }
}

// Test data validation
export const validateTestData = (data: any, schema: any): boolean => {
  // Simple validation - in a real app you might use a library like Joi or Zod
  try {
    return typeof data === typeof schema
  } catch {
    return false
  }
}

// Test cleanup utilities
export const cleanupTestData = () => {
  // Clear any test data, reset mocks, etc.
  localStorage.clear()
  sessionStorage.clear()
}

// Test assertion helpers
export const expectToBeWithinRange = (value: number, min: number, max: number) => {
  expect(value).toBeGreaterThanOrEqual(min)
  expect(value).toBeLessThanOrEqual(max)
}

export const expectToMatchPattern = (value: string, pattern: RegExp) => {
  expect(value).toMatch(pattern)
}

export const expectToBeValidDate = (value: any) => {
  expect(value).toBeInstanceOf(Date)
  expect(value.getTime()).not.toBeNaN()
}

export const expectToBeValidUrl = (value: string) => {
  expect(() => new URL(value)).not.toThrow()
}

export const expectToBeValidEmail = (value: string) => {
  expect(value).toMatch(TEST_PATTERNS.EMAIL)
}