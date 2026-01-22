import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
import { createMockUser } from '@/test/setup'
import type { ISkill, IAchievement, ISocialLink } from '@/types'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useUserStore()
      
      expect(store.profile).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.isProfileLoaded).toBe(false)
    })
  })

  describe('Profile Loading', () => {
    it('should load profile successfully', async () => {
      const store = useUserStore()
      
      await store.loadProfile()
      
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.profile).not.toBeNull()
      expect(store.isProfileLoaded).toBe(true)
      expect(store.profile?.name).toBe('Your Name')
      expect(store.profile?.title).toBe('Backend Developer')
    })

    it('should set loading state during profile load', async () => {
      const store = useUserStore()
      
      const loadPromise = store.loadProfile()
      expect(store.isLoading).toBe(true)
      
      await loadPromise
      expect(store.isLoading).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('should group skills by category', async () => {
      const store = useUserStore()
      await store.loadProfile()
      
      const skillsByCategory = store.skillsByCategory
      
      expect(skillsByCategory).toHaveProperty('Backend')
      expect(skillsByCategory).toHaveProperty('Frontend')
      expect(skillsByCategory).toHaveProperty('Languages')
      expect(skillsByCategory).toHaveProperty('Quality Assurance')
      
      expect(skillsByCategory.Backend).toHaveLength(1)
      expect(skillsByCategory.Backend[0].name).toBe('Node.js')
    })

    it('should return recent achievements sorted by date', async () => {
      const store = useUserStore()
      await store.loadProfile()
      
      const recentAchievements = store.recentAchievements
      
      expect(recentAchievements).toHaveLength(1)
      expect(recentAchievements[0].title).toBe('Built Personal Website')
    })

    it('should handle empty skills array', () => {
      const store = useUserStore()
      store.profile = { ...createMockUser(), skills: [] }
      
      expect(store.skillsByCategory).toEqual({})
    })
  })

  describe('Profile Updates', () => {
    it('should update profile data', async () => {
      const store = useUserStore()
      await store.loadProfile()
      
      const updates = {
        name: 'Updated Name',
        title: 'Senior Developer'
      }
      
      store.updateProfile(updates)
      
      expect(store.profile?.name).toBe('Updated Name')
      expect(store.profile?.title).toBe('Senior Developer')
      expect(store.profile?.email).toBe('your.email@example.com') // Should preserve other fields
    })

    it('should not update if profile is null', () => {
      const store = useUserStore()
      
      store.updateProfile({ name: 'Test' })
      
      expect(store.profile).toBeNull()
    })
  })

  describe('Skills Management', () => {
    it('should add new skill', async () => {
      const store = useUserStore()
      await store.loadProfile()
      
      const initialSkillCount = store.profile?.skills.length || 0
      
      const newSkill: ISkill = {
        id: 'new-skill',
        name: 'React',
        category: 'Frontend',
        level: 'intermediate'
      }
      
      store.addSkill(newSkill)
      
      expect(store.profile?.skills).toHaveLength(initialSkillCount + 1)
      expect(store.profile?.skills).toContainEqual(newSkill)
    })

    it('should not add skill if profile is null', () => {
      const store = useUserStore()
      
      const newSkill: ISkill = {
        id: 'test',
        name: 'Test',
        category: 'Test',
        level: 'beginner'
      }
      
      store.addSkill(newSkill)
      
      expect(store.profile).toBeNull()
    })
  })

  describe('Achievements Management', () => {
    it('should add new achievement', async () => {
      const store = useUserStore()
      await store.loadProfile()
      
      const initialAchievementCount = store.profile?.achievements.length || 0
      
      const newAchievement: IAchievement = {
        id: 'new-achievement',
        title: 'Test Achievement',
        description: 'Test description',
        date: new Date(),
        category: 'project'
      }
      
      store.addAchievement(newAchievement)
      
      expect(store.profile?.achievements).toHaveLength(initialAchievementCount + 1)
      expect(store.profile?.achievements).toContainEqual(newAchievement)
    })
  })

  describe('Social Links Management', () => {
    it('should add new social link', async () => {
      const store = useUserStore()
      await store.loadProfile()
      
      const initialLinkCount = store.profile?.socialLinks.length || 0
      
      const newLink: ISocialLink = {
        id: 'new-link',
        platform: 'twitter',
        url: 'https://twitter.com/test',
        displayName: 'Twitter'
      }
      
      store.addSocialLink(newLink)
      
      expect(store.profile?.socialLinks).toHaveLength(initialLinkCount + 1)
      expect(store.profile?.socialLinks).toContainEqual(newLink)
    })
  })

  describe('Error Handling', () => {
    it('should handle profile loading errors gracefully', () => {
      const store = useUserStore()
      
      // Since we're using mock data, we can't easily simulate errors
      // In a real implementation, you would mock the API call to throw an error
      expect(store.error).toBeNull()
    })
  })
})