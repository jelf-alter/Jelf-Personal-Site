<template>
  <div class="demo-documentation" v-if="demo">
    <!-- Documentation Header -->
    <header class="doc-header">
      <div class="demo-badge" v-if="demo.featured" aria-label="Featured demo">
        ⭐ Featured Demo
      </div>
      <h1 class="doc-title">{{ demo.name }}</h1>
      <p class="doc-description">{{ demo.description }}</p>
      
      <!-- Demo Metadata -->
      <div class="demo-metadata">
        <div class="metadata-grid">
          <div class="metadata-item">
            <span class="metadata-label">Complexity</span>
            <span class="metadata-value" :class="`complexity-${demo.metadata?.complexity}`">
              {{ formatComplexity(demo.metadata?.complexity) }}
            </span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Estimated Time</span>
            <span class="metadata-value">{{ demo.metadata?.estimatedTime || 'N/A' }}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Difficulty</span>
            <span class="metadata-value">{{ demo.metadata?.difficulty || 'N/A' }}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Category</span>
            <span class="metadata-value">{{ getCategoryName(demo.category) }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Quick Start Section -->
    <section class="quick-start" aria-labelledby="quick-start-title">
      <h2 id="quick-start-title">Quick Start</h2>
      <div class="quick-start-content">
        <div class="prerequisites" v-if="demo.metadata?.prerequisites">
          <h3>Prerequisites</h3>
          <p>{{ demo.metadata.prerequisites }}</p>
        </div>
        
        <div class="learning-objectives" v-if="demo.metadata?.learningObjectives?.length">
          <h3>What You'll Learn</h3>
          <ul>
            <li v-for="objective in demo.metadata.learningObjectives" :key="objective">
              {{ objective }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Technologies Section -->
    <section class="technologies" aria-labelledby="tech-title">
      <h2 id="tech-title">Technologies Used</h2>
      <div class="tech-grid">
        <div 
          v-for="tech in demo.technologies" 
          :key="tech" 
          class="tech-item"
          :title="`Technology: ${tech}`"
        >
          <span class="tech-icon">{{ getTechIcon(tech) }}</span>
          <span class="tech-name">{{ tech }}</span>
        </div>
      </div>
    </section>

    <!-- Requirements Section -->
    <section class="requirements" aria-labelledby="requirements-title" v-if="demo.requirements?.length">
      <h2 id="requirements-title">Key Features & Requirements</h2>
      <ul class="requirements-list">
        <li v-for="requirement in demo.requirements" :key="requirement" class="requirement-item">
          <span class="requirement-icon" aria-hidden="true">✓</span>
          {{ requirement }}
        </li>
      </ul>
    </section>

    <!-- API Endpoints Section -->
    <section class="api-endpoints" aria-labelledby="api-title" v-if="demo.apiEndpoints?.length">
      <h2 id="api-title">API Endpoints</h2>
      <div class="endpoints-list">
        <div v-for="endpoint in demo.apiEndpoints" :key="endpoint" class="endpoint-item">
          <code class="endpoint-path">{{ endpoint }}</code>
        </div>
      </div>
    </section>

    <!-- WebSocket Events Section -->
    <section class="websocket-events" aria-labelledby="ws-title" v-if="demo.websocketEvents?.length">
      <h2 id="ws-title">WebSocket Events</h2>
      <div class="events-list">
        <div v-for="event in demo.websocketEvents" :key="event" class="event-item">
          <code class="event-name">{{ event }}</code>
        </div>
      </div>
    </section>

    <!-- Detailed Documentation -->
    <section class="detailed-docs" aria-labelledby="docs-title" v-if="demo.documentation">
      <h2 id="docs-title">Detailed Documentation</h2>
      <div class="docs-content" v-html="renderMarkdown(demo.documentation)"></div>
    </section>

    <!-- Action Buttons -->
    <section class="demo-actions">
      <div class="action-buttons">
        <BaseButton 
          variant="primary" 
          size="large"
          @click="$emit('launch-demo')"
          aria-label="Launch the demo application"
        >
          <span class="button-icon">🚀</span>
          Launch Demo
        </BaseButton>
        
        <BaseButton 
          v-if="demo.sourceUrl" 
          variant="secondary" 
          size="large"
          @click="openSource"
          aria-label="View source code in new tab"
        >
          <span class="button-icon">📄</span>
          View Source
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          size="large"
          @click="$emit('view-tests')"
          aria-label="View test results for this demo"
        >
          <span class="button-icon">🧪</span>
          View Tests
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { demoRegistry } from '@/services/demoRegistry'
import type { IDemoConfig } from '@/services/demoRegistry'
import BaseButton from '@/components/common/BaseButton.vue'

// Props
interface Props {
  demo: IDemoConfig
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'launch-demo'): void
  (e: 'view-tests'): void
}

const emit = defineEmits<Emits>()

// Computed
const getCategoryName = (categoryId: string): string => {
  const category = demoRegistry.getCategory(categoryId)
  return category?.name || categoryId
}

// Methods
const formatComplexity = (complexity: string | undefined): string => {
  if (!complexity) return 'N/A'
  return complexity.charAt(0).toUpperCase() + complexity.slice(1)
}

const getTechIcon = (tech: string): string => {
  const iconMap: Record<string, string> = {
    'Vue.js': '🟢',
    'TypeScript': '🔷',
    'Node.js': '🟢',
    'WebSockets': '⚡',
    'D3.js': '📊',
    'Chart.js': '📈',
    'Axios': '🌐',
    'Socket.IO': '🔌',
    'JSON': '📄',
    'REST': '🔗',
    'CSS': '🎨',
    'HTML': '📝'
  }
  return iconMap[tech] || '⚙️'
}

const renderMarkdown = (markdown: string): string => {
  // Simple markdown rendering - in a real app, you'd use a proper markdown parser
  return markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l|p])/gm, '<p>')
    .replace(/(?<![h|l|p]>)$/gm, '</p>')
}

const openSource = () => {
  if (props.demo.sourceUrl) {
    window.open(props.demo.sourceUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.demo-documentation {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

/* Header Styles */
.doc-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.demo-badge {
  display: inline-block;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.doc-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.doc-description {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0 0 2rem 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

/* Metadata Styles */
.demo-metadata {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metadata-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.metadata-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.complexity-high {
  color: #e74c3c;
}

.complexity-medium {
  color: #f39c12;
}

.complexity-low {
  color: #27ae60;
}

/* Section Styles */
.demo-documentation section {
  margin-bottom: 3rem;
}

.demo-documentation h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3498db;
  font-weight: 600;
}

.demo-documentation h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

/* Quick Start Styles */
.quick-start-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.prerequisites,
.learning-objectives {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.learning-objectives ul {
  margin: 0;
  padding-left: 1.5rem;
}

.learning-objectives li {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

/* Technologies Styles */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s;
}

.tech-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.tech-icon {
  font-size: 1.5rem;
}

.tech-name {
  font-weight: 500;
  color: #2c3e50;
}

/* Requirements Styles */
.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirement-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.requirement-item:last-child {
  border-bottom: none;
}

.requirement-icon {
  color: #27ae60;
  font-weight: bold;
  margin-top: 0.1rem;
}

/* API and WebSocket Styles */
.endpoints-list,
.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.endpoint-item,
.event-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.endpoint-path,
.event-name {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  color: #2c3e50;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

/* Documentation Content Styles */
.docs-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.docs-content :deep(h1) {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.docs-content :deep(h2) {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 2rem 0 1rem 0;
}

.docs-content :deep(h3) {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 1.5rem 0 0.75rem 0;
}

.docs-content :deep(p) {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.docs-content :deep(ul) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.docs-content :deep(li) {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.docs-content :deep(code) {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  color: #e74c3c;
}

.docs-content :deep(strong) {
  font-weight: 600;
  color: #2c3e50;
}

/* Action Buttons */
.demo-actions {
  text-align: center;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.button-icon {
  margin-right: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .demo-documentation {
    padding: 1rem;
  }
  
  .doc-title {
    font-size: 2rem;
  }
  
  .doc-description {
    font-size: 1.1rem;
  }
  
  .metadata-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-start-content {
    grid-template-columns: 1fr;
  }
  
  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .endpoints-list,
  .events-list {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .doc-title {
    font-size: 1.75rem;
  }
  
  .metadata-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .tech-item {
    transition: none;
  }
}

/* Focus styles */
.tech-item:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}
</style>