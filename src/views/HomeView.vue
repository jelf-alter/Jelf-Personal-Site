<template>
  <div class="home">
    <HeroSection
      :personal-info="personalInfo"
      @navigate-to-demos="handleNavigateToDemos"
      @navigate-to-testing="handleNavigateToTesting"
      @contact-clicked="handleContactClick"
    />

    <SkillsShowcase
      :skills="skills"
      :highlighted-skills="highlightedSkills"
      @skill-hovered="handleSkillHover"
      @skill-clicked="handleSkillClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HeroSection from '@/components/landing/HeroSection.vue'
import SkillsShowcase from '@/components/landing/SkillsShowcase.vue'
import type { ISkill } from '@/types'

const router = useRouter()
const userStore = useUserStore()

// Computed properties
const personalInfo = computed(() => {
  if (!userStore.profile) {
    return {
      name: 'Loading...',
      title: 'Loading...',
      email: '',
      location: '',
      summary: ''
    }
  }
  
  return {
    name: userStore.profile.name,
    title: userStore.profile.title,
    email: userStore.profile.email,
    location: userStore.profile.location,
    summary: userStore.profile.summary
  }
})

const skills = computed(() => userStore.profile?.skills || [])

const highlightedSkills = computed(() => {
  // Highlight skills with expert level or high experience
  return skills.value
    .filter(skill => skill.level === 'expert' || (skill.yearsOfExperience && skill.yearsOfExperience >= 3))
    .map(skill => skill.id)
})

// Event handlers
const handleNavigateToDemos = () => {
  router.push('/demos')
}

const handleNavigateToTesting = () => {
  router.push('/testing')
}

const handleContactClick = () => {
  // Scroll to contact section or open contact modal
  // For now, we'll navigate to about page
  router.push('/about')
}

const handleSkillHover = (skill: ISkill) => {
  // Could be used for analytics or additional interactions
  console.log('Skill hovered:', skill.name)
}

const handleSkillClick = (skill: ISkill) => {
  // Could navigate to detailed skill information or demos
  console.log('Skill clicked:', skill.name)
}

// Lifecycle
onMounted(async () => {
  // Load user profile data
  if (!userStore.isProfileLoaded) {
    await userStore.loadProfile()
  }
})
</script>

<style scoped>
.home {
  /* Container for landing page components */
}
</style>