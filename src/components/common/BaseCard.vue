<template>
  <div :class="cardClasses">
    <header v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </header>
    
    <div class="card-content">
      <slot />
    </div>
    
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'small' | 'medium' | 'large'
  hoverable?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'medium',
  hoverable: false,
  clickable: false
})

const cardClasses = computed(() => [
  'base-card',
  `base-card--${props.variant}`,
  `base-card--padding-${props.padding}`,
  {
    'base-card--hoverable': props.hoverable,
    'base-card--clickable': props.clickable
  }
])
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
</style>