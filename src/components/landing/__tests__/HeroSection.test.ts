import { describe, it, expect } from 'vitest'
import { mountComponent } from '@/test/component-utils'
import HeroSection from '../HeroSection.vue'
import type { IUserProfile } from '@/types'

const mockPersonalInfo: Pick<IUserProfile, 'name' | 'title' | 'email' | 'location' | 'summary'> = {
  name: 'John Doe',
  title: 'Backend Developer',
  email: 'john@example.com',
  location: 'San Francisco, CA',
  summary: 'Passionate backend developer with expertise in modern web technologies.'
}

describe('HeroSection', () => {
  describe('Basic Functionality', () => {
    it('renders personal information correctly', () => {
      const wrapper = mountComponent(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      expect(wrapper.text()).toContain(mockPersonalInfo.name)
      expect(wrapper.text()).toContain(mockPersonalInfo.title)
      expect(wrapper.text()).toContain(mockPersonalInfo.email)
      expect(wrapper.text()).toContain(mockPersonalInfo.location)
      expect(wrapper.text()).toContain(mockPersonalInfo.summary)
    })

    it('renders action buttons', () => {
      const wrapper = mountComponent(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      expect(wrapper.text()).toContain('View Demos')
      expect(wrapper.text()).toContain('See Testing')
      expect(wrapper.text()).toContain('Get in Touch')
    })

    it('has proper semantic structure', () => {
      const wrapper = mountComponent(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      expect(wrapper.find('section[role="banner"]').exists()).toBe(true)
      expect(wrapper.find('h1#hero-title').exists()).toBe(true)
    })
  })

  describe('Event Handling', () => {
    it('emits navigate-to-demos when demos button is clicked', async () => {
      const wrapper = mountComponent(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const buttons = wrapper.findAll('button')
      const demosButton = buttons.find(btn => btn.text().includes('View Demos'))
      expect(demosButton).toBeTruthy()
      
      await demosButton!.trigger('click')

      expect(wrapper.emitted('navigate-to-demos')).toBeTruthy()
    })

    it('emits navigate-to-testing when testing button is clicked', async () => {
      const wrapper = mountComponent(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const buttons = wrapper.findAll('button')
      const testingButton = buttons.find(btn => btn.text().includes('See Testing'))
      expect(testingButton).toBeTruthy()
      
      await testingButton!.trigger('click')

      expect(wrapper.emitted('navigate-to-testing')).toBeTruthy()
    })

    it('emits contact-clicked when contact button is clicked', async () => {
      const wrapper = mountComponent(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const buttons = wrapper.findAll('button')
      const contactButton = buttons.find(btn => btn.text().includes('Get in Touch'))
      expect(contactButton).toBeTruthy()
      
      await contactButton!.trigger('click')

      expect(wrapper.emitted('contact-clicked')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and structure', () => {
      const wrapper = mountComponent(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      expect(wrapper.find('[aria-labelledby="hero-title"]').exists()).toBe(true)
      expect(wrapper.find('[aria-describedby]').exists()).toBe(true)
      expect(wrapper.find('.sr-only').exists()).toBe(true)
    })

    it('has proper email link', () => {
      const wrapper = mountComponent(HeroSection, {
        props: { personalInfo: mockPersonalInfo }
      })

      const emailLink = wrapper.find(`a[href="mailto:${mockPersonalInfo.email}"]`)
      expect(emailLink.exists()).toBe(true)
      expect(emailLink.attributes('aria-label')).toContain(mockPersonalInfo.email)
    })
  })
})