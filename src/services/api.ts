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
}