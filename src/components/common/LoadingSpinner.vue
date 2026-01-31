<template>
  <div 
    :class="spinnerClasses"
    :style="{ visibility: visible ? 'visible' : 'hidden' }"
    role="status"
    :aria-label="ariaLabel"
    :aria-live="ariaLive"
  >
    <!-- Backdrop for overlay mode -->
    <div v-if="overlay" class="loading-backdrop"></div>
    
    <!-- Loading overlay for overlay mode -->
    <div v-if="overlay" class="loading-overlay" @click="handleBackdropClick">
      <div class="spinner-container">
        <div :class="spinnerElementClasses" aria-hidden="true" @click="handleSpinnerClick"></div>
        <div v-if="message" class="loading-message">{{ message }}</div>
        <div v-if="showProgress && progress !== undefined" class="progress-indicator">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <div class="progress-text">{{ progress }}%</div>
        </div>
        <div v-if="estimatedTime" class="estimated-time">
          {{ estimatedTime }} seconds
        </div>
        <button v-if="cancellable" class="cancel-button" @click="handleCancel">
          Cancel
        </button>
      </div>
    </div>
    
    <!-- Inline mode content -->
    <template v-else>
      <div :class="spinnerElementClasses" aria-hidden="true" @click="handleSpinnerClick"></div>
      <div v-if="message" class="loading-message">{{ message }}</div>
      <div v-if="showProgress && progress !== undefined" class="progress-indicator">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
      <div v-if="estimatedTime" class="estimated-time">
        {{ estimatedTime }} seconds
      </div>
      <button v-if="cancellable" class="cancel-button" @click="handleCancel">
        Cancel
      </button>
    </template>
    
    <span class="sr-only">{{ srMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  message?: string
  overlay?: boolean
  inline?: boolean
  visible?: boolean
  progress?: number
  showProgress?: boolean
  estimatedTime?: string
  cancellable?: boolean
  type?: 'circle' | 'dots' | 'bars'
  speed?: 'slow' | 'normal' | 'fast'
  animationSpeed?: 'slow' | 'normal' | 'fast'
  customClass?: string
  ariaLabel?: string
  ariaLive?: 'polite' | 'assertive' | 'off'
}

interface Emits {
  cancel: []
  click: [event: MouseEvent]
  'backdrop-click': [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  color: 'primary',
  overlay: false,
  inline: false,
  visible: true,
  showProgress: false,
  cancellable: false,
  type: 'circle',
  speed: 'normal',
  animationSpeed: 'normal',
  ariaLabel: 'Loading content',
  ariaLive: 'polite'
})

const emit = defineEmits<Emits>()

const spinnerClasses = computed(() => {
  const classes = [
    'loading-spinner',
    `size-${props.size}`
  ]
  
  if (props.overlay) {
    classes.push('overlay-mode')
  }
  
  if (props.inline) {
    classes.push('inline-mode')
  }
  
  if (props.customClass) {
    classes.push(...props.customClass.split(' '))
  }
  
  return classes
})

const spinnerElementClasses = computed(() => {
  const classes = ['spinner']
  
  if (props.type === 'dots') {
    classes.push('spinner-dots')
  } else if (props.type === 'bars') {
    classes.push('spinner-bars')
  }
  
  classes.push(`size-${props.size}`)
  classes.push(`color-${props.color}`)
  classes.push(`speed-${props.speed || props.animationSpeed}`)
  
  return classes
})

const srMessage = computed(() => {
  if (props.message) {
    return props.message
  }
  return 'Loading, please wait...'
})

const handleCancel = () => {
  emit('cancel')
}

const handleSpinnerClick = (event: MouseEvent) => {
  emit('click', event)
}

const handleBackdropClick = (event: MouseEvent) => {
  emit('backdrop-click', event)
}
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.overlay-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.inline-mode {
  display: inline-flex;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  border: 3px solid #ecf0f1;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-dots {
  display: flex;
  gap: 0.25rem;
}

.spinner-dots::before,
.spinner-dots::after {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  background: #3498db;
  border-radius: 50%;
  animation: dots 1.4s infinite ease-in-out both;
}

.spinner-dots::before {
  animation-delay: -0.32s;
}

.spinner-dots::after {
  animation-delay: -0.16s;
}

/* Size variants */
.size-small .spinner {
  width: 1.5rem;
  height: 1.5rem;
}

.size-medium .spinner {
  width: 2.5rem;
  height: 2.5rem;
}

.size-large .spinner {
  width: 4rem;
  height: 4rem;
}

/* Color variants */
.color-primary .spinner {
  border-top-color: #3498db;
}

.color-secondary .spinner {
  border-top-color: #95a5a6;
}

.color-success .spinner {
  border-top-color: #27ae60;
}

.color-warning .spinner {
  border-top-color: #f39c12;
}

.color-danger .spinner {
  border-top-color: #e74c3c;
}

/* Animation speed variants */
.speed-slow .spinner {
  animation-duration: 2s;
}

.speed-normal .spinner {
  animation-duration: 1s;
}

.speed-fast .spinner {
  animation-duration: 0.5s;
}

.loading-message {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
}

.progress-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.estimated-time {
  font-size: 0.8rem;
  color: #7f8c8d;
  text-align: center;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.cancel-button:hover {
  background: #c0392b;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dots {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    /* Show a static indicator instead */
    border: 3px solid #ecf0f1;
    border-left: 3px solid #3498db;
  }
}
</style>