<template>
  <div class="demos">
    <header class="page-header">
      <h1>Demo Applications</h1>
      <p class="page-subtitle">Explore interactive demonstrations of various technologies and concepts</p>
      
      <!-- Demo Statistics -->
      <div class="demo-stats" v-if="demoStatistics">
        <div class="stat-item">
          <span class="stat-number">{{ demoStatistics.active }}</span>
          <span class="stat-label">Active Demos</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ demoStatistics.categories }}</span>
          <span class="stat-label">Categories</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ demoStatistics.technologies.length }}</span>
          <span class="stat-label">Technologies</span>
        </div>
      </div>
    </header>

    <!-- Category Filter -->
    <section class="category-filter" v-if="categories.length > 0">
      <h2 class="sr-only">Filter by Category</h2>
      <div class="filter-buttons">
        <button
          class="filter-btn"
          :class="{ active: selectedCategory === null }"
          @click="handleCategoryFilter(null)"
          aria-label="Show all demos"
        >
          All Demos
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          class="filter-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="handleCategoryFilter(category.id)"
          :aria-label="`Filter by ${category.name}`"
        >
          <span class="category-icon" v-if="category.icon">{{ category.icon }}</span>
          {{ category.name }}
        </button>
      </div>
    </section>

    <!-- Featured Demos Section -->
    <section class="featured-section" v-if="featuredDemos.length > 0 && selectedCategory === null" aria-labelledby="featured-title">
      <h2 id="featured-title">🌟 Featured Showcase</h2>
      <p class="featured-subtitle">Our flagship demonstrations highlighting advanced technical capabilities</p>
      
      <div class="demo-grid featured-grid" role="list">
        <BaseCard 
          v-for="demo in featuredDemos"
          :key="demo.id"
          class="demo-card featured"
          :class="{ 'primary-showcase': demo.id === 'elt-pipeline' }"
          clickable
          hoverable
          role="listitem"
          :aria-labelledby="`demo-title-${demo.id}`"
          :aria-describedby="`demo-description-${demo.id}`"
          @click="handleNavigateToDemo(demo.id)"
        >
          <!-- Primary Showcase Badge -->
          <div class="showcase-badge" v-if="demo.id === 'elt-pipeline'">
            🚀 Primary Showcase
          </div>
          
          <div class="demo-header">
            <h3 :id="`demo-title-${demo.id}`">{{ demo.name }}</h3>
            <div class="demo-status" :class="`status-${demo.status}`" role="status" :aria-label="`Demo status: ${demo.status}`">
              {{ formatStatus(demo.status) }}
            </div>
          </div>
          
          <p :id="`demo-description-${demo.id}`">{{ demo.description }}</p>
          
          <!-- Enhanced metadata for featured demos -->
          <div class="demo-enhanced-meta" v-if="getDemoConfig(demo.id)">
            <div class="meta-item">
              <span class="meta-label">Complexity</span>
              <span class="meta-value" :class="`complexity-${getDemoConfig(demo.id)?.metadata?.complexity}`">
                {{ formatComplexity(getDemoConfig(demo.id)?.metadata?.complexity) }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Time</span>
              <span class="meta-value">{{ getDemoConfig(demo.id)?.metadata?.estimatedTime || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="demo-meta">
            <div class="demo-category">{{ demo.category }}</div>
            <div class="demo-updated">
              Updated {{ formatDate(demo.lastUpdated) }}
            </div>
          </div>
          
          <div class="demo-tech" role="list" :aria-label="`Technologies used in ${demo.name}`">
            <span 
              v-for="tech in demo.technologies.slice(0, 4)" 
              :key="tech" 
              class="tech-tag" 
              role="listitem"
              :title="`Technology: ${tech}`"
            >
              {{ getTechIcon(tech) }} {{ tech }}
            </span>
            <span v-if="demo.technologies.length > 4" class="tech-more">
              +{{ demo.technologies.length - 4 }} more
            </span>
          </div>
          
          <!-- Learning objectives for featured demos -->
          <div class="demo-objectives" v-if="getDemoConfig(demo.id)?.metadata?.learningObjectives?.length">
            <h4>Key Learning Points</h4>
            <ul class="objectives-preview">
              <li v-for="objective in getDemoConfig(demo.id)?.metadata?.learningObjectives.slice(0, 2)" :key="objective">
                {{ objective }}
              </li>
              <li v-if="getDemoConfig(demo.id)?.metadata?.learningObjectives.length > 2" class="more-objectives">
                +{{ getDemoConfig(demo.id)?.metadata?.learningObjectives.length - 2 }} more
              </li>
            </ul>
          </div>
        </BaseCard>
      </div>
    </section>

    <!-- All Demos Section -->
    <section class="demo-section" :aria-labelledby="selectedCategory ? 'filtered-demos-title' : 'all-demos-title'">
      <h2 :id="selectedCategory ? 'filtered-demos-title' : 'all-demos-title'">
        {{ selectedCategory ? getCategoryName(selectedCategory) : 'All Demos' }}
      </h2>
      
      <div v-if="filteredDemos.length === 0" class="no-demos">
        <p>No demos found in this category.</p>
        <BaseButton variant="primary" @click="handleCategoryFilter(null)">
          View All Demos
        </BaseButton>
      </div>
      
      <div v-else class="demo-grid" role="list">
        <BaseCard 
          v-for="demo in filteredDemos"
          :key="demo.id"
          class="demo-card"
          :class="{ featured: demo.featured }"
          clickable
          hoverable
          role="listitem"
          :aria-labelledby="`demo-title-${demo.id}`"
          :aria-describedby="`demo-description-${demo.id}`"
          @click="handleNavigateToDemo(demo.id)"
        >
          <div class="demo-header">
            <h3 :id="`demo-title-${demo.id}`">{{ demo.name }}</h3>
            <div class="demo-status" :class="`status-${demo.status}`" role="status" :aria-label="`Demo status: ${demo.status}`">
              {{ formatStatus(demo.status) }}
            </div>
          </div>
          
          <p :id="`demo-description-${demo.id}`">{{ demo.description }}</p>
          
          <div class="demo-meta">
            <div class="demo-category">{{ demo.category }}</div>
            <div class="demo-updated">
              Updated {{ formatDate(demo.lastUpdated) }}
            </div>
          </div>
          
          <div class="demo-tech" role="list" :aria-label="`Technologies used in ${demo.name}`">
            <span 
              v-for="tech in demo.technologies.slice(0, 4)" 
              :key="tech" 
              class="tech-tag" 
              role="listitem"
              :title="`Technology: ${tech}`"
            >
              {{ getTechIcon(tech) }} {{ tech }}
            </span>
            <span v-if="demo.technologies.length > 4" class="tech-more">
              +{{ demo.technologies.length - 4 }} more
            </span>
          </div>
          
          <div class="demo-actions">
            <BaseButton 
              variant="primary" 
              size="small"
              @click.stop="handleNavigateToDemo(demo.id)"
              :aria-label="`Launch ${demo.name} demo`"
            >
              Launch Demo
            </BaseButton>
            <BaseButton 
              v-if="demo.sourceUrl" 
              variant="secondary" 
              size="small"
              @click.stop="openSource(demo.sourceUrl)"
              :aria-label="`View source code for ${demo.name}`"
            >
              Source
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDemosStore } from '@/stores/demos'
import { useNavigation } from '@/composables/useNavigation'
import { demoRegistry } from '@/services/demoRegistry'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const demosStore = useDemosStore()
const { navigateToDemo, navigateToCategory } = useNavigation()

const selectedCategory = ref<string | null>(null)

// Initialize category from route params or props
const initializeCategory = () => {
  const categoryFromRoute = route.params.categoryId as string
  const categoryFromProps = (route.meta as any)?.categoryFilter as string
  
  if (categoryFromRoute) {
    selectedCategory.value = categoryFromRoute
  } else if (categoryFromProps) {
    selectedCategory.value = categoryFromProps
  } else {
    selectedCategory.value = null
  }
}

const featuredDemos = computed(() => demosStore.featuredDemos)
const categories = computed(() => demosStore.getCategories())
const demoStatistics = computed(() => demosStore.demoStatistics)

const filteredDemos = computed(() => {
  if (selectedCategory.value) {
    return demosStore.getDemosByCategory(selectedCategory.value)
  }
  return demosStore.activeDemos
})

const handleNavigateToDemo = (demoId: string) => {
  navigateToDemo(demoId)
}

const handleCategoryFilter = (categoryId: string | null) => {
  selectedCategory.value = categoryId
  navigateToCategory(categoryId)
}

const openSource = (sourceUrl: string) => {
  window.open(sourceUrl, '_blank', 'noopener,noreferrer')
}

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'Active',
    maintenance: 'Maintenance',
    archived: 'Archived'
  }
  return statusMap[status] || status
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category?.name || categoryId
}

const getDemoConfig = (demoId: string) => {
  return demoRegistry.getDemo(demoId)
}

const formatComplexity = (complexity: string | undefined): string => {
  if (!complexity) return 'N/A'
  return complexity.charAt(0).toUpperCase() + complexity.slice(1)
}

const getTechIcon = (tech: string): string => {
  const iconMap: Record<string, string> = {
    'Vue.js': '🟢',
    'TypeScript': '🔷',
    'Node.js': '🟢',
    'WebSockets': '⚡',
    'D3.js': '📊',
    'Chart.js': '📈',
    'Axios': '🌐',
    'Socket.IO': '🔌',
    'JSON': '📄',
    'REST': '🔗'
  }
  return iconMap[tech] || '⚙️'
}

onMounted(async () => {
  if (demosStore.demos.length === 0) {
    await demosStore.loadDemos()
  }
  
  // Initialize category from route
  initializeCategory()
})

// Watch for route changes to update category
watch(() => route.params.categoryId, (newCategoryId) => {
  selectedCategory.value = newCategoryId as string || null
})
</script>

<style scoped>
.demos {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.page-subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  line-height: 1.6;
}

/* Demo Statistics */
.demo-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: #3498db;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

/* Category Filter */
.category-filter {
  margin-bottom: 3rem;
}

.filter-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  color: #2c3e50;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.filter-btn.active {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

.category-icon {
  font-size: 1rem;
}

/* Featured Section */
.featured-section {
  margin-bottom: 4rem;
}

.featured-section h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 700;
}

.featured-subtitle {
  text-align: center;
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.demo-card.featured {
  border: 2px solid #3498db;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%);
  position: relative;
  overflow: visible;
}

.demo-card.primary-showcase {
  border: 3px solid #e74c3c;
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%);
  box-shadow: 0 8px 32px rgba(231, 76, 60, 0.2);
  transform: scale(1.02);
}

.showcase-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
  animation: pulse-showcase 2s infinite;
}

@keyframes pulse-showcase {
  0%, 100% { 
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
  }
  50% { 
    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.6);
  }
}

.demo-enhanced-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.meta-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.meta-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.complexity-high {
  color: #e74c3c;
}

.complexity-medium {
  color: #f39c12;
}

.complexity-low {
  color: #27ae60;
}

.demo-objectives {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.demo-objectives h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.objectives-preview {
  margin: 0;
  padding-left: 1rem;
  list-style-type: disc;
}

.objectives-preview li {
  font-size: 0.8rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.more-objectives {
  color: #7f8c8d;
  font-style: italic;
}

.tech-tag {
  background-color: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

/* Demo Section */
.demo-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.no-demos {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.no-demos p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.demo-card {
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.demo-card.featured {
  border: 2px solid #3498db;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%);
}

.demo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.demo-card h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.3rem;
  flex: 1;
}

.demo-card p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  min-height: 3rem;
}

.demo-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-active {
  background-color: #27ae60;
  color: white;
}

.status-maintenance {
  background-color: #f39c12;
  color: white;
}

.status-archived {
  background-color: #95a5a6;
  color: white;
}

.demo-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.demo-category {
  background-color: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.demo-updated {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.demo-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tech-tag {
  background-color: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.tech-more {
  background-color: #95a5a6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.demo-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}

/* Responsive design */
@media (max-width: 768px) {
  .demos {
    padding: 2rem 1rem;
  }
  
  .page-header h1 {
    font-size: 1.75rem;
  }
  
  .demo-stats {
    gap: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .filter-buttons {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .filter-btn {
    white-space: nowrap;
  }
  
  .featured-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .demo-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .demo-actions {
    flex-direction: column;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .demos {
    padding: 1.5rem 0.75rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .demo-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .demo-card {
    margin: 0 -0.5rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .demo-card,
  .filter-btn {
    transition: none;
  }
  
  .demo-card:hover {
    transform: none;
  }
}

/* Focus styles */
.filter-btn:focus,
.demo-card:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}
</style>