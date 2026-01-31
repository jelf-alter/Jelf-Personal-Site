import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PipelineVisualizer from '../PipelineVisualizer.vue'
import type { IPipelineStep } from '@/types'

const mockPipelineSteps: IPipelineStep[] = [
  {
    id: 'extract-1',
    name: 'Extract Data',
    status: 'completed',
    progress: 100,
    stepType: 'extract',
    startTime: new Date(Date.now() - 5000),
    endTime: new Date(Date.now() - 3000),
    inputData: { source: 'database' },
    outputData: { records: 1000 }
  },
  {
    id: 'load-1',
    name: 'Load Data',
    status: 'running',
    progress: 65,
    stepType: 'load',
    startTime: new Date(Date.now() - 2000),
    inputData: { records: 1000 }
  },
  {
    id: 'transform-1',
    name: 'Transform Data',
    status: 'pending',
    progress: 0,
    stepType: 'transform'
  }
]

describe('PipelineVisualizer Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders pipeline visualization correctly', () => {
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: mockPipelineSteps,
        currentStep: 'load-1'
      }
    })
    
    expect(wrapper.find('.pipeline-visualizer').exists()).toBe(true)
    expect(wrapper.find('.pipeline-steps').exists()).toBe(true)
    expect(wrapper.findAll('.pipeline-step')).toHaveLength(3)
  })

  it('displays step status correctly', () => {
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: mockPipelineSteps,
        currentStep: 'load-1'
      }
    })
    
    const steps = wrapper.findAll('.pipeline-step')
    
    // Extract step should be completed
    expect(steps[0].classes()).toContain('completed')
    expect(steps[0].find('.step-status').text()).toContain('Completed')
    
    // Load step should be running
    expect(steps[1].classes()).toContain('running')
    expect(steps[1].find('.step-status').text()).toContain('Running')
    
    // Transform step should be pending
    expect(steps[2].classes()).toContain('pending')
    expect(steps[2].find('.step-status').text()).toContain('Pending')
  })

  it('shows progress indicators correctly', () => {
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: mockPipelineSteps,
        currentStep: 'load-1'
      }
    })
    
    const steps = wrapper.findAll('.pipeline-step')
    
    // Extract step should show 100% progress
    const extractProgress = steps[0].find('.progress-bar .progress-fill')
    expect(extractProgress.attributes('style')).toContain('width: 100%')
    
    // Load step should show 65% progress
    const loadProgress = steps[1].find('.progress-bar .progress-fill')
    expect(loadProgress.attributes('style')).toContain('width: 65%')
    
    // Transform step should show 0% progress
    const transformProgress = steps[2].find('.progress-bar .progress-fill')
    expect(transformProgress.attributes('style')).toContain('width: 0%')
  })

  it('displays step timing information', () => {
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: mockPipelineSteps,
        currentStep: 'load-1'
      }
    })
    
    const completedStep = wrapper.findAll('.pipeline-step')[0]
    expect(completedStep.find('.step-duration').exists()).toBe(true)
    expect(completedStep.find('.step-duration').text()).toContain('2.0s')
  })

  it('shows input/output data when available', async () => {
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: mockPipelineSteps,
        currentStep: 'load-1',
        showDataFlow: true
      }
    })
    
    const extractStep = wrapper.findAll('.pipeline-step')[0]
    
    // Click to expand step details
    await extractStep.find('.step-header').trigger('click')
    
    expect(extractStep.find('.step-details').exists()).toBe(true)
    expect(extractStep.find('.input-data').text()).toContain('database')
    expect(extractStep.find('.output-data').text()).toContain('1000')
  })

  it('handles step click events correctly', async () => {
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: mockPipelineSteps,
        currentStep: 'load-1'
      }
    })
    
    const extractStep = wrapper.findAll('.pipeline-step')[0]
    await extractStep.trigger('click')
    
    expect(wrapper.emitted('step-selected')).toBeTruthy()
    expect(wrapper.emitted('step-selected')?.[0]).toEqual(['extract-1'])
  })

  it('displays error states correctly', () => {
    const errorSteps: IPipelineStep[] = [
      {
        id: 'failed-step',
        name: 'Failed Step',
        status: 'failed',
        progress: 50,
        stepType: 'extract',
        errorMessage: 'Connection timeout'
      }
    ]
    
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: errorSteps,
        currentStep: 'failed-step'
      }
    })
    
    const failedStep = wrapper.find('.pipeline-step')
    expect(failedStep.classes()).toContain('failed')
    expect(failedStep.find('.error-message').text()).toContain('Connection timeout')
  })

  it('animates progress updates correctly', async () => {
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: mockPipelineSteps,
        currentStep: 'load-1'
      }
    })
    
    // Update progress
    const updatedSteps = [...mockPipelineSteps]
    updatedSteps[1].progress = 85
    
    await wrapper.setProps({ pipelineSteps: updatedSteps })
    
    const loadProgress = wrapper.findAll('.pipeline-step')[1].find('.progress-fill')
    expect(loadProgress.attributes('style')).toContain('width: 85%')
    expect(loadProgress.classes()).toContain('animated')
  })

  it('shows step connections correctly', () => {
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: mockPipelineSteps,
        currentStep: 'load-1',
        showConnections: true
      }
    })
    
    const connections = wrapper.findAll('.step-connection')
    expect(connections).toHaveLength(2) // Between 3 steps, there should be 2 connections
  })

  it('handles empty pipeline steps gracefully', () => {
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: [],
        currentStep: null
      }
    })
    
    expect(wrapper.find('.empty-pipeline').exists()).toBe(true)
    expect(wrapper.find('.empty-pipeline').text()).toContain('No pipeline steps')
  })

  it('displays step metadata when available', async () => {
    const stepsWithMetadata: IPipelineStep[] = [
      {
        ...mockPipelineSteps[0],
        metadata: {
          recordsProcessed: 1000,
          processingRate: '500 records/sec',
          memoryUsage: '128MB'
        }
      }
    ]
    
    const wrapper = mount(PipelineVisualizer, {
      props: {
        pipelineSteps: stepsWithMetadata,
        currentStep: 'extract-1',
        showMetadata: true
      }
    })
    
    const step = wrapper.find('.pipeline-step')
    await step.find('.step-header').trigger('click')
    
    expect(step.find('.step-metadata').exists()).toBe(true)
    expect(step.find('.step-metadata').text()).toContain('1000')
    expect(step.find('.step-metadata').text()).toContain('500 records/sec')
  })
})