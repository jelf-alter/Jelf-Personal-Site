<template>
  <div class="demo-detail-view">
    <DemoContainer
      v-if="demoId"
      :demo-id="demoId"
      :is-active="true"
      :show-tests-link="true"
      :show-footer="true"
      @demo-loaded="onDemoLoaded"
      @demo-error="onDemoError"
      @retry="onRetry"
      @fullscreen-toggle="onFullscreenToggle"
    >
      <!-- Dynamic demo component loading -->
      <template #default="{ demo, isActive, isFullScreen, config }">
        <Suspense>
          <component
            v-if="demoComponent"
            :is="demoComponent"
            :demo="demo"
            :is-active="isActive"
            :is-full-screen="isFullScreen"
            :config="config"
            @error="onDemoComponentError"
          />
          <template #fallback>
            <div class="demo-loading">
              <LoadingSpinner size="large" message="Loading demo component..." />
            </div>
          </template>
        </Suspense>
      </template>
    </DemoContainer>
    
    <!-- Error state when demo ID is missing -->
    <div v-else class="error-container">
      <h1>Invalid Demo</h1>
      <p>No demo ID provided in the URL.</p>
      <RouterLink to="/demos" class="back-link">← Back to Demos</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDemosStore } from '@/stores/demos'
import { demoRegistry } from '@/services/demoRegistry'
import type { IDemoApplication } from '@/types'
import type { Component } from 'vue'
import DemoContainer from '@/components/demos/DemoContainer.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const demosStore = useDemosStore()

const demoComponent = ref<Component | null>(null)
const componentError = ref<string | null>(null)

const demoId = computed(() => route.params.id as string)

const onDemoLoaded = async (demo: IDemoApplication) => {
  console.log('Demo loaded:', demo.name)
  
  // Load the demo component dynamically
  try {
    const demoConfig = demoRegistry.getDemo(demo.id)
    if (demoConfig?.component) {
      if (typeof demoConfig.component === 'function') {
        const componentModule = await demoConfig.component()
        demoComponent.value = componentModule.default || componentModule
      } else {
        demoComponent.value = demoConfig.component
      }
    } else {
      console.warn(`No component configured for demo: ${demo.id}`)
      demoComponent.value = null
    }
  } catch (error) {
    console.error('Failed to load demo component:', error)
    componentError.value = error instanceof Error ? error.message : 'Failed to load demo component'
    demoComponent.value = null
  }
}

const onDemoError = (error: string) => {
  console.error('Demo error:', error)
  // Error is handled by DemoContainer
}

const onRetry = () => {
  // Reset component state and retry
  demoComponent.value = null
  componentError.value = null
  
  // Reload the page to retry demo loading
  router.go(0)
}

const onFullscreenToggle = (isFullScreen: boolean) => {
  console.log('Fullscreen toggled:', isFullScreen)
  // Handle fullscreen state changes if needed
}

const onDemoComponentError = (error: string) => {
  console.error('Demo component error:', error)
  componentError.value = error
}

// Watch for route changes to handle navigation between demos
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    // Reset component state when navigating to a different demo
    demoComponent.value = null
    componentError.value = null
  }
})

onMounted(() => {
  // Ensure demos are loaded when component mounts
  if (demosStore.demos.length === 0) {
    demosStore.loadDemos()
  }
})
</script>

<style scoped>
.demo-detail-view {
  min-height: 100vh;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 2rem;
}

.error-container h1 {
  color: #e74c3c;
  margin-bottom: 1rem;
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

.demo-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
}
</style>