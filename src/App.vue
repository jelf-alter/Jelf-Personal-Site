<template>
  <div id="app">
    <header>
      <nav class="navbar">
        <div class="nav-brand">
          <RouterLink to="/" class="brand-link">Personal Website</RouterLink>
        </div>
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          <RouterLink to="/demos" class="nav-link">Demos</RouterLink>
          <RouterLink to="/testing" class="nav-link">Testing</RouterLink>
          <RouterLink to="/about" class="nav-link">About</RouterLink>
        </div>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer>
      <p>&copy; 2024 Personal Website. Built with Vue.js and TypeScript.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
}

.brand-link {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #34495e;
}

main {
  min-height: calc(100vh - 120px);
  padding: 2rem;
}

footer {
  text-align: center;
  padding: 1rem;
  background-color: #ecf0f1;
  color: #7f8c8d;
}
</style>