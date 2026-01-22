<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    :aria-pressed="ariaPressed"
    :aria-expanded="ariaExpanded"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span v-if="loading" class="loading-spinner" aria-hidden="true"></span>
    <slot v-if="!loading" />
    <span v-if="loading" class="sr-only">{{ loadingText }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  ariaLabel?: string
  ariaDescribedby?: string
  ariaPressed?: boolean
  ariaExpanded?: boolean
}

interface Emits {
  click: [event: MouseEvent]
  keydown: [event: KeyboardEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  loadingText: 'Loading...',
  type: 'button',
  block: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'base-button--disabled': props.disabled,
    'base-button--loading': props.loading,
    'base-button--block': props.block
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle Enter and Space keys for better accessibility
  if ((event.key === 'Enter' || event.key === ' ') && !props.disabled && !props.loading) {
    event.preventDefault()
    emit('keydown', event)
    // Also emit click for consistency
    emit('click', event as any)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
  min-height: 44px; /* Minimum touch target size for accessibility */
}

.base-button:focus {
  outline: none;
}

.base-button:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 2px;
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

/* Sizes */
.base-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.base-button--medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.base-button--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Variants */
.base-button--primary {
  background-color: #3498db;
  color: white;
}

.base-button--primary:hover:not(.base-button--disabled) {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.base-button--secondary {
  background-color: transparent;
  color: #3498db;
  border: 2px solid #3498db;
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background-color: #3498db;
  color: white;
}

.base-button--success {
  background-color: #27ae60;
  color: white;
}

.base-button--success:hover:not(.base-button--disabled) {
  background-color: #229954;
}

.base-button--warning {
  background-color: #f39c12;
  color: white;
}

.base-button--warning:hover:not(.base-button--disabled) {
  background-color: #e67e22;
}

.base-button--danger {
  background-color: #e74c3c;
  color: white;
}

.base-button--danger:hover:not(.base-button--disabled) {
  background-color: #c0392b;
}

/* States */
.base-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.base-button--loading {
  cursor: wait;
}

.base-button--block {
  width: 100%;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .base-button:focus-visible {
    outline: 3px solid;
  }
  
  .base-button--primary {
    border: 2px solid transparent;
  }
  
  .base-button--secondary {
    border-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;
  }
  
  .base-button:hover:not(.base-button--disabled) {
    transform: none;
  }
  
  .loading-spinner {
    animation: none;
  }
}
</style>