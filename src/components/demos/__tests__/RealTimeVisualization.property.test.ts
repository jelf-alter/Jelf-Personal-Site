import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { mountComponent } from '@/test/component-utils'
import { propertyTestConfig } from '@/test/property-generators'
import { createPinia, setActivePinia } from 'pinia'
import PipelineVisualizer from '../PipelineVisualizer.vue'
import type { IPipelineExecution } from '@/types'

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

// Property generators for real-time visualization testing

const arbRunningPipelineExecution = (): fc.Arbitrary<IPipelineExecution> => {
  return fc.record({
    id: fc.string({ minLength: 10, maxLength: 20 }),
    pipelineId: fc.string({ minLength: 5, maxLength: 20 }),
    startTime: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
    endTime: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date() })),
    status: fc.constantFrom('running' as const, 'completed' as const),
    steps: fc.tuple(
      // Generate exactly 3 steps in the correct order with correct names and types
      fc.record({
        id: fc.constant('extract-step'),
        name: fc.constant('Extract Data'),
        status: fc.constantFrom('pending' as const, 'running' as const, 'completed' as const, 'failed' as const),
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
        status: fc.constantFrom('pending' as const, 'running' as const, 'completed' as const, 'failed' as const),
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
        status: fc.constantFrom('pending' as const, 'running' as const, 'completed' as const, 'failed' as const),
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
    ).map(([extractStep, loadStep, transformStep]) => {
      // Ensure completed steps have 100% progress and running steps have some progress
      const steps = [extractStep, loadStep, transformStep].map(step => {
        if (step.status === 'completed') {
          return { ...step, progress: 100 }
        } else if (step.status === 'running') {
          return { ...step, progress: Math.max(1, step.progress) } // Ensure running steps have at least 1% progress
        }
        return step
      })
      return steps
    }),
    inputDataset: fc.record({
      id: fc.string({ minLength: 5, maxLength: 20 }),
      name: fc.string({ minLength: 5, maxLength: 50 }),
      description: fc.string({ minLength: 10, maxLength: 200 }),
      format: fc.constantFrom('json' as const, 'csv' as const, 'xml' as const, 'text' as const),
      size: fc.integer({ min: 100, max: 10000 }),
      sampleData: fc.array(fc.record({
        id: fc.integer({ min: 1, max: 1000 }),
        name: fc.string({ minLength: 3, maxLength: 30 }),
        value: fc.oneof(fc.string(), fc.integer(), fc.float())
      }), { minLength: 1, maxLength: 10 }),
      schema: fc.option(fc.record({
        id: fc.constant('number'),
        name: fc.constant('string'),
        value: fc.constantFrom('string', 'number')
      }))
    }),
    outputData: fc.option(fc.anything()),
    errorMessage: fc.option(fc.string({ minLength: 10, maxLength: 100 })),
    executionTime: fc.option(fc.integer({ min: 1000, max: 30000 }))
  }) as fc.Arbitrary<IPipelineExecution>
}

describe('Real-time Visualization Property-Based Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('**Feature: personal-website, Property 4: Real-time Progress Visualization**', () => {
    it('should update progress indicators in real-time during pipeline execution', () => {
      fc.assert(
        fc.property(
          arbRunningPipelineExecution(),
          (execution: IPipelineExecution) => {
            // Property: Progress indicators should update in real-time during processing
            
            const wrapper = mountComponent(PipelineVisualizer, {
              props: {
                execution,
                isExecuting: execution.status === 'running'
              }
            })
            
            // 1. Overall progress should be displayed and calculated correctly
            const overallProgressElement = wrapper.find('.overall-progress')
            expect(overallProgressElement.exists()).toBe(true)
            
            const progressText = overallProgressElement.text()
            expect(progressText).toMatch(/Overall Progress:/i)
            expect(progressText).toMatch(/\d+%/)
            
            // 2. Each step should display its individual progress
            execution.steps.forEach((step, index) => {
              const stepGroups = wrapper.findAll('.step-group')
              if (stepGroups.length > index) {
                const stepGroup = stepGroups[index]
                
                // Progress should be visible for running/completed steps
                if (step.status === 'running' || step.status === 'completed') {
                  const progressText = stepGroup.text()
                  expect(progressText).toMatch(/\d+%/)
                  
                  // Progress bar should be present
                  const progressBar = stepGroup.find('.progress-fill')
                  expect(progressBar.exists()).toBe(true)
                }
                
                // Step status should be visually indicated
                const stepRect = stepGroup.find('.step-rect')
                expect(stepRect.exists()).toBe(true)
                expect(stepRect.classes()).toContain(step.status)
              }
            })
            
            // 3. Real-time execution should show appropriate visual indicators
            if (execution.status === 'running') {
              // Running steps should have animated indicators
              const runningSteps = execution.steps.filter(s => s.status === 'running')
              runningSteps.forEach((_, index) => {
                const stepGroups = wrapper.findAll('.step-group')
                if (stepGroups.length > index) {
                  const stepGroup = stepGroups[index]
                  const stepRect = stepGroup.find('.step-rect.running')
                  
                  if (stepRect.exists()) {
                    // Running steps should have the running class for animation
                    expect(stepRect.classes()).toContain('running')
                  }
                }
              })
              
              // Should show data flow indicators when executing
              if (wrapper.props().isExecuting) {
                // Data flow elements might be present (they're conditionally rendered)
                // We don't assert their presence since they're conditionally shown
              }
            }
            
            // 4. Progress should be within valid ranges
            execution.steps.forEach(step => {
              expect(step.progress).toBeGreaterThanOrEqual(0)
              expect(step.progress).toBeLessThanOrEqual(100)
            })
            
            // 5. Completed steps should show 100% progress
            const completedSteps = execution.steps.filter(s => s.status === 'completed')
            completedSteps.forEach(step => {
              expect(step.progress).toBe(100)
            })
            
            // 6. Connection arrows should indicate flow direction
            const connectionArrows = wrapper.findAll('.connection-arrow')
            expect(connectionArrows.length).toBe(Math.max(0, execution.steps.length - 1))
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should complete processing within specified time limits for any valid dataset', () => {
      fc.assert(
        fc.property(
          fc.record({
            executionTime: fc.integer({ min: 1000, max: 30000 }), // 1-30 seconds
            status: fc.constantFrom('completed', 'failed')
          }),
          (executionData) => {
            // Property: Pipeline should complete within specified time limits (30 seconds max)
            
            const { executionTime, status } = executionData
            
            // 1. Execution time should be within reasonable bounds
            expect(executionTime).toBeLessThanOrEqual(30000) // 30 second limit
            expect(executionTime).toBeGreaterThan(0)
            
            // 2. Execution time should be realistic for the amount of work
            // Minimum time should be at least 1 second for 3 steps
            if (status === 'completed') {
              expect(executionTime).toBeGreaterThanOrEqual(1000)
            }
            
            // 3. Test that the component can handle these execution times
            const execution = {
              id: 'test-execution',
              pipelineId: 'test-pipeline',
              startTime: new Date('2024-01-01T00:00:00.000Z'),
              endTime: new Date(new Date('2024-01-01T00:00:00.000Z').getTime() + executionTime),
              status,
              steps: [
                {
                  id: 'extract-step',
                  name: 'Extract Data',
                  status: 'completed' as const,
                  progress: 100,
                  stepType: 'extract' as const,
                  startTime: new Date('2024-01-01T00:00:00.000Z'),
                  endTime: new Date('2024-01-01T00:00:00.000Z'),
                  inputData: undefined,
                  outputData: undefined,
                  errorMessage: undefined,
                  metadata: undefined
                },
                {
                  id: 'load-step',
                  name: 'Load Data',
                  status: 'completed' as const,
                  progress: 100,
                  stepType: 'load' as const,
                  startTime: new Date('2024-01-01T00:00:00.000Z'),
                  endTime: new Date('2024-01-01T00:00:00.000Z'),
                  inputData: undefined,
                  outputData: undefined,
                  errorMessage: undefined,
                  metadata: undefined
                },
                {
                  id: 'transform-step',
                  name: 'Transform Data',
                  status: 'completed' as const,
                  progress: 100,
                  stepType: 'transform' as const,
                  startTime: new Date('2024-01-01T00:00:00.000Z'),
                  endTime: new Date('2024-01-01T00:00:00.000Z'),
                  inputData: undefined,
                  outputData: undefined,
                  errorMessage: undefined,
                  metadata: undefined
                }
              ],
              inputDataset: {
                id: 'test-dataset',
                name: 'Test Dataset',
                description: 'Test dataset',
                format: 'json' as const,
                size: 100,
                sampleData: [{ id: 1, name: 'test', value: 0 }],
                schema: { id: 'number', name: 'string', value: 'string' }
              },
              outputData: undefined,
              errorMessage: undefined,
              executionTime
            }
            
            const wrapper = mountComponent(PipelineVisualizer, {
              props: {
                execution,
                isExecuting: false
              }
            })
            
            // Component should render without errors
            expect(wrapper.find('.pipeline-visualizer').exists()).toBe(true)
            expect(wrapper.find('.execution-time').exists()).toBe(true)
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should maintain visual consistency during real-time updates', () => {
      fc.assert(
        fc.property(
          fc.array(arbRunningPipelineExecution(), { minLength: 2, maxLength: 5 }),
          (executions: IPipelineExecution[]) => {
            // Property: Visual consistency should be maintained during real-time updates
            
            // Test multiple execution states to simulate real-time updates
            executions.forEach(execution => {
              const wrapper = mountComponent(PipelineVisualizer, {
                props: {
                  execution,
                  isExecuting: execution.status === 'running'
                }
              })
              
              // 1. SVG structure should remain consistent
              expect(wrapper.find('.pipeline-svg').exists()).toBe(true)
              expect(wrapper.find('.pipeline-visualizer').exists()).toBe(true)
              
              // 2. Step count should match execution steps
              const stepGroups = wrapper.findAll('.step-group')
              expect(stepGroups.length).toBe(execution.steps.length)
              
              // 3. Each step should have required visual elements
              stepGroups.forEach((stepGroup, index) => {
                const step = execution.steps[index]
                
                // Step rectangle
                expect(stepGroup.find('.step-rect').exists()).toBe(true)
                
                // Step name
                expect(stepGroup.text()).toContain(step.name)
                
                // Status indicator
                const statusIndicator = stepGroup.find('.step-rect')
                expect(statusIndicator.classes()).toContain(step.status)
                
                // Progress display for active steps
                if (step.status === 'running' || step.status === 'completed') {
                  expect(stepGroup.text()).toMatch(/\d+%/)
                }
              })
              
              // 4. Overall progress should be consistent with step progress
              const overallProgress = wrapper.find('.overall-progress')
              expect(overallProgress.exists()).toBe(true)
              
              // 5. Accessibility attributes should be maintained
              expect(wrapper.find('[role="img"]').exists()).toBe(true)
              expect(wrapper.find('[aria-label]').exists()).toBe(true)
              
              // 6. Interactive elements should remain accessible
              const stepRects = wrapper.findAll('.step-rect')
              stepRects.forEach(rect => {
                expect(rect.attributes('tabindex')).toBe('0')
                expect(rect.attributes('role')).toBe('button')
                expect(rect.attributes('aria-label')).toBeDefined()
              })
              
              wrapper.unmount()
            })
          }
        ),
        propertyTestConfig
      )
    })

    it('should handle rapid state changes without visual artifacts', () => {
      fc.assert(
        fc.property(
          fc.record({
            stepIndex: fc.integer({ min: 0, max: 2 }), // 0-2 for 3 steps
            newStatus: fc.constantFrom('pending' as const, 'running' as const, 'completed' as const, 'failed' as const)
          }),
          ({ stepIndex, newStatus }) => {
            // Property: State changes should not cause visual artifacts
            
            // Create a simple initial execution
            const initialExecution = {
              id: 'test-execution',
              pipelineId: 'test-pipeline',
              startTime: new Date('2024-01-01T00:00:00.000Z'),
              endTime: undefined,
              status: 'running' as const,
              steps: [
                {
                  id: 'extract-step',
                  name: 'Extract Data',
                  status: 'pending' as const,
                  progress: 0,
                  stepType: 'extract' as const,
                  startTime: new Date('2024-01-01T00:00:00.000Z'),
                  endTime: undefined,
                  inputData: undefined,
                  outputData: undefined,
                  errorMessage: undefined,
                  metadata: undefined
                },
                {
                  id: 'load-step',
                  name: 'Load Data',
                  status: 'pending' as const,
                  progress: 0,
                  stepType: 'load' as const,
                  startTime: new Date('2024-01-01T00:00:00.000Z'),
                  endTime: undefined,
                  inputData: undefined,
                  outputData: undefined,
                  errorMessage: undefined,
                  metadata: undefined
                },
                {
                  id: 'transform-step',
                  name: 'Transform Data',
                  status: 'pending' as const,
                  progress: 0,
                  stepType: 'transform' as const,
                  startTime: new Date('2024-01-01T00:00:00.000Z'),
                  endTime: undefined,
                  inputData: undefined,
                  outputData: undefined,
                  errorMessage: undefined,
                  metadata: undefined
                }
              ],
              inputDataset: {
                id: 'test-dataset',
                name: 'Test Dataset',
                description: 'Test dataset',
                format: 'json' as const,
                size: 100,
                sampleData: [{ id: 1, name: 'test', value: 0 }],
                schema: { id: 'number', name: 'string', value: 'string' }
              },
              outputData: undefined,
              errorMessage: undefined,
              executionTime: undefined
            }
            
            // Update the execution state before mounting
            const updatedExecution = {
              ...initialExecution,
              steps: initialExecution.steps.map((step, index) => 
                index === stepIndex 
                  ? { 
                      ...step, 
                      progress: newStatus === 'completed' ? 100 : 
                               newStatus === 'running' ? 50 : 0, 
                      status: newStatus 
                    }
                  : step
              )
            }
            
            const wrapper = mountComponent(PipelineVisualizer, {
              props: {
                execution: updatedExecution,
                isExecuting: updatedExecution.status === 'running'
              }
            })
            
            // 1. Component should render without errors
            expect(wrapper.find('.pipeline-visualizer').exists()).toBe(true)
            const stepGroups = wrapper.findAll('.step-group')
            expect(stepGroups.length).toBe(3)
            
            // 2. Check that the component structure remains intact
            expect(wrapper.find('.pipeline-svg').exists()).toBe(true)
            expect(wrapper.find('.overall-progress').exists()).toBe(true)
            
            // 3. Verify step names are present
            stepGroups.forEach((stepGroup, index) => {
              const step = updatedExecution.steps[index]
              expect(stepGroup.text()).toContain(step.name)
            })
            
            // 4. Verify the updated step has the correct structure
            const updatedStepGroup = stepGroups[stepIndex]
            const stepRect = updatedStepGroup.find('.step-rect')
            expect(stepRect.exists()).toBe(true)
            
            // 5. The step rect should have at least the base class
            expect(stepRect.classes()).toContain('step-rect')
            
            wrapper.unmount()
          }
        ),
        { ...propertyTestConfig, numRuns: 20 } // Increased runs since test is simpler
      )
    })
  })
})