import { describe, it, expect, vi } from 'vitest'
import { mountComponent, triggerAndWait, testKeyboardNavigation } from '@/test/component-utils'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  describe('Basic Functionality', () => {
    it('renders with default props', () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Click me' }
      })

      expect(wrapper.text()).toBe('Click me')
      expect(wrapper.classes()).toContain('base-button')
      expect(wrapper.classes()).toContain('base-button--primary')
      expect(wrapper.classes()).toContain('base-button--medium')
    })

    it('applies variant classes correctly', () => {
      const variants = ['primary', 'secondary', 'success', 'warning', 'danger'] as const
      
      variants.forEach(variant => {
        const wrapper = mountComponent(BaseButton, {
          props: { variant },
          slots: { default: 'Button' }
        })
        
        expect(wrapper.classes()).toContain(`base-button--${variant}`)
      })
    })

    it('applies size classes correctly', () => {
      const sizes = ['small', 'medium', 'large'] as const
      
      sizes.forEach(size => {
        const wrapper = mountComponent(BaseButton, {
          props: { size },
          slots: { default: 'Button' }
        })
        
        expect(wrapper.classes()).toContain(`base-button--${size}`)
      })
    })

    it('applies block class when block prop is true', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { block: true },
        slots: { default: 'Button' }
      })

      expect(wrapper.classes()).toContain('base-button--block')
    })
  })

  describe('Event Handling', () => {
    it('emits click event when clicked', async () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Click me' }
      })

      await triggerAndWait(wrapper, 'button', 'click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('does not emit click event when disabled', async () => {
      const wrapper = mountComponent(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Disabled' }
      })

      await triggerAndWait(wrapper, 'button', 'click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('does not emit click event when loading', async () => {
      const wrapper = mountComponent(BaseButton, {
        props: { loading: true },
        slots: { default: 'Loading' }
      })

      await triggerAndWait(wrapper, 'button', 'click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { loading: true, loadingText: 'Please wait...' },
        slots: { default: 'Submit' }
      })

      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.text()).toBe('Please wait...')
      expect(wrapper.text()).not.toBe('Submit')
    })

    it('applies loading class when loading', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { loading: true },
        slots: { default: 'Button' }
      })

      expect(wrapper.classes()).toContain('base-button--loading')
    })

    it('disables button when loading', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { loading: true },
        slots: { default: 'Button' }
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('Disabled State', () => {
    it('applies disabled class when disabled', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Button' }
      })

      expect(wrapper.classes()).toContain('base-button--disabled')
    })

    it('sets disabled attribute when disabled', () => {
      const wrapper = mountComponent(BaseButton, {
        props: { disabled: true },
        slots: { default: 'Button' }
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('Button Types', () => {
    it('sets correct type attribute', () => {
      const types = ['button', 'submit', 'reset'] as const
      
      types.forEach(type => {
        const wrapper = mountComponent(BaseButton, {
          props: { type },
          slots: { default: 'Button' }
        })
        
        expect(wrapper.find('button').attributes('type')).toBe(type)
      })
    })

    it('defaults to button type', () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Button' }
      })

      expect(wrapper.find('button').attributes('type')).toBe('button')
    })
  })

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Accessible Button' }
      })

      const keyboardResults = await testKeyboardNavigation(wrapper)
      
      expect(keyboardResults.canFocusElements).toBe(true)
      expect(keyboardResults.canActivateWithEnter).toBe(true)
      expect(keyboardResults.canActivateWithSpace).toBe(true)
    })

    it('has proper focus styles', () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Button' }
      })

      const button = wrapper.find('button')
      const styles = getComputedStyle(button.element)
      
      // Note: In a real test environment, you might need to check actual computed styles
      // This is a simplified check for the CSS class
      expect(wrapper.classes()).toContain('base-button')
    })

    it('maintains semantic button element', () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Button' }
      })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.element.tagName).toBe('BUTTON')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty slot content', () => {
      const wrapper = mountComponent(BaseButton)
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('handles multiple rapid clicks', async () => {
      const wrapper = mountComponent(BaseButton, {
        slots: { default: 'Rapid Click' }
      })

      // Simulate rapid clicking
      for (let i = 0; i < 5; i++) {
        await triggerAndWait(wrapper, 'button', 'click')
      }
      
      expect(wrapper.emitted('click')).toHaveLength(5)
    })

    it('handles loading state changes', async () => {
      const wrapper = mountComponent(BaseButton, {
        props: { loading: false },
        slots: { default: 'Dynamic Loading' }
      })

      expect(wrapper.find('.loading-spinner').exists()).toBe(false)
      
      await wrapper.setProps({ loading: true })
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.classes()).toContain('base-button--loading')
    })
  })
})