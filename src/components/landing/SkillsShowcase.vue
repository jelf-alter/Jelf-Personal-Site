<template>
  <section class="skills-showcase" role="region" aria-labelledby="skills-title">
    <div class="skills-container">
      <header class="skills-header">
        <h2 id="skills-title" class="skills-title">Skills & Technologies</h2>
        <p class="skills-subtitle">
          Expertise across the full development stack with a focus on quality and testing
        </p>
      </header>

      <!-- Skills filter tabs -->
      <div class="skills-filter" role="tablist" aria-label="Filter skills by category">
        <button
          v-for="category in skillCategories"
          :key="category"
          class="filter-tab"
          :class="{ 'is-active': activeCategory === category }"
          :aria-selected="activeCategory === category"
          role="tab"
          :aria-controls="`skills-panel-${category.toLowerCase().replace(/\s+/g, '-')}`"
          @click="setActiveCategory(category)"
        >
          {{ category }}
          <span class="skill-count" aria-hidden="true">
            ({{ getSkillsByCategory(category).length }})
          </span>
        </button>
      </div>

      <!-- Skills grid -->
      <div class="skills-content">
        <div
          v-for="category in (showAllCategories ? skillCategories : [activeCategory])"
          :key="category"
          :id="`skills-panel-${category.toLowerCase().replace(/\s+/g, '-')}`"
          class="skills-category"
          :class="{ 'is-visible': isVisible }"
          role="tabpanel"
          :aria-labelledby="`tab-${category.toLowerCase().replace(/\s+/g, '-')}`"
        >
          <h3 class="category-title" v-if="showAllCategories">{{ category }}</h3>
          
          <div class="skills-grid">
            <div
              v-for="(skill, index) in getSkillsByCategory(category)"
              :key="skill.id"
              class="skill-card"
              :class="{ 'is-highlighted': highlightedSkills.includes(skill.id) }"
              :style="{ animationDelay: `${index * 0.1}s` }"
              @mouseenter="handleSkillHover(skill)"
              @mouseleave="handleSkillLeave"
              @focus="handleSkillHover(skill)"
              @blur="handleSkillLeave"
              tabindex="0"
              :aria-describedby="`skill-description-${skill.id}`"
            >
              <div class="skill-header">
                <h4 class="skill-name">{{ skill.name }}</h4>
                <div class="skill-level" :aria-label="`Skill level: ${skill.level}`">
                  <div 
                    class="level-indicator"
                    :class="`level-${skill.level}`"
                    :title="skill.level"
                  >
                    <div 
                      class="level-fill"
                      :style="{ width: getLevelPercentage(skill.level) }"
                    ></div>
                  </div>
                  <span class="level-text">{{ skill.level }}</span>
                </div>
              </div>

              <div class="skill-details">
                <p 
                  :id="`skill-description-${skill.id}`"
                  class="skill-description"
                >
                  {{ skill.description }}
                </p>
                
                <div class="skill-meta" v-if="skill.yearsOfExperience">
                  <span class="experience-badge">
                    <span class="badge-icon" aria-hidden="true">⏱️</span>
                    {{ skill.yearsOfExperience }} year{{ skill.yearsOfExperience !== 1 ? 's' : '' }}
                  </span>
                </div>
              </div>

              <!-- Interactive hover effect -->
              <div class="skill-overlay" aria-hidden="true">
                <div class="overlay-content">
                  <span class="overlay-text">Click to learn more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- View toggle -->
      <div class="skills-actions">
        <button
          class="toggle-view-btn"
          @click="toggleViewMode"
          :aria-pressed="showAllCategories"
        >
          <span class="btn-icon" aria-hidden="true">
            {{ showAllCategories ? '📋' : '🔍' }}
          </span>
          {{ showAllCategories ? 'Filter View' : 'Show All' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ISkill } from '@/types'

// Props
interface Props {
  skills: ISkill[]
  highlightedSkills?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  highlightedSkills: () => []
})

// Emits
const emit = defineEmits<{
  'skill-hovered': [skill: ISkill]
  'skill-clicked': [skill: ISkill]
}>()

// State
const activeCategory = ref('All')
const showAllCategories = ref(false)
const isVisible = ref(false)
const hoveredSkill = ref<ISkill | null>(null)

// Computed
const skillCategories = computed(() => {
  const categories = ['All', ...new Set(props.skills.map(skill => skill.category))]
  return categories
})

const getSkillsByCategory = (category: string): ISkill[] => {
  if (category === 'All') {
    return props.skills
  }
  return props.skills.filter(skill => skill.category === category)
}

// Methods
const setActiveCategory = (category: string) => {
  activeCategory.value = category
}

const toggleViewMode = () => {
  showAllCategories.value = !showAllCategories.value
  if (showAllCategories.value) {
    activeCategory.value = 'All'
  }
}

const handleSkillHover = (skill: ISkill) => {
  hoveredSkill.value = skill
  emit('skill-hovered', skill)
}

const handleSkillLeave = () => {
  hoveredSkill.value = null
}

const getLevelPercentage = (level: ISkill['level']): string => {
  const percentages = {
    beginner: '25%',
    intermediate: '50%',
    advanced: '75%',
    expert: '100%'
  }
  return percentages[level]
}

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 200)
})
</script>

<style scoped>
.skills-showcase {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.skills-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.skills-header {
  text-align: center;
  margin-bottom: 3rem;
}

.skills-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.skills-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.skills-filter {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e9ecef;
  background-color: white;
  color: #6c757d;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-tab:hover,
.filter-tab:focus {
  border-color: #3498db;
  color: #3498db;
  transform: translateY(-2px);
  outline: none;
}

.filter-tab:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.filter-tab.is-active {
  background-color: #3498db;
  border-color: #3498db;
  color: white;
}

.skill-count {
  font-size: 0.85rem;
  opacity: 0.8;
}

.skills-content {
  margin-bottom: 3rem;
}

.skills-category {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.skills-category.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.category-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.6s ease-out forwards;
}

.skill-card:hover,
.skill-card:focus {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  outline: none;
}

.skill-card:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.skill-card.is-highlighted {
  border: 2px solid #3498db;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.skill-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.skill-level {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.level-indicator {
  width: 80px;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.level-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

.level-beginner .level-fill {
  background-color: #f39c12;
}

.level-intermediate .level-fill {
  background-color: #3498db;
}

.level-advanced .level-fill {
  background-color: #27ae60;
}

.level-expert .level-fill {
  background-color: #e74c3c;
}

.level-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6c757d;
  text-transform: capitalize;
}

.skill-details {
  margin-bottom: 1rem;
}

.skill-description {
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.skill-meta {
  display: flex;
  gap: 0.5rem;
}

.experience-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-icon {
  font-size: 0.9rem;
}

.skill-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.9), rgba(155, 89, 182, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.skill-card:hover .skill-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: white;
}

.overlay-text {
  font-weight: 600;
  font-size: 1rem;
}

.skills-actions {
  text-align: center;
}

.toggle-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-view-btn:hover,
.toggle-view-btn:focus {
  background-color: #2980b9;
  transform: translateY(-2px);
  outline: none;
}

.toggle-view-btn:focus-visible {
  outline: 2px solid #2980b9;
  outline-offset: 2px;
}

.btn-icon {
  font-size: 1.1rem;
}

/* Animations */
@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .skills-container {
    padding: 0 1rem;
  }

  .skills-title {
    font-size: 2rem;
  }

  .skills-filter {
    gap: 0.25rem;
  }

  .filter-tab {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .skills-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .skill-card {
    padding: 1.25rem;
  }

  .skill-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .skill-level {
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .skills-showcase {
    padding: 3rem 0;
  }

  .skills-title {
    font-size: 1.75rem;
  }

  .skills-subtitle {
    font-size: 1rem;
  }

  .filter-tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .skill-card {
    padding: 1rem;
  }

  .skill-name {
    font-size: 1.1rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .skill-card:focus-visible,
  .filter-tab:focus-visible,
  .toggle-view-btn:focus-visible {
    outline: 3px solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .skill-card,
  .skills-category,
  .level-fill {
    animation: none;
    transition: none;
  }

  .skill-card {
    opacity: 1;
    transform: none;
  }

  .skills-category {
    opacity: 1;
    transform: none;
  }

  .skill-card:hover,
  .filter-tab:hover,
  .toggle-view-btn:hover {
    transform: none;
  }
}
</style>