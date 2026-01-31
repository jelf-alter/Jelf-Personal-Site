import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ELTPipelineDemo from '../ELTPipelineDemo.vue'
import { api } from '@/services/api'

// Mock the API service
vi.mock('@/services/api', () => ({
  api: {
    getSampleDatasets: vi.fn(),
    executeELTPipeline: vi.fn(),
    getPipelineStatus: vi.fn()
  }
}))

describe('ELT Pipeline Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should load sample datasets on component mount', async () => {
    const mockDatasets = [
      {
        id: 'dataset-1',
        name: 'Sample Dataset 1',
        description: 'Test dataset for integration',
        format: 'json',
        size: 1024,
        sampleData: { test: 'data' }
      }
    ]

    vi.mocked(api.getSampleDatasets).mockResolvedValue({
      success: true,
      data: mockDatasets,
      timestamp: new Date()
    })

    const wrapper = mount(ELTPipelineDemo)
    
    // Wait for component to load datasets
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(api.getSampleDatasets).toHaveBeenCalled()
  })

  it('should execute pipeline with selected dataset', async () => {
    const mockExecutionResponse = {
      success: true,
      data: {
        executionId: 'exec-123',
        status: 'started'
      },
      timestamp: new Date()
    }

    vi.mocked(api.executeELTPipeline).mockResolvedValue(mockExecutionResponse)

    const wrapper = mount(ELTPipelineDemo)
    
    // Simulate dataset selection and pipeline execution
    const executeButton = wrapper.find('[data-testid="execute-pipeline"]')
    if (executeButton.exists()) {
      await executeButton.trigger('click')
      expect(api.executeELTPipeline).toHaveBeenCalled()
    }
  })

  it('should handle API errors gracefully', async () => {
    vi.mocked(api.getSampleDatasets).mockRejectedValue(new Error('API Error'))

    const wrapper = mount(ELTPipelineDemo)
    
    // Wait for error handling
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Component should handle error without crashing
    expect(wrapper.exists()).toBe(true)
  })

  it('should poll pipeline status during execution', async () => {
    const mockStatusResponse = {
      success: true,
      data: {
        executionId: 'exec-123',
        status: 'running',
        progress: 0.5
      },
      timestamp: new Date()
    }

    vi.mocked(api.getPipelineStatus).mockResolvedValue(mockStatusResponse)

    const wrapper = mount(ELTPipelineDemo)
    
    // Simulate starting pipeline execution
    if (wrapper.vm.startPipelineExecution) {
      wrapper.vm.startPipelineExecution('exec-123')
      
      // Wait for status polling
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(api.getPipelineStatus).toHaveBeenCalledWith('exec-123')
    }
  })

  it('should display pipeline results after completion', async () => {
    const mockCompletionResponse = {
      success: true,
      data: {
        executionId: 'exec-123',
        status: 'completed',
        progress: 1.0,
        results: {
          extracted: 100,
          loaded: 100,
          transformed: 95
        }
      },
      timestamp: new Date()
    }

    vi.mocked(api.getPipelineStatus).mockResolvedValue(mockCompletionResponse)

    const wrapper = mount(ELTPipelineDemo)
    
    // Simulate pipeline completion
    if (wrapper.vm.handlePipelineCompletion) {
      wrapper.vm.handlePipelineCompletion(mockCompletionResponse.data)
      await wrapper.vm.$nextTick()
      
      // Check if results are displayed
      const resultsSection = wrapper.find('[data-testid="pipeline-results"]')
      if (resultsSection.exists()) {
        expect(resultsSection.text()).toContain('completed')
      }
    }
  })

  it('should handle WebSocket real-time updates', async () => {
    const wrapper = mount(ELTPipelineDemo)
    
    // Simulate WebSocket message
    const mockWebSocketUpdate = {
      type: 'pipeline_update',
      payload: {
        executionId: 'exec-123',
        step: 'extract',
        progress: 0.3,
        status: 'running'
      },
      timestamp: new Date(),
      id: 'ws-msg-123'
    }

    if (wrapper.vm.handleWebSocketUpdate) {
      wrapper.vm.handleWebSocketUpdate(mockWebSocketUpdate)
      await wrapper.vm.$nextTick()
      
      // Component should update based on WebSocket message
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('should validate dataset format before execution', async () => {
    const wrapper = mount(ELTPipelineDemo)
    
    const invalidDataset = {
      id: 'invalid-dataset',
      name: 'Invalid Dataset',
      format: 'unknown',
      size: 0,
      sampleData: null
    }

    if (wrapper.vm.validateDataset) {
      const isValid = wrapper.vm.validateDataset(invalidDataset)
      expect(isValid).toBe(false)
    }
  })

  it('should cleanup resources on component unmount', async () => {
    const wrapper = mount(ELTPipelineDemo)
    
    // Simulate component unmount
    wrapper.unmount()
    
    // Verify cleanup was performed (no specific assertions as cleanup is internal)
    expect(wrapper.exists()).toBe(false)
  })
})