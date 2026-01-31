<template>
  <div 
    :class="cardClasses"
    :role="role"
    :aria-labelledby="ariaLabelledby || titleId"
    :aria-describedby="ariaDescribedby"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="clickable && !disabled ? 0 : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
    </div>
    
    <header v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" :id="titleId" class="card-title">{{ title }}</h3>
      </slot>
    </header>
    
    <div class="card-content" :id="contentId">
      <slot />
    </div>
    
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  title?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'small' | 'medium' | 'large'
  hoverable?: boolean
  hover?: boolean
  clickable?: boolean
  loading?: boolean
  disabled?: boolean
  responsive?: boolean
  elevation?: number
  border?: string
  customClass?: string
  rounded?: boolean
  role?: string
  ariaLabelledby?: string
  ariaDescribedby?: string
}

interface Emits {
  click: [event: MouseEvent | KeyboardEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'medium',
  hoverable: false,
  hover: false,
  clickable: false,
  loading: false,
  disabled: false,
  responsive: false,
  elevation: 0,
  rounded: false,
  role: 'article'
})

const emit = defineEmits<Emits>()

// Generate unique IDs for accessibility
const cardId = ref(`card-${Math.random().toString(36).substr(2, 9)}`)
const titleId = computed(() => props.title ? `${cardId.value}-title` : undefined)
const contentId = computed(() => `${cardId.value}-content`)

const cardClasses = computed(() => {
  const classes = [
    'base-card',
    `base-card--${props.variant}`,
    `base-card--padding-${props.padding}`,
  ]
  
  // Add padding class that tests expect
  classes.push(`padding-${props.padding}`)
  
  if (props.hoverable || props.hover) {
    classes.push('hover-enabled')
  }
  
  if (props.clickable) {
    classes.push('clickable')
  }
  
  if (props.loading) {
    classes.push('loading')
  }
  
  if (props.disabled) {
    classes.push('disabled')
  }
  
  if (props.responsive) {
    classes.push('responsive')
  }
  
  if (props.elevation > 0) {
    classes.push(`elevation-${props.elevation}`)
  }
  
  if (props.border) {
    classes.push(`border-${props.border}`)
  }
  
  if (props.rounded) {
    classes.push('rounded')
  }
  
  if (props.customClass) {
    classes.push(...props.customClass.split(' '))
  }
  
  return classes
})

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.disabled && !props.loading) {
    emit('click', event)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.clickable && !props.disabled && !props.loading && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    emit('click', event)
  }
}
</script>

<style scoped>
.base-card {
  background: white;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.base-card--default {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #ecf0f1;
}

.base-card--elevated {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.base-card--outlined {
  border: 2px solid #ecf0f1;
  box-shadow: none;
}

.base-card--flat {
  box-shadow: none;
  border: none;
}

.base-card--hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.hover-enabled:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.base-card--clickable {
  cursor: pointer;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  transform: translateY(-2px);
}

.base-card--clickable:hover {
  transform: translateY(-2px);
}

.base-card--clickable:focus {
  outline: none;
}

.base-card--clickable:focus-visible {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

/* Loading state */
.loading {
  position: relative;
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #ecf0f1;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Disabled state */
.disabled {
  opacity: 0.6;
  pointer-events: none;
  cursor: not-allowed;
}

/* Responsive */
.responsive {
  width: 100%;
  max-width: 100%;
}

/* Elevation levels */
.elevation-1 { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24); }
.elevation-2 { box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23); }
.elevation-3 { box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23); }
.elevation-4 { box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22); }
.elevation-5 { box-shadow: 0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22); }

/* Border variants */
.border-primary { border: 2px solid #3498db; }
.border-secondary { border: 2px solid #95a5a6; }
.border-success { border: 2px solid #27ae60; }
.border-warning { border: 2px solid #f39c12; }
.border-danger { border: 2px solid #e74c3c; }

/* Rounded variant */
.rounded {
  border-radius: 16px;
}

/* Padding variants */
.base-card--padding-none .card-content {
  padding: 0;
}

.base-card--padding-small .card-content {
  padding: 1rem;
}

.base-card--padding-medium .card-content {
  padding: 1.5rem;
}

.base-card--padding-large .card-content {
  padding: 2rem;
}

.card-header {
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #ecf0f1;
  margin-bottom: 1rem;
}

.card-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-footer {
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid #ecf0f1;
  margin-top: 1rem;
  padding-top: 1rem;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .base-card--clickable:focus-visible {
    outline: 3px solid;
  }
  
  .base-card--outlined {
    border-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .base-card {
    transition: none;
  }
  
  .base-card--hoverable:hover,
  .base-card--clickable:hover {
    transform: none;
  }
}
</style>