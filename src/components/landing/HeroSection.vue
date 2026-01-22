<template>
  <section class="hero-section" role="banner" aria-labelledby="hero-title">
    <div class="hero-container">
      <div class="hero-content">
        <!-- Animated introduction -->
        <div class="hero-intro" :class="{ 'is-visible': isVisible }">
          <h1 id="hero-title" class="hero-title">
            <span class="title-line" :style="{ animationDelay: '0.2s' }">
              {{ personalInfo.name }}
            </span>
          </h1>
          
          <p class="hero-subtitle" :style="{ animationDelay: '0.4s' }">
            {{ personalInfo.title }}
          </p>
          
          <p class="hero-summary" :style="{ animationDelay: '0.6s' }">
            {{ personalInfo.summary }}
          </p>
        </div>

        <!-- Contact information -->
        <div class="hero-contact" :class="{ 'is-visible': isVisible }" :style="{ animationDelay: '0.8s' }">
          <div class="contact-item">
            <span class="contact-icon" aria-hidden="true">📍</span>
            <span class="contact-text">{{ personalInfo.location }}</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon" aria-hidden="true">✉️</span>
            <a 
              :href="`mailto:${personalInfo.email}`" 
              class="contact-link"
              :aria-label="`Send email to ${personalInfo.email}`"
            >
              {{ personalInfo.email }}
            </a>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="hero-actions" :class="{ 'is-visible': isVisible }" :style="{ animationDelay: '1.0s' }">
          <button
            class="btn btn-primary"
            @click="handleNavigateToDemos"
            aria-describedby="demos-description"
          >
            <span class="btn-icon" aria-hidden="true">🚀</span>
            View Demos
          </button>
          <button
            class="btn btn-secondary"
            @click="handleNavigateToTesting"
            aria-describedby="testing-description"
          >
            <span class="btn-icon" aria-hidden="true">🧪</span>
            See Testing
          </button>
          <button
            class="btn btn-outline"
            @click="handleContactClick"
            aria-describedby="contact-description"
          >
            <span class="btn-icon" aria-hidden="true">💬</span>
            Get in Touch
          </button>
        </div>

        <!-- Hidden descriptions for screen readers -->
        <div class="sr-only">
          <div id="demos-description">View interactive demonstrations of various technologies</div>
          <div id="testing-description">Explore comprehensive testing dashboard and coverage metrics</div>
          <div id="contact-description">Contact information and social links</div>
        </div>
      </div>

      <!-- Animated background elements -->
      <div class="hero-background" aria-hidden="true">
        <div class="bg-shape bg-shape-1" :class="{ 'is-animated': isVisible }"></div>
        <div class="bg-shape bg-shape-2" :class="{ 'is-animated': isVisible }"></div>
        <div class="bg-shape bg-shape-3" :class="{ 'is-animated': isVisible }"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { IUserProfile } from '@/types'

// Props
interface Props {
  personalInfo: Pick<IUserProfile, 'name' | 'title' | 'email' | 'location' | 'summary'>
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  'navigate-to-demos': []
  'navigate-to-testing': []
  'contact-clicked': []
}>()

// State
const isVisible = ref(false)

// Methods
const handleNavigateToDemos = () => {
  emit('navigate-to-demos')
}

const handleNavigateToTesting = () => {
  emit('navigate-to-testing')
}

const handleContactClick = () => {
  emit('contact-clicked')
}

// Lifecycle
onMounted(() => {
  // Trigger animations after component mounts
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>

<style scoped>
/* Responsive Design - Mobile First */
.hero-section {
  position: relative;
  min-height: 60vh; /* Smaller on mobile */
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

.hero-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem; /* Mobile first padding */
  z-index: 2;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-intro {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-title {
  font-size: 2rem; /* Mobile first */
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.title-line {
  display: inline-block;
  opacity: 0;
  transform: translateY(30px);
  animation: slideInUp 0.8s ease-out forwards;
}

.hero-subtitle {
  font-size: 1.125rem; /* Mobile first */
  font-weight: 300;
  margin-bottom: 1rem;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.8s ease-out forwards;
  color: rgba(255, 255, 255, 0.9);
}

.hero-summary {
  font-size: 1rem; /* Mobile first */
  line-height: 1.6;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.8s ease-out forwards;
  color: rgba(255, 255, 255, 0.8);
  max-width: 100%;
  margin: 0 auto;
}

.hero-contact {
  display: flex;
  flex-direction: column; /* Mobile first - stack vertically */
  align-items: center;
  gap: 1rem;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.8s ease-out forwards;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem; /* Slightly smaller on mobile */
}

.contact-icon {
  font-size: 1.1rem;
}

.contact-link {
  color: white;
  text-decoration: none;
  transition: color 0.3s ease;
  word-break: break-all; /* Prevent email overflow on small screens */
}

.contact-link:hover,
.contact-link:focus {
  color: #3498db;
  text-decoration: underline;
}

.hero-actions {
  display: flex;
  flex-direction: column; /* Mobile first - stack vertically */
  gap: 1rem;
  align-items: center;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.8s ease-out forwards;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem; /* Smaller padding on mobile */
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem; /* Smaller font on mobile */
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 280px;
  min-height: 44px; /* Minimum touch target size */
}

.btn:focus {
  outline: none;
}

.btn:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.btn-secondary {
  background-color: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.btn-secondary:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
}

.btn-outline {
  background-color: transparent;
  color: white;
  border-color: white;
}

.btn-outline:hover {
  background-color: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}

.btn-icon {
  font-size: 1rem;
}

/* Background animations */
.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: all 1s ease-out;
}

.bg-shape-1 {
  width: 120px; /* Smaller on mobile */
  height: 120px;
  top: 10%;
  left: 5%;
  animation-delay: 0.5s;
}

.bg-shape-2 {
  width: 80px; /* Smaller on mobile */
  height: 80px;
  top: 60%;
  right: 10%;
  animation-delay: 1s;
}

.bg-shape-3 {
  width: 60px; /* Smaller on mobile */
  height: 60px;
  bottom: 20%;
  left: 15%;
  animation-delay: 1.5s;
}

.bg-shape.is-animated {
  opacity: 1;
  animation: float 6s ease-in-out infinite;
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

/* Animations */
@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Small devices (576px and up) */
@media (min-width: 576px) {
  .hero-section {
    min-height: 65vh;
  }
  
  .hero-container {
    padding: 2.5rem 1.5rem;
  }
  
  .hero-title {
    font-size: 2.25rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
  }
  
  .hero-contact {
    flex-direction: row;
    gap: 1.5rem;
  }
  
  .contact-item {
    font-size: 1rem;
  }
  
  .btn {
    font-size: 1rem;
    padding: 0.875rem 1.75rem;
    max-width: 320px;
  }
  
  .bg-shape-1 {
    width: 150px;
    height: 150px;
  }
  
  .bg-shape-2 {
    width: 100px;
    height: 100px;
  }
  
  .bg-shape-3 {
    width: 80px;
    height: 80px;
  }
}

/* Medium devices (768px and up) */
@media (min-width: 768px) {
  .hero-section {
    min-height: 70vh;
  }
  
  .hero-container {
    padding: 3rem 2rem;
  }
  
  .hero-content {
    gap: 2.5rem;
  }
  
  .hero-title {
    font-size: 2.75rem;
  }
  
  .hero-subtitle {
    font-size: 1.375rem;
  }
  
  .hero-summary {
    font-size: 1.1rem;
    max-width: 600px;
  }
  
  .hero-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.25rem;
  }
  
  .btn {
    width: auto;
    max-width: none;
  }
  
  .bg-shape-1 {
    width: 180px;
    height: 180px;
    left: 8%;
  }
  
  .bg-shape-2 {
    width: 120px;
    height: 120px;
    right: 12%;
  }
  
  .bg-shape-3 {
    width: 90px;
    height: 90px;
    left: 18%;
  }
}

/* Large devices (992px and up) */
@media (min-width: 992px) {
  .hero-section {
    min-height: 75vh;
  }
  
  .hero-container {
    padding: 4rem 2rem;
  }
  
  .hero-content {
    gap: 3rem;
  }
  
  .hero-title {
    font-size: 3.25rem;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
  
  .hero-contact {
    gap: 2rem;
  }
  
  .bg-shape-1 {
    width: 200px;
    height: 200px;
    left: 10%;
  }
  
  .bg-shape-2 {
    width: 150px;
    height: 150px;
    right: 15%;
  }
  
  .bg-shape-3 {
    width: 100px;
    height: 100px;
    left: 20%;
  }
}

/* Extra large devices (1200px and up) */
@media (min-width: 1200px) {
  .hero-section {
    min-height: 80vh;
  }
  
  .hero-title {
    font-size: 3.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
  }
}

/* Ultra-wide screens (1920px and up) */
@media (min-width: 1920px) {
  .hero-section {
    min-height: 85vh;
  }
  
  .hero-title {
    font-size: 4rem;
  }
  
  .hero-subtitle {
    font-size: 1.75rem;
  }
  
  .hero-summary {
    font-size: 1.2rem;
    max-width: 700px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn:focus-visible {
    outline: 3px solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .title-line,
  .hero-subtitle,
  .hero-summary,
  .hero-contact,
  .hero-actions {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .bg-shape {
    animation: none;
  }

  .btn {
    transition: none;
  }

  .btn:hover {
    transform: none;
  }
}
</style>