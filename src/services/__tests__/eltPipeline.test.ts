import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ELTPipelineService } from '../eltPipeline'
import type { IPipelineStep, IDataset, IPipelineConfig } from '@/types'

const mockDataset: IDataset = {
  id: 'test-dataset',
  name: 'Test Dataset',
  description: 'Sample test data',
  format: 'json',
  size: 1000,
  sampleData: [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 }
  ]
}

const mockConfig: IPipelineConfig = {
  id: 'test-config',
  name: 'Test Pipeline Config',
  description: 'Test configuration',
  extractConfig: { source: 'database' },
  loadConfig: { target: 'warehouse' },
  transformConfig: { rules: ['normalize', 'validate'] },
  timeout: 30000,
  retryAttempts: 3
}

describe('ELTPipelineService Unit Tests', () => {
  let pipelineService: ELTPipelineService

  beforeEach(() => {
    pipelineService = new ELTPipelineService()
    vi.clearAllMocks()
  })

  describe('Pipeline Execution', () => {
    it('executes pipeline successfully', async () => {
      const result = await pipelineService.executePipeline(mockDataset, mockConfig)

      expect(result.success).toBe(true)
      expect(result.executionId).toBeDefined()
      expect(result.steps).toHaveLength(3) // Extract, Load, Transform
    })

    it('creates correct pipeline steps', async () => {
      const result = await pipelineService.executePipeline(mockDataset, mockConfig)

      const steps = result.steps
      expect(steps[0].stepType).toBe('extract')
      expect(steps[1].stepType).toBe('load')
      expect(steps[2].stepType).toBe('transform')
      
      expect(steps[0].name).toBe('Extract Data')
      expect(steps[1].name).toBe('Load Data')
      expect(steps[2].name).toBe('Transform Data')
    })

    it('handles pipeline execution with progress updates', async () => {
      const progressCallback = vi.fn()
      
      await pipelineService.executePipeline(mockDataset, mockConfig, progressCallback)

      expect(progressCallback).toHaveBeenCalled()
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stepId: expect.any(String),
          progress: expect.any(Number),
          status: expect.any(String)
        })
      )
    })
  })

  describe('Extract Step', () => {
    it('executes extract step successfully', async () => {
      const step = await pipelineService.executeExtractStep(mockDataset, mockConfig.extractConfig)

      expect(step.status).toBe('completed')
      expect(step.stepType).toBe('extract')
      expect(step.outputData).toBeDefined()
      expect(step.progress).toBe(100)
    })

    it('handles extract step errors', async () => {
      const invalidDataset = { ...mockDataset, sampleData: null }
      
      const step = await pipelineService.executeExtractStep(invalidDataset, mockConfig.extractConfig)

      expect(step.status).toBe('failed')
      expect(step.errorMessage).toBeDefined()
    })

    it('validates extract configuration', async () => {
      const invalidConfig = {}
      
      const step = await pipelineService.executeExtractStep(mockDataset, invalidConfig)

      expect(step.status).toBe('failed')
      expect(step.errorMessage).toContain('Invalid extract configuration')
    })
  })

  describe('Load Step', () => {
    it('executes load step successfully', async () => {
      const extractedData = mockDataset.sampleData
      
      const step = await pipelineService.executeLoadStep(extractedData, mockConfig.loadConfig)

      expect(step.status).toBe('completed')
      expect(step.stepType).toBe('load')
      expect(step.outputData).toBeDefined()
      expect(step.progress).toBe(100)
    })

    it('handles load step with large datasets', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000
      }))
      
      const step = await pipelineService.executeLoadStep(largeDataset, mockConfig.loadConfig)

      expect(step.status).toBe('completed')
      expect(step.outputData).toHaveLength(10000)
    })

    it('handles load step errors', async () => {
      const invalidData = 'not-an-array'
      
      const step = await pipelineService.executeLoadStep(invalidData, mockConfig.loadConfig)

      expect(step.status).toBe('failed')
      expect(step.errorMessage).toBeDefined()
    })
  })

  describe('Transform Step', () => {
    it('executes transform step successfully', async () => {
      const loadedData = mockDataset.sampleData
      
      const step = await pipelineService.executeTransformStep(loadedData, mockConfig.transformConfig)

      expect(step.status).toBe('completed')
      expect(step.stepType).toBe('transform')
      expect(step.outputData).toBeDefined()
      expect(step.progress).toBe(100)
    })

    it('applies transformation rules correctly', async () => {
      const inputData = [
        { id: 1, name: 'item 1', value: '100' },
        { id: 2, name: 'item 2', value: '200' }
      ]
      
      const transformConfig = {
        rules: ['normalize', 'validate', 'convert-types']
      }
      
      const step = await pipelineService.executeTransformStep(inputData, transformConfig)

      expect(step.status).toBe('completed')
      const transformedData = step.outputData
      
      // Check that names are normalized (capitalized)
      expect(transformedData[0].name).toBe('Item 1')
      expect(transformedData[1].name).toBe('Item 2')
      
      // Check that values are converted to numbers
      expect(typeof transformedData[0].value).toBe('number')
      expect(typeof transformedData[1].value).toBe('number')
    })

    it('handles transform step validation errors', async () => {
      const invalidData = [
        { id: 'invalid', name: null, value: 'not-a-number' }
      ]
      
      const step = await pipelineService.executeTransformStep(invalidData, mockConfig.transformConfig)

      expect(step.status).toBe('failed')
      expect(step.errorMessage).toContain('validation')
    })
  })

  describe('Error Handling and Recovery', () => {
    it('handles step timeout correctly', async () => {
      const shortTimeoutConfig = { ...mockConfig, timeout: 1 } // 1ms timeout
      
      const result = await pipelineService.executePipeline(mockDataset, shortTimeoutConfig)

      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
    })

    it('implements retry logic for failed steps', async () => {
      const retryConfig = { ...mockConfig, retryAttempts: 2 }
      
      // Mock a step that fails twice then succeeds
      let attemptCount = 0
      const originalExecuteExtractStep = pipelineService.executeExtractStep
      pipelineService.executeExtractStep = vi.fn().mockImplementation(async (dataset, config) => {
        attemptCount++
        if (attemptCount <= 2) {
          return {
            id: 'extract-1',
            name: 'Extract Data',
            status: 'failed',
            progress: 0,
            stepType: 'extract',
            errorMessage: 'Temporary failure'
          }
        }
        return originalExecuteExtractStep.call(pipelineService, dataset, config)
      })

      const result = await pipelineService.executePipeline(mockDataset, retryConfig)

      expect(attemptCount).toBe(3) // Initial attempt + 2 retries
      expect(result.success).toBe(true)
    })

    it('stops pipeline execution on critical errors', async () => {
      // Mock extract step to fail with critical error
      pipelineService.executeExtractStep = vi.fn().mockResolvedValue({
        id: 'extract-1',
        name: 'Extract Data',
        status: 'failed',
        progress: 0,
        stepType: 'extract',
        errorMessage: 'Critical: Database connection failed'
      })

      const result = await pipelineService.executePipeline(mockDataset, mockConfig)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Critical')
    })
  })

  describe('Pipeline Monitoring', () => {
    it('tracks execution time correctly', async () => {
      const result = await pipelineService.executePipeline(mockDataset, mockConfig)

      expect(result.executionTime).toBeGreaterThan(0)
      expect(result.startTime).toBeDefined()
      expect(result.endTime).toBeDefined()
    })

    it('provides detailed step metrics', async () => {
      const result = await pipelineService.executePipeline(mockDataset, mockConfig)

      result.steps.forEach(step => {
        expect(step.startTime).toBeDefined()
        expect(step.endTime).toBeDefined()
        expect(step.progress).toBeGreaterThanOrEqual(0)
        expect(step.progress).toBeLessThanOrEqual(100)
      })
    })

    it('calculates overall pipeline progress', async () => {
      const progressUpdates: number[] = []
      const progressCallback = (update: any) => {
        progressUpdates.push(update.overallProgress)
      }

      await pipelineService.executePipeline(mockDataset, mockConfig, progressCallback)

      expect(progressUpdates.length).toBeGreaterThan(0)
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100)
    })
  })

  describe('Data Validation', () => {
    it('validates input dataset format', async () => {
      const invalidDataset = { ...mockDataset, format: 'unsupported' as any }
      
      const result = await pipelineService.executePipeline(invalidDataset, mockConfig)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unsupported dataset format')
    })

    it('validates pipeline configuration', async () => {
      const invalidConfig = { ...mockConfig, timeout: -1 }
      
      const result = await pipelineService.executePipeline(mockDataset, invalidConfig)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid configuration')
    })

    it('validates data integrity between steps', async () => {
      const result = await pipelineService.executePipeline(mockDataset, mockConfig)

      expect(result.success).toBe(true)
      
      // Verify data flows correctly between steps
      const extractStep = result.steps.find(s => s.stepType === 'extract')
      const loadStep = result.steps.find(s => s.stepType === 'load')
      const transformStep = result.steps.find(s => s.stepType === 'transform')

      expect(extractStep?.outputData).toBeDefined()
      expect(loadStep?.inputData).toEqual(extractStep?.outputData)
      expect(transformStep?.inputData).toEqual(loadStep?.outputData)
    })
  })
})