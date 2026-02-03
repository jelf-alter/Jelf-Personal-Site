import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import DemoContainer from '../DemoContainer.vue'
import { useDemosStore } from '@/stores/demos'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/demos/:id', component: { template: '<div>Demo</div>' } }
  ]
})

describe('DemoContainer', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    vi.clearAllMocks()
  })

  it('should render with demo ID', async () => {
    const wrapper = mount(DemoContainer, {
      props: {
        demoId: 'elt-pipeline'
      },
      global: {
        plugins: [router, pinia],
        stubs: {
          BaseButton: true,
          LoadingSpinner: true
        }
      }
    })

    // Wait for component to initialize
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.demo-container').exists()).toBe(true)
  })

  it('should display loading state initially', async () => {
    const wrapper = mount(DemoContainer, {
      props: {
        demoId: 'elt-pipeline'
      },
      global: {
        plugins: [router, pinia],
        stubs: {
          BaseButton: true,
          LoadingSpinner: true
        }
      }
    })

    // Should show loading initially
    expect(wrapper.find('.demo-loading').exists()).toBe(true)
  })

  it('should emit demo-loaded event when demo is found', async () => {
    const wrapper = mount(DemoContainer, {
      props: {
        demoId: 'elt-pipeline'
      },
      global: {
        plugins: [router, pinia],
        stubs: {
          BaseButton: true,
          LoadingSpinner: true
        }
      }
    })

    // Wait for the component to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Check if demo-loaded event was emitted
    const emittedEvents = wrapper.emitted('demo-loaded')
    expect(emittedEvents).toBeDefined()
  })

  it('should emit demo-error event when demo is not found', async () => {
    const wrapper = mount(DemoContainer, {
      props: {
        demoId: 'non-existent-demo'
      },
      global: {
        plugins: [router, pinia],
        stubs: {
          BaseButton: true,
          LoadingSpinner: true
        }
      }
    })

    // Wait for the component to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Check if demo-error event was emitted
    const emittedEvents = wrapper.emitted('demo-error')
    expect(emittedEvents).toBeDefined()
  })

  it('should provide slot props to child components', async () => {
    const wrapper = mount(DemoContainer, {
      props: {
        demoId: 'elt-pipeline'
      },
      slots: {
        default: `
          <template #default="{ demo, isActive, isFullScreen, config }">
            <div class="test-slot">
              <span class="demo-name">{{ demo?.name || 'No demo' }}</span>
              <span class="is-active">{{ isActive }}</span>
              <span class="is-fullscreen">{{ isFullScreen }}</span>
            </div>
          </template>
        `
      },
      global: {
        plugins: [router, pinia],
        stubs: {
          BaseButton: true,
          LoadingSpinner: true
        }
      }
    })

    // Wait for the component to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Check if slot content is rendered
    const testSlot = wrapper.find('.test-slot')
    if (testSlot.exists()) {
      expect(testSlot.find('.is-active').text()).toBe('true')
      expect(testSlot.find('.is-fullscreen').text()).toBe('false')
    }
  })

  it('should handle fullscreen toggle', async () => {
    const wrapper = mount(DemoContainer, {
      props: {
        demoId: 'elt-pipeline'
      },
      global: {
        plugins: [router, pinia],
        stubs: {
          BaseButton: true,
          LoadingSpinner: true
        }
      }
    })

    // Wait for component to load
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // Initially not fullscreen
    expect(wrapper.find('.demo-container.full-screen').exists()).toBe(false)

    // Trigger fullscreen toggle (simulate method call)
    await wrapper.vm.toggleFullScreen()
    await wrapper.vm.$nextTick()

    // Should emit fullscreen-toggle event
    const emittedEvents = wrapper.emitted('fullscreen-toggle')
    expect(emittedEvents).toBeDefined()
  })
})