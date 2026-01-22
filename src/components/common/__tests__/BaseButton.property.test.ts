import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { mountComponent } from '@/test/component-utils'
import { propertyTestConfig, arbSafeString } from '@/test/property-generators'
import BaseButton from '../BaseButton.vue'

describe('BaseButton Property-Based Tests', () => {
  describe('**Feature: personal-website, Property 1: Button Content Rendering**', () => {
    it('should always render button content correctly for any valid string input', () => {
      fc.assert(
        fc.property(
          arbSafeString(1, 50), // Generate safe strings
          (content) => {
            const wrapper = mountComponent(BaseButton, {
              slots: { default: () => content }
            })

            // Property: Button should always render the provided content (trimmed)
            expect(wrapper.text().trim()).toBe(content.trim())
            expect(wrapper.find('button').exists()).toBe(true)
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 2: Button Variant Classes**', () => {
    it('should always apply correct variant classes for any valid variant', () => {
      const validVariants = ['primary', 'secondary', 'success', 'warning', 'danger'] as const
      
      fc.assert(
        fc.property(
          fc.constantFrom(...validVariants),
          (variant) => {
            const wrapper = mountComponent(BaseButton, {
              props: { variant },
              slots: { default: () => 'Test' }
            })

            // Property: Button should always have the correct variant class
            expect(wrapper.classes()).toContain(`base-button--${variant}`)
            expect(wrapper.classes()).toContain('base-button')
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 3: Button Size Classes**', () => {
    it('should always apply correct size classes for any valid size', () => {
      const validSizes = ['small', 'medium', 'large'] as const
      
      fc.assert(
        fc.property(
          fc.constantFrom(...validSizes),
          (size) => {
            const wrapper = mountComponent(BaseButton, {
              props: { size },
              slots: { default: () => 'Test' }
            })

            // Property: Button should always have the correct size class
            expect(wrapper.classes()).toContain(`base-button--${size}`)
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 4: Button Disabled State**', () => {
    it('should never emit click events when disabled, regardless of other props', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // loading state
          fc.constantFrom('primary', 'secondary', 'success', 'warning', 'danger'), // variant
          fc.constantFrom('small', 'medium', 'large'), // size
          arbSafeString(1, 20), // content
          (loading, variant, size, content) => {
            const wrapper = mountComponent(BaseButton, {
              props: { 
                disabled: true, 
                loading, 
                variant, 
                size 
              },
              slots: { default: () => content }
            })

            // Simulate click - this should be synchronous for property tests
            wrapper.find('button').trigger('click')

            // Property: Disabled buttons should never emit click events
            expect(wrapper.emitted('click')).toBeFalsy()
            expect(wrapper.find('button').attributes('disabled')).toBeDefined()
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 5: Button Loading State**', () => {
    it('should always show loading spinner and prevent clicks when loading', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('primary', 'secondary', 'success', 'warning', 'danger'), // variant
          fc.constantFrom('small', 'medium', 'large'), // size
          arbSafeString(1, 20), // content
          arbSafeString(1, 20).filter(s => s.trim() !== ''), // loading text (different from content)
          (variant, size, content, loadingText) => {
            // Ensure loadingText is different from content to avoid assertion conflicts
            const finalLoadingText = loadingText.trim() === content.trim() ? `${loadingText} Loading` : loadingText
            
            const wrapper = mountComponent(BaseButton, {
              props: { 
                loading: true, 
                variant, 
                size,
                loadingText: finalLoadingText
              },
              slots: { default: () => content }
            })

            // Property: Loading buttons should always show spinner and loading text
            expect(wrapper.find('.loading-spinner').exists()).toBe(true)
            expect(wrapper.text().trim()).toBe(finalLoadingText.trim())
            expect(wrapper.text().trim()).not.toBe(content.trim())
            expect(wrapper.classes()).toContain('base-button--loading')

            // Simulate click - should be synchronous
            wrapper.find('button').trigger('click')

            // Property: Loading buttons should never emit click events
            expect(wrapper.emitted('click')).toBeFalsy()
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 6: Button Type Attribute**', () => {
    it('should always set correct type attribute for any valid button type', () => {
      const validTypes = ['button', 'submit', 'reset'] as const
      
      fc.assert(
        fc.property(
          fc.constantFrom(...validTypes),
          arbSafeString(1, 20), // content
          (type, content) => {
            const wrapper = mountComponent(BaseButton, {
              props: { type },
              slots: { default: () => content }
            })

            // Property: Button should always have the correct type attribute
            expect(wrapper.find('button').attributes('type')).toBe(type)
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 7: Button Block Behavior**', () => {
    it('should apply block class consistently when block prop is true', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // block state
          fc.constantFrom('primary', 'secondary', 'success', 'warning', 'danger'), // variant
          arbSafeString(1, 20), // content
          (block, variant, content) => {
            const wrapper = mountComponent(BaseButton, {
              props: { block, variant },
              slots: { default: () => content }
            })

            // Property: Block class should be present if and only if block prop is true
            const hasBlockClass = wrapper.classes().includes('base-button--block')
            expect(hasBlockClass).toBe(block)
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 8: Button Click Event Emission**', () => {
    it('should emit click events for enabled, non-loading buttons', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('primary', 'secondary', 'success', 'warning', 'danger'), // variant
          fc.constantFrom('small', 'medium', 'large'), // size
          arbSafeString(1, 20), // content
          (variant, size, content) => {
            const wrapper = mountComponent(BaseButton, {
              props: { 
                disabled: false, 
                loading: false, 
                variant, 
                size 
              },
              slots: { default: () => content }
            })

            // Simulate click - synchronous for property tests
            wrapper.find('button').trigger('click')

            // Property: Enabled, non-loading buttons should always emit click events
            expect(wrapper.emitted('click')).toBeTruthy()
            expect(wrapper.emitted('click')).toHaveLength(1)
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 9: Button State Consistency**', () => {
    it('should maintain consistent state regardless of prop combination', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // disabled
          fc.boolean(), // loading
          fc.boolean(), // block
          fc.constantFrom('primary', 'secondary', 'success', 'warning', 'danger'), // variant
          fc.constantFrom('small', 'medium', 'large'), // size
          fc.constantFrom('button', 'submit', 'reset'), // type
          arbSafeString(1, 20), // content
          (disabled, loading, block, variant, size, type, content) => {
            const wrapper = mountComponent(BaseButton, {
              props: { disabled, loading, block, variant, size, type },
              slots: { default: () => content }
            })

            // Property: Button should always maintain consistent state
            expect(wrapper.find('button').exists()).toBe(true)
            expect(wrapper.classes()).toContain('base-button')
            expect(wrapper.classes()).toContain(`base-button--${variant}`)
            expect(wrapper.classes()).toContain(`base-button--${size}`)
            
            if (disabled) {
              expect(wrapper.classes()).toContain('base-button--disabled')
              expect(wrapper.find('button').attributes('disabled')).toBeDefined()
            }
            
            if (loading) {
              expect(wrapper.classes()).toContain('base-button--loading')
              expect(wrapper.find('.loading-spinner').exists()).toBe(true)
            }
            
            if (block) {
              expect(wrapper.classes()).toContain('base-button--block')
            }
            
            expect(wrapper.find('button').attributes('type')).toBe(type)
            
            wrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })
})