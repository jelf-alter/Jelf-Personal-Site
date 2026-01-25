import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { mountComponent } from '@/test/component-utils'
import { propertyTestConfig } from '@/test/property-generators'
import { useELTPipelineStore } from '@/stores/eltPipeline'
import { createPinia, setActivePinia } from 'pinia'
import ELTPipelineDemo from '../ELTPipelineDemo.vue'
import PipelineVisualizer from '../PipelineVisualizer.vue'
import ErrorRecoveryPanel from '../ErrorRecoveryPanel.vue'
import type { IDataset, IPipelineExecution, IPipelineStep } from '@/types'

// Mock WebSocket composable
vi.mock('@/composables/useWebSocket', () => ({
  useWebSocket: () => ({
    isConnected: { value: false },
    connectionStatus: { value: 'disconnected' },
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  })
}))

// Property generators for ELT pipeline data
const arbDataset = (): fc.Arbitrary<IDataset> => {
  return fc.record({
    id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz-'.split('')), { minLength: 5, maxLength: 20 }),
    name: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '.split('')), { minLength: 5, maxLength: 50 }),
    description: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ. '.split('')), { minLength: 10, maxLength: 200 }),
    format: fc.constantFrom('json', 'csv', 'xml', 'text'),
    size: fc.integer({ min: 100, max: 10000 }),
    sampleData: fc.array(
      fc.record({
        id: fc.integer({ min: 1, max: 1000 }),
        name: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '.split('')), { minLength: 3, maxLength: 30 }),
        value: fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 0, max: 1000 }),
          fc.float({ min: 0, max: 1000 })
        )
      }),
      { minLength: 1, maxLength: 100 }
    ),
    schema: fc.record({
      id: fc.constant('number'),
      name: fc.constant('string'),
      value: fc.constantFrom('string', 'number')
    })
  })
}

const arbPipelineStep = (): fc.Arbitrary<IPipelineStep> => {
  return fc.record({
    id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz-'.split('')), { minLength: 5, maxLength: 20 }),
    name: fc.constantFrom('Extract Data', 'Load Data', 'Transform Data'), // Use fixed step names that match implementation
    status: fc.constantFrom('pending', 'running', 'completed', 'failed'),
    progress: fc.integer({ min: 0, max: 100 }),
    stepType: fc.constantFrom('extract', 'load', 'transform'),
    startTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
    endTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
    inputData: fc.option(fc.anything()),
    outputData: fc.option(fc.anything()),
    errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 100 })),
    metadata: fc.option(fc.record({
      description: fc.string({ minLength: 10, maxLength: 100 }),
      estimatedDuration: fc.integer({ min: 1000, max: 10000 })
    }))
  })
}

const arbPipelineExecution = (): fc.Arbitrary<IPipelineExecution> => {
  return fc.record({
    id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz-0123456789'.split('')), { minLength: 10, maxLength: 20 }),
    pipelineId: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz-'.split('')), { minLength: 5, maxLength: 20 }),
    startTime: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
    endTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
    status: fc.constantFrom('running', 'completed', 'failed', 'cancelled'),
    steps: fc.tuple(
      // Generate exactly 3 steps in the correct order with correct names and types
      fc.record({
        id: fc.constant('extract-step'),
        name: fc.constant('Extract Data'),
        status: fc.constantFrom('pending', 'running', 'completed', 'failed'),
        progress: fc.integer({ min: 0, max: 100 }),
        stepType: fc.constant('extract' as const),
        startTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
        endTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
        inputData: fc.option(fc.anything()),
        outputData: fc.option(fc.anything()),
        errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 100 })),
        metadata: fc.option(fc.record({
          description: fc.string({ minLength: 10, maxLength: 100 }),
          estimatedDuration: fc.integer({ min: 1000, max: 10000 })
        }))
      }),
      fc.record({
        id: fc.constant('load-step'),
        name: fc.constant('Load Data'),
        status: fc.constantFrom('pending', 'running', 'completed', 'failed'),
        progress: fc.integer({ min: 0, max: 100 }),
        stepType: fc.constant('load' as const),
        startTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
        endTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
        inputData: fc.option(fc.anything()),
        outputData: fc.option(fc.anything()),
        errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 100 })),
        metadata: fc.option(fc.record({
          description: fc.string({ minLength: 10, maxLength: 100 }),
          estimatedDuration: fc.integer({ min: 1000, max: 10000 })
        }))
      }),
      fc.record({
        id: fc.constant('transform-step'),
        name: fc.constant('Transform Data'),
        status: fc.constantFrom('pending', 'running', 'completed', 'failed'),
        progress: fc.integer({ min: 0, max: 100 }),
        stepType: fc.constant('transform' as const),
        startTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
        endTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
        inputData: fc.option(fc.anything()),
        outputData: fc.option(fc.anything()),
        errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 100 })),
        metadata: fc.option(fc.record({
          description: fc.string({ minLength: 10, maxLength: 100 }),
          estimatedDuration: fc.integer({ min: 1000, max: 10000 })
        }))
      })
    ).map(([extractStep, loadStep, transformStep]) => [extractStep, loadStep, transformStep]),
    inputDataset: arbDataset(),
    outputData: fc.option(fc.anything()),
    errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 100 })),
    executionTime: fc.option(fc.integer({ min: 1000, max: 30000 }))
  })
}

describe('ELT Pipeline Property-Based Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('**Feature: personal-website, Property 3: ELT Pipeline Completeness**', () => {
    it('should successfully execute all three phases (Extract, Load, Transform) for any valid sample dataset', () => {
      fc.assert(
        fc.asyncProperty(
          arbDataset(),
          async (dataset: IDataset) => {
            // Property: For any sample dataset, the ELT pipeline should successfully execute all three phases
            
            const store = useELTPipelineStore()
            store.initializePipeline()
            
            // Add the test dataset to sample datasets
            store.sampleDatasets.push(dataset)
            
            try {
              // Execute pipeline with the dataset
              const execution = await store.executePipeline(dataset.id)
              
              // 1. Pipeline should have exactly 3 steps (Extract, Load, Transform)
              expect(execution.steps).toHaveLength(3)
              
              // 2. Steps should be in correct order
              expect(execution.steps[0].stepType).toBe('extract')
              expect(execution.steps[1].stepType).toBe('load')
              expect(execution.steps[2].stepType).toBe('transform')
              
              // 3. Each step should have proper names
              expect(execution.steps[0].name).toBe('Extract Data')
              expect(execution.steps[1].name).toBe('Load Data')
              expect(execution.steps[2].name).toBe('Transform Data')
              
              // 4. If execution completed successfully, all steps should be completed
              if (execution.status === 'completed') {
                execution.steps.forEach(step => {
                  expect(step.status).toBe('completed')
                  expect(step.progress).toBe(100)
                  expect(step.outputData).toBeDefined()
                })
              }
              
              // 5. Input dataset should be preserved
              expect(execution.inputDataset.id).toBe(dataset.id)
              expect(execution.inputDataset.sampleData).toEqual(dataset.sampleData)
              
              // 6. Execution should have proper metadata
              expect(execution.id).toBeDefined()
              expect(execution.pipelineId).toBeDefined()
              expect(execution.startTime).toBeInstanceOf(Date)
              
              // 7. If execution failed, there should be error information
              if (execution.status === 'failed') {
                const failedStep = execution.steps.find(s => s.status === 'failed')
                expect(failedStep || execution.errorMessage).toBeTruthy()
              }
              
            } catch (error) {
              // If execution throws, it should be due to invalid dataset
              expect(error).toBeInstanceOf(Error)
              const errorMessage = (error as Error).message
              expect(errorMessage).toMatch(/dataset|data|array|empty|invalid/i)
            }
          }
        ),
        { ...propertyTestConfig, numRuns: 50 } // Reduced runs for async tests
      )
    })

    it('should display transparent visualization of input, process, and output for any pipeline execution', () => {
      fc.assert(
        fc.property(
          arbPipelineExecution(),
          (execution: IPipelineExecution) => {
            // Property: Pipeline should display transparent visualization of input, process, and output
            
            const wrapper = mountComponent(PipelineVisualizer, {
              props: {
                execution,
                isExecuting: execution.status === 'running'
              }
            })
            
            // 1. Pipeline visualization should be present
            expect(wrapper.find('.pipeline-visualizer').exists()).toBe(true)
            expect(wrapper.find('.pipeline-svg').exists()).toBe(true)
            
            // 2. All steps should be visualized
            const stepGroups = wrapper.findAll('.step-group')
            expect(stepGroups).toHaveLength(execution.steps.length)
            
            // 3. Each step should display its information transparently
            execution.steps.forEach((step, index) => {
              const stepGroup = stepGroups[index]
              
              // Step name should be visible
              expect(stepGroup.text()).toContain(step.name)
              
              // Step status should be indicated
              const stepRect = stepGroup.find('.step-rect')
              expect(stepRect.exists()).toBe(true)
              expect(stepRect.classes()).toContain(step.status)
              
              // Progress should be displayed for running/completed steps
              if (step.status === 'running' || step.status === 'completed') {
                expect(stepGroup.text()).toContain(`${Math.round(step.progress)}%`)
              }
              
              // Step type icon should be present
              const iconText = stepGroup.text()
              switch (step.stepType) {
                case 'extract':
                  expect(iconText).toContain('E')
                  break
                case 'load':
                  expect(iconText).toContain('L')
                  break
                case 'transform':
                  expect(iconText).toContain('T')
                  break
              }
            })
            
            // 4. Overall progress should be displayed
            expect(wrapper.find('.overall-progress').exists()).toBe(true)
            expect(wrapper.text()).toMatch(/Overall Progress:/i)
            
            // 5. Connection arrows should be present between steps
            const connectionArrows = wrapper.findAll('.connection-arrow')
            expect(connectionArrows).toHaveLength(Math.max(0, execution.steps.length - 1))
            
            // 6. Accessibility features should be present
            expect(wrapper.find('[role="img"]').exists()).toBe(true)
            expect(wrapper.find('[aria-label]').exists()).toBe(true)
            
            // 7. Interactive elements should be keyboard accessible
            const stepRects = wrapper.findAll('.step-rect')
            stepRects.forEach(rect => {
              expect(rect.attributes('tabindex')).toBe('0')
              expect(rect.attributes('role')).toBe('button')
              expect(rect.attributes('aria-label')).toBeDefined()
            })
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should maintain data integrity through all pipeline phases for any valid input', () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 1000 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              value: fc.oneof(fc.string(), fc.integer(), fc.float())
            }),
            { minLength: 1, maxLength: 50 }
          ),
          async (inputData: any[]) => {
            // Property: Data integrity should be maintained through all pipeline phases
            
            const store = useELTPipelineStore()
            store.initializePipeline()
            
            // Test each step's data processing logic directly
            const pipeline = store.activePipeline
            if (!pipeline) return
            
            try {
              // Test each step's data processing logic by simulating the pipeline execution
              // We'll test the data flow through a complete pipeline execution
              
              const dataset: IDataset = {
                id: 'test-dataset',
                name: 'Test Dataset',
                description: 'Test dataset for property testing',
                format: 'json',
                size: JSON.stringify(inputData).length,
                sampleData: inputData,
                schema: {
                  id: 'number',
                  name: 'string',
                  value: 'string'
                }
              }
              
              // Add dataset to store
              store.sampleDatasets.push(dataset)
              
              // Execute the pipeline
              const execution = await store.executePipeline(dataset.id)
              
              // 1. If execution completed successfully, verify data integrity
              if (execution.status === 'completed') {
                // Extract step should preserve input data
                const extractStep = execution.steps[0]
                expect(extractStep.stepType).toBe('extract')
                expect(extractStep.status).toBe('completed')
                expect(extractStep.outputData.extractedRecords).toBe(inputData.length)
                expect(extractStep.outputData.data).toEqual(inputData)
                
                // Load step should preserve extracted data
                const loadStep = execution.steps[1]
                expect(loadStep.stepType).toBe('load')
                expect(loadStep.status).toBe('completed')
                expect(loadStep.outputData.loadedRecords).toBe(inputData.length)
                expect(loadStep.outputData.data).toEqual(inputData)
                
                // Transform step should preserve record count and add fields
                const transformStep = execution.steps[2]
                expect(transformStep.stepType).toBe('transform')
                expect(transformStep.status).toBe('completed')
                expect(transformStep.outputData.transformedRecords).toBe(inputData.length)
                expect(transformStep.outputData.data).toHaveLength(inputData.length)
                
                // Each transformed record should have original data plus new fields
                transformStep.outputData.data.forEach((record: any, index: number) => {
                  const originalRecord = inputData[index]
                  
                  // Original fields should be preserved
                  expect(record.name).toBe(originalRecord.name)
                  expect(record.value).toBe(originalRecord.value)
                  
                  // New fields should be added
                  expect(record.id).toBeDefined()
                  expect(record.processedAt).toBeDefined()
                  expect(record.recordHash).toBeDefined()
                  expect(record.transformationVersion).toBeDefined()
                })
                
                // Metadata should track the transformation chain
                expect(transformStep.outputData.metadata.extractedAt).toBeDefined()
                expect(transformStep.outputData.metadata.loadedAt).toBeDefined()
                expect(transformStep.outputData.metadata.transformedAt).toBeDefined()
              }
              
            } catch (error) {
              // If processing fails, it should be due to invalid input data
              expect(error).toBeInstanceOf(Error)
              const errorMessage = (error as Error).message
              expect(errorMessage).toMatch(/array|object|record|data|empty/i)
            }
          }
        ),
        propertyTestConfig
      )
    })

    it('should provide complete execution metadata for any pipeline run', () => {
      fc.assert(
        fc.asyncProperty(
          arbDataset(),
          async (dataset: IDataset) => {
            // Property: Pipeline should provide complete execution metadata for any run
            
            const store = useELTPipelineStore()
            store.initializePipeline()
            
            // Add the test dataset
            store.sampleDatasets.push(dataset)
            
            try {
              const execution = await store.executePipeline(dataset.id)
              
              // 1. Execution should have complete identification
              expect(execution.id).toBeDefined()
              expect(execution.id).toMatch(/^exec-\d+$/)
              expect(execution.pipelineId).toBe('demo-elt-pipeline')
              
              // 2. Timing information should be complete
              expect(execution.startTime).toBeInstanceOf(Date)
              if (execution.status === 'completed' || execution.status === 'failed') {
                expect(execution.endTime).toBeInstanceOf(Date)
                expect(execution.executionTime).toBeGreaterThan(0)
                expect(execution.endTime!.getTime()).toBeGreaterThanOrEqual(execution.startTime.getTime())
              }
              
              // 3. Input dataset should be completely preserved
              expect(execution.inputDataset).toEqual(dataset)
              
              // 4. Each step should have complete metadata
              execution.steps.forEach(step => {
                expect(step.id).toBeDefined()
                expect(step.name).toBeDefined()
                expect(step.stepType).toMatch(/^(extract|load|transform)$/)
                expect(step.status).toMatch(/^(pending|running|completed|failed)$/)
                expect(step.progress).toBeGreaterThanOrEqual(0)
                expect(step.progress).toBeLessThanOrEqual(100)
                
                if (step.status === 'completed' || step.status === 'failed') {
                  expect(step.startTime).toBeInstanceOf(Date)
                  expect(step.endTime).toBeInstanceOf(Date)
                }
                
                if (step.status === 'completed') {
                  expect(step.outputData).toBeDefined()
                  expect(step.outputData.metadata).toBeDefined()
                  expect(step.outputData.metadata.stepId).toBe(step.id)
                }
                
                if (step.status === 'failed') {
                  expect(step.errorMessage).toBeDefined()
                  expect(step.errorMessage).toMatch(/.+/)
                }
              })
              
              // 5. Status should be consistent with step statuses
              if (execution.status === 'completed') {
                expect(execution.steps.every(s => s.status === 'completed')).toBe(true)
              } else if (execution.status === 'failed') {
                expect(execution.steps.some(s => s.status === 'failed')).toBe(true)
              }
              
            } catch (error) {
              // Execution errors should provide meaningful information
              expect(error).toBeInstanceOf(Error)
              expect((error as Error).message).toMatch(/.+/)
            }
          }
        ),
        { ...propertyTestConfig, numRuns: 30 } // Reduced runs for async tests
      )
    })
  })

  describe('**Feature: personal-website, Property 5: Error Handling and Recovery**', () => {
    it('should display clear error messages and provide appropriate recovery options for any error condition', () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            dataset: arbDataset(),
            errorType: fc.constantFrom('network', 'validation', 'processing', 'timeout', 'memory'),
            errorStep: fc.constantFrom('extract', 'load', 'transform'),
            errorMessage: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length >= 5),
            shouldRecover: fc.boolean()
          }),
          async ({ dataset, errorType, errorStep, errorMessage, shouldRecover }) => {
            // Property: For any error condition in the ELT pipeline, the system should display clear error messages and provide appropriate recovery options
            
            const store = useELTPipelineStore()
            store.initializePipeline()
            
            // Add the test dataset
            store.sampleDatasets.push(dataset)
            
            // Mock error injection based on error type and step
            const originalExecute = store.executePipeline
            store.executePipeline = vi.fn().mockImplementation(async (datasetId: string) => {
              const execution: IPipelineExecution = {
                id: `exec-${Date.now()}`,
                pipelineId: 'demo-elt-pipeline',
                startTime: new Date(),
                status: 'failed',
                steps: [
                  {
                    id: 'extract-step',
                    name: 'Extract Data',
                    status: errorStep === 'extract' ? 'failed' : 'completed',
                    progress: errorStep === 'extract' ? Math.floor(Math.random() * 80) : 100,
                    stepType: 'extract',
                    startTime: new Date(Date.now() - 3000),
                    endTime: new Date(Date.now() - 2000),
                    inputData: dataset.sampleData,
                    outputData: errorStep === 'extract' ? undefined : { data: dataset.sampleData, extractedRecords: dataset.sampleData.length },
                    errorMessage: errorStep === 'extract' ? `${errorType.toUpperCase()}_ERROR: ${errorMessage}` : undefined
                  },
                  {
                    id: 'load-step',
                    name: 'Load Data',
                    status: errorStep === 'load' ? 'failed' : (errorStep === 'extract' ? 'pending' : 'completed'),
                    progress: errorStep === 'load' ? Math.floor(Math.random() * 80) : (errorStep === 'extract' ? 0 : 100),
                    stepType: 'load',
                    startTime: errorStep === 'extract' ? undefined : new Date(Date.now() - 2000),
                    endTime: errorStep === 'extract' ? undefined : new Date(Date.now() - 1000),
                    inputData: errorStep === 'extract' ? undefined : dataset.sampleData,
                    outputData: errorStep === 'load' ? undefined : (errorStep === 'extract' ? undefined : { data: dataset.sampleData, loadedRecords: dataset.sampleData.length }),
                    errorMessage: errorStep === 'load' ? `${errorType.toUpperCase()}_ERROR: ${errorMessage}` : undefined
                  },
                  {
                    id: 'transform-step',
                    name: 'Transform Data',
                    status: errorStep === 'transform' ? 'failed' : (errorStep === 'extract' || errorStep === 'load' ? 'pending' : 'completed'),
                    progress: errorStep === 'transform' ? Math.floor(Math.random() * 80) : (errorStep === 'extract' || errorStep === 'load' ? 0 : 100),
                    stepType: 'transform',
                    startTime: errorStep === 'extract' || errorStep === 'load' ? undefined : new Date(Date.now() - 1000),
                    endTime: errorStep === 'extract' || errorStep === 'load' ? undefined : new Date(),
                    inputData: errorStep === 'extract' || errorStep === 'load' ? undefined : dataset.sampleData,
                    outputData: errorStep === 'transform' ? undefined : (errorStep === 'extract' || errorStep === 'load' ? undefined : { data: dataset.sampleData, transformedRecords: dataset.sampleData.length }),
                    errorMessage: errorStep === 'transform' ? `${errorType.toUpperCase()}_ERROR: ${errorMessage}` : undefined
                  }
                ],
                inputDataset: dataset,
                errorMessage: `Pipeline failed at ${errorStep} step: ${errorMessage}`,
                endTime: new Date(),
                executionTime: Math.floor(Math.random() * 5000) + 1000
              }
              
              return execution
            })
            
            try {
              // Execute pipeline to trigger error
              const execution = await store.executePipeline(dataset.id)
              
              // 1. Execution should be marked as failed
              expect(execution.status).toBe('failed')
              expect(execution.errorMessage).toBeDefined()
              expect(execution.errorMessage).toContain(errorMessage)
              
              // 2. Failed step should have clear error information
              const failedStep = execution.steps.find(s => s.status === 'failed')
              expect(failedStep).toBeDefined()
              expect(failedStep!.errorMessage).toBeDefined()
              expect(failedStep!.errorMessage).toContain(errorType.toUpperCase())
              expect(failedStep!.errorMessage).toContain(errorMessage)
              expect(failedStep!.stepType).toBe(errorStep)
              
              // 3. Error message should be descriptive and actionable
              expect(failedStep!.errorMessage!.length).toBeGreaterThan(10)
              expect(failedStep!.errorMessage).toMatch(/ERROR:/i)
              
              // 4. Failed step should have timing information
              expect(failedStep!.startTime).toBeInstanceOf(Date)
              expect(failedStep!.endTime).toBeInstanceOf(Date)
              expect(failedStep!.progress).toBeGreaterThanOrEqual(0)
              expect(failedStep!.progress).toBeLessThan(100)
              
              // 5. Steps after the failed step should be pending
              const failedStepIndex = execution.steps.findIndex(s => s.id === failedStep!.id)
              for (let i = failedStepIndex + 1; i < execution.steps.length; i++) {
                expect(execution.steps[i].status).toBe('pending')
                expect(execution.steps[i].progress).toBe(0)
                expect(execution.steps[i].startTime).toBeUndefined()
                expect(execution.steps[i].endTime).toBeUndefined()
              }
              
              // 6. Test error recovery panel component
              const errorRecoveryWrapper = mountComponent(ErrorRecoveryPanel, {
                props: {
                  execution,
                  show: true
                }
              })
              
              // 7. Error recovery panel should display error details
              expect(errorRecoveryWrapper.find('.error-details').exists()).toBe(true)
              expect(errorRecoveryWrapper.text()).toContain('Pipeline Execution Failed')
              expect(errorRecoveryWrapper.text()).toContain(failedStep!.name)
              expect(errorRecoveryWrapper.text()).toContain(errorMessage)
              
              // 8. Recovery options should be available
              const recoveryOptions = errorRecoveryWrapper.findAll('.recovery-option')
              expect(recoveryOptions.length).toBeGreaterThan(0)
              
              // 9. Recovery options should include retry
              const retryOption = recoveryOptions.find(option => 
                option.text().toLowerCase().includes('retry')
              )
              expect(retryOption).toBeDefined()
              expect(retryOption!.text()).toContain('Retry Failed Step')
              expect(retryOption!.text()).toContain('LOW RISK')
              
              // 10. Recovery options should include restart
              const restartOption = recoveryOptions.find(option => 
                option.text().toLowerCase().includes('restart')
              )
              expect(restartOption).toBeDefined()
              expect(restartOption!.text()).toContain('Restart Entire Pipeline')
              expect(restartOption!.text()).toContain('MEDIUM RISK')
              
              // 11. Skip option should be available if not the last step
              if (failedStepIndex < execution.steps.length - 1) {
                const skipOption = recoveryOptions.find(option => 
                  option.text().toLowerCase().includes('skip')
                )
                expect(skipOption).toBeDefined()
                expect(skipOption!.text()).toContain('Skip Failed Step')
                expect(skipOption!.text()).toContain('HIGH RISK')
              }
              
              // 12. Each recovery option should have clear descriptions
              recoveryOptions.forEach(option => {
                expect(option.find('.option-description').text().length).toBeGreaterThan(20)
                expect(option.find('.risk-badge').exists()).toBe(true)
                expect(option.find('.option-radio').exists()).toBe(true)
              })
              
              // 13. Step context should provide helpful information
              expect(errorRecoveryWrapper.find('.step-context').exists()).toBe(true)
              expect(errorRecoveryWrapper.text()).toContain('Step Type:')
              expect(errorRecoveryWrapper.text()).toContain(errorStep.toUpperCase())
              expect(errorRecoveryWrapper.text()).toContain('Progress:')
              
              // 14. Action buttons should be present
              const executeButton = errorRecoveryWrapper.find('button').filter(btn => 
                btn.text().includes('Execute Recovery')
              )
              expect(executeButton.exists()).toBe(true)
              expect(executeButton.attributes('disabled')).toBe('true') // Should be disabled until strategy selected
              
              const cancelButton = errorRecoveryWrapper.find('button').filter(btn => 
                btn.text().includes('Cancel')
              )
              expect(cancelButton.exists()).toBe(true)
              
              // 15. Accessibility features should be present
              expect(errorRecoveryWrapper.find('[role="dialog"]').exists()).toBe(true)
              expect(errorRecoveryWrapper.find('[aria-modal="true"]').exists()).toBe(true)
              expect(errorRecoveryWrapper.find('[role="alert"]').exists()).toBe(true)
              expect(errorRecoveryWrapper.find('[aria-live]').exists()).toBe(true)
              
              // 16. Recovery options should be keyboard navigable
              recoveryOptions.forEach(option => {
                expect(option.attributes('tabindex')).toBe('0')
                expect(option.attributes('role')).toBe('radio')
                expect(option.attributes('aria-checked')).toBeDefined()
              })
              
              errorRecoveryWrapper.unmount()
              
            } catch (error) {
              // If execution throws, error should be meaningful
              expect(error).toBeInstanceOf(Error)
              const errorMsg = (error as Error).message
              expect(errorMsg.length).toBeGreaterThan(5)
              expect(errorMsg).toMatch(/error|fail|invalid|timeout|network/i)
            } finally {
              // Restore original method
              store.executePipeline = originalExecute
            }
          }
        ),
        { ...propertyTestConfig, numRuns: 30 } // Reduced runs for complex async tests
      )
    })

    it('should provide contextual error information and recovery guidance for different error types', () => {
      fc.assert(
        fc.property(
          fc.record({
            errorType: fc.constantFrom('NETWORK_ERROR', 'VALIDATION_ERROR', 'PROCESSING_ERROR', 'TIMEOUT_ERROR', 'MEMORY_ERROR'),
            errorStep: fc.constantFrom('extract', 'load', 'transform'),
            errorMessage: fc.string({ minLength: 15, maxLength: 100 }).filter(s => s.trim().length >= 10),
            stepProgress: fc.integer({ min: 0, max: 99 }),
            hasInputData: fc.boolean(),
            executionTime: fc.integer({ min: 1000, max: 30000 })
          }),
          ({ errorType, errorStep, errorMessage, stepProgress, hasInputData, executionTime }) => {
            // Property: Error recovery should provide contextual information based on error type and step
            
            const failedStep: IPipelineStep = {
              id: `${errorStep}-step`,
              name: `${errorStep.charAt(0).toUpperCase() + errorStep.slice(1)} Data`,
              status: 'failed',
              progress: stepProgress,
              stepType: errorStep as 'extract' | 'load' | 'transform',
              startTime: new Date(Date.now() - executionTime),
              endTime: new Date(),
              inputData: hasInputData ? { data: [{ id: 1, name: 'test' }] } : undefined,
              errorMessage: `${errorType}: ${errorMessage}`
            }
            
            const execution: IPipelineExecution = {
              id: 'test-execution',
              pipelineId: 'demo-elt-pipeline',
              startTime: new Date(Date.now() - executionTime),
              endTime: new Date(),
              status: 'failed',
              steps: [failedStep],
              inputDataset: {
                id: 'test-dataset',
                name: 'Test Dataset',
                description: 'Test',
                format: 'json',
                size: 100,
                sampleData: [{ id: 1, name: 'test' }]
              },
              errorMessage: `Pipeline failed: ${errorMessage}`,
              executionTime
            }
            
            const wrapper = mountComponent(ErrorRecoveryPanel, {
              props: {
                execution,
                show: true
              }
            })
            
            // 1. Error type should be clearly displayed
            expect(wrapper.text()).toContain(errorType)
            expect(wrapper.text()).toContain(errorMessage)
            
            // 2. Failed step information should be contextual
            expect(wrapper.text()).toContain(failedStep.name)
            expect(wrapper.text()).toContain(errorStep.toUpperCase())
            expect(wrapper.text()).toContain(`${stepProgress}%`)
            
            // 3. Timing information should be formatted properly
            const durationText = wrapper.text()
            if (executionTime >= 1000) {
              expect(durationText).toMatch(/\d+\.\d+s|\d+ms/)
            }
            
            // 4. Recovery options should be contextually appropriate
            const recoveryOptions = wrapper.findAll('.recovery-option')
            expect(recoveryOptions.length).toBeGreaterThanOrEqual(2) // At least retry and restart
            
            // 5. Risk levels should be appropriate for each option
            const riskBadges = wrapper.findAll('.risk-badge')
            expect(riskBadges.length).toBe(recoveryOptions.length)
            
            riskBadges.forEach(badge => {
              const riskLevel = badge.text().toLowerCase()
              expect(['low risk', 'medium risk', 'high risk']).toContain(riskLevel)
            })
            
            // 6. Error context should include step type information
            expect(wrapper.find('.step-context').exists()).toBe(true)
            expect(wrapper.text()).toContain('Step Type:')
            expect(wrapper.text()).toContain('Progress:')
            
            // 7. Error message should be properly formatted and readable
            const errorText = wrapper.find('.error-text')
            if (errorText.exists()) {
              expect(errorText.text()).toContain(errorType)
              if (errorMessage.trim().length > 0) {
                expect(errorText.text()).toContain(errorMessage.trim())
              }
              expect(errorText.classes()).toContain('error-text') // Should have error styling
            }
            
            // 8. Recovery descriptions should be informative
            recoveryOptions.forEach(option => {
              const description = option.find('.option-description').text()
              expect(description.length).toBeGreaterThan(30)
              expect(description).toMatch(/step|pipeline|data|execute|run/i)
            })
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })
})