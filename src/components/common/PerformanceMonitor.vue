<template>
  <BaseCard 
    title="Performance Metrics"
    variant="outlined"
    class="performance-monitor"
    role="region"
    aria-labelledby="performance-title"
  >
    <template #header>
      <div class="performance-header">
        <h3 id="performance-title">Performance Metrics</h3>
        <div class="performance-grade" :class="`grade-${overallGrade.toLowerCase()}`">
          Grade: {{ overallGrade }}
        </div>
      </div>
    </template>

    <div class="performance-content">
      <!-- Core Web Vitals -->
      <section class="core-web-vitals" aria-labelledby="cwv-title">
        <h4 id="cwv-title">Core Web Vitals</h4>
        <div class="metrics-grid" role="list">
          <div 
            class="metric-item"
            :class="`score-${performanceScores.lcp.score}`"
            role="listitem"
            :aria-label="`Largest Contentful Paint: ${formattedMetrics?.lcp || 'N/A'}, Score: ${performanceScores.lcp.score}`"
          >
            <div class="metric-label">
              <span class="metric-name">LCP</span>
              <span class="metric-description">Largest Contentful Paint</span>
            </div>
            <div class="metric-value">{{ formattedMetrics?.lcp || 'N/A' }}</div>
            <div class="metric-score" :aria-hidden="true">{{ performanceScores.lcp.score }}</div>
          </div>

          <div 
            class="metric-item"
            :class="`score-${performanceScores.fid.score}`"
            role="listitem"
            :aria-label="`First Input Delay: ${formattedMetrics?.fid || 'N/A'}, Score: ${performanceScores.fid.score}`"
          >
            <div class="metric-label">
              <span class="metric-name">FID</span>
              <span class="metric-description">First Input Delay</span>
            </div>
            <div class="metric-value">{{ formattedMetrics?.fid || 'N/A' }}</div>
            <div class="metric-score" :aria-hidden="true">{{ performanceScores.fid.score }}</div>
          </div>

          <div 
            class="metric-item"
            :class="`score-${performanceScores.cls.score}`"
            role="listitem"
            :aria-label="`Cumulative Layout Shift: ${formattedMetrics?.cls || 'N/A'}, Score: ${performanceScores.cls.score}`"
          >
            <div class="metric-label">
              <span class="metric-name">CLS</span>
              <span class="metric-description">Cumulative Layout Shift</span>
            </div>
            <div class="metric-value">{{ formattedMetrics?.cls || 'N/A' }}</div>
            <div class="metric-score" :aria-hidden="true">{{ performanceScores.cls.score }}</div>
          </div>
        </div>
      </section>

      <!-- Additional Metrics -->
      <section class="additional-metrics" aria-labelledby="additional-title" v-if="formattedMetrics">
        <h4 id="additional-title">Additional Metrics</h4>
        <div class="metrics-list" role="list">
          <div class="metric-row" role="listitem">
            <span class="metric-label">Load Time:</span>
            <span class="metric-value">{{ formattedMetrics.loadTime }}</span>
          </div>
          <div class="metric-row" role="listitem">
            <span class="metric-label">DOM Content Loaded:</span>
            <span class="metric-value">{{ formattedMetrics.domContentLoaded }}</span>
          </div>
          <div class="metric-row" role="listitem">
            <span class="metric-label">First Paint:</span>
            <span class="metric-value">{{ formattedMetrics.firstPaint }}</span>
          </div>
          <div class="metric-row" role="listitem">
            <span class="metric-label">First Contentful Paint:</span>
            <span class="metric-value">{{ formattedMetrics.firstContentfulPaint }}</span>
          </div>
          <div class="metric-row" role="listitem">
            <span class="metric-label">Time to Interactive:</span>
            <span class="metric-value">{{ formattedMetrics.timeToInteractive }}</span>
          </div>
          <div class="metric-row" role="listitem">
            <span class="metric-label">Resource Count:</span>
            <span class="metric-value">{{ formattedMetrics.resourceCount }}</span>
          </div>
          <div class="metric-row" role="listitem" v-if="formattedMetrics.memoryUsage !== 'N/A'">
            <span class="metric-label">Memory Usage:</span>
            <span class="metric-value">{{ formattedMetrics.memoryUsage }}</span>
          </div>
        </div>
      </section>

      <!-- Recommendations -->
      <section class="recommendations" aria-labelledby="recommendations-title" v-if="recommendations.length > 0">
        <h4 id="recommendations-title">Performance Recommendations</h4>
        <ul class="recommendations-list" role="list">
          <li 
            v-for="(recommendation, index) in recommendations"
            :key="index"
            class="recommendation-item"
            role="listitem"
          >
            {{ recommendation }}
          </li>
        </ul>
      </section>

      <!-- Controls -->
      <section class="performance-controls" aria-labelledby="controls-title">
        <h4 id="controls-title" class="sr-only">Performance Controls</h4>
        <div class="controls-row">
          <BaseButton 
            @click="updateMetrics"
            variant="primary"
            size="small"
            :disabled="!isMonitoring"
            aria-describedby="refresh-help"
          >
            <span aria-hidden="true">🔄</span>
            Refresh Metrics
          </BaseButton>
          
          <BaseButton 
            @click="exportMetrics"
            variant="secondary"
            size="small"
            :disabled="!metrics"
            aria-describedby="export-help"
          >
            <span aria-hidden="true">📊</span>
            Export Report
          </BaseButton>
          
          <BaseButton 
            @click="clearMetrics"
            variant="warning"
            size="small"
            :disabled="!metrics"
            aria-describedby="clear-help"
          >
            <span aria-hidden="true">🗑️</span>
            Clear Data
          </BaseButton>
        </div>
        
        <div class="sr-only">
          <div id="refresh-help">Refresh current performance metrics</div>
          <div id="export-help">Export performance report as JSON file</div>
          <div id="clear-help">Clear all collected performance data</div>
        </div>
      </section>

      <!-- Status -->
      <div class="performance-status" role="status" aria-live="polite">
        <span class="status-indicator" :class="{ active: isMonitoring }" aria-hidden="true"></span>
        <span class="status-text">
          {{ isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive' }}
        </span>
        <span v-if="lastUpdate" class="last-update">
          Last updated: {{ formatTime(lastUpdate) }}
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePerformance } from '@/composables/usePerformance'
import BaseCard from './BaseCard.vue'
import BaseButton from './BaseButton.vue'

// Props
interface Props {
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: false,
  refreshInterval: 5000
})

// Use performance monitoring
const {
  metrics,
  isMonitoring,
  lastUpdate,
  performanceScores,
  overallGrade,
  formattedMetrics,
  recommendations,
  updateMetrics,
  exportMetrics,
  clearMetrics
} = usePerformance()

// Format timestamp for display
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString()
}

// Auto-refresh if enabled
if (props.autoRefresh) {
  setInterval(() => {
    if (isMonitoring.value) {
      updateMetrics()
    }
  }, props.refreshInterval)
}
</script>

<style scoped>
.performance-monitor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.performance-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.performance-grade {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.grade-a {
  background-color: #27ae60;
  color: white;
}

.grade-b {
  background-color: #3498db;
  color: white;
}

.grade-c {
  background-color: #f39c12;
  color: white;
}

.grade-d {
  background-color: #e74c3c;
  color: white;
}

.performance-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.core-web-vitals h4,
.additional-metrics h4,
.recommendations h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-item {
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #ecf0f1;
  transition: all 0.3s ease;
}

.metric-item.score-good {
  border-color: #27ae60;
  background-color: #f8fff9;
}

.metric-item.score-needs-improvement {
  border-color: #f39c12;
  background-color: #fffcf8;
}

.metric-item.score-poor {
  border-color: #e74c3c;
  background-color: #fff8f8;
}

.metric-label {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.metric-name {
  font-weight: 700;
  font-size: 0.875rem;
  color: #2c3e50;
}

.metric-description {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.metric-score {
  font-size: 0.75rem;
  text-transform: capitalize;
  font-weight: 500;
}

.score-good .metric-score {
  color: #27ae60;
}

.score-needs-improvement .metric-score {
  color: #f39c12;
}

.score-poor .metric-score {
  color: #e74c3c;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.metric-row:last-child {
  border-bottom: none;
}

.metric-row .metric-label {
  font-weight: 500;
  color: #7f8c8d;
}

.metric-row .metric-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
}

.recommendations-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendation-item {
  padding: 0.75rem;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #856404;
}

.recommendation-item:last-child {
  margin-bottom: 0;
}

.performance-controls {
  border-top: 1px solid #ecf0f1;
  padding-top: 1rem;
}

.controls-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.performance-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #7f8c8d;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #95a5a6;
  transition: background-color 0.3s ease;
}

.status-indicator.active {
  background-color: #27ae60;
}

.last-update {
  margin-left: auto;
  font-size: 0.75rem;
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

/* Responsive design */
@media (max-width: 768px) {
  .performance-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .controls-row {
    flex-direction: column;
  }
  
  .performance-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .last-update {
    margin-left: 0;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .metric-item {
    border-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .metric-item,
  .status-indicator {
    transition: none;
  }
}
</style>