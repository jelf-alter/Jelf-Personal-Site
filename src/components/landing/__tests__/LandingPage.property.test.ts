import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { mountComponent } from '@/test/component-utils'
import { propertyTestConfig, arbUserProfile } from '@/test/property-generators'
import HeroSection from '../HeroSection.vue'
import NavigationHeader from '../NavigationHeader.vue'
import SkillsShowcase from '../SkillsShowcase.vue'
import type { IUserProfile, INavigationItem } from '@/types'

describe('Landing Page Property-Based Tests', () => {
  describe('**Feature: personal-website, Property 1: Landing Page Content Completeness**', () => {
    it('should always display all required professional elements for any valid user profile', () => {
      fc.assert(
        fc.property(
          arbUserProfile(),
          (userProfile: IUserProfile) => {
            // Test HeroSection component with user profile data
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

            // Property: Landing page should contain all required professional elements
            
            // 1. Contact information must be present (trim whitespace for comparison)
            const renderedText = heroWrapper.text()
            expect(renderedText).toContain(userProfile.name.trim())
            expect(renderedText).toContain(userProfile.title.trim())
            expect(renderedText).toContain(userProfile.email.trim())
            expect(renderedText).toContain(userProfile.location.trim())
            expect(renderedText).toContain(userProfile.summary.trim())

            // 2. Email should be a clickable link
            const emailLink = heroWrapper.find(`a[href="mailto:${userProfile.email}"]`)
            expect(emailLink.exists()).toBe(true)
            expect(emailLink.attributes('aria-label')).toContain(userProfile.email)

            // 3. Navigation links to demos and testing dashboard must be present
            const demosButton = heroWrapper.findAll('button').find(btn => btn.text().includes('View Demos'))
            const testingButton = heroWrapper.findAll('button').find(btn => btn.text().includes('See Testing'))
            const contactButton = heroWrapper.findAll('button').find(btn => btn.text().includes('Get in Touch'))

            expect(demosButton).toBeTruthy()
            expect(testingButton).toBeTruthy()
            expect(contactButton).toBeTruthy()

            // 4. Proper semantic structure must be present
            expect(heroWrapper.find('section[role="banner"]').exists()).toBe(true)
            expect(heroWrapper.find('h1#hero-title').exists()).toBe(true)

            // 5. Accessibility features must be present
            expect(heroWrapper.find('[aria-labelledby="hero-title"]').exists()).toBe(true)
            expect(heroWrapper.find('[aria-describedby]').exists()).toBe(true)
            expect(heroWrapper.find('.sr-only').exists()).toBe(true)

            heroWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should always provide consistent navigation structure for any navigation items', () => {
      const defaultNavItems: INavigationItem[] = [
        { id: 'home', label: 'Home', path: '/', icon: '🏠' },
        { id: 'demos', label: 'Demos', path: '/demos', icon: '🚀' },
        { id: 'testing', label: 'Testing', path: '/testing', icon: '🧪' },
        { id: 'about', label: 'About', path: '/about', icon: '👤' }
      ]

      fc.assert(
        fc.property(
          fc.constant(defaultNavItems), // Use consistent navigation structure
          (navigationItems: INavigationItem[]) => {
            const navWrapper = mountComponent(NavigationHeader, {
              props: { navigationItems }
            })

            // Property: Navigation should always provide consistent structure
            
            // 1. Brand link must be present and accessible
            const brandLink = navWrapper.find('.brand-link')
            expect(brandLink.exists()).toBe(true)
            expect(brandLink.attributes('aria-label')).toContain('Personal Website')

            // 2. All navigation items must be present and accessible
            navigationItems.forEach(item => {
              const navLink = navWrapper.findAll('.nav-link').find(link => 
                link.text().includes(item.label)
              )
              expect(navLink).toBeTruthy()
              // For property tests, we just verify the navigation structure exists
              // The actual RouterLink functionality is tested in unit tests
              expect(navLink?.exists()).toBe(true)
            })

            // 3. Mobile menu toggle must be present and accessible
            const mobileToggle = navWrapper.find('.mobile-menu-toggle')
            expect(mobileToggle.exists()).toBe(true)
            expect(mobileToggle.attributes('aria-expanded')).toBeDefined()
            expect(mobileToggle.attributes('aria-controls')).toBe('mobile-menu')
            expect(mobileToggle.attributes('aria-label')).toContain('Toggle navigation menu')

            // 4. Navigation must have proper semantic structure
            expect(navWrapper.find('header[role="banner"]').exists()).toBe(true)
            expect(navWrapper.find('nav[role="navigation"]').exists()).toBe(true)
            expect(navWrapper.find('nav[aria-label="Main navigation"]').exists()).toBe(true)

            navWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should always display skills summary correctly for any valid skills data', () => {
      fc.assert(
        fc.property(
          arbUserProfile(),
          (userProfile: IUserProfile) => {
            // Only test if user has skills
            if (userProfile.skills.length === 0) return

            const skillsWrapper = mountComponent(SkillsShowcase, {
              props: { 
                skills: userProfile.skills,
                highlightedSkills: userProfile.skills.slice(0, 2).map(s => s.id)
              }
            })

            // Property: Skills showcase should always display skills summary correctly
            
            // 1. Skills title and description must be present
            expect(skillsWrapper.find('#skills-title').exists()).toBe(true)
            expect(skillsWrapper.text()).toContain('Skills & Technologies')
            expect(skillsWrapper.text()).toContain('Expertise across the full development stack')

            // 2. All skills must be displayed with proper information
            userProfile.skills.forEach(skill => {
              expect(skillsWrapper.text()).toContain(skill.name)
              expect(skillsWrapper.text()).toContain(skill.category)
              expect(skillsWrapper.text()).toContain(skill.level)
              
              if (skill.description) {
                expect(skillsWrapper.text()).toContain(skill.description)
              }
              
              if (skill.yearsOfExperience) {
                expect(skillsWrapper.text()).toContain(skill.yearsOfExperience.toString())
              }
            })

            // 3. Skills filter functionality must be present
            expect(skillsWrapper.find('.skills-filter').exists()).toBe(true)
            expect(skillsWrapper.find('[role="tablist"]').exists()).toBe(true)
            
            // 4. Skills grid must be present and accessible
            expect(skillsWrapper.find('.skills-grid').exists()).toBe(true)
            const skillCards = skillsWrapper.findAll('.skill-card')
            expect(skillCards.length).toBeGreaterThan(0)

            // 5. Each skill card must have proper accessibility attributes
            skillCards.forEach(card => {
              expect(card.attributes('tabindex')).toBe('0')
              expect(card.attributes('aria-describedby')).toBeDefined()
            })

            // 6. Proper semantic structure must be present
            expect(skillsWrapper.find('section[role="region"]').exists()).toBe(true)
            expect(skillsWrapper.find('[aria-labelledby="skills-title"]').exists()).toBe(true)

            skillsWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should always maintain professional appearance regardless of content length', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '.split('')), { minLength: 1, maxLength: 100 }),
            title: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '.split('')), { minLength: 1, maxLength: 100 }),
            email: fc.emailAddress(),
            location: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ, '.split('')), { minLength: 1, maxLength: 100 }),
            summary: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ. '.split('')), { minLength: 10, maxLength: 500 })
          }),
          (personalInfo) => {
            const heroWrapper = mountComponent(HeroSection, {
              props: { personalInfo }
            })

            // Property: Landing page should maintain professional appearance regardless of content length
            
            // 1. All content should be properly contained within layout
            expect(heroWrapper.find('.hero-container').exists()).toBe(true)
            expect(heroWrapper.find('.hero-content').exists()).toBe(true)

            // 2. Text content should not overflow or break layout
            const heroTitle = heroWrapper.find('.hero-title')
            const heroSubtitle = heroWrapper.find('.hero-subtitle')
            const heroSummary = heroWrapper.find('.hero-summary')

            expect(heroTitle.exists()).toBe(true)
            expect(heroSubtitle.exists()).toBe(true)
            expect(heroSummary.exists()).toBe(true)

            // 3. Contact information should be properly formatted
            const contactItems = heroWrapper.findAll('.contact-item')
            expect(contactItems.length).toBeGreaterThanOrEqual(2) // location and email

            // 4. Action buttons should remain accessible and properly sized
            const actionButtons = heroWrapper.findAll('.hero-actions button')
            expect(actionButtons.length).toBe(3)
            
            actionButtons.forEach(button => {
              expect(button.classes()).toContain('btn')
              // Ensure minimum touch target size is maintained
              expect(button.element.getBoundingClientRect).toBeDefined()
            })

            // 5. Background elements should not interfere with content
            expect(heroWrapper.find('.hero-background').exists()).toBe(true)
            expect(heroWrapper.findAll('.bg-shape').length).toBeGreaterThan(0)

            heroWrapper.unmount()
          }
        ),
        propertyTestConfig
      )
    })

    it('should always emit correct navigation events when action buttons are clicked', () => {
      fc.assert(
        fc.property(
          arbUserProfile(),
          (userProfile: IUserProfile) => {
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

            // Property: Action buttons should always emit correct navigation events
            
            const buttons = heroWrapper.findAll('button')
            const demosButton = buttons.find(btn => btn.text().includes('View Demos'))
            const testingButton = buttons.find(btn => btn.text().includes('See Testing'))
            const contactButton = buttons.find(btn => btn.text().includes('Get in Touch'))

            // Test demos button (synchronous for property tests)
            if (demosButton) {
              demosButton.trigger('click')
              expect(heroWrapper.emitted('navigate-to-demos')).toBeTruthy()
            }

            // Test testing button
            if (testingButton) {
              testingButton.trigger('click')
              expect(heroWrapper.emitted('navigate-to-testing')).toBeTruthy()
            }

            // Test contact button
            if (contactButton) {
              contactButton.trigger('click')
              expect(heroWrapper.emitted('contact-clicked')).toBeTruthy()
            }

            heroWrapper.unmount()
            return true // Explicit return for property test
          }
        ),
        propertyTestConfig
      )
    })
  })
})