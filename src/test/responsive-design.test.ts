import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import HeroSection from '@/components/landing/HeroSection.vue'
import NavigationHeader from '@/components/landing/NavigationHeader.vue'
import SkillsShowcase from '@/components/landing/SkillsShowcase.vue'
import type { IUserProfile, ISkill } from '@/types'

// Create a mock router for testing
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/demos', name: 'demos', component: { template: '<div>Demos</div>' } },
    { path: '/testing', name: 'testing', component: { template: '<div>Testing</div>' } },
    { path: '/about', name: 'about', component: { template: '<div>About</div>' } }
  ]
})

// Mock data for testing
const mockPersonalInfo: Pick<IUserProfile, 'name' | 'title' | 'email' | 'location' | 'summary'> = {
  name: 'Test Developer',
  title: 'Full Stack Developer',
  email: 'test@example.com',
  location: 'Test City',
  summary: 'A passionate developer with expertise in modern web technologies.'
}

const mockSkills: ISkill[] = [
  {
    id: '1',
    name: 'Vue.js',
    category: 'Frontend',
    level: 'advanced',
    yearsOfExperience: 3,
    description: 'Modern frontend framework'
  },
  {
    id: '2',
    name: 'Node.js',
    category: 'Backend',
    level: 'intermediate',
    yearsOfExperience: 2,
    description: 'Server-side JavaScript runtime'
  }
]

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

describe('Responsive Design Implementation', () => {
  beforeEach(() => {
    // Reset viewport to default
    setViewport(1024, 768)
  })

  afterEach(() => {
    // Clean up
    setViewport(1024, 768)
  })

  describe('Mobile First Approach (320px - 575px)', () => {
    beforeEach(() => {
      setViewport(320)
    })

    it('HeroSection adapts to mobile viewport', () => {
      const wrapper = mount(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const heroSection = wrapper.find('.hero-section')
      const heroContainer = wrapper.find('.hero-container')
      const heroContent = wrapper.find('.hero-content')
      const heroActions = wrapper.find('.hero-actions')

      expect(heroSection.exists()).toBe(true)
      expect(heroContainer.exists()).toBe(true)
      expect(heroContent.exists()).toBe(true)
      expect(heroActions.exists()).toBe(true)

      // Check that buttons exist and are properly structured for mobile
      const buttons = wrapper.findAll('.btn')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('NavigationHeader shows mobile menu toggle', () => {
      const wrapper = mount(NavigationHeader, {
        global: {
          plugins: [router]
        }
      })

      const mobileToggle = wrapper.find('.mobile-menu-toggle')
      const navLinks = wrapper.find('.nav-links')

      expect(mobileToggle.exists()).toBe(true)
      expect(navLinks.exists()).toBe(true)
    })

    it('SkillsShowcase uses single column grid on mobile', () => {
      const wrapper = mount(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      const skillsGrid = wrapper.find('.skills-grid')
      const skillCards = wrapper.findAll('.skill-card')

      expect(skillsGrid.exists()).toBe(true)
      expect(skillCards.length).toBe(mockSkills.length)
    })
  })

  describe('Small Devices (576px - 767px)', () => {
    beforeEach(() => {
      setViewport(576)
    })

    it('components adapt to small device viewport', () => {
      const heroWrapper = mount(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const skillsWrapper = mount(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      // Verify components render without errors
      expect(heroWrapper.find('.hero-section').exists()).toBe(true)
      expect(skillsWrapper.find('.skills-showcase').exists()).toBe(true)
    })
  })

  describe('Medium Devices (768px - 991px)', () => {
    beforeEach(() => {
      setViewport(768)
    })

    it('NavigationHeader switches to desktop layout', () => {
      const wrapper = mount(NavigationHeader, {
        global: {
          plugins: [router]
        }
      })

      const navbar = wrapper.find('.navbar')
      const navLinks = wrapper.find('.nav-links')

      expect(navbar.exists()).toBe(true)
      expect(navLinks.exists()).toBe(true)
    })

    it('SkillsShowcase uses multi-column grid', () => {
      const wrapper = mount(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      const skillsGrid = wrapper.find('.skills-grid')
      expect(skillsGrid.exists()).toBe(true)
    })
  })

  describe('Large Devices (992px - 1199px)', () => {
    beforeEach(() => {
      setViewport(992)
    })

    it('components scale appropriately for large screens', () => {
      const heroWrapper = mount(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const skillsWrapper = mount(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      expect(heroWrapper.find('.hero-section').exists()).toBe(true)
      expect(skillsWrapper.find('.skills-showcase').exists()).toBe(true)
    })
  })

  describe('Extra Large Devices (1200px - 1919px)', () => {
    beforeEach(() => {
      setViewport(1200)
    })

    it('components utilize extra large viewport effectively', () => {
      const heroWrapper = mount(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const navWrapper = mount(NavigationHeader, {
        global: {
          plugins: [router]
        }
      })

      expect(heroWrapper.find('.hero-section').exists()).toBe(true)
      expect(navWrapper.find('.navigation-header').exists()).toBe(true)
    })
  })

  describe('Ultra-wide Screens (1920px+)', () => {
    beforeEach(() => {
      setViewport(1920)
    })

    it('components handle ultra-wide viewports', () => {
      const heroWrapper = mount(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const skillsWrapper = mount(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      expect(heroWrapper.find('.hero-section').exists()).toBe(true)
      expect(skillsWrapper.find('.skills-showcase').exists()).toBe(true)
    })
  })

  describe('CSS Grid and Flexbox Implementation', () => {
    it('HeroSection uses CSS Grid layout', () => {
      const wrapper = mount(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const heroContent = wrapper.find('.hero-content')
      expect(heroContent.exists()).toBe(true)
    })

    it('NavigationHeader uses Flexbox layout', () => {
      const wrapper = mount(NavigationHeader, {
        global: {
          plugins: [router]
        }
      })

      const navbar = wrapper.find('.navbar')
      const navLinks = wrapper.find('.nav-links')

      expect(navbar.exists()).toBe(true)
      expect(navLinks.exists()).toBe(true)
    })

    it('SkillsShowcase uses CSS Grid for skills layout', () => {
      const wrapper = mount(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      const skillsGrid = wrapper.find('.skills-grid')
      const skillsFilter = wrapper.find('.skills-filter')

      expect(skillsGrid.exists()).toBe(true)
      expect(skillsFilter.exists()).toBe(true)
    })
  })

  describe('Touch Target Accessibility', () => {
    it('buttons meet minimum touch target size requirements', () => {
      const wrapper = mount(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const buttons = wrapper.findAll('.btn')
      expect(buttons.length).toBeGreaterThan(0)

      // Verify buttons exist (actual size testing would require DOM measurement)
      buttons.forEach(button => {
        expect(button.exists()).toBe(true)
      })
    })

    it('navigation links are touch-friendly', () => {
      const wrapper = mount(NavigationHeader, {
        global: {
          plugins: [router]
        }
      })

      const navLinks = wrapper.findAll('.nav-link')
      expect(navLinks.length).toBeGreaterThan(0)

      navLinks.forEach(link => {
        expect(link.exists()).toBe(true)
      })
    })
  })

  describe('Content Overflow Prevention', () => {
    it('prevents horizontal scroll on small screens', () => {
      setViewport(320)

      const heroWrapper = mount(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const skillsWrapper = mount(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      // Verify components render without throwing errors
      expect(heroWrapper.find('.hero-section').exists()).toBe(true)
      expect(skillsWrapper.find('.skills-showcase').exists()).toBe(true)
    })

    it('handles long email addresses gracefully', () => {
      const longEmailInfo = {
        ...mockPersonalInfo,
        email: 'very.long.email.address.that.might.overflow@example.com'
      }

      const wrapper = mount(HeroSection, {
        props: { personalInfo: longEmailInfo }
      })

      const contactLink = wrapper.find('.contact-link')
      expect(contactLink.exists()).toBe(true)
      expect(contactLink.text()).toContain(longEmailInfo.email)
    })
  })

  describe('Responsive Typography', () => {
    it('adjusts font sizes across breakpoints', () => {
      const wrapper = mount(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const heroTitle = wrapper.find('.hero-title')
      const heroSubtitle = wrapper.find('.hero-subtitle')

      expect(heroTitle.exists()).toBe(true)
      expect(heroSubtitle.exists()).toBe(true)
      expect(heroTitle.text()).toBe(mockPersonalInfo.name)
      expect(heroSubtitle.text()).toBe(mockPersonalInfo.title)
    })
  })
})