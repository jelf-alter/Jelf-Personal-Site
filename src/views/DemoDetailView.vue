<template>
  <div class="demo-detail">
    <div v-if="isLoading" class="loading-container">
      <LoadingSpinner size="large" message="Loading demo..." />
    </div>
    
    <div v-else-if="demo" class="demo-content">
      <header class="demo-header">
        <div class="demo-breadcrumb">
          <RouterLink to="/demos" class="breadcrumb-link">← Back to Demos</RouterLink>
        </div>
        
        <h1>{{ demo.name }}</h1>
        <p class="demo-description">{{ demo.description }}</p>
        
        <div class="demo-meta">
          <div class="demo-status" :class="`status-${demo.status}`">
            {{ demo.status }}
          </div>
          <div class="demo-category">{{ demo.category }}</div>
        </div>
        
        <div class="demo-technologies">
          <span v-for="tech in demo.technologies" :key="tech" class="tech-tag">
            {{ tech }}
          </span>
        </div>
      </header>
      
      <main class="demo-main">
        <div class="demo-placeholder">
          <h2>Demo Application</h2>
          <p>This demo will be implemented in later tasks.</p>
          <p><strong>Technologies:</strong> {{ demo.technologies.join(', ') }}</p>
          <p><strong>Status:</strong> {{ demo.status }}</p>
          
          <div class="demo-actions">
            <BaseButton 
              v-if="demo.sourceUrl" 
              variant="secondary" 
              @click="openSource"
            >
              View Source Code
            </BaseButton>
            <BaseButton 
              variant="primary" 
              disabled
            >
              Launch Demo (Coming Soon)
            </BaseButton>
          </div>
        </div>
      </main>
    </div>
    
    <div v-else class="error-container">
      <h1>Demo Not Found</h1>
      <p>The requested demo could not be found.</p>
      <RouterLink to="/demos" class="back-link">← Back to Demos</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDemosStore } from '@/stores/demos'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const demosStore = useDemosStore()

const isLoading = ref(true)

const demo = computed(() => {
  const demoId = route.params.id as string
  return demosStore.getDemoById(demoId)
})

const openSource = () => {
  if (demo.value?.sourceUrl) {
    window.open(demo.value.sourceUrl, '_blank')
  }
}

onMounted(async () => {
  if (demosStore.demos.length === 0) {
    await demosStore.loadDemos()
  }
  isLoading.value = false
})
</script>

<style scoped>
.demo-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.demo-breadcrumb {
  margin-bottom: 1rem;
}

.breadcrumb-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.demo-header h1 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.demo-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.demo-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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
  margin-bottom: 2rem;
}

.tech-tag {
  background-color: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.demo-main {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.demo-placeholder {
  padding: 3rem;
  text-align: center;
  color: #7f8c8d;
}

.demo-placeholder h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-placeholder p {
  margin-bottom: 1rem;
}

.demo-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.back-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .demo-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .demo-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>