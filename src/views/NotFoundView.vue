<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Page Not Found</h1>
      <p class="error-message">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div class="suggestions">
        <h2>Here are some helpful links:</h2>
        <div class="suggestion-links">
          <RouterLink to="/" class="suggestion-link">
            <div class="link-icon">🏠</div>
            <div class="link-content">
              <h3>Home</h3>
              <p>Return to the homepage</p>
            </div>
          </RouterLink>
          
          <RouterLink to="/demos" class="suggestion-link">
            <div class="link-icon">🚀</div>
            <div class="link-content">
              <h3>Demos</h3>
              <p>Explore interactive demonstrations</p>
            </div>
          </RouterLink>
          
          <RouterLink to="/testing" class="suggestion-link">
            <div class="link-icon">🧪</div>
            <div class="link-content">
              <h3>Testing</h3>
              <p>View the testing dashboard</p>
            </div>
          </RouterLink>
          
          <RouterLink to="/about" class="suggestion-link">
            <div class="link-icon">ℹ️</div>
            <div class="link-content">
              <h3>About</h3>
              <p>Learn about this project</p>
            </div>
          </RouterLink>
        </div>
      </div>
      
      <div class="back-button">
        <BaseButton variant="primary" @click="goBack">
          ← Go Back
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 1rem;
  line-height: 1;
}

.not-found-content h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.suggestions {
  margin-bottom: 3rem;
}

.suggestions h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.suggestion-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.suggestion-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.suggestion-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.link-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.link-content {
  text-align: left;
}

.link-content h3 {
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.link-content p {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
}

.back-button {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .not-found-content h1 {
    font-size: 2rem;
  }
  
  .suggestion-links {
    grid-template-columns: 1fr;
  }
  
  .suggestion-link {
    justify-content: center;
    text-align: center;
  }
  
  .link-content {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 4rem;
  }
  
  .not-found-content h1 {
    font-size: 1.5rem;
  }
  
  .suggestion-link {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>