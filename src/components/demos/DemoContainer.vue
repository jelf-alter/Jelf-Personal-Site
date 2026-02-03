<template>
  <div class="demo-container" :class="{ 'full-screen': isFullScreen }">
    <!-- Demo Header -->
    <header class="demo-header" v-if="!isFullScreen">
      <div class="demo-breadcrumb">
        <RouterLink to="/demos" class="breadcrumb-link" aria-label="Back to demos list">
          ← Back to Demos
        </RouterLink>
      </div>
      
      <!-- Featured Demo Badge -->
      <div class="featured-badge" v-if="demo?.featured" aria-label="Featured demo">
        ⭐ Featured Demo - Primary Showcase
      </div>
      
      <div class="demo-title-section">
        <h1 class="demo-title">{{ demo?.name || 'Demo Application' }}</h1>
        <p class="demo-description" v-if="demo?.description">
          {{ demo.description }}
        </p>
        
        <!-- Enhanced Demo Information -->
        <div class="demo-info-grid" v-if="demo">
          <div class="info-item">
            <span class="info-label">Complexity</span>
            <span class="info-value" :class="`complexity-${demo.metadata?.complexity}`">
              {{ formatComplexity(demo.metadata?.complexity) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Time</span>
            <span class="info-value">{{ demo.metadata?.estimatedTime || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Difficulty</span>
            <span class="info-value">{{ demo.metadata?.difficulty || 'N/A' }}</span>
          </div>
        </div>
      </div>
      
      <div class="demo-meta" v-if="demo">
        <div class="demo-status" :class="`status-${demo.status}`" role="status">
          {{ formatStatus(demo.status) }}
        </div>
        <div class="demo-category">{{ getCategoryName(demo.category) }}</div>
      </div>
      
      <div class="demo-technologies" v-if="demo?.technologies?.length">
        <span class="tech-label">Technologies:</span>
        <span 
          v-for="tech in demo.technologies" 
          :key="tech" 
          class="tech-tag"
          role="listitem"
          :title="`Technology: ${tech}`"
        >
          {{ getTechIcon(tech) }} {{ tech }}
        </span>
      </div>
      
      <!-- Learning Objectives -->
      <div class="learning-objectives" v-if="demo?.metadata?.learningObjectives?.length">
        <h3>What You'll Learn</h3>
        <ul class="objectives-list">
          <li v-for="objective in demo.metadata.learningObjectives.slice(0, 3)" :key="objective">
            {{ objective }}
          </li>
          <li v-if="demo.metadata.learningObjectives.length > 3" class="more-objectives">
            +{{ demo.metadata.learningObjectives.length - 3 }} more learning objectives
          </li>
        </ul>
      </div>
      
      <div class="demo-actions">
        <BaseButton 
          v-if="demo?.sourceUrl" 
          variant="secondary" 
          size="small"
          @click="openSource"
          aria-label="View source code in new tab"
        >
          <span class="button-icon">📄</span>
          View Source
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          size="small"
          @click="showDocumentation = !showDocumentation"
          :aria-label="showDocumentation ? 'Hide documentation' : 'Show documentation'"
        >
          <span class="button-icon">📖</span>
          {{ showDocumentation ? 'Hide Docs' : 'Show Docs' }}
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          size="small"
          @click="toggleFullScreen"
          :aria-label="isFullScreen ? 'Exit full screen' : 'Enter full screen'"
        >
          <span class="button-icon">{{ isFullScreen ? '🗗' : '🗖' }}</span>
          {{ isFullScreen ? 'Exit Full Screen' : 'Full Screen' }}
        </BaseButton>
        
        <BaseButton 
          v-if="showTestsLink && demo?.testSuiteId" 
          variant="outline" 
          size="small"
          @click="navigateToTests"
          aria-label="View test results for this demo"
        >
          <span class="button-icon">🧪</span>
          View Tests
        </BaseButton>
      </div>
    </header>
    
    <!-- Documentation Panel -->
    <div class="documentation-panel" v-if="showDocumentation && !isFullScreen && demoConfig">
      <DemoDocumentation 
        :demo="demoConfig"
        @launch-demo="showDocumentation = false"
        @view-tests="navigateToTests"
      />
    </div>
    
    <!-- Demo Navigation (when multiple demos available) -->
    <nav class="demo-navigation" v-if="!isFullScreen && relatedDemos.length > 1" aria-label="Related demos">
      <h2 class="nav-title">Related Demos</h2>
      <div class="demo-nav-list" role="list">
        <RouterLink
          v-for="relatedDemo in relatedDemos"
          :key="relatedDemo.id"
          :to="`/demos/${relatedDemo.id}`"
          class="demo-nav-item"
          :class="{ active: relatedDemo.id === demo?.id }"
          role="listitem"
          :aria-current="relatedDemo.id === demo?.id ? 'page' : undefined"
        >
          <span class="nav-item-name">{{ relatedDemo.name }}</span>
          <span class="nav-item-status" :class="`status-${relatedDemo.status}`">
            {{ formatStatus(relatedDemo.status) }}
          </span>
        </RouterLink>
      </div>
    </nav>
    
    <!-- Demo Content Area -->
    <main class="demo-content" :aria-label="`${demo?.name || 'Demo'} application`">
      <div class="demo-wrapper">
        <!-- Loading State -->
        <div v-if="isLoading" class="demo-loading">
          <LoadingSpinner size="large" :message="loadingMessage" />
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="demo-error" role="alert">
          <h2>Demo Error</h2>
          <p>{{ error }}</p>
          <BaseButton variant="primary" @click="$emit('retry')">
            Retry
          </BaseButton>
        </div>
        
        <!-- Demo Content Slot -->
        <div v-else class="demo-app">
          <slot 
            :demo="demo" 
            :isActive="isActive"
            :isFullScreen="isFullScreen"
            :config="demoConfig"
          >
            <!-- Fallback content when no demo component is provided -->
            <div class="demo-placeholder">
              <h2>Demo Coming Soon</h2>
              <p>This demo is currently under development.</p>
              <p v-if="demo?.technologies?.length">
                <strong>Technologies:</strong> {{ demo.technologies.join(', ') }}
              </p>
            </div>
          </slot>
        </div>
      </div>
    </main>
    
    <!-- Demo Footer (only in non-fullscreen mode) -->
    <footer class="demo-footer" v-if="!isFullScreen && showFooter">
      <div class="footer-content">
        <div class="demo-info">
          <span class="info-item">
            Last Updated: {{ formatDate(demo?.lastUpdated) }}
          </span>
          <span class="info-item" v-if="demo?.createdDate">
            Created: {{ formatDate(demo.createdDate) }}
          </span>
        </div>
        
        <div class="demo-links">
          <RouterLink to="/testing" class="footer-link">
            View All Tests
          </RouterLink>
          <RouterLink to="/demos" class="footer-link">
            Browse Demos
          </RouterLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDemosStore } from '@/stores/demos'
import { demoRegistry } from '@/services/demoRegistry'
import type { IDemoApplication } from '@/types'
import type { IDemoConfig } from '@/services/demoRegistry'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import DemoDocumentation from './DemoDocumentation.vue'

// Props
interface Props {
  demoId: string
  isActive?: boolean
  showTestsLink?: boolean
  showFooter?: boolean
  loadingMessage?: string
  demoConfig?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  isActive: true,
  showTestsLink: true,
  showFooter: true,
  loadingMessage: 'Loading demo...'
})

// Emits
interface Emits {
  (e: 'demo-loaded', demo: IDemoApplication): void
  (e: 'demo-error', error: string): void
  (e: 'retry'): void
  (e: 'fullscreen-toggle', isFullScreen: boolean): void
}

const emit = defineEmits<Emits>()

// Composables
const router = useRouter()
const demosStore = useDemosStore()

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const isFullScreen = ref(false)
const showDocumentation = ref(false)

// Computed
const demo = computed(() => demosStore.getDemoById(props.demoId))

const demoConfig = computed(() => {
  if (!demo.value) return null
  return demoRegistry.getDemo(demo.value.id)
})

const relatedDemos = computed(() => {
  if (!demo.value) return []
  
  return demosStore.activeDemos.filter(d => 
    d.category === demo.value?.category && d.id !== demo.value?.id
  ).slice(0, 5) // Limit to 5 related demos
})

// Methods
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'Active',
    maintenance: 'Maintenance',
    archived: 'Archived'
  }
  return statusMap[status] || status
}

const formatComplexity = (complexity: string | undefined): string => {
  if (!complexity) return 'N/A'
  return complexity.charAt(0).toUpperCase() + complexity.slice(1)
}

const getCategoryName = (categoryId: string): string => {
  const category = demoRegistry.getCategory(categoryId)
  return category?.name || categoryId
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

const formatDate = (date: Date | undefined): string => {
  if (!date) return 'Unknown'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

const openSource = () => {
  if (demo.value?.sourceUrl) {
    window.open(demo.value.sourceUrl, '_blank', 'noopener,noreferrer')
  }
}

const navigateToTests = () => {
  if (demo.value?.testSuiteId) {
    router.push(`/testing?suite=${demo.value.testSuiteId}`)
  }
}

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
  emit('fullscreen-toggle', isFullScreen.value)
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullScreen.value) {
    toggleFullScreen()
  }
  if (event.key === 'F11') {
    event.preventDefault()
    toggleFullScreen()
  }
}

// Lifecycle
onMounted(async () => {
  try {
    // Ensure demos are loaded
    if (demosStore.demos.length === 0) {
      await demosStore.loadDemos()
    }
    
    const currentDemo = demo.value
    if (!currentDemo) {
      throw new Error(`Demo with ID "${props.demoId}" not found`)
    }
    
    // Set current demo in store
    demosStore.setCurrentDemo(currentDemo)
    
    emit('demo-loaded', currentDemo)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load demo'
    error.value = errorMessage
    emit('demo-error', errorMessage)
  } finally {
    isLoading.value = false
  }
  
  // Add keyboard event listeners
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('keydown', handleKeydown)
  
  // Clear current demo
  demosStore.setCurrentDemo(null)
})
</script>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.demo-container.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: white;
}

/* Header Styles */
.demo-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.demo-breadcrumb {
  margin-bottom: 1rem;
}

.breadcrumb-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

.featured-badge {
  display: inline-block;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  }
  50% { 
    box-shadow: 0 4px 16px rgba(52, 152, 219, 0.5);
  }
}

.demo-title-section {
  margin-bottom: 1.5rem;
}

.demo-title {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.demo-description {
  color: #7f8c8d;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  max-width: 800px;
}

.demo-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.info-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
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

.demo-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.demo-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
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

.demo-category {
  padding: 0.25rem 0.75rem;
  background-color: #ecf0f1;
  color: #2c3e50;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.demo-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tech-label {
  font-weight: 500;
  color: #2c3e50;
  margin-right: 0.5rem;
}

.tech-tag {
  background-color: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.learning-objectives {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  margin-bottom: 1.5rem;
}

.learning-objectives h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

.objectives-list {
  margin: 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.objectives-list li {
  margin-bottom: 0.25rem;
  color: #2c3e50;
  font-size: 0.9rem;
}

.more-objectives {
  color: #7f8c8d;
  font-style: italic;
}

.demo-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.button-icon {
  margin-right: 0.5rem;
}

/* Documentation Panel */
.documentation-panel {
  background: white;
  border-bottom: 1px solid #e9ecef;
  max-height: 70vh;
  overflow-y: auto;
}

/* Navigation Styles */
.demo-navigation {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 2rem;
}

.nav-title {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.demo-nav-list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.demo-nav-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.2s;
  min-width: 120px;
}

.demo-nav-item:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
}

.demo-nav-item.active {
  background-color: #3498db;
  color: white;
}

.nav-item-name {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.nav-item-status {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* Content Styles */
.demo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.demo-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.demo-loading,
.demo-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 2rem;
}

.demo-error h2 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.demo-app {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.demo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}

.demo-placeholder h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

/* Footer Styles */
.demo-footer {
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 1rem 2rem;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.demo-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.info-item {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.demo-links {
  display: flex;
  gap: 1rem;
}

.footer-link {
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.footer-link:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .demo-header {
    padding: 1rem;
  }
  
  .demo-title {
    font-size: 1.5rem;
  }
  
  .demo-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .demo-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .demo-navigation {
    padding: 1rem;
  }
  
  .demo-nav-list {
    flex-direction: column;
  }
  
  .footer-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .demo-links {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .demo-header {
    padding: 0.75rem;
  }
  
  .demo-title {
    font-size: 1.25rem;
  }
  
  .demo-technologies {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .demo-nav-item,
  .breadcrumb-link,
  .footer-link {
    transition: none;
  }
  
  .demo-nav-item:hover {
    transform: none;
  }
}

/* Focus styles */
.breadcrumb-link:focus,
.demo-nav-item:focus,
.footer-link:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}
</style>