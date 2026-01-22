<template>
  <div id="app">
    <NavigationHeader @menu-toggled="handleMenuToggle" @navigation-clicked="handleNavigationClick" />

    <main>
      <RouterView />
    </main>

    <footer>
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

main {
  flex: 1;
  padding: 0;
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scroll */
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