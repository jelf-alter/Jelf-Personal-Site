<template>
  <div class="home">
    <section class="hero">
      <h1>Welcome to My Personal Website</h1>
      <p class="hero-subtitle">Backend Developer | Full-Stack Enthusiast | Testing Advocate</p>
      <div class="hero-actions">
        <RouterLink to="/demos" class="btn btn-primary">View Demos</RouterLink>
        <RouterLink to="/testing" class="btn btn-secondary">See Testing</RouterLink>
      </div>
    </section>

    <section class="skills">
      <h2>Skills & Technologies</h2>
      <div class="skills-grid">
        <div class="skill-card">
          <h3>Backend Development</h3>
          <p>Node.js, Express, APIs, Databases</p>
        </div>
        <div class="skill-card">
          <h3>Frontend Development</h3>
          <p>Vue.js, TypeScript, Modern CSS</p>
        </div>
        <div class="skill-card">
          <h3>Testing & Quality</h3>
          <p>Unit Testing, Property-Based Testing, Coverage</p>
        </div>
        <div class="skill-card">
          <h3>Data Processing</h3>
          <p>ELT Pipelines, Data Visualization, Analytics</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.skills {
  margin-top: 3rem;
}

.skills h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.skill-card:hover {
  transform: translateY(-4px);
}

.skill-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.skill-card p {
  color: #7f8c8d;
}
</style>