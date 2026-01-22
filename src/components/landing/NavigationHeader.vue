<template>
  <header class="navigation-header" role="banner">
    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <div class="nav-brand">
        <RouterLink 
          to="/" 
          class="brand-link"
          aria-label="Personal Website - Home"
        >
          Personal Website
        </RouterLink>
      </div>

      <!-- Mobile menu button -->
      <button
        class="mobile-menu-toggle"
        :class="{ 'is-active': isMobileMenuOpen }"
        @click="toggleMobileMenu"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="mobile-menu"
        aria-label="Toggle navigation menu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Navigation links -->
      <div 
        id="mobile-menu"
        class="nav-links"
        :class="{ 'is-open': isMobileMenuOpen }"
      >
        <RouterLink 
          v-for="item in navigationItems"
          :key="item.id"
          :to="item.path"
          class="nav-link"
          :aria-current="$route.path === item.path ? 'page' : undefined"
          @click="closeMobileMenu"
        >
          <span v-if="item.icon" class="nav-icon" :aria-hidden="true">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { INavigationItem } from '@/types'

// Props
interface Props {
  navigationItems?: INavigationItem[]
}

withDefaults(defineProps<Props>(), {
  navigationItems: () => [
    { id: 'home', label: 'Home', path: '/', icon: '🏠' },
    { id: 'demos', label: 'Demos', path: '/demos', icon: '🚀' },
    { id: 'testing', label: 'Testing', path: '/testing', icon: '🧪' },
    { id: 'about', label: 'About', path: '/about', icon: '👤' }
  ]
})

// Emits
const emit = defineEmits<{
  'menu-toggled': [isOpen: boolean]
  'navigation-clicked': [path: string]
}>()

// State
const isMobileMenuOpen = ref(false)

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  emit('menu-toggled', isMobileMenuOpen.value)
}

const closeMobileMenu = () => {
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
    emit('menu-toggled', false)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  const navbar = document.querySelector('.navbar')
  
  if (navbar && !navbar.contains(target) && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Mobile First Navigation Design */
.navigation-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #2c3e50;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem; /* Mobile first padding */
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  min-height: 60px; /* Ensure consistent height */
}

.brand-link {
  font-size: 1.25rem; /* Mobile first size */
  font-weight: bold;
  color: white;
  text-decoration: none;
  transition: color 0.3s ease;
  flex-shrink: 0; /* Prevent shrinking */
}

.brand-link:hover,
.brand-link:focus {
  color: #3498db;
  outline: 2px solid transparent;
}

.brand-link:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.mobile-menu-toggle {
  display: flex; /* Show by default on mobile */
  flex-direction: column;
  justify-content: space-around;
  width: 1.75rem; /* Mobile optimized size */
  height: 1.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
  position: relative;
}

.mobile-menu-toggle:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.hamburger-line {
  width: 1.75rem;
  height: 0.2rem;
  background: white;
  border-radius: 10px;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
}

.mobile-menu-toggle.is-active .hamburger-line:first-child {
  transform: rotate(45deg);
}

.mobile-menu-toggle.is-active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.is-active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg);
}

.nav-links {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #2c3e50;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.5rem;
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-top: 1px solid #34495e;
}

.nav-links.is-open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  justify-content: flex-start;
  min-height: 44px; /* Touch target size */
  font-size: 1rem;
}

.nav-link:hover,
.nav-link:focus {
  background-color: #34495e;
  transform: translateY(-2px);
  outline: none;
}

.nav-link:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.nav-link[aria-current="page"] {
  background-color: #3498db;
  font-weight: 600;
}

.nav-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* Small devices (576px and up) */
@media (min-width: 576px) {
  .navbar {
    padding: 1rem 1.5rem;
  }
  
  .brand-link {
    font-size: 1.375rem;
  }
  
  .mobile-menu-toggle {
    width: 2rem;
    height: 2rem;
  }
  
  .hamburger-line {
    width: 2rem;
    height: 0.25rem;
  }
}

/* Medium devices (768px and up) - Desktop Navigation */
@media (min-width: 768px) {
  .navbar {
    padding: 1rem 2rem;
  }
  
  .brand-link {
    font-size: 1.5rem;
  }

  .mobile-menu-toggle {
    display: none; /* Hide hamburger menu */
  }

  .nav-links {
    position: static;
    background: transparent;
    flex-direction: row;
    padding: 0;
    gap: 1rem;
    transform: none;
    opacity: 1;
    visibility: visible;
    box-shadow: none;
    border: none;
    align-items: center;
  }

  .nav-link {
    width: auto;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    justify-content: center;
    min-height: auto;
  }
}

/* Large devices (992px and up) */
@media (min-width: 992px) {
  .nav-links {
    gap: 1.25rem;
  }
  
  .nav-link {
    padding: 0.625rem 1.25rem;
  }
}

/* Extra large devices (1200px and up) */
@media (min-width: 1200px) {
  .nav-links {
    gap: 1.5rem;
  }
  
  .nav-link {
    padding: 0.75rem 1.5rem;
  }
}

/* Ultra-wide screens (1920px and up) */
@media (min-width: 1920px) {
  .navbar {
    padding: 1.25rem 2rem;
  }
  
  .brand-link {
    font-size: 1.75rem;
  }
  
  .nav-links {
    gap: 2rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .nav-link:focus-visible,
  .brand-link:focus-visible,
  .mobile-menu-toggle:focus {
    outline: 3px solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .hamburger-line,
  .nav-links {
    transition: none;
  }
  
  .nav-link:hover {
    transform: none;
  }
}

/* Print styles */
@media print {
  .navigation-header {
    position: static;
    box-shadow: none;
  }
  
  .mobile-menu-toggle {
    display: none;
  }
  
  .nav-links {
    position: static;
    flex-direction: row;
    gap: 1rem;
    opacity: 1;
    visibility: visible;
  }
}
</style>