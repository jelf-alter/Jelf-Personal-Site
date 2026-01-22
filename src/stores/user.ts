import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IUserProfile, ISkill, IAchievement, ISocialLink } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const profile = ref<IUserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isProfileLoaded = computed(() => profile.value !== null)
  const skillsByCategory = computed(() => {
    if (!profile.value?.skills) return {}
    
    return profile.value.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, ISkill[]>)
  })

  const recentAchievements = computed(() => {
    if (!profile.value?.achievements) return []
    
    return [...profile.value.achievements]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
  })

  // Actions
  const loadProfile = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // For now, return mock data - will be replaced with API call
      const mockProfile: IUserProfile = {
        name: 'Your Name',
        title: 'Backend Developer',
        email: 'your.email@example.com',
        location: 'Your Location',
        summary: 'Passionate backend developer with expertise in modern web technologies and testing practices.',
        skills: [
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
            name: 'TypeScript',
            category: 'Languages',
            level: 'advanced',
            yearsOfExperience: 3,
            description: 'Type-safe JavaScript development'
          },
          {
            id: '4',
            name: 'Testing',
            category: 'Quality Assurance',
            level: 'expert',
            yearsOfExperience: 4,
            description: 'Unit, integration, and property-based testing'
          }
        ],
        achievements: [
          {
            id: '1',
            title: 'Built Personal Website',
            description: 'Created a comprehensive personal website with Vue.js and TypeScript',
            date: new Date(),
            category: 'project'
          }
        ],
        socialLinks: [
          {
            id: '1',
            platform: 'github',
            url: 'https://github.com/yourusername',
            displayName: 'GitHub'
          },
          {
            id: '2',
            platform: 'linkedin',
            url: 'https://linkedin.com/in/yourusername',
            displayName: 'LinkedIn'
          }
        ]
      }
      
      profile.value = mockProfile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load profile'
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = (updates: Partial<IUserProfile>) => {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates }
    }
  }

  const addSkill = (skill: ISkill) => {
    if (profile.value) {
      profile.value.skills.push(skill)
    }
  }

  const addAchievement = (achievement: IAchievement) => {
    if (profile.value) {
      profile.value.achievements.push(achievement)
    }
  }

  const addSocialLink = (link: ISocialLink) => {
    if (profile.value) {
      profile.value.socialLinks.push(link)
    }
  }

  return {
    // State
    profile,
    isLoading,
    error,
    
    // Getters
    isProfileLoaded,
    skillsByCategory,
    recentAchievements,
    
    // Actions
    loadProfile,
    updateProfile,
    addSkill,
    addAchievement,
    addSocialLink
  }
})