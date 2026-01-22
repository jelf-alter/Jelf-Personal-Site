<template>
  <div :class="spinnerClasses">
    <div class="spinner-circle"></div>
    <p v-if="message" class="spinner-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  message?: string
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  overlay: false
})

const spinnerClasses = computed(() => [
  'loading-spinner',
  `loading-spinner--${props.size}`,
  {
    'loading-spinner--overlay': props.overlay
  }
])
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.loading-spinner--overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.spinner-circle {
  border: 3px solid #ecf0f1;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner--small .spinner-circle {
  width: 1.5rem;
  height: 1.5rem;
}

.loading-spinner--medium .spinner-circle {
  width: 2.5rem;
  height: 2.5rem;
}

.loading-spinner--large .spinner-circle {
  width: 4rem;
  height: 4rem;
}

.spinner-message {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>