import { describe, it, expect } from 'vitest'
import { mountComponent } from '@/test/component-utils'
import NavigationHeader from '../NavigationHeader.vue'
import type { INavigationItem } from '@/types'

const mockNavigationItems: INavigationItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: '🏠' },
  { id: 'demos', label: 'Demos', path: '/demos', icon: '🚀' },
  { id: 'testing', label: 'Testing', path: '/testing', icon: '🧪' },
  { id: 'about', label: 'About', path: '/about', icon: '👤' }
]

describe('NavigationHeader', () => {
  describe('Basic Functionality', () => {
    it('renders with default navigation items', () => {
      const wrapper = mountComponent(NavigationHeader)

      expect(wrapper.text()).toContain('Home')
      expect(wrapper.text()).toContain('Demos')
      expect(wrapper.text()).toContain('Testing')
      expect(wrapper.text()).toContain('About')
    })

    it('renders with custom navigation items', () => {
      const customItems: INavigationItem[] = [
        { id: 'custom', label: 'Custom Page', path: '/custom' }
      ]

      const wrapper = mountComponent(NavigationHeader, {
        props: { navigationItems: customItems }
      })

      expect(wrapper.text()).toContain('Custom Page')
    })

    it('renders brand link', () => {
      const wrapper = mountComponent(NavigationHeader)

      const brandLink = wrapper.find('.brand-link')
      expect(brandLink.exists()).toBe(true)
      expect(brandLink.text()).toBe('Personal Website')
    })
  })

  describe('Mobile Menu', () => {
    it('renders mobile menu toggle button', () => {
      const wrapper = mountComponent(NavigationHeader)

      const toggleButton = wrapper.find('.mobile-menu-toggle')
      expect(toggleButton.exists()).toBe(true)
      expect(toggleButton.attributes('aria-expanded')).toBe('false')
    })

    it('toggles mobile menu when button is clicked', async () => {
      const wrapper = mountComponent(NavigationHeader)

      const toggleButton = wrapper.find('.mobile-menu-toggle')
      await toggleButton.trigger('click')

      expect(toggleButton.classes()).toContain('is-active')
      expect(toggleButton.attributes('aria-expanded')).toBe('true')
      expect(wrapper.find('.nav-links.is-open').exists()).toBe(true)
    })

    it('emits menu-toggled event when mobile menu is toggled', async () => {
      const wrapper = mountComponent(NavigationHeader)

      const toggleButton = wrapper.find('.mobile-menu-toggle')
      await toggleButton.trigger('click')

      expect(wrapper.emitted('menu-toggled')).toBeTruthy()
      expect(wrapper.emitted('menu-toggled')?.[0]).toEqual([true])
    })

    it('closes mobile menu when navigation link is clicked', async () => {
      const wrapper = mountComponent(NavigationHeader)

      // Open mobile menu first
      const toggleButton = wrapper.find('.mobile-menu-toggle')
      await toggleButton.trigger('click')

      // Click a navigation link
      const navLink = wrapper.find('.nav-link')
      await navLink.trigger('click')

      expect(toggleButton.classes()).not.toContain('is-active')
      expect(wrapper.find('.nav-links.is-open').exists()).toBe(false)
    })
  })

  describe('Navigation Links', () => {
    it('renders all navigation links', () => {
      const wrapper = mountComponent(NavigationHeader, {
        props: { navigationItems: mockNavigationItems }
      })

      // Check that all navigation labels are present in the text
      mockNavigationItems.forEach(item => {
        expect(wrapper.text()).toContain(item.label)
      })

      // Check that nav-link elements exist
      const navLinks = wrapper.findAll('.nav-link')
      expect(navLinks.length).toBe(mockNavigationItems.length)
    })

    it('renders icons when provided', () => {
      const wrapper = mountComponent(NavigationHeader, {
        props: { navigationItems: mockNavigationItems }
      })

      mockNavigationItems.forEach(item => {
        if (item.icon) {
          expect(wrapper.text()).toContain(item.icon)
        }
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const wrapper = mountComponent(NavigationHeader)

      expect(wrapper.find('[role="banner"]').exists()).toBe(true)
      expect(wrapper.find('[role="navigation"]').exists()).toBe(true)
      expect(wrapper.find('[aria-label="Main navigation"]').exists()).toBe(true)
    })

    it('has proper mobile menu accessibility', () => {
      const wrapper = mountComponent(NavigationHeader)

      const toggleButton = wrapper.find('.mobile-menu-toggle')
      expect(toggleButton.attributes('aria-expanded')).toBeDefined()
      expect(toggleButton.attributes('aria-controls')).toBe('mobile-menu')
      expect(toggleButton.attributes('aria-label')).toBe('Toggle navigation menu')

      const mobileMenu = wrapper.find('#mobile-menu')
      expect(mobileMenu.exists()).toBe(true)
    })

    it('supports keyboard navigation', () => {
      const wrapper = mountComponent(NavigationHeader)

      const focusableElements = wrapper.findAll('a, button')
      expect(focusableElements.length).toBeGreaterThan(0)

      // All links should be keyboard accessible
      const navLinks = wrapper.findAll('.nav-link')
      navLinks.forEach(link => {
        expect(link.element.tagName).toBe('A')
      })
    })
  })

  describe('Responsive Design', () => {
    it('has responsive classes', () => {
      const wrapper = mountComponent(NavigationHeader)

      expect(wrapper.find('.navigation-header').exists()).toBe(true)
      expect(wrapper.find('.navbar').exists()).toBe(true)
      expect(wrapper.find('.nav-links').exists()).toBe(true)
    })
  })
})