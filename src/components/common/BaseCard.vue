<template>
  <div 
    :class="cardClasses"
    :role="role"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
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
  clickable?: boolean
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
  clickable: false,
  role: 'article'
})

const emit = defineEmits<Emits>()

// Generate unique IDs for accessibility
const cardId = ref(`card-${Math.random().toString(36).substr(2, 9)}`)
const titleId = computed(() => props.title ? `${cardId.value}-title` : undefined)
const contentId = computed(() => `${cardId.value}-content`)

const cardClasses = computed(() => [
  'base-card',
  `base-card--${props.variant}`,
  `base-card--padding-${props.padding}`,
  {
    'base-card--hoverable': props.hoverable,
    'base-card--clickable': props.clickable
  }
])

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.clickable && (event.key === 'Enter' || event.key === ' ')) {
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

.base-card--clickable {
  cursor: pointer;
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