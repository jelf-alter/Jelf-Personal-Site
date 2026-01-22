<template>
  <div id="app">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <NavigationHeader 
      @menu-toggled="handleMenuToggle" 
      @navigation-clicked="handleNavigationClick" 
    />

    <main id="main-content" role="main" tabindex="-1">
      <RouterView />
    </main>

    <footer role="contentinfo">
      <p>&copy; 2024 Personal Website. Built with Vue.js and TypeScript.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavigationHeader from '@/components/landing/NavigationHeader.vue'

// Event handlers
const handleMenuToggle = (isOpen: boolean) => {
  // Could be used for analytics or body scroll lock
  console.log('Mobile menu toggled:', isOpen)
}

const handleNavigationClick = (path: string) => {
  // Could be used for analytics
  console.log('Navigation clicked:', path)
}
</script>

<style scoped>
/* Mobile First App Layout */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Skip link for keyboard navigation */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #3498db;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 0 0 4px 4px;
  z-index: 9999;
  font-weight: 600;
}

.skip-link:focus {
  top: 0;
}

main {
  flex: 1;
  padding: 0;
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

main:focus {
  outline: none;
}

footer {
  text-align: center;
  padding: 1rem;
  background-color: #ecf0f1;
  color: #7f8c8d;
  margin-top: auto;
  font-size: 0.875rem; /* Mobile first size */
  line-height: 1.4;
}

/* Small devices (576px and up) */
@media (min-width: 576px) {
  footer {
    padding: 1.25rem;
    font-size: 0.9rem;
  }
}

/* Medium devices (768px and up) */
@media (min-width: 768px) {
  footer {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Large devices (992px and up) */
@media (min-width: 992px) {
  footer {
    padding: 2rem;
  }
}

/* Ultra-wide screens (1920px and up) */
@media (min-width: 1920px) {
  footer {
    padding: 2.5rem;
    font-size: 1.1rem;
  }
}

/* Print styles */
@media print {
  footer {
    padding: 1rem;
    font-size: 0.8rem;
    background-color: transparent;
    border-top: 1px solid #ddd;
  }
}
</style>