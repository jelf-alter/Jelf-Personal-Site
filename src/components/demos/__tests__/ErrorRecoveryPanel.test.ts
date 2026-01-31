import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ErrorRecoveryPanel from '../ErrorRecoveryPanel.vue'

const mockError = {
  id: 'error-1',
  message: 'Pipeline step failed',
  code: 'PIPELINE_ERROR',
  timestamp: new Date(),
  stepId: 'extract-1',
  details: {
    originalError: 'Connection timeout',
    retryCount: 2,
    maxRetries: 3
  }
}

describe('ErrorRecoveryPanel Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders error recovery panel correctly', () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true
      }
    })
    
    expect(wrapper.find('.error-recovery-panel').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain('Pipeline step failed')
    expect(wrapper.find('.error-code').text()).toContain('PIPELINE_ERROR')
  })

  it('displays error details correctly', () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true
      }
    })
    
    expect(wrapper.find('.error-details').exists()).toBe(true)
    expect(wrapper.find('.error-details').text()).toContain('Connection timeout')
    expect(wrapper.find('.retry-info').text()).toContain('2 of 3 retries')
  })

  it('shows recovery options when available', () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true,
        recoveryOptions: [
          { id: 'retry', label: 'Retry Step', action: 'retry' },
          { id: 'skip', label: 'Skip Step', action: 'skip' },
          { id: 'abort', label: 'Abort Pipeline', action: 'abort' }
        ]
      }
    })
    
    const options = wrapper.findAll('.recovery-option')
    expect(options).toHaveLength(3)
    expect(options[0].text()).toContain('Retry Step')
    expect(options[1].text()).toContain('Skip Step')
    expect(options[2].text()).toContain('Abort Pipeline')
  })

  it('handles retry action correctly', async () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true,
        recoveryOptions: [
          { id: 'retry', label: 'Retry Step', action: 'retry' }
        ]
      }
    })
    
    await wrapper.find('.recovery-option[data-action="retry"]').trigger('click')
    
    expect(wrapper.emitted('recovery-action')).toBeTruthy()
    expect(wrapper.emitted('recovery-action')?.[0]).toEqual(['retry', mockError])
  })

  it('handles skip action correctly', async () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true,
        recoveryOptions: [
          { id: 'skip', label: 'Skip Step', action: 'skip' }
        ]
      }
    })
    
    await wrapper.find('.recovery-option[data-action="skip"]').trigger('click')
    
    expect(wrapper.emitted('recovery-action')).toBeTruthy()
    expect(wrapper.emitted('recovery-action')?.[0]).toEqual(['skip', mockError])
  })

  it('handles abort action correctly', async () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true,
        recoveryOptions: [
          { id: 'abort', label: 'Abort Pipeline', action: 'abort' }
        ]
      }
    })
    
    await wrapper.find('.recovery-option[data-action="abort"]').trigger('click')
    
    expect(wrapper.emitted('recovery-action')).toBeTruthy()
    expect(wrapper.emitted('recovery-action')?.[0]).toEqual(['abort', mockError])
  })

  it('can be dismissed correctly', async () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true,
        dismissible: true
      }
    })
    
    await wrapper.find('.dismiss-button').trigger('click')
    
    expect(wrapper.emitted('dismiss')).toBeTruthy()
  })

  it('shows error timestamp correctly', () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true
      }
    })
    
    expect(wrapper.find('.error-timestamp').exists()).toBe(true)
    expect(wrapper.find('.error-timestamp').text()).toMatch(/\d{2}:\d{2}:\d{2}/)
  })

  it('displays retry countdown when retrying', async () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true,
        isRetrying: true,
        retryCountdown: 5
      }
    })
    
    expect(wrapper.find('.retry-countdown').exists()).toBe(true)
    expect(wrapper.find('.retry-countdown').text()).toContain('Retrying in 5 seconds')
  })

  it('disables recovery options when retrying', () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true,
        isRetrying: true,
        recoveryOptions: [
          { id: 'retry', label: 'Retry Step', action: 'retry' }
        ]
      }
    })
    
    const retryButton = wrapper.find('.recovery-option')
    expect(retryButton.attributes('disabled')).toBeDefined()
  })

  it('shows error severity correctly', () => {
    const criticalError = {
      ...mockError,
      severity: 'critical'
    }
    
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: criticalError,
        isVisible: true
      }
    })
    
    expect(wrapper.find('.error-recovery-panel').classes()).toContain('critical')
    expect(wrapper.find('.error-severity').text()).toContain('Critical')
  })

  it('handles error without details gracefully', () => {
    const simpleError = {
      id: 'simple-error',
      message: 'Simple error',
      timestamp: new Date()
    }
    
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: simpleError,
        isVisible: true
      }
    })
    
    expect(wrapper.find('.error-message').text()).toContain('Simple error')
    expect(wrapper.find('.error-details').exists()).toBe(false)
  })

  it('shows loading state when processing recovery action', () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true,
        isProcessing: true,
        recoveryOptions: [
          { id: 'retry', label: 'Retry Step', action: 'retry' }
        ]
      }
    })
    
    expect(wrapper.find('.processing-indicator').exists()).toBe(true)
    expect(wrapper.find('.recovery-option').attributes('disabled')).toBeDefined()
  })

  it('formats error code correctly', () => {
    const wrapper = mount(ErrorRecoveryPanel, {
      props: {
        error: mockError,
        isVisible: true
      }
    })
    
    expect(wrapper.find('.error-code').text()).toBe('PIPELINE_ERROR')
    expect(wrapper.find('.error-code').classes()).toContain('error-code')
  })
})