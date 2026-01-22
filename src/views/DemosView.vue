<template>
  <div class="demos">
    <header class="page-header">
      <h1>Demo Applications</h1>
      <p class="page-subtitle">Explore interactive demonstrations of various technologies and concepts</p>
    </header>

    <section class="demo-section" aria-labelledby="demo-grid-title">
      <h2 id="demo-grid-title" class="sr-only">Available Demonstrations</h2>
      <div class="demo-grid" role="list">
        <BaseCard 
          class="demo-card featured"
          clickable
          hoverable
          role="listitem"
          aria-labelledby="elt-title"
          aria-describedby="elt-description"
          @click="navigateToDemo('elt-pipeline')"
        >
          <h3 id="elt-title">ELT Pipeline Visualization</h3>
          <p id="elt-description">Interactive demonstration of Extract, Load, Transform data processing with real-time visualization</p>
          <div class="demo-status" role="status" aria-label="Demo status">Coming Soon</div>
          <div class="demo-tech" role="list" aria-label="Technologies used">
            <span class="tech-tag" role="listitem">Vue.js</span>
            <span class="tech-tag" role="listitem">WebSockets</span>
            <span class="tech-tag" role="listitem">Data Processing</span>
          </div>
        </BaseCard>

        <BaseCard 
          class="demo-card"
          clickable
          hoverable
          role="listitem"
          aria-labelledby="api-title"
          aria-describedby="api-description"
          @click="navigateToDemo('api-testing')"
        >
          <h3 id="api-title">API Testing Tool</h3>
          <p id="api-description">Interactive API testing interface with request/response visualization</p>
          <div class="demo-status" role="status" aria-label="Demo status">Planned</div>
          <div class="demo-tech" role="list" aria-label="Technologies used">
            <span class="tech-tag" role="listitem">REST APIs</span>
            <span class="tech-tag" role="listitem">HTTP</span>
          </div>
        </BaseCard>

        <BaseCard 
          class="demo-card"
          clickable
          hoverable
          role="listitem"
          aria-labelledby="dashboard-title"
          aria-describedby="dashboard-description"
          @click="navigateToDemo('realtime-dashboard')"
        >
          <h3 id="dashboard-title">Real-time Dashboard</h3>
          <p id="dashboard-description">Live data dashboard with WebSocket connections and interactive charts</p>
          <div class="demo-status" role="status" aria-label="Demo status">Planned</div>
          <div class="demo-tech" role="list" aria-label="Technologies used">
            <span class="tech-tag" role="listitem">WebSockets</span>
            <span class="tech-tag" role="listitem">Charts</span>
          </div>
        </BaseCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'

const router = useRouter()

const navigateToDemo = (demoId: string) => {
  // For now, just log the demo navigation
  // In the future, this will navigate to specific demo routes
  console.log('Navigating to demo:', demoId)
  
  // Example navigation (when routes are implemented)
  // router.push(`/demos/${demoId}`)
}
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
  margin: 0 auto;
  line-height: 1.6;
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
}

.demo-card.featured {
  border: 2px solid #3498db;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%);
}

.demo-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.demo-card p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.demo-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #f39c12;
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.demo-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  background-color: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* Responsive design */
@media (min-width: 768px) {
  .demos {
    padding: 3rem 2rem;
  }
  
  .page-header h1 {
    font-size: 2.5rem;
  }
  
  .demo-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (min-width: 1200px) {
  .demos {
    padding: 4rem 2rem;
  }
}
</style>