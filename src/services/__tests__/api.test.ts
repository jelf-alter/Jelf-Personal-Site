import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { api } from '../api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Test Suite Operations', () => {
    it('fetches test suites successfully', async () => {
      const mockResponse = {
        success: true,
        testSuites: [
          {
            id: 'test-suite-1',
            name: 'Unit Tests',
            testType: 'unit',
            category: 'core-feature'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.getTestSuites()

      expect(mockFetch).toHaveBeenCalledWith('/api/test/suites')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse.testSuites)
    })

    it('handles test suite fetch errors correctly', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getTestSuites()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('runs all tests successfully', async () => {
      const mockResponse = {
        success: true,
        executionId: 'exec-123',
        message: 'Test execution started'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.runAllTests()

      expect(mockFetch).toHaveBeenCalledWith('/api/test/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      expect(result.success).toBe(true)
      expect(result.data.executionId).toBe('exec-123')
    })

    it('runs specific test suite successfully', async () => {
      const mockResponse = {
        success: true,
        executionId: 'exec-456',
        suiteId: 'test-suite-1'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.runTestSuite('test-suite-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/test/run/test-suite-1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      expect(result.success).toBe(true)
      expect(result.data.suiteId).toBe('test-suite-1')
    })
  })

  describe('Test Results Operations', () => {
    it('fetches test results successfully', async () => {
      const mockResponse = {
        success: true,
        results: [
          {
            id: 'result-1',
            testName: 'Test 1',
            status: 'pass',
            duration: 100
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.getTestResults('test-suite-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/test/suites/test-suite-1/results')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse.results)
    })

    it('fetches test results with limit', async () => {
      const mockResponse = {
        success: true,
        results: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await api.getTestResults('test-suite-1', 10)

      expect(mockFetch).toHaveBeenCalledWith('/api/test/suites/test-suite-1/results?limit=10')
    })
  })

  describe('Coverage Operations', () => {
    it('fetches overall coverage successfully', async () => {
      const mockResponse = {
        success: true,
        coverage: {
          lines: { covered: 85, total: 100, percentage: 85 },
          branches: { covered: 20, total: 25, percentage: 80 }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.getCoverage()

      expect(mockFetch).toHaveBeenCalledWith('/api/test/coverage')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse.coverage)
    })

    it('fetches suite-specific coverage successfully', async () => {
      const mockResponse = {
        success: true,
        coverage: {
          lines: { covered: 90, total: 100, percentage: 90 }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.getCoverage('test-suite-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/test/coverage?suiteId=test-suite-1')
      expect(result.success).toBe(true)
    })
  })

  describe('Test Metrics Operations', () => {
    it('fetches test metrics successfully', async () => {
      const mockResponse = {
        success: true,
        metrics: {
          overview: {
            totalSuites: 5,
            totalTests: 100,
            passedTests: 95,
            failedTests: 5
          }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.getTestMetrics()

      expect(mockFetch).toHaveBeenCalledWith('/api/test/metrics')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse.metrics)
    })
  })

  describe('Demo Operations', () => {
    it('fetches demo applications successfully', async () => {
      const mockResponse = {
        success: true,
        demos: [
          {
            id: 'elt-pipeline',
            name: 'ELT Pipeline Demo',
            category: 'demo-application'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.getDemoApplications()

      expect(mockFetch).toHaveBeenCalledWith('/api/demo/applications')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse.demos)
    })

    it('executes ELT pipeline successfully', async () => {
      const mockResponse = {
        success: true,
        executionId: 'pipeline-exec-123',
        status: 'started'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const pipelineConfig = {
        datasetId: 'sample-dataset-1',
        steps: ['extract', 'load', 'transform']
      }

      const result = await api.executeELTPipeline(pipelineConfig)

      expect(mockFetch).toHaveBeenCalledWith('/api/demo/elt/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pipelineConfig)
      })
      expect(result.success).toBe(true)
      expect(result.data.executionId).toBe('pipeline-exec-123')
    })
  })

  describe('Error Handling', () => {
    it('handles HTTP error responses correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          error: 'Resource not found'
        })
      })

      const result = await api.getTestSuites()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Resource not found')
    })

    it('handles network errors correctly', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))

      const result = await api.getTestSuites()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to fetch')
    })

    it('handles malformed JSON responses correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      const result = await api.getTestSuites()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid JSON')
    })
  })

  describe('Request Configuration', () => {
    it('includes correct headers for POST requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await api.runAllTests()

      expect(mockFetch).toHaveBeenCalledWith('/api/test/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
    })

    it('handles query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, results: [] })
      })

      await api.getTestResults('suite-1', 25)

      expect(mockFetch).toHaveBeenCalledWith('/api/test/suites/suite-1/results?limit=25')
    })
  })

  describe('Response Validation', () => {
    it('validates successful responses correctly', async () => {
      const mockResponse = {
        success: true,
        data: { test: 'data' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await api.getTestSuites()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('validates error responses correctly', async () => {
      const mockResponse = {
        success: false,
        error: 'Test error message'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockResponse
      })

      const result = await api.getTestSuites()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Test error message')
      expect(result.data).toBeUndefined()
    })
  })
})