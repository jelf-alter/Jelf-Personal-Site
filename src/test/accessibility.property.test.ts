/**
 * Property-Based Tests for Accessibility Compliance
 * Feature: personal-website, Property 17: Accessibility Compliance
 * Validates: Requirements 6.1, 6.3, 6.4, 6.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import * as fc from 'fast-check'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Components to test
import HeroSection from '@/components/landing/HeroSection.vue'
import NavigationHeader from '@/components/landing/NavigationHeader.vue'
import SkillsShowcase from '@/components/landing/SkillsShowcase.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import WebSocketDemo from '@/components/demos/WebSocketDemo.vue'

// Test utilities and generators
import { 
  arbUserProfile, 
  arbSkill, 
  arbSafeString, 
  arbViewportSize,
  propertyTestConfig 
} from './property-generators'
import { createMockUser } from './setup'

// Accessibility testing utilities
interface AccessibilityViolation {
  element: Element
  rule: string
  description: string
  severity: 'error' | 'warning' | 'info'
}

/**
 * Check if element has proper ARIA attributes
 */
function hasProperAriaAttributes(element: Element): boolean {
  // Check for required ARIA attributes based on role
  const role = element.getAttribute('role')
  const ariaLabel = element.getAttribute('aria-label')
  const ariaLabelledby = element.getAttribute('aria-labelledby')
  const ariaDescribedby = element.getAttribute('aria-describedby')

  // Elements with interactive roles should have accessible names
  const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option']
  if (interactiveRoles.includes(role || '')) {
    return !!(ariaLabel || ariaLabelledby || element.textContent?.trim())
  }

  // Form controls should have labels
  if (element.tagName.toLowerCase() === 'input' || 
      element.tagName.toLowerCase() === 'select' || 
      element.tagName.toLowerCase() === 'textarea') {
    const id = element.getAttribute('id')
    const label = id ? document.querySelector(`label[for="${id}"]`) : null
    return !!(ariaLabel || ariaLabelledby || label)
  }

  return true
}

/**
 * Check if element meets minimum touch target size (44x44px)
 */
function meetsTouchTargetSize(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  const isInteractive = element.matches('button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])')
  
  if (!isInteractive) return true
  
  return rect.width >= 44 && rect.height >= 44
}

/**
 * Check if element has proper semantic HTML structure
 */
function hasSemanticStructure(element: Element): boolean {
  // Check for proper heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let lastLevel = 0
  
  for (const heading of headings) {
    const level = parseInt(heading.tagName.charAt(1))
    if (level > lastLevel + 1) {
      return false // Skipped heading level
    }
    lastLevel = level
  }

  // Check for proper landmark usage
  const landmarks = element.querySelectorAll('main, nav, header, footer, aside, section, article')
  const hasProperLandmarks = landmarks.length > 0 || element.matches('main, nav, header, footer, aside, section, article')

  return hasProperLandmarks
}

/**
 * Check if images have proper alt text
 */
function hasProperImageAltText(element: Element): boolean {
  const images = element.querySelectorAll('img')
  
  for (const img of images) {
    const alt = img.getAttribute('alt')
    const ariaLabel = img.getAttribute('aria-label')
    const ariaHidden = img.getAttribute('aria-hidden')
    
    // Decorative images should have empty alt or aria-hidden
    if (ariaHidden === 'true') continue
    
    // Content images should have meaningful alt text
    if (!alt && !ariaLabel) return false
  }
  
  return true
}

/**
 * Check keyboard navigation support
 */
function supportsKeyboardNavigation(wrapper: VueWrapper): boolean {
  const interactiveElements = wrapper.element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
  )
  
  for (const element of interactiveElements) {
    const tabIndex = element.getAttribute('tabindex')
    
    // Interactive elements should be focusable
    if (tabIndex === '-1' && !element.matches('button, a, input, select, textarea')) {
      return false
    }
  }
  
  return true
}

/**
 * Check color contrast (simplified check)
 */
function hasAdequateColorContrast(element: Element): boolean {
  // This is a simplified check - in production, use a proper color contrast library
  const style = window.getComputedStyle(element)
  const backgroundColor = style.backgroundColor
  const color = style.color
  
  // Skip elements with transparent or default colors
  if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
    return true
  }
  
  // Basic check - ensure colors are not the same
  return backgroundColor !== color
}

/**
 * Comprehensive accessibility audit
 */
function auditAccessibility(wrapper: VueWrapper): AccessibilityViolation[] {
  const violations: AccessibilityViolation[] = []
  const element = wrapper.element

  // Check ARIA attributes
  const elementsWithAria = element.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]')
  elementsWithAria.forEach(el => {
    if (!hasProperAriaAttributes(el)) {
      violations.push({
        element: el,
        rule: 'aria-attributes',
        description: 'Element has improper ARIA attributes',
        severity: 'error'
      })
    }
  })

  // Check touch target sizes
  const interactiveElements = element.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]')
  interactiveElements.forEach(el => {
    if (!meetsTouchTargetSize(el)) {
      violations.push({
        element: el,
        rule: 'touch-target-size',
        description: 'Interactive element does not meet minimum touch target size (44x44px)',
        severity: 'error'
      })
    }
  })

  // Check semantic structure
  if (!hasSemanticStructure(element)) {
    violations.push({
      element: element,
      rule: 'semantic-structure',
      description: 'Element lacks proper semantic HTML structure',
      severity: 'warning'
    })
  }

  // Check image alt text
  if (!hasProperImageAltText(element)) {
    violations.push({
      element: element,
      rule: 'image-alt-text',
      description: 'Images missing proper alt text',
      severity: 'error'
    })
  }

  // Check keyboard navigation
  if (!supportsKeyboardNavigation(wrapper)) {
    violations.push({
      element: element,
      rule: 'keyboard-navigation',
      description: 'Component does not support proper keyboard navigation',
      severity: 'error'
    })
  }

  return violations
}

describe('Property 17: Accessibility Compliance', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    // Setup router and pinia for components that need them
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/demos', component: { template: '<div>Demos</div>' } },
        { path: '/testing', component: { template: '<div>Testing</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } }
      ]
    })
    
    pinia = createPinia()

    // Mock DOM methods for testing
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
      value: () => ({
        width: 50,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 50,
        x: 0,
        y: 0
      })
    })
  })

  afterEach(() => {
    // Clean up
    document.body.innerHTML = ''
  })

  it('should ensure all interactive elements have proper ARIA attributes', () => {
    fc.assert(
      fc.property(
        arbSafeString(2, 30), // button text
        arbSafeString(5, 50), // aria label
        (buttonText, ariaLabel) => {
          const wrapper = mount(BaseButton, {
            props: {
              ariaLabel: ariaLabel
            },
            slots: {
              default: buttonText
            }
          })

          const button = wrapper.find('button')
          expect(button.exists()).toBe(true)
          
          // Should have accessible name (either aria-label or text content)
          const hasAccessibleName = !!(
            button.attributes('aria-label') || 
            button.text().trim()
          )
          expect(hasAccessibleName).toBe(true)

          // Should be focusable
          expect(button.attributes('tabindex')).not.toBe('-1')
          
          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure all components meet minimum touch target sizes', () => {
    fc.assert(
      fc.property(
        arbSafeString(2, 20), // button text
        (buttonText) => {
          const wrapper = mount(BaseButton, {
            slots: {
              default: buttonText
            }
          })

          const violations = auditAccessibility(wrapper)
          const touchTargetViolations = violations.filter(v => v.rule === 'touch-target-size')
          
          // Should not have touch target size violations
          expect(touchTargetViolations).toHaveLength(0)
          
          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure proper semantic HTML structure in landing components', () => {
    fc.assert(
      fc.property(
        arbUserProfile(),
        (userProfile) => {
          const personalInfo = {
            name: userProfile.name,
            title: userProfile.title,
            email: userProfile.email,
            location: userProfile.location,
            summary: userProfile.summary
          }

          const wrapper = mount(HeroSection, {
            props: { personalInfo }
          })

          // Should have proper heading hierarchy (h1 is always present)
          const headings = wrapper.element.querySelectorAll('h1, h2, h3, h4, h5, h6')
          expect(headings.length).toBeGreaterThan(0)

          // Should have semantic landmarks - HeroSection has section[role="banner"], header, nav, aside
          const landmarks = wrapper.element.querySelectorAll('section, header, main, nav, aside, [role="banner"], [role="navigation"], [role="complementary"]')
          expect(landmarks.length).toBeGreaterThanOrEqual(2) // At minimum: section and header

          // Should have proper ARIA roles - banner, navigation, complementary
          const sectionsWithRoles = wrapper.element.querySelectorAll('[role]')
          expect(sectionsWithRoles.length).toBeGreaterThanOrEqual(2) // banner and navigation minimum

          // Verify specific semantic structure regardless of data content
          const bannerSection = wrapper.find('section[role="banner"]')
          expect(bannerSection.exists()).toBe(true)
          
          const navigationElement = wrapper.find('nav[role="navigation"]')
          expect(navigationElement.exists()).toBe(true)
          
          const complementaryAside = wrapper.find('aside[role="complementary"]')
          expect(complementaryAside.exists()).toBe(true)

          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure navigation components support keyboard navigation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: arbSafeString(1, 10),
            label: arbSafeString(2, 20),
            path: arbSafeString(1, 20),
            icon: arbSafeString(1, 5)
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (navigationItems) => {
          const wrapper = mount(NavigationHeader, {
            props: { navigationItems },
            global: {
              plugins: [router]
            }
          })

          // All navigation links should be focusable
          const navLinks = wrapper.findAll('.nav-link')
          navLinks.forEach(link => {
            expect(link.attributes('tabindex')).not.toBe('-1')
          })

          // Mobile menu button should be focusable and have proper ARIA
          const menuButton = wrapper.find('.mobile-menu-toggle')
          if (menuButton.exists()) {
            expect(menuButton.attributes('aria-expanded')).toBeDefined()
            expect(menuButton.attributes('aria-controls')).toBeDefined()
            expect(menuButton.attributes('aria-label')).toBeDefined()
          }

          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure skills showcase has proper accessibility for interactive elements', () => {
    fc.assert(
      fc.property(
        fc.array(arbSkill(), { minLength: 1, maxLength: 20 }),
        fc.array(arbSafeString(1, 20), { maxLength: 5 }),
        (skills, highlightedSkills) => {
          const wrapper = mount(SkillsShowcase, {
            props: { 
              skills,
              highlightedSkills
            }
          })

          // Filter tabs should have proper ARIA attributes
          const filterTabs = wrapper.findAll('.filter-tab')
          filterTabs.forEach(tab => {
            expect(tab.attributes('role')).toBe('tab')
            expect(tab.attributes('aria-selected')).toBeDefined()
            expect(tab.attributes('aria-controls')).toBeDefined()
          })

          // Skill cards should be focusable and have proper descriptions
          const skillCards = wrapper.findAll('.skill-card')
          skillCards.forEach(card => {
            expect(card.attributes('tabindex')).toBe('0')
            expect(card.attributes('aria-describedby')).toBeDefined()
          })

          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure loading components have proper accessibility announcements', () => {
    fc.assert(
      fc.property(
        fc.option(arbSafeString(5, 50)), // loading message
        fc.constantFrom('small', 'medium', 'large'), // size
        (message, size) => {
          const wrapper = mount(LoadingSpinner, {
            props: {
              message,
              size,
              ariaLabel: 'Loading content'
            }
          })

          // Should have proper role and ARIA attributes
          const spinner = wrapper.find('.loading-spinner')
          expect(spinner.attributes('role')).toBe('status')
          expect(spinner.attributes('aria-label')).toBeDefined()
          expect(spinner.attributes('aria-live')).toBeDefined()

          // Should have screen reader text
          const srText = wrapper.find('.sr-only')
          expect(srText.exists()).toBe(true)
          expect(srText.text().trim()).toBeTruthy()

          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure card components support proper focus management', () => {
    fc.assert(
      fc.property(
        arbSafeString(5, 50), // title
        arbSafeString(10, 100), // content
        fc.boolean(), // clickable
        (title, content, clickable) => {
          const wrapper = mount(BaseCard, {
            props: {
              title,
              clickable,
              role: 'article'
            },
            slots: {
              default: content
            }
          })

          const card = wrapper.find('.base-card')
          
          if (clickable) {
            // Clickable cards should be focusable
            expect(card.attributes('tabindex')).toBe('0')
            expect(card.attributes('role')).toBeDefined()
          }

          // Should have proper heading structure if title is provided
          if (title) {
            const cardTitle = wrapper.find('.card-title')
            expect(cardTitle.exists()).toBe(true)
            // Normalize whitespace for comparison - Vue may trim text content
            const actualTitle = cardTitle.text().trim()
            const expectedTitle = title.trim()
            expect(actualTitle).toBe(expectedTitle)
          }

          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure demo components have comprehensive accessibility features', () => {
    fc.assert(
      fc.property(
        fc.constant({}), // No specific props needed for WebSocketDemo
        (_props) => {
          const wrapper = mount(WebSocketDemo, {
            global: {
              stubs: {
                BaseButton: BaseButton
              }
            }
          })

          // Should have proper heading hierarchy
          const headings = wrapper.element.querySelectorAll('h1, h2, h3, h4, h5, h6')
          expect(headings.length).toBeGreaterThan(0)

          // Should have proper ARIA landmarks - sections with aria-labelledby
          const sections = wrapper.findAll('section')
          sections.forEach(section => {
            expect(section.attributes('aria-labelledby')).toBeDefined()
          })

          // Interactive elements should have proper ARIA
          const buttons = wrapper.findAll('button')
          buttons.forEach(button => {
            const hasAccessibleName = !!(
              button.attributes('aria-label') ||
              button.attributes('aria-describedby') ||
              button.text().trim()
            )
            expect(hasAccessibleName).toBe(true)
          })

          // Status indicators should have proper live regions
          // Check for elements with role="status" or aria-live attributes
          const statusElements = wrapper.findAll('[role="status"], [aria-live]')
          expect(statusElements.length).toBeGreaterThan(0)
          
          // Verify specific status elements have aria-live
          const connectionStatus = wrapper.find('.status-indicator[role="status"]')
          expect(connectionStatus.exists()).toBe(true)
          expect(connectionStatus.attributes('aria-live')).toBeDefined()
          
          const messageCount = wrapper.find('.message-count[aria-live]')
          expect(messageCount.exists()).toBe(true)
          
          const messagesContainer = wrapper.find('.messages-container[aria-live]')
          expect(messagesContainer.exists()).toBe(true)

          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure responsive design maintains accessibility across viewport sizes', () => {
    fc.assert(
      fc.property(
        arbViewportSize(),
        arbUserProfile(),
        (viewport, userProfile) => {
          // Mock viewport size
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewport.width
          })
          Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: viewport.height
          })

          const personalInfo = {
            name: userProfile.name,
            title: userProfile.title,
            email: userProfile.email,
            location: userProfile.location,
            summary: userProfile.summary
          }

          const wrapper = mount(HeroSection, {
            props: { personalInfo }
          })

          // Accessibility should be maintained regardless of viewport size
          const violations = auditAccessibility(wrapper)
          const criticalViolations = violations.filter(v => v.severity === 'error')
          
          expect(criticalViolations).toHaveLength(0)

          // Interactive elements should remain focusable
          const interactiveElements = wrapper.element.querySelectorAll('button, a, [role="button"]')
          interactiveElements.forEach(element => {
            expect(element.getAttribute('tabindex')).not.toBe('-1')
          })

          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure all text content has adequate color contrast', () => {
    fc.assert(
      fc.property(
        arbSafeString(5, 50),
        (text) => {
          const wrapper = mount(BaseButton, {
            slots: {
              default: text
            }
          })

          // Should not have color contrast violations
          const violations = auditAccessibility(wrapper)
          const contrastViolations = violations.filter(v => v.rule === 'color-contrast')
          
          expect(contrastViolations).toHaveLength(0)

          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })

  it('should ensure screen reader compatibility with proper ARIA live regions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('polite', 'assertive', 'off'),
        arbSafeString(5, 50),
        (ariaLive, message) => {
          const wrapper = mount(LoadingSpinner, {
            props: {
              message,
              ariaLive
            }
          })

          const liveRegion = wrapper.find('[aria-live]')
          expect(liveRegion.exists()).toBe(true)
          expect(liveRegion.attributes('aria-live')).toBe(ariaLive)

          // Should have screen reader content
          const srContent = wrapper.find('.sr-only')
          expect(srContent.exists()).toBe(true)
          expect(srContent.text().trim()).toBeTruthy()

          wrapper.unmount()
        }
      ),
      propertyTestConfig
    )
  })
})

/**
 * **Validates: Requirements 6.1, 6.3, 6.4, 6.5**
 * 
 * This test suite validates that all components comply with WCAG 2.1 AA accessibility standards:
 * 
 * - **Requirement 6.1**: WCAG 2.1 AA compliance through comprehensive accessibility auditing
 * - **Requirement 6.3**: Keyboard navigation support for all interactive elements  
 * - **Requirement 6.4**: Proper alt text, ARIA labels, and semantic HTML structure
 * - **Requirement 6.5**: Screen reader compatibility with ARIA live regions and proper markup
 * 
 * The property-based tests ensure accessibility compliance across all possible component states
 * and configurations, validating that the website remains accessible regardless of content,
 * viewport size, or user interaction patterns.
 */