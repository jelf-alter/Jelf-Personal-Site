import { ref, computed, watch } from 'vue'
import { useELTPipelineStore } from '@/stores/eltPipeline'
import { eltPipelineService } from '@/services/eltPipeline'
import { useWebSocket } from './useWebSocket'
import type { 
  IPipelineExecution, 
  IDataset, 
  IPipelineConfig
} from '@/types'

export function useELTPipeline() {
  const store = useELTPipelineStore()
  const webSocket = useWebSocket()
  
  // Local state
  const isInitialized = ref(false)
  const selectedDataset = ref<IDataset | null>(null)
  const customConfig = ref<Partial<IPipelineConfig>>({})

  // Initialize pipeline and WebSocket connection
  const initialize = async () => {
    if (isInitialized.value) return

    try {
      // Initialize pipeline store
      store.initializePipeline()
      
      // Connect to WebSocket for real-time updates
      if (!webSocket.isConnected.value) {
        webSocket.connect()
      }
      
      // Subscribe to pipeline updates
      webSocket.subscribe('pipeline')
      
      // Set up WebSocket message handling
      webSocket.on('pipeline_update', handlePipelineUpdate)
      
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to initialize ELT pipeline:', error)
      throw error
    }
  }

  // Handle real-time pipeline updates from WebSocket
  const handlePipelineUpdate = (message: any) => {
    if (message.type === 'pipeline_update' && store.currentExecution) {
      const { stepId, progress, status, data } = message.payload || {}
      
      const step = store.currentExecution.steps.find((s: any) => s.id === stepId)
      if (step) {
        step.progress = progress || step.progress
        step.status = status || step.status
        
        if (data) {
          if (status === 'completed') {
            step.outputData = data
            step.endTime = new Date()
          } else if (status === 'failed') {
            step.errorMessage = data.error || 'Step failed'
            step.endTime = new Date()
          }
        }
      }
    }
  }

  // Execute pipeline with selected dataset
  const executePipeline = async (datasetId?: string, config?: Partial<IPipelineConfig>) => {
    const targetDatasetId = datasetId || selectedDataset.value?.id
    if (!targetDatasetId) {
      throw new Error('No dataset selected for pipeline execution')
    }

    const mergedConfig = { ...customConfig.value, ...config }
    
    try {
      const execution = await store.executePipeline(targetDatasetId, mergedConfig)
      return execution
    } catch (error) {
      console.error('Pipeline execution failed:', error)
      throw error
    }
  }

  // Select dataset for pipeline execution
  const selectDataset = (dataset: IDataset) => {
    selectedDataset.value = dataset
  }

  // Update custom configuration
  const updateConfig = (config: Partial<IPipelineConfig>) => {
    customConfig.value = { ...customConfig.value, ...config }
  }

  // Reset configuration to defaults
  const resetConfig = () => {
    customConfig.value = {}
  }

  // Cancel current execution
  const cancelExecution = () => {
    store.cancelExecution()
  }

  // Retry failed execution
  const retryExecution = async () => {
    await store.retryExecution()
  }

  // Get step details with enhanced information
  const getStepDetails = (stepId: string) => {
    if (!store.currentExecution) return null
    
    const step = store.currentExecution.steps.find((s: any) => s.id === stepId)
    if (!step) return null

    return {
      ...step,
      duration: step.endTime && step.startTime 
        ? step.endTime.getTime() - step.startTime.getTime() 
        : 0,
      inputSize: step.inputData ? JSON.stringify(step.inputData).length : 0,
      outputSize: step.outputData ? JSON.stringify(step.outputData).length : 0,
      isActive: step.status === 'running',
      hasError: step.status === 'failed',
      isCompleted: step.status === 'completed'
    }
  }

  // Get execution summary
  const getExecutionSummary = computed(() => {
    if (!store.currentExecution) return null

    const execution = store.currentExecution
    const completedSteps = execution.steps.filter((s: any) => s.status === 'completed').length
    const failedSteps = execution.steps.filter((s: any) => s.status === 'failed').length
    const totalSteps = execution.steps.length

    return {
      id: execution.id,
      status: execution.status,
      progress: store.executionProgress,
      completedSteps,
      failedSteps,
      totalSteps,
      inputRecords: execution.inputDataset.sampleData?.length || 0,
      outputRecords: execution.outputData?.transformedRecords || 0,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.executionTime || 0,
      hasError: execution.status === 'failed',
      isRunning: execution.status === 'running',
      isCompleted: execution.status === 'completed'
    }
  })

  // Validate dataset before execution
  const validateDataset = (dataset: IDataset) => {
    return eltPipelineService.validateDataset(dataset)
  }

  // Estimate execution time
  const estimateExecutionTime = (dataset: IDataset, config?: Partial<IPipelineConfig>) => {
    return eltPipelineService.estimateExecutionTime(dataset, config)
  }

  // Generate sample dataset
  const generateSampleDataset = (type: 'users' | 'sales' | 'logs', recordCount: number = 10) => {
    return eltPipelineService.generateSampleDataset(type, recordCount)
  }

  // Format results for display
  const formatResults = (execution: IPipelineExecution) => {
    return eltPipelineService.formatExecutionResults(execution)
  }

  // Watch for execution completion to emit events
  watch(
    () => store.currentExecution?.status,
    (newStatus, oldStatus) => {
      if (oldStatus === 'running' && newStatus === 'completed') {
        // Emit completion event for parent components
        console.log('Pipeline execution completed successfully')
      } else if (oldStatus === 'running' && newStatus === 'failed') {
        // Emit error event for parent components
        console.log('Pipeline execution failed')
      }
    }
  )

  // Cleanup function
  const cleanup = () => {
    webSocket.off('pipeline_update', handlePipelineUpdate)
    webSocket.unsubscribe('pipeline')
  }

  return {
    // State
    isInitialized,
    selectedDataset,
    customConfig,
    
    // Store state (reactive) - ensure proper reactivity
    pipelines: computed(() => store.pipelines),
    currentExecution: computed(() => store.currentExecution),
    isExecuting: computed(() => store.isExecuting),
    executionHistory: computed(() => store.executionHistory),
    error: computed(() => store.error),
    sampleDatasets: computed(() => store.sampleDatasets),
    
    // Computed
    activePipeline: store.activePipeline,
    currentStep: store.currentStep,
    executionProgress: store.executionProgress,
    lastExecution: store.lastExecution,
    executionSummary: getExecutionSummary,
    
    // Actions
    initialize,
    executePipeline,
    selectDataset,
    updateConfig,
    resetConfig,
    cancelExecution,
    retryExecution,
    getStepDetails,
    validateDataset,
    estimateExecutionTime,
    generateSampleDataset,
    formatResults,
    cleanup
  }
}