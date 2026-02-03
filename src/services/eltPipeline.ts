import type { 
  IPipelineExecution, 
  IDataset, 
  IPipelineConfig,
  IApiResponse 
} from '@/types'
import { apiService } from './api'

export class ELTPipelineService {
  /**
   * Get all available sample datasets
   */
  async getSampleDatasets(): Promise<IApiResponse<IDataset[]>> {
    return apiService.getSampleDatasets() as Promise<IApiResponse<IDataset[]>>
  }

  /**
   * Execute ELT pipeline with specified dataset
   */
  async executePipeline(
    datasetId: string, 
    config?: Partial<IPipelineConfig>
  ): Promise<IApiResponse<IPipelineExecution>> {
    return apiService.executeELTPipeline(datasetId, config) as Promise<IApiResponse<IPipelineExecution>>
  }

  /**
   * Get pipeline execution status
   */
  async getExecutionStatus(executionId: string): Promise<IApiResponse<IPipelineExecution>> {
    return apiService.getPipelineStatus(executionId) as Promise<IApiResponse<IPipelineExecution>>
  }

  /**
   * Get pipeline configuration
   */
  async getPipelineConfig(): Promise<IApiResponse<IPipelineConfig>> {
    try {
      const response = await fetch('/api/demo/elt/config')
      const data = await response.json()
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Failed to fetch pipeline config',
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date()
      }
    }
  }

  /**
   * Validate dataset format and structure
   */
  validateDataset(dataset: IDataset): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!dataset.id || dataset.id.trim() === '') {
      errors.push('Dataset ID is required')
    }

    if (!dataset.name || dataset.name.trim() === '') {
      errors.push('Dataset name is required')
    }

    if (!dataset.sampleData || !Array.isArray(dataset.sampleData)) {
      errors.push('Sample data must be an array')
    }

    if (dataset.sampleData && dataset.sampleData.length === 0) {
      errors.push('Sample data cannot be empty')
    }

    if (!['json', 'csv', 'xml', 'text'].includes(dataset.format)) {
      errors.push('Dataset format must be one of: json, csv, xml, text')
    }

    // Validate schema consistency
    if (dataset.sampleData && dataset.sampleData.length > 0 && dataset.schema) {
      const firstRecord = dataset.sampleData[0]
      const recordKeys = Object.keys(firstRecord)
      const schemaKeys = Object.keys(dataset.schema)

      const missingKeys = schemaKeys.filter(key => !recordKeys.includes(key))
      const extraKeys = recordKeys.filter(key => !schemaKeys.includes(key))

      if (missingKeys.length > 0) {
        errors.push(`Missing keys in sample data: ${missingKeys.join(', ')}`)
      }

      if (extraKeys.length > 0) {
        errors.push(`Extra keys in sample data: ${extraKeys.join(', ')}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Estimate pipeline execution time based on dataset size and configuration
   */
  estimateExecutionTime(dataset: IDataset, config?: Partial<IPipelineConfig>): number {
    const baseTime = 2000 // Base time in milliseconds
    const recordMultiplier = 10 // Additional time per record
    const sizeMultiplier = 0.1 // Additional time per byte

    let estimatedTime = baseTime
    
    if (dataset.sampleData && Array.isArray(dataset.sampleData)) {
      estimatedTime += dataset.sampleData.length * recordMultiplier
    }

    estimatedTime += dataset.size * sizeMultiplier

    // Apply configuration modifiers
    if (config?.timeout && config.timeout < estimatedTime) {
      estimatedTime = config.timeout * 0.8 // Leave buffer for timeout
    }

    return Math.round(estimatedTime)
  }

  /**
   * Generate sample data for testing
   */
  generateSampleDataset(type: 'users' | 'sales' | 'logs', recordCount: number = 10): IDataset {
    const generators = {
      users: () => ({
        id: Math.floor(Math.random() * 10000),
        name: `User ${Math.floor(Math.random() * 1000)}`,
        age: Math.floor(Math.random() * 50) + 18,
        city: ['Seattle', 'Portland', 'San Francisco', 'Denver', 'Austin'][Math.floor(Math.random() * 5)],
        role: ['developer', 'designer', 'manager', 'analyst'][Math.floor(Math.random() * 4)]
      }),
      sales: () => ({
        transactionId: `T${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        product: ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones'][Math.floor(Math.random() * 5)],
        amount: Math.round((Math.random() * 2000 + 10) * 100) / 100,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customer: `Customer ${Math.floor(Math.random() * 100)}`
      }),
      logs: () => ({
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        level: ['INFO', 'WARN', 'ERROR', 'DEBUG'][Math.floor(Math.random() * 4)],
        message: [
          'Application started',
          'High memory usage detected',
          'Database connection failed',
          'Request processed successfully',
          'Cache miss occurred'
        ][Math.floor(Math.random() * 5)],
        service: ['api', 'worker', 'database', 'cache'][Math.floor(Math.random() * 4)]
      })
    }

    const sampleData = Array.from({ length: recordCount }, () => generators[type]())
    const firstRecord = sampleData[0]
    const schema = Object.keys(firstRecord).reduce((acc, key) => {
      acc[key] = typeof firstRecord[key as keyof typeof firstRecord]
      return acc
    }, {} as Record<string, string>)

    return {
      id: `generated-${type}-${Date.now()}`,
      name: `Generated ${type.charAt(0).toUpperCase() + type.slice(1)} Dataset`,
      description: `Automatically generated ${type} dataset with ${recordCount} records`,
      format: 'json',
      size: JSON.stringify(sampleData).length,
      sampleData,
      schema
    }
  }

  /**
   * Format execution results for display
   */
  formatExecutionResults(execution: IPipelineExecution) {
    return {
      id: execution.id,
      status: execution.status,
      duration: execution.executionTime || 0,
      startTime: execution.startTime,
      endTime: execution.endTime,
      inputRecords: execution.inputDataset.sampleData?.length || 0,
      outputRecords: execution.outputData?.transformedRecords || 0,
      steps: execution.steps.map(step => ({
        name: step.name,
        status: step.status,
        progress: step.progress,
        duration: step.endTime && step.startTime 
          ? step.endTime.getTime() - step.startTime.getTime() 
          : 0,
        inputSize: step.inputData ? JSON.stringify(step.inputData).length : 0,
        outputSize: step.outputData ? JSON.stringify(step.outputData).length : 0,
        error: step.errorMessage
      })),
      error: execution.errorMessage
    }
  }
}

export const eltPipelineService = new ELTPipelineService()