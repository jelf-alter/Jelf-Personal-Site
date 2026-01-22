<template>
  <div class="demos">
    <h1>Demo Applications</h1>
    <p class="page-subtitle">Explore interactive demonstrations of various technologies and concepts</p>

    <div class="demo-grid">
      <div class="demo-card featured">
        <h3>ELT Pipeline Visualization</h3>
        <p>Interactive demonstration of Extract, Load, Transform data processing with real-time visualization</p>
        <div class="demo-status">Coming Soon</div>
        <div class="demo-tech">
          <span class="tech-tag">Vue.js</span>
          <span class="tech-tag">WebSockets</span>
          <span class="tech-tag">Data Processing</span>
        </div>
      </div>

      <div class="demo-card">
        <h3>API Testing Tool</h3>
        <p>Interactive API testing interface with request/response visualization</p>
        <div class="demo-status">Planned</div>
        <div class="demo-tech">
          <span class="tech-tag">REST APIs</span>
          <span class="tech-tag">HTTP</span>
        </div>
      </div>

      <div class="demo-card">
        <h3>Real-time Dashboard</h3>
        <p>Live data dashboard with WebSocket connections and interactive charts</p>
        <div class="demo-status">Planned</div>
        <div class="demo-tech">
          <span class="tech-tag">WebSockets</span>
          <span class="tech-tag">Charts</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Demo applications will be implemented in later tasks
</script>

<style scoped>
.demos {
  max-width: 1200px;
  margin: 0 auto;
}

.page-subtitle {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 3rem;
  font-size: 1.1rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.demo-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #ecf0f1;
}

.demo-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
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
</style>