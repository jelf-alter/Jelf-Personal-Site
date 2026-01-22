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
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 0;
}

footer {
  text-align: center;
  padding: 1rem;
  background-color: #ecf0f1;
  color: #7f8c8d;
  margin-top: auto;
}

@media (max-width: 768px) {
  footer {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}
</style>