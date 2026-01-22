<template>
  <div class="about">
    <section class="about-hero">
      <h1>About This Project</h1>
      <p class="hero-subtitle">
        A comprehensive personal website built with modern web technologies and best practices
      </p>
    </section>

    <div class="about-content">
      <section class="about-section">
        <h2>Project Overview</h2>
        <p>
          This personal website serves as both a professional portfolio and a demonstration platform 
          for various development capabilities. It showcases modern web development practices, 
          comprehensive testing strategies, and transparent development processes.
        </p>
      </section>

      <section class="about-section">
        <h2>Technology Stack</h2>
        <div class="tech-grid">
          <div class="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li>Vue.js 3 with Composition API</li>
              <li>TypeScript for type safety</li>
              <li>Vite for fast development and building</li>
              <li>Modern CSS with responsive design</li>
            </ul>
          </div>
          
          <div class="tech-category">
            <h3>State Management</h3>
            <ul>
              <li>Pinia for reactive state management</li>
              <li>Vue Router for client-side routing</li>
              <li>Composables for shared logic</li>
            </ul>
          </div>
          
          <div class="tech-category">
            <h3>Testing</h3>
            <ul>
              <li>Vitest for unit testing</li>
              <li>Vue Test Utils for component testing</li>
              <li>Fast-check for property-based testing</li>
              <li>Coverage reporting with v8</li>
            </ul>
          </div>
          
          <div class="tech-category">
            <h3>Development Tools</h3>
            <ul>
              <li>ESLint for code linting</li>
              <li>Prettier for code formatting</li>
              <li>TypeScript for static type checking</li>
              <li>Git for version control</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>Key Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>Professional Portfolio</h3>
            <p>Clean, responsive design showcasing skills, achievements, and professional experience.</p>
          </div>
          
          <div class="feature-card">
            <h3>Interactive Demos</h3>
            <p>Live demonstrations of various technologies including data processing and visualization.</p>
          </div>
          
          <div class="feature-card">
            <h3>Public Testing Dashboard</h3>
            <p>Transparent view into code quality, test coverage, and testing practices.</p>
          </div>
          
          <div class="feature-card">
            <h3>Performance Optimized</h3>
            <p>Built with performance in mind, achieving excellent Core Web Vitals scores.</p>
          </div>
          
          <div class="feature-card">
            <h3>Accessibility First</h3>
            <p>WCAG 2.1 AA compliant with full keyboard navigation and screen reader support.</p>
          </div>
          
          <div class="feature-card">
            <h3>Modern Architecture</h3>
            <p>Component-based architecture with TypeScript interfaces and comprehensive testing.</p>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>Development Approach</h2>
        <p>
          This project follows a spec-driven development methodology, starting with detailed requirements, 
          creating comprehensive design documents, and implementing features incrementally with 
          property-based testing to ensure correctness.
        </p>
        
        <div class="approach-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Requirements Analysis</h4>
              <p>Detailed user stories and acceptance criteria</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Design & Architecture</h4>
              <p>Component interfaces and correctness properties</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Implementation</h4>
              <p>Incremental development with continuous testing</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Validation</h4>
              <p>Property-based testing and performance optimization</p>
            </div>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>Contact & Links</h2>
        <p>
          This project is continuously evolving. Feel free to explore the demos, check out the 
          testing dashboard, and see the development process in action.
        </p>
        
        <div class="contact-links">
          <BaseButton variant="primary" @click="navigateTo('/demos')">
            Explore Demos
          </BaseButton>
          <BaseButton variant="secondary" @click="navigateTo('/testing')">
            View Testing Dashboard
          </BaseButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.about {
  max-width: 1200px;
  margin: 0 auto;
}

.about-hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.about-hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.about-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.about-section p {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.tech-category {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tech-category h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.tech-category ul {
  list-style: none;
  padding: 0;
}

.tech-category li {
  padding: 0.5rem 0;
  color: #7f8c8d;
  border-bottom: 1px solid #ecf0f1;
}

.tech-category li:last-child {
  border-bottom: none;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.feature-card p {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

.approach-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.step-number {
  background: #3498db;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.step-content p {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

.contact-links {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .about-hero h1 {
    font-size: 2rem;
  }
  
  .tech-grid,
  .features-grid,
  .approach-steps {
    grid-template-columns: 1fr;
  }
  
  .contact-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>