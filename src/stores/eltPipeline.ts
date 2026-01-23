import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  IELTPipeline, 
  IPipelineExecution, 
  IPipelineStep, 
  IDataset, 
  IPipelineConfig,
  IPipelineEvent
} from '@/types'

export const useELTPipelineStore = defineStore('eltPipeline', () => {
  // State
  const pipelines = ref<IELTPipeline[]>([])
  const currentExecution = ref<IPipelineExecution | null>(null)
  const isExecuting = ref(false)
  const executionHistory = ref<IPipelineExecution[]>([])
  const error = ref<string | null>(null)
  const sampleDatasets = ref<IDataset[]>([])

  // Getters
  const activePipeline = computed(() => 
    pipelines.value.find(p => p.isActive) || null
  )

  const currentStep = computed(() => {
    if (!currentExecution.value) return null
    return currentExecution.value.steps.find(step => 
      step.status === 'running' || step.status === 'pending'
    ) || null
  })

  const executionProgress = computed(() => {
    if (!currentExecution.value) return 0
    const completedSteps = currentExecution.value.steps.filter(s => s.status === 'completed').length
    return (completedSteps / currentExecution.value.steps.length) * 100
  })

  const lastExecution = computed(() => 
    executionHistory.value[executionHistory.value.length - 1] || null
  )

  // Actions
  const initializePipeline = () => {
    // Create default ELT pipeline configuration
    const defaultPipeline: IELTPipeline = {
      id: 'demo-elt-pipeline',
      name: 'Demo ELT Pipeline',
      description: 'Interactive demonstration of Extract, Load, Transform data processing',
      steps: [
        {
          id: 'extract-step',
          name: 'Extract Data',
          status: 'pending',
          progress: 0,
          stepType: 'extract',
          metadata: {
            description: 'Extract data from source dataset',
            estimatedDuration: 2000
          }
        },
        {
          id: 'load-step',
          name: 'Load Data',
          status: 'pending',
          progress: 0,
          stepType: 'load',
          metadata: {
            description: 'Load extracted data into processing environment',
            estimatedDuration: 1500
          }
        },
        {
          id: 'transform-step',
          name: 'Transform Data',
          status: 'pending',
          progress: 0,
          stepType: 'transform',
          metadata: {
            description: 'Apply transformations and business logic',
            estimatedDuration: 3000
          }
        }
      ],
      sampleDatasets: [],
      configuration: {
        id: 'default-config',
        name: 'Default Configuration',
        description: 'Standard ELT pipeline configuration',
        extractConfig: {
          format: 'json',
          validation: true,
          chunkSize: 1000
        },
        loadConfig: {
          batchSize: 500,
          parallelism: 2
        },
        transformConfig: {
          enableValidation: true,
          outputFormat: 'json'
        },
        timeout: 30000,
        retryAttempts: 3
      },
      executionHistory: [],
      isActive: true,
      createdDate: new Date(),
      lastRun: undefined
    }

    pipelines.value = [defaultPipeline]
    initializeSampleDatasets()
  }

  const initializeSampleDatasets = () => {
    const datasets: IDataset[] = [
      {
        id: 'users-dataset',
        name: 'User Profiles',
        description: 'Sample user profile data with demographics and preferences',
        format: 'json',
        size: 1024,
        sampleData: [
          { id: 1, name: 'Alice Johnson', age: 28, city: 'Seattle', role: 'developer' },
          { id: 2, name: 'Bob Smith', age: 34, city: 'Portland', role: 'designer' },
          { id: 3, name: 'Carol Davis', age: 29, city: 'San Francisco', role: 'manager' }
        ],
        schema: {
          id: 'number',
          name: 'string',
          age: 'number',
          city: 'string',
          role: 'string'
        }
      },
      {
        id: 'sales-dataset',
        name: 'Sales Transactions',
        description: 'E-commerce sales transaction data with products and revenue',
        format: 'json',
        size: 2048,
        sampleData: [
          { transactionId: 'T001', product: 'Laptop', amount: 1299.99, date: '2024-01-15', customer: 'Alice' },
          { transactionId: 'T002', product: 'Mouse', amount: 29.99, date: '2024-01-16', customer: 'Bob' },
          { transactionId: 'T003', product: 'Keyboard', amount: 89.99, date: '2024-01-17', customer: 'Carol' }
        ],
        schema: {
          transactionId: 'string',
          product: 'string',
          amount: 'number',
          date: 'string',
          customer: 'string'
        }
      },
      {
        id: 'logs-dataset',
        name: 'Application Logs',
        description: 'Server application logs with timestamps and error levels',
        format: 'json',
        size: 512,
        sampleData: [
          { timestamp: '2024-01-20T10:30:00Z', level: 'INFO', message: 'Application started', service: 'api' },
          { timestamp: '2024-01-20T10:31:15Z', level: 'WARN', message: 'High memory usage detected', service: 'worker' },
          { timestamp: '2024-01-20T10:32:30Z', level: 'ERROR', message: 'Database connection failed', service: 'api' }
        ],
        schema: {
          timestamp: 'string',
          level: 'string',
          message: 'string',
          service: 'string'
        }
      }
    ]

    sampleDatasets.value = datasets
    if (pipelines.value.length > 0) {
      pipelines.value[0].sampleDatasets = datasets
    }
  }

  const executePipeline = async (datasetId: string, config?: Partial<IPipelineConfig>) => {
    const pipeline = activePipeline.value
    if (!pipeline) {
      const errorMsg = 'No active pipeline found. Please initialize the pipeline first.'
      error.value = errorMsg
      throw new Error(errorMsg)
    }

    const dataset = sampleDatasets.value.find(d => d.id === datasetId)
    if (!dataset) {
      const errorMsg = `Dataset with id '${datasetId}' not found. Available datasets: ${sampleDatasets.value.map(d => d.id).join(', ')}`
      error.value = errorMsg
      throw new Error(errorMsg)
    }

    // Validate dataset before execution
    if (!dataset.sampleData || !Array.isArray(dataset.sampleData) || dataset.sampleData.length === 0) {
      const errorMsg = 'Selected dataset contains no valid sample data'
      error.value = errorMsg
      throw new Error(errorMsg)
    }

    // Check if already executing
    if (isExecuting.value) {
      const errorMsg = 'Pipeline is already executing. Please wait for completion or cancel the current execution.'
      error.value = errorMsg
      throw new Error(errorMsg)
    }

    // Reset state
    error.value = null
    isExecuting.value = true

    // Merge configuration with defaults
    const mergedConfig = {
      ...pipeline.configuration,
      ...config
    }

    // Create new execution
    const execution: IPipelineExecution = {
      id: `exec-${Date.now()}`,
      pipelineId: pipeline.id,
      startTime: new Date(),
      status: 'running',
      steps: pipeline.steps.map(step => ({
        ...step,
        status: 'pending',
        progress: 0,
        startTime: undefined,
        endTime: undefined,
        inputData: undefined,
        outputData: undefined,
        errorMessage: undefined
      })),
      inputDataset: dataset
    }

    currentExecution.value = execution

    try {
      // Execute each step sequentially with retry logic
      for (let i = 0; i < execution.steps.length; i++) {
        const step = execution.steps[i]
        const inputData = i === 0 ? dataset.sampleData : execution.steps[i - 1].outputData
        
        let retryCount = 0
        const maxRetries = mergedConfig.retryAttempts || 3
        
        while (retryCount <= maxRetries) {
          try {
            await executeStep(step, inputData, mergedConfig)
            break // Success, exit retry loop
          } catch (stepError) {
            retryCount++
            
            if (retryCount > maxRetries) {
              // Max retries reached, fail the step
              step.status = 'failed'
              step.errorMessage = `Step failed after ${maxRetries} retries: ${stepError instanceof Error ? stepError.message : 'Unknown error'}`
              throw stepError
            } else {
              // Reset step for retry
              step.status = 'pending'
              step.progress = 0
              step.errorMessage = `Retry ${retryCount}/${maxRetries}: ${stepError instanceof Error ? stepError.message : 'Unknown error'}`
              
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
            }
          }
        }
      }

      // Mark execution as completed
      execution.status = 'completed'
      execution.endTime = new Date()
      execution.executionTime = execution.endTime.getTime() - execution.startTime.getTime()

      // Update pipeline last run
      pipeline.lastRun = new Date()

    } catch (err) {
      execution.status = 'failed'
      execution.endTime = new Date()
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during pipeline execution'
      execution.errorMessage = errorMessage
      error.value = errorMessage
      
      // Log detailed error information
      console.error('Pipeline execution failed:', {
        executionId: execution.id,
        pipelineId: pipeline.id,
        datasetId: dataset.id,
        error: err,
        failedStep: execution.steps.find(s => s.status === 'failed')
      })
    } finally {
      isExecuting.value = false
      executionHistory.value.push({ ...execution })
      pipeline.executionHistory.push({ ...execution })
    }

    return execution
  }

  const executeStep = async (step: IPipelineStep, inputData: any, config?: IPipelineConfig): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Validate input data
      if (!inputData) {
        reject(new Error(`No input data provided for step: ${step.name}`))
        return
      }

      // Update step status
      step.status = 'running'
      step.startTime = new Date()
      step.inputData = inputData
      step.progress = 0
      step.errorMessage = undefined

      const duration = step.metadata?.estimatedDuration || 2000
      const timeout = config?.timeout || 30000
      const progressInterval = duration / 20 // Update progress 20 times during execution

      // Set up timeout
      const timeoutId = setTimeout(() => {
        clearInterval(interval)
        step.status = 'failed'
        step.progress = 0
        step.endTime = new Date()
        step.errorMessage = `Step timed out after ${timeout}ms`
        reject(new Error(`Step ${step.name} timed out after ${timeout}ms`))
      }, timeout)

      const interval = setInterval(() => {
        step.progress = Math.min(step.progress + 5, 95)
      }, progressInterval)

      // Simulate step execution with error scenarios
      setTimeout(() => {
        clearInterval(interval)
        clearTimeout(timeoutId)
        
        try {
          // Simulate random failures for demonstration (5% chance)
          if (Math.random() < 0.05) {
            throw new Error(`Simulated failure in ${step.name} step`)
          }

          // Execute step logic based on type
          let outputData: any

          switch (step.stepType) {
            case 'extract':
              outputData = extractData(inputData, step)
              break
            case 'load':
              outputData = loadData(inputData, step)
              break
            case 'transform':
              outputData = transformData(inputData, step)
              break
            default:
              throw new Error(`Unknown step type: ${step.stepType}`)
          }

          // Complete step
          step.status = 'completed'
          step.progress = 100
          step.endTime = new Date()
          step.outputData = outputData

          resolve()
        } catch (err) {
          step.status = 'failed'
          step.progress = 0
          step.endTime = new Date()
          
          const errorMessage = err instanceof Error ? err.message : 'Step execution failed'
          step.errorMessage = errorMessage
          
          // Log step-specific error details
          console.error(`Step ${step.name} failed:`, {
            stepId: step.id,
            stepType: step.stepType,
            error: err,
            inputDataSize: JSON.stringify(inputData).length,
            duration: step.endTime.getTime() - (step.startTime?.getTime() || 0)
          })
          
          reject(new Error(errorMessage))
        }
      }, duration)
    })
  }

  // Step execution logic with enhanced error handling
  const extractData = (inputData: any, step: IPipelineStep) => {
    // Validate input data structure
    if (!Array.isArray(inputData)) {
      throw new Error('Extract step requires input data to be an array')
    }

    if (inputData.length === 0) {
      throw new Error('Extract step cannot process empty dataset')
    }

    // Validate data consistency
    const firstRecord = inputData[0]
    if (!firstRecord || typeof firstRecord !== 'object') {
      throw new Error('Extract step requires input data to contain valid objects')
    }

    const expectedKeys = Object.keys(firstRecord)
    for (let i = 1; i < inputData.length; i++) {
      const record = inputData[i]
      if (!record || typeof record !== 'object') {
        throw new Error(`Extract step: Invalid record at index ${i}`)
      }
      
      const recordKeys = Object.keys(record)
      if (recordKeys.length !== expectedKeys.length || !expectedKeys.every(key => recordKeys.includes(key))) {
        console.warn(`Extract step: Inconsistent record structure at index ${i}`)
      }
    }

    return {
      extractedRecords: inputData.length,
      data: inputData,
      metadata: {
        extractedAt: new Date().toISOString(),
        recordCount: inputData.length,
        dataTypes: expectedKeys.reduce((acc, key) => {
          acc[key] = typeof firstRecord[key]
          return acc
        }, {} as Record<string, string>),
        stepId: step.id,
        validation: {
          hasConsistentStructure: true,
          totalRecords: inputData.length,
          validRecords: inputData.length
        }
      }
    }
  }

  const loadData = (inputData: any, step: IPipelineStep) => {
    // Validate extracted data structure
    if (!inputData || !inputData.data || !Array.isArray(inputData.data)) {
      throw new Error('Load step requires valid extracted data with data array')
    }

    if (!inputData.metadata || !inputData.metadata.recordCount) {
      throw new Error('Load step requires metadata from extract step')
    }

    const { data, metadata } = inputData
    
    // Simulate load validation
    if (data.length !== metadata.recordCount) {
      throw new Error(`Load step: Data count mismatch. Expected ${metadata.recordCount}, got ${data.length}`)
    }

    // Simulate batch processing
    const batchSize = 500
    const batches = Math.ceil(data.length / batchSize)
    
    // Simulate potential load failures
    if (data.length > 10000) {
      throw new Error('Load step: Dataset too large for processing (max 10,000 records)')
    }

    return {
      loadedRecords: data.length,
      data: data,
      metadata: {
        ...metadata,
        loadedAt: new Date().toISOString(),
        batchSize: Math.min(data.length, batchSize),
        batches: batches,
        stepId: step.id,
        loadValidation: {
          recordsProcessed: data.length,
          batchesProcessed: batches,
          loadTime: new Date().toISOString()
        }
      }
    }
  }

  const transformData = (inputData: any, step: IPipelineStep) => {
    // Validate loaded data structure
    if (!inputData || !inputData.data || !Array.isArray(inputData.data)) {
      throw new Error('Transform step requires valid loaded data with data array')
    }

    if (!inputData.metadata || !inputData.metadata.loadedAt) {
      throw new Error('Transform step requires metadata from load step')
    }

    const { data, metadata } = inputData

    // Simulate transformation validation
    if (data.length === 0) {
      throw new Error('Transform step: No data to transform')
    }

    try {
      const transformedData = data.map((record: any, index: number) => {
        // Validate each record before transformation
        if (!record || typeof record !== 'object') {
          throw new Error(`Transform step: Invalid record at index ${index}`)
        }

        return {
          ...record,
          id: record.id || index + 1,
          processedAt: new Date().toISOString(),
          recordHash: `hash_${Math.random().toString(36).substr(2, 9)}`,
          transformationVersion: '1.0.0'
        }
      })

      // Validate transformation results
      if (transformedData.length !== data.length) {
        throw new Error(`Transform step: Output count mismatch. Expected ${data.length}, got ${transformedData.length}`)
      }

      return {
        transformedRecords: transformedData.length,
        data: transformedData,
        metadata: {
          ...metadata,
          transformedAt: new Date().toISOString(),
          transformations: ['add_id', 'add_timestamp', 'add_hash', 'add_version'],
          outputSchema: Object.keys(transformedData[0] || {}),
          stepId: step.id,
          transformValidation: {
            inputRecords: data.length,
            outputRecords: transformedData.length,
            transformationSuccess: true,
            addedFields: ['processedAt', 'recordHash', 'transformationVersion']
          }
        }
      }
    } catch (transformError) {
      throw new Error(`Transform step failed: ${transformError instanceof Error ? transformError.message : 'Unknown transformation error'}`)
    }
  }

  const cancelExecution = () => {
    if (currentExecution.value && isExecuting.value) {
      currentExecution.value.status = 'cancelled'
      currentExecution.value.endTime = new Date()
      isExecuting.value = false
    }
  }

  const retryExecution = async () => {
    if (currentExecution.value && currentExecution.value.status === 'failed') {
      const datasetId = currentExecution.value.inputDataset.id
      await executePipeline(datasetId)
    }
  }

  const retryFailedStep = async (stepId: string) => {
    if (!currentExecution.value) {
      throw new Error('No current execution to retry step from')
    }

    const stepIndex = currentExecution.value.steps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) {
      throw new Error(`Step with id ${stepId} not found`)
    }

    const step = currentExecution.value.steps[stepIndex]
    if (step.status !== 'failed') {
      throw new Error(`Step ${step.name} is not in failed state`)
    }

    // Get input data for the step
    const inputData = stepIndex === 0 
      ? currentExecution.value.inputDataset.sampleData 
      : currentExecution.value.steps[stepIndex - 1].outputData

    if (!inputData) {
      throw new Error(`No input data available for step ${step.name}`)
    }

    try {
      // Reset step state
      step.status = 'pending'
      step.progress = 0
      step.errorMessage = undefined
      step.startTime = undefined
      step.endTime = undefined
      step.outputData = undefined

      // Execute the step
      await executeStep(step, inputData, activePipeline.value?.configuration)

      // If this was the last step or all subsequent steps are completed, mark execution as completed
      const remainingSteps = currentExecution.value.steps.slice(stepIndex + 1)
      if (remainingSteps.length === 0 || remainingSteps.every(s => s.status === 'completed')) {
        currentExecution.value.status = 'completed'
        currentExecution.value.endTime = new Date()
        currentExecution.value.executionTime = currentExecution.value.endTime.getTime() - currentExecution.value.startTime.getTime()
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Step retry failed'
      step.errorMessage = errorMessage
      error.value = errorMessage
      throw err
    }
  }

  const recoverFromError = async (recoveryStrategy: 'retry' | 'skip' | 'restart') => {
    if (!currentExecution.value) {
      throw new Error('No current execution to recover from')
    }

    const failedStep = currentExecution.value.steps.find(s => s.status === 'failed')
    if (!failedStep) {
      throw new Error('No failed step found to recover from')
    }

    switch (recoveryStrategy) {
      case 'retry':
        await retryFailedStep(failedStep.id)
        break
      
      case 'skip':
        // Mark failed step as skipped and continue with next steps
        failedStep.status = 'completed' // Mark as completed to allow continuation
        failedStep.progress = 100
        failedStep.endTime = new Date()
        failedStep.outputData = failedStep.inputData // Pass input as output
        failedStep.errorMessage = 'Step was skipped due to error recovery'
        
        // Continue with remaining steps
        const stepIndex = currentExecution.value.steps.findIndex(s => s.id === failedStep.id)
        for (let i = stepIndex + 1; i < currentExecution.value.steps.length; i++) {
          const nextStep = currentExecution.value.steps[i]
          if (nextStep.status === 'pending') {
            const inputData = currentExecution.value.steps[i - 1].outputData
            try {
              await executeStep(nextStep, inputData, activePipeline.value?.configuration)
            } catch (err) {
              // If another step fails, stop recovery
              break
            }
          }
        }
        break
      
      case 'restart':
        await executePipeline(currentExecution.value.inputDataset.id)
        break
      
      default:
        throw new Error(`Unknown recovery strategy: ${recoveryStrategy}`)
    }
  }

  const validateExecution = (execution: IPipelineExecution): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!execution.id) {
      errors.push('Execution ID is required')
    }

    if (!execution.pipelineId) {
      errors.push('Pipeline ID is required')
    }

    if (!execution.startTime) {
      errors.push('Start time is required')
    }

    if (!execution.inputDataset) {
      errors.push('Input dataset is required')
    }

    if (!execution.steps || execution.steps.length === 0) {
      errors.push('Execution must have at least one step')
    }

    if (execution.status === 'completed' && !execution.endTime) {
      errors.push('Completed execution must have end time')
    }

    if (execution.status === 'completed' && execution.steps.some(s => s.status !== 'completed')) {
      errors.push('Completed execution must have all steps completed')
    }

    if (execution.status === 'failed' && !execution.errorMessage && !execution.steps.some(s => s.status === 'failed')) {
      errors.push('Failed execution must have error message or failed step')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const getRecoveryOptions = (execution: IPipelineExecution) => {
    if (!execution || execution.status !== 'failed') {
      return []
    }

    const failedStep = execution.steps.find(s => s.status === 'failed')
    if (!failedStep) {
      return []
    }

    const options = [
      {
        strategy: 'retry' as const,
        label: 'Retry Failed Step',
        description: `Retry the ${failedStep.name} step that failed`,
        risk: 'low'
      },
      {
        strategy: 'restart' as const,
        label: 'Restart Pipeline',
        description: 'Start the entire pipeline from the beginning',
        risk: 'medium'
      }
    ]

    // Only offer skip option if it's not the last step
    const stepIndex = execution.steps.findIndex(s => s.id === failedStep.id)
    if (stepIndex < execution.steps.length - 1) {
      options.splice(1, 0, {
        strategy: 'skip' as const,
        label: 'Skip Failed Step',
        description: `Skip the ${failedStep.name} step and continue with remaining steps`,
        risk: 'high'
      })
    }

    return options
  }

  const clearHistory = () => {
    executionHistory.value = []
    if (activePipeline.value) {
      activePipeline.value.executionHistory = []
    }
  }

  const getExecutionById = (id: string) => {
    return executionHistory.value.find(exec => exec.id === id) || null
  }

  return {
    // State
    pipelines,
    currentExecution,
    isExecuting,
    executionHistory,
    error,
    sampleDatasets,

    // Getters
    activePipeline,
    currentStep,
    executionProgress,
    lastExecution,

    // Actions
    initializePipeline,
    executePipeline,
    cancelExecution,
    retryExecution,
    retryFailedStep,
    recoverFromError,
    validateExecution,
    getRecoveryOptions,
    clearHistory,
    getExecutionById
  }
})