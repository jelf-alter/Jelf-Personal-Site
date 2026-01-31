import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '../LoadingSpinner.vue'

describe('LoadingSpinner Unit Tests', () => {
  it('renders loading spinner correctly', () => {
    const wrapper = mount(LoadingSpinner)
    
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('displays custom message correctly', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        message: 'Loading test data...'
      }
    })
    
    expect(wrapper.find('.loading-message').exists()).toBe(true)
    expect(wrapper.find('.loading-message').text()).toBe('Loading test data...')
  })

  it('applies custom size correctly', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'large'
      }
    })
    
    expect(wrapper.find('.spinner').classes()).toContain('size-large')
  })

  it('applies custom color correctly', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        color: 'primary'
      }
    })
    
    expect(wrapper.find('.spinner').classes()).toContain('color-primary')
  })

  it('shows progress when provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        progress: 65,
        showProgress: true
      }
    })
    
    expect(wrapper.find('.progress-indicator').exists()).toBe(true)
    expect(wrapper.find('.progress-text').text()).toContain('65%')
  })

  it('applies overlay mode correctly', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        overlay: true
      }
    })
    
    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
    expect(wrapper.classes()).toContain('overlay-mode')
  })

  it('handles inline mode correctly', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        inline: true
      }
    })
    
    expect(wrapper.classes()).toContain('inline-mode')
  })

  it('applies custom animation speed', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        speed: 'slow'
      }
    })
    
    expect(wrapper.find('.spinner').classes()).toContain('speed-slow')
  })

  it('shows determinate progress bar when progress is provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        progress: 45,
        showProgress: true,
        type: 'bar'
      }
    })
    
    expect(wrapper.find('.progress-bar').exists()).toBe(true)
    expect(wrapper.find('.progress-fill').attributes('style')).toContain('width: 45%')
  })

  it('handles different spinner types correctly', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        type: 'dots'
      }
    })
    
    expect(wrapper.find('.spinner-dots').exists()).toBe(true)
  })

  it('applies accessibility attributes correctly', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        message: 'Loading content'
      }
    })
    
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(wrapper.attributes('aria-label')).toContain('Loading')
  })

  it('handles visibility correctly', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        visible: false
      }
    })
    
    expect(wrapper.find('.loading-spinner').isVisible()).toBe(false)
  })

  it('applies custom CSS classes', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        customClass: 'my-custom-spinner'
      }
    })
    
    expect(wrapper.classes()).toContain('my-custom-spinner')
  })

  it('handles backdrop correctly in overlay mode', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        overlay: true,
        backdrop: true
      }
    })
    
    expect(wrapper.find('.loading-backdrop').exists()).toBe(true)
  })

  it('emits events correctly', async () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        overlay: true
      }
    })
    
    await wrapper.find('.loading-overlay').trigger('click')
    
    expect(wrapper.emitted('backdrop-click')).toBeTruthy()
  })

  it('handles different sizes correctly', () => {
    const sizes = ['small', 'medium', 'large', 'extra-large']
    
    sizes.forEach(size => {
      const wrapper = mount(LoadingSpinner, {
        props: { size }
      })
      
      expect(wrapper.find('.spinner').classes()).toContain(`size-${size}`)
    })
  })

  it('shows estimated time when provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        message: 'Loading...',
        estimatedTime: 30
      }
    })
    
    expect(wrapper.find('.estimated-time').exists()).toBe(true)
    expect(wrapper.find('.estimated-time').text()).toContain('30 seconds')
  })

  it('handles cancellation correctly', async () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        cancellable: true
      }
    })
    
    expect(wrapper.find('.cancel-button').exists()).toBe(true)
    
    await wrapper.find('.cancel-button').trigger('click')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })
})