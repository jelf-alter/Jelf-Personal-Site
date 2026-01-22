// Global test setup for Vitest
import { beforeAll, afterEach, vi } from 'vitest'

// Global test configuration
beforeAll(() => {
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  
  // Mock window.matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock WebSocket for testing real-time features
  global.WebSocket = vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: WebSocket.CONNECTING,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  }))
})

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Global test utilities
export const createMockUser = () => ({
  name: 'Test User',
  title: 'Test Developer',
  email: 'test@example.com',
  location: 'Test Location',
  summary: 'Test summary',
  skills: [],
  achievements: [],
  socialLinks: []
})

export const createMockDemo = () => ({
  id: 'test-demo',
  name: 'Test Demo',
  description: 'Test description',
  category: 'Test Category',
  technologies: ['Vue.js', 'TypeScript'],
  status: 'active' as const,
  launchUrl: '/test-demo',
  testSuiteId: 'test-suite',
  featured: false,
  createdDate: new Date('2024-01-01'),
  lastUpdated: new Date()
})

export const createMockTestSuite = () => ({
  id: 'test-suite',
  applicationId: 'test-demo',
  name: 'Test Suite',
  testFiles: [],
  coverage: {
    lines: { covered: 80, total: 100, percentage: 80 },
    branches: { covered: 15, total: 20, percentage: 75 },
    functions: { covered: 10, total: 12, percentage: 83.3 },
    statements: { covered: 80, total: 100, percentage: 80 }
  },
  lastRun: new Date(),
  status: 'passing' as const,
  results: [],
  totalTests: 10,
  passedTests: 9,
  failedTests: 1,
  skippedTests: 0
})

export const createMockPipelineStep = () => ({
  id: 'test-step',
  name: 'Test Step',
  status: 'pending' as const,
  progress: 0,
  stepType: 'extract' as const
})

// Property-based testing utilities
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const mockApiResponse = <T>(data: T, success = true) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : 'Mock error',
  message: success ? 'Success' : 'Error',
  timestamp: new Date()
})