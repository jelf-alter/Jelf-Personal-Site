import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mountComponent } from '@/test/component-utils'
import { propertyTestConfig, arbUserProfile, arbViewportSize } from '@/test/property-generators'
import { TEST_CONFIG } from '@/test/test-config'
import HeroSection from '../HeroSection.vue'
import NavigationHeader from '../NavigationHeader.vue'
import SkillsShowcase from '../SkillsShowcase.vue'
import type { IUserProfile, INavigationItem } from '@/types'

// Viewport simulation helper
const setViewport = (width: number, height: number = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

// Responsive breakpoint generator
const arbResponsiveBreakpoint = () => 
  fc.constantFrom(
    { name: 'mobile', width: 320, height: 568 },
    { name: 'small-mobile', width: 375, height: 667 },
    { name: 'large-mobile', width: 414, height: 896 },
    { name: 'small-tablet', width: 576, height: 768 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'small-desktop', width: 992, height: 768 },
    { name: 'desktop', width: 1024, height: 768 },
    { name: 'large-desktop', width: 1200, height: 800 },
    { name: 'xl-desktop', width: 1440, height: 900 },
    { name: 'ultra-wide', width: 1920, height: 1080 }
  )

// Generate viewport sizes within the required range (320px to 1920px)
const arbValidViewportSize = () => 
  fc.record({
    width: fc.integer({ min: 320, max: 1920 }),
    height: fc.integer({ min: 568, max: 1080 })
  })

describe('Responsive Design Property-Based Tests', () => {
  beforeEach(() => {
    // Reset viewport to default
    setViewport(1024, 768)
  })

  afterEach(() => {
    // Clean up
    setViewport(1024, 768)
  })

  describe('**Feature: personal-website, Property 2: Responsive Design Consistency**', () => {
    it('should maintain professional appearance and readability across all viewport widths', () => {
      fc.assert(
        fc.property(
          arbValidViewportSize(),
          arbUserProfile(),
          (viewport, userProfile) => {
            // Set the viewport size
            setViewport(viewport.width, viewport.height)

            const heroWrapper = mountComponent(HeroSection, {
              props: { 
                personalInfo: {
                  name: userProfile.name,
                  title: userProfile.title,
                  email: userProfile.email,
                  location: userProfile.location,
                  summary: userProfile.summary
                }
              }
            })

            // Property: Professional appearance should be maintained across all viewport sizes
            
            // 1. Core layout elements must always be present and visible
            expect(heroWrapper.find('.hero-section').exists()).toBe(true)
            expect(heroWrapper.find('.hero-container').exists()).toBe(true)
            expect(heroWrapper.find('.hero-content').exists()).toBe(true)
            expect(heroWrapper.find('.hero-actions').exists()).toBe(true)

            // 2. Essential content must always be readable and accessible
            const renderedText = heroWrapper.text()
            expect(renderedText).toContain(userProfile.name.trim())
            expect(renderedText).toContain(userProfile.title.trim())
            expect(renderedText).toContain(userProfile.email.trim())
            expect(renderedText).toContain(userProfile.location.trim())
            expect(renderedText).toContain(userProfile.summary.trim())

            // 3. Navigation elements must be present and functional
            const actionButtons = heroWrapper.findAll('.hero-actions button')
            expect(actionButtons.length).toBe(3) // View Demos, See Testing, Get in Touch

            // 4. Contact information must remain accessible
            const emailLink = heroWrapper.find(`a[href="mailto:${userProfile.email}"]`)
            expect(emailLink.exists()).toBe(true)

            // 5. Semantic structure must be preserved
            expect(heroWrapper.find('section[role="banner"]').exists()).toBe(true)
            expect(heroWrapper.find('h1#hero-title').exists()).toBe(true)

            // 6. Background elements should not interfere with content
            expect(heroWrapper.find('.hero-background').exists()).toBe(true)

            heroWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should maintain navigation functionality across all viewport sizes', () => {
      const defaultNavItems: INavigationItem[] = [
        { id: 'home', label: 'Home', path: '/', icon: '🏠' },
        { id: 'demos', label: 'Demos', path: '/demos', icon: '🚀' },
        { id: 'testing', label: 'Testing', path: '/testing', icon: '🧪' },
        { id: 'about', label: 'About', path: '/about', icon: '👤' }
      ]

      fc.assert(
        fc.property(
          arbValidViewportSize(),
          (viewport) => {
            // Set the viewport size
            setViewport(viewport.width, viewport.height)

            const navWrapper = mountComponent(NavigationHeader, {
              props: { navigationItems: defaultNavItems }
            })

            // Property: Navigation functionality should be maintained across all viewport sizes
            
            // 1. Core navigation structure must always be present
            expect(navWrapper.find('.navigation-header').exists()).toBe(true)
            expect(navWrapper.find('.navbar').exists()).toBe(true)
            expect(navWrapper.find('.nav-links').exists()).toBe(true)

            // 2. Brand link must always be accessible
            const brandLink = navWrapper.find('.brand-link')
            expect(brandLink.exists()).toBe(true)
            expect(brandLink.attributes('aria-label')).toContain('Personal Website')

            // 3. Mobile menu toggle must be present (for responsive behavior)
            const mobileToggle = navWrapper.find('.mobile-menu-toggle')
            expect(mobileToggle.exists()).toBe(true)
            expect(mobileToggle.attributes('aria-expanded')).toBeDefined()
            expect(mobileToggle.attributes('aria-controls')).toBe('mobile-menu')

            // 4. All navigation items must be accessible
            defaultNavItems.forEach(item => {
              const navLink = navWrapper.findAll('.nav-link').find(link => 
                link.text().includes(item.label)
              )
              expect(navLink).toBeTruthy()
              expect(navLink?.exists()).toBe(true)
            })

            // 5. Semantic structure must be preserved
            expect(navWrapper.find('header[role="banner"]').exists()).toBe(true)
            expect(navWrapper.find('nav[role="navigation"]').exists()).toBe(true)
            expect(navWrapper.find('nav[aria-label="Main navigation"]').exists()).toBe(true)

            navWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should maintain skills showcase layout and functionality across all viewport sizes', () => {
      fc.assert(
        fc.property(
          arbValidViewportSize(),
          arbUserProfile(),
          (viewport, userProfile) => {
            // Only test if user has skills
            if (userProfile.skills.length === 0) return

            // Set the viewport size
            setViewport(viewport.width, viewport.height)

            const skillsWrapper = mountComponent(SkillsShowcase, {
              props: { 
                skills: userProfile.skills,
                highlightedSkills: userProfile.skills.slice(0, 2).map(s => s.id)
              }
            })

            // Property: Skills showcase should maintain layout and functionality across all viewport sizes
            
            // 1. Core skills structure must always be present
            expect(skillsWrapper.find('.skills-showcase').exists()).toBe(true)
            expect(skillsWrapper.find('.skills-grid').exists()).toBe(true)
            expect(skillsWrapper.find('.skills-filter').exists()).toBe(true)

            // 2. Skills title and description must remain visible
            expect(skillsWrapper.find('#skills-title').exists()).toBe(true)
            expect(skillsWrapper.text()).toContain('Skills & Technologies')

            // 3. All skills must be displayed regardless of viewport size
            userProfile.skills.forEach(skill => {
              expect(skillsWrapper.text()).toContain(skill.name)
              expect(skillsWrapper.text()).toContain(skill.category)
              expect(skillsWrapper.text()).toContain(skill.level)
            })

            // 4. Skills grid must adapt to viewport size
            const skillCards = skillsWrapper.findAll('.skill-card')
            expect(skillCards.length).toBeGreaterThan(0)
            expect(skillCards.length).toBe(userProfile.skills.length)

            // 5. Filter functionality must remain accessible
            expect(skillsWrapper.find('[role="tablist"]').exists()).toBe(true)
            const filterButtons = skillsWrapper.findAll('[role="tab"]')
            expect(filterButtons.length).toBeGreaterThan(0)

            // 6. Accessibility attributes must be preserved
            skillCards.forEach(card => {
              expect(card.attributes('tabindex')).toBe('0')
              expect(card.attributes('aria-describedby')).toBeDefined()
            })

            // 7. Semantic structure must be maintained
            expect(skillsWrapper.find('section[role="region"]').exists()).toBe(true)
            expect(skillsWrapper.find('[aria-labelledby="skills-title"]').exists()).toBe(true)

            skillsWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should prevent horizontal overflow and maintain content containment', () => {
      fc.assert(
        fc.property(
          arbValidViewportSize(),
          fc.record({
            name: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '.split('')), { minLength: 1, maxLength: 200 }),
            title: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '.split('')), { minLength: 1, maxLength: 200 }),
            email: fc.emailAddress(),
            location: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ, '.split('')), { minLength: 1, maxLength: 200 }),
            summary: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ. '.split('')), { minLength: 10, maxLength: 1000 })
          }),
          (viewport, personalInfo) => {
            // Set the viewport size
            setViewport(viewport.width, viewport.height)

            const heroWrapper = mountComponent(HeroSection, {
              props: { personalInfo }
            })

            // Property: Content should never cause horizontal overflow regardless of content length or viewport size
            
            // 1. Container elements must properly contain content
            expect(heroWrapper.find('.hero-container').exists()).toBe(true)
            expect(heroWrapper.find('.hero-content').exists()).toBe(true)

            // 2. Text elements must be present and contained
            const heroTitle = heroWrapper.find('.hero-title')
            const heroSubtitle = heroWrapper.find('.hero-subtitle')
            const heroSummary = heroWrapper.find('.hero-summary')

            expect(heroTitle.exists()).toBe(true)
            expect(heroSubtitle.exists()).toBe(true)
            expect(heroSummary.exists()).toBe(true)

            // 3. Long content should not break layout
            expect(heroTitle.text().trim()).toBe(personalInfo.name.trim())
            expect(heroSubtitle.text().trim()).toBe(personalInfo.title.trim())
            expect(heroSummary.text().trim()).toBe(personalInfo.summary.trim())

            // 4. Contact information should be properly formatted
            const contactItems = heroWrapper.findAll('.contact-item')
            expect(contactItems.length).toBeGreaterThanOrEqual(2)

            // 5. Email links should handle long addresses gracefully
            const emailLinks = heroWrapper.findAll('a[href^="mailto:"]')
            expect(emailLinks.length).toBeGreaterThan(0)
            const emailLink = emailLinks[0]
            expect(emailLink.exists()).toBe(true)
            expect(emailLink.text().trim()).toContain(personalInfo.email.trim())

            // 6. Action buttons should remain properly sized and accessible
            const actionButtons = heroWrapper.findAll('.hero-actions button')
            expect(actionButtons.length).toBe(3)
            
            actionButtons.forEach(button => {
              expect(button.classes()).toContain('btn')
              expect(button.exists()).toBe(true)
            })

            heroWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should maintain touch target accessibility across all viewport sizes', () => {
      const defaultNavItems: INavigationItem[] = [
        { id: 'home', label: 'Home', path: '/', icon: '🏠' },
        { id: 'demos', label: 'Demos', path: '/demos', icon: '🚀' },
        { id: 'testing', label: 'Testing', path: '/testing', icon: '🧪' },
        { id: 'about', label: 'About', path: '/about', icon: '👤' }
      ]

      fc.assert(
        fc.property(
          arbValidViewportSize(),
          arbUserProfile(),
          (viewport, userProfile) => {
            // Set the viewport size
            setViewport(viewport.width, viewport.height)

            const heroWrapper = mountComponent(HeroSection, {
              props: { 
                personalInfo: {
                  name: userProfile.name,
                  title: userProfile.title,
                  email: userProfile.email,
                  location: userProfile.location,
                  summary: userProfile.summary
                }
              }
            })

            const navWrapper = mountComponent(NavigationHeader, {
              props: { navigationItems: defaultNavItems }
            })

            // Property: Touch targets should remain accessible across all viewport sizes
            
            // 1. Hero action buttons should be touch-friendly
            const heroButtons = heroWrapper.findAll('.hero-actions button')
            expect(heroButtons.length).toBe(3)
            
            heroButtons.forEach(button => {
              expect(button.exists()).toBe(true)
              expect(button.classes()).toContain('btn')
              // Button should have proper accessibility attributes
              expect(button.attributes('aria-describedby')).toBeDefined()
            })

            // 2. Navigation links should be touch-friendly
            const navLinks = navWrapper.findAll('.nav-link')
            expect(navLinks.length).toBeGreaterThan(0)
            
            navLinks.forEach(link => {
              expect(link.exists()).toBe(true)
            })

            // 3. Mobile menu toggle should be accessible
            const mobileToggle = navWrapper.find('.mobile-menu-toggle')
            expect(mobileToggle.exists()).toBe(true)
            expect(mobileToggle.attributes('aria-expanded')).toBeDefined()
            expect(mobileToggle.attributes('aria-label')).toContain('Toggle navigation menu')

            // 4. Email contact link should be touch-friendly
            const emailLinks = heroWrapper.findAll('a[href^="mailto:"]')
            expect(emailLinks.length).toBeGreaterThan(0)
            const emailLink = emailLinks[0]
            expect(emailLink.exists()).toBe(true)
            expect(emailLink.text()).toContain(userProfile.email.trim())

            heroWrapper.unmount()
            navWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should maintain CSS Grid and Flexbox layouts across all viewport sizes', () => {
      fc.assert(
        fc.property(
          arbValidViewportSize(),
          arbUserProfile(),
          (viewport, userProfile) => {
            // Only test if user has skills
            if (userProfile.skills.length === 0) return

            // Set the viewport size
            setViewport(viewport.width, viewport.height)

            const heroWrapper = mountComponent(HeroSection, {
              props: { 
                personalInfo: {
                  name: userProfile.name,
                  title: userProfile.title,
                  email: userProfile.email,
                  location: userProfile.location,
                  summary: userProfile.summary
                }
              }
            })

            const skillsWrapper = mountComponent(SkillsShowcase, {
              props: { 
                skills: userProfile.skills,
                highlightedSkills: userProfile.skills.slice(0, 2).map(s => s.id)
              }
            })

            const navWrapper = mountComponent(NavigationHeader, {
              props: { 
                navigationItems: [
                  { id: 'home', label: 'Home', path: '/', icon: '🏠' },
                  { id: 'demos', label: 'Demos', path: '/demos', icon: '🚀' }
                ]
              }
            })

            // Property: CSS Grid and Flexbox layouts should function correctly across all viewport sizes
            
            // 1. Hero section should use proper layout structure
            expect(heroWrapper.find('.hero-content').exists()).toBe(true)
            expect(heroWrapper.find('.hero-actions').exists()).toBe(true)

            // 2. Navigation should use Flexbox layout
            expect(navWrapper.find('.navbar').exists()).toBe(true)
            expect(navWrapper.find('.nav-links').exists()).toBe(true)

            // 3. Skills showcase should use CSS Grid
            expect(skillsWrapper.find('.skills-grid').exists()).toBe(true)
            expect(skillsWrapper.find('.skills-filter').exists()).toBe(true)

            // 4. Layout elements should be properly structured
            const skillCards = skillsWrapper.findAll('.skill-card')
            expect(skillCards.length).toBe(userProfile.skills.length)
            expect(skillCards.length).toBeGreaterThan(0)

            // 5. Filter layout should be maintained
            const filterTabs = skillsWrapper.findAll('[role="tab"]')
            expect(filterTabs.length).toBeGreaterThan(0)

            heroWrapper.unmount()
            skillsWrapper.unmount()
            navWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should handle extreme viewport sizes gracefully', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            { width: 320, height: 568 }, // Minimum supported
            { width: 1920, height: 1080 }, // Maximum supported
            { width: 320, height: 1080 }, // Narrow and tall
            { width: 1920, height: 568 } // Wide and short
          ),
          arbUserProfile(),
          (viewport, userProfile) => {
            // Set the extreme viewport size
            setViewport(viewport.width, viewport.height)

            const heroWrapper = mountComponent(HeroSection, {
              props: { 
                personalInfo: {
                  name: userProfile.name,
                  title: userProfile.title,
                  email: userProfile.email,
                  location: userProfile.location,
                  summary: userProfile.summary
                }
              }
            })

            // Property: Components should handle extreme viewport sizes gracefully
            
            // 1. Core structure should remain intact
            expect(heroWrapper.find('.hero-section').exists()).toBe(true)
            expect(heroWrapper.find('.hero-container').exists()).toBe(true)
            expect(heroWrapper.find('.hero-content').exists()).toBe(true)

            // 2. Essential content should remain accessible
            const renderedText = heroWrapper.text()
            expect(renderedText).toContain(userProfile.name.trim())
            expect(renderedText).toContain(userProfile.title.trim())
            expect(renderedText).toContain(userProfile.email.trim())

            // 3. Interactive elements should remain functional
            const actionButtons = heroWrapper.findAll('.hero-actions button')
            expect(actionButtons.length).toBe(3)

            // 4. Accessibility should be preserved
            expect(heroWrapper.find('section[role="banner"]').exists()).toBe(true)
            expect(heroWrapper.find('h1#hero-title').exists()).toBe(true)

            heroWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })
  })
})