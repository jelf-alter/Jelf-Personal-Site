import { describe, it, expect } from 'vitest'
import { mountComponent } from '@/test/component-utils'
import SkillsShowcase from '../SkillsShowcase.vue'
import type { ISkill } from '@/types'

const mockSkills: ISkill[] = [
  {
    id: '1',
    name: 'Node.js',
    category: 'Backend',
    level: 'advanced',
    yearsOfExperience: 3,
    description: 'Server-side JavaScript development'
  },
  {
    id: '2',
    name: 'Vue.js',
    category: 'Frontend',
    level: 'intermediate',
    yearsOfExperience: 2,
    description: 'Modern frontend framework'
  },
  {
    id: '3',
    name: 'Testing',
    category: 'Quality Assurance',
    level: 'expert',
    yearsOfExperience: 4,
    description: 'Unit, integration, and property-based testing'
  }
]

describe('SkillsShowcase', () => {
  describe('Basic Functionality', () => {
    it('renders skills correctly', () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      mockSkills.forEach(skill => {
        expect(wrapper.text()).toContain(skill.name)
        expect(wrapper.text()).toContain(skill.description)
      })
    })

    it('renders skill categories', () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      expect(wrapper.text()).toContain('All')
      expect(wrapper.text()).toContain('Backend')
      expect(wrapper.text()).toContain('Frontend')
      expect(wrapper.text()).toContain('Quality Assurance')
    })

    it('shows skill levels correctly', () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      expect(wrapper.text()).toContain('advanced')
      expect(wrapper.text()).toContain('intermediate')
      expect(wrapper.text()).toContain('expert')
    })

    it('displays years of experience', () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      expect(wrapper.text()).toContain('3 years')
      expect(wrapper.text()).toContain('2 years')
      expect(wrapper.text()).toContain('4 years')
    })
  })

  describe('Filtering', () => {
    it('filters skills by category when tab is clicked', async () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      const buttons = wrapper.findAll('button')
      const backendTab = buttons.find(btn => btn.text().includes('Backend'))
      expect(backendTab).toBeTruthy()
      
      await backendTab!.trigger('click')

      // Should show only backend skills
      expect(wrapper.text()).toContain('Node.js')
    })

    it('shows all skills when "All" tab is clicked', async () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      const buttons = wrapper.findAll('button')
      const allTab = buttons.find(btn => btn.text().includes('All'))
      expect(allTab).toBeTruthy()
      
      await allTab!.trigger('click')

      mockSkills.forEach(skill => {
        expect(wrapper.text()).toContain(skill.name)
      })
    })
  })

  describe('Highlighted Skills', () => {
    it('highlights specified skills', () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { 
          skills: mockSkills,
          highlightedSkills: ['1', '3'] // Node.js and Testing
        }
      })

      const highlightedCards = wrapper.findAll('.skill-card.is-highlighted')
      expect(highlightedCards.length).toBe(2)
    })
  })

  describe('Event Handling', () => {
    it('emits skill-hovered when skill is hovered', async () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      const skillCard = wrapper.find('.skill-card')
      await skillCard.trigger('mouseenter')

      expect(wrapper.emitted('skill-hovered')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA structure', () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      expect(wrapper.find('[role="region"]').exists()).toBe(true)
      expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
      expect(wrapper.find('[role="tab"]').exists()).toBe(true)
      expect(wrapper.find('[role="tabpanel"]').exists()).toBe(true)
    })

    it('has proper skill descriptions for screen readers', () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      mockSkills.forEach(skill => {
        expect(wrapper.find(`#skill-description-${skill.id}`).exists()).toBe(true)
      })
    })

    it('supports keyboard navigation', () => {
      const wrapper = mountComponent(SkillsShowcase, {
        props: { skills: mockSkills }
      })

      const skillCards = wrapper.findAll('.skill-card[tabindex="0"]')
      expect(skillCards.length).toBeGreaterThan(0)
    })
  })
})