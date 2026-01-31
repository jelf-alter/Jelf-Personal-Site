import type { IApiResponse } from '@/types'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<IApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    try {
      const response = await fetch(url, { ...defaultOptions, ...options })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          message: errorData.message,
          timestamp: new Date()
        }
      }

      const data = await response.json()
      return {
        success: true,
        data,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        timestamp: new Date()
      }
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }

  // Demo endpoints
  async getAllDemos() {
    return this.request('/demo')
  }

  async getDemoById(id: string) {
    return this.request(`/demo/${id}`)
  }

  async getSampleDatasets() {
    return this.request('/demo/elt/datasets')
  }

  async executeELTPipeline(datasetId: string, config?: any) {
    return this.request('/demo/elt/execute', {
      method: 'POST',
      body: JSON.stringify({ datasetId, config }),
    })
  }

  async getPipelineStatus(executionId: string) {
    return this.request(`/demo/elt/status/${executionId}`)
  }

  // Configuration endpoints
  async getAppConfig() {
    return this.request('/config')
  }

  async getUserProfile() {
    return this.request('/config/profile')
  }

  async getDemosConfig() {
    return this.request('/config/demos')
  }

  async getTestingConfig() {
    return this.request('/config/testing')
  }

  // Test execution endpoints
  async runTests(options?: any) {
    return this.request('/test/run', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    })
  }

  async runTestSuite(suiteId: string, options?: any) {
    return this.request(`/test/run/${suiteId}`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    })
  }

  async getTestExecutionStatus(executionId: string) {
    return this.request(`/test/status/${executionId}`)
  }

  // Test metrics endpoints
  async getTestSuites() {
    return this.request('/test/suites')
  }

  async getTestSuite(suiteId: string) {
    return this.request(`/test/suites/${suiteId}`)
  }

  async getTestResults(suiteId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    return this.request(`/test/suites/${suiteId}/results${params}`)
  }

  async getTestCoverage(suiteId?: string) {
    const endpoint = suiteId ? `/test/coverage?suiteId=${suiteId}` : '/test/coverage'
    return this.request(endpoint)
  }

  async getTestTrends(suiteId?: string, period?: string) {
    const params = new URLSearchParams()
    if (period) params.append('period', period)
    const paramString = params.toString() ? `?${params.toString()}` : ''
    const endpoint = suiteId ? `/test/trends/${suiteId}${paramString}` : `/test/trends${paramString}`
    return this.request(endpoint)
  }

  async getTestMetrics() {
    return this.request('/test/metrics')
  }

  // Public test data endpoints (no authentication required)
  async getPublicTestSuites() {
    return this.request('/test/suites')
  }

  async getPublicTestResults(suiteId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    return this.request(`/test/suites/${suiteId}/results${params}`)
  }

  async getPublicCoverage(suiteId?: string) {
    const endpoint = suiteId ? `/test/coverage?suiteId=${suiteId}` : '/test/coverage'
    return this.request(endpoint)
  }

  async getPublicTestMetrics() {
    return this.request('/test/metrics')
  }
}

export const apiService = new ApiService()

// Export individual API functions for use with useApi composable
export const api = {
  healthCheck: () => apiService.healthCheck(),
  getAllDemos: () => apiService.getAllDemos(),
  getDemoById: (id: string) => apiService.getDemoById(id),
  getSampleDatasets: () => apiService.getSampleDatasets(),
  executeELTPipeline: (datasetId: string, config?: any) => 
    apiService.executeELTPipeline(datasetId, config),
  getPipelineStatus: (executionId: string) => 
    apiService.getPipelineStatus(executionId),
  getAppConfig: () => apiService.getAppConfig(),
  getUserProfile: () => apiService.getUserProfile(),
  getDemosConfig: () => apiService.getDemosConfig(),
  getTestingConfig: () => apiService.getTestingConfig(),
  
  // Test execution API functions
  runTests: (options?: any) => apiService.runTests(options),
  runTestSuite: (suiteId: string, options?: any) => 
    apiService.runTestSuite(suiteId, options),
  getTestExecutionStatus: (executionId: string) => 
    apiService.getTestExecutionStatus(executionId),
  
  // Test metrics API functions
  getTestSuites: () => apiService.getTestSuites(),
  getTestSuite: (suiteId: string) => apiService.getTestSuite(suiteId),
  getTestResults: (suiteId: string, limit?: number) => 
    apiService.getTestResults(suiteId, limit),
  getTestCoverage: (suiteId?: string) => apiService.getTestCoverage(suiteId),
  getTestTrends: (suiteId?: string, period?: string) => 
    apiService.getTestTrends(suiteId, period),
  getTestMetrics: () => apiService.getTestMetrics(),
  runAllTests: (options?: any) => apiService.runTests(options),
  
  // Public test data API functions (no authentication required)
  getPublicTestSuites: () => apiService.getPublicTestSuites(),
  getPublicTestResults: (suiteId: string, limit?: number) => 
    apiService.getPublicTestResults(suiteId, limit),
  getPublicCoverage: (suiteId?: string) => apiService.getPublicCoverage(suiteId),
  getPublicTestMetrics: () => apiService.getPublicTestMetrics(),
}