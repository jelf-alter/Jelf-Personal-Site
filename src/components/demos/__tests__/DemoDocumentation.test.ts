import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DemoDocumentation from '../DemoDocumentation.vue'
import { demoRegistry } from '@/services/demoRegistry'

describe('DemoDocumentation', () => {
  const mockDemo = demoRegistry.getDemo('elt-pipeline')!

  it('should render demo documentation', () => {
    const wrapper = mount(DemoDocumentation, {
      props: {
        demo: mockDemo
      }
    })

    expect(wrapper.find('.demo-documentation').exists()).toBe(true)
    expect(wrapper.find('.doc-title').text()).toBe(mockDemo.name)
    expect(wrapper.find('.doc-description').text()).toBe(mockDemo.description)
  })

  it('should display featured badge for featured demos', () => {
    const wrapper = mount(DemoDocumentation, {
      props: {
        demo: mockDemo
      }
    })

    expect(wrapper.find('.demo-badge').exists()).toBe(true)
    expect(wrapper.find('.demo-badge').text()).toContain('Featured Demo')
  })

  it('should display technologies with icons', () => {
    const wrapper = mount(DemoDocumentation, {
      props: {
        demo: mockDemo
      }
    })

    const techItems = wrapper.findAll('.tech-item')
    expect(techItems.length).toBe(mockDemo.technologies.length)
    
    // Check that each tech item has an icon and name
    techItems.forEach((item, index) => {
      expect(item.find('.tech-icon').exists()).toBe(true)
      expect(item.find('.tech-name').text()).toBe(mockDemo.technologies[index])
    })
  })

  it('should display requirements list', () => {
    const wrapper = mount(DemoDocumentation, {
      props: {
        demo: mockDemo
      }
    })

    const requirements = wrapper.findAll('.requirement-item')
    expect(requirements.length).toBe(mockDemo.requirements?.length || 0)
  })

  it('should emit launch-demo event when launch button is clicked', async () => {
    const wrapper = mount(DemoDocumentation, {
      props: {
        demo: mockDemo
      }
    })

    const launchButton = wrapper.find('[aria-label="Launch the demo application"]')
    await launchButton.trigger('click')

    expect(wrapper.emitted('launch-demo')).toBeTruthy()
  })

  it('should emit view-tests event when tests button is clicked', async () => {
    const wrapper = mount(DemoDocumentation, {
      props: {
        demo: mockDemo
      }
    })

    const testsButton = wrapper.find('[aria-label="View test results for this demo"]')
    await testsButton.trigger('click')

    expect(wrapper.emitted('view-tests')).toBeTruthy()
  })

  it('should display learning objectives if available', () => {
    const wrapper = mount(DemoDocumentation, {
      props: {
        demo: mockDemo
      }
    })

    if (mockDemo.metadata?.learningObjectives?.length) {
      expect(wrapper.find('.learning-objectives').exists()).toBe(true)
      const objectives = wrapper.findAll('.learning-objectives li')
      expect(objectives.length).toBeGreaterThan(0)
    }
  })

  it('should display API endpoints if available', () => {
    const wrapper = mount(DemoDocumentation, {
      props: {
        demo: mockDemo
      }
    })

    if (mockDemo.apiEndpoints?.length) {
      expect(wrapper.find('.api-endpoints').exists()).toBe(true)
      const endpoints = wrapper.findAll('.endpoint-path')
      expect(endpoints.length).toBe(mockDemo.apiEndpoints.length)
    }
  })

  it('should display WebSocket events if available', () => {
    const wrapper = mount(DemoDocumentation, {
      props: {
        demo: mockDemo
      }
    })

    if (mockDemo.websocketEvents?.length) {
      expect(wrapper.find('.websocket-events').exists()).toBe(true)
      const events = wrapper.findAll('.event-name')
      expect(events.length).toBe(mockDemo.websocketEvents.length)
    }
  })
})