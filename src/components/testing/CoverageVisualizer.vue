<template>
  <div class="coverage-visualizer">
    <div class="visualizer-header">
      <h3 class="visualizer-title">Coverage Report</h3>
      <div class="coverage-controls">
        <select 
          v-model="selectedSuite" 
          class="suite-selector"
          @change="onSuiteChange"
        >
          <option value="overall">Overall Coverage</option>
          <option 
            v-for="suite in testSuites" 
            :key="suite.id" 
            :value="suite.id"
          >
            {{ suite.name }}
          </option>
        </select>
        
        <button 
          class="view-toggle"
          :class="{ active: viewMode === 'detailed' }"
          @click="toggleViewMode"
        >
          {{ viewMode === 'summary' ? '📊 Detailed' : '📋 Summary' }}
        </button>
      </div>
    </div>

    <!-- Summary View -->
    <div v-if="viewMode === 'summary'" class="summary-view">
      <div class="coverage-summary-grid">
        <div 
          v-for="(metric, key) in currentCoverage" 
          :key="key"
          class="coverage-metric-card"
        >
          <div class="metric-header">
            <div class="metric-name">{{ formatMetricName(key) }}</div>
            <div class="metric-percentage" :style="{ color: getCoverageColor(metric.percentage) }">
              {{ metric.percentage.toFixed(1) }}%
            </div>
          </div>
          
          <div class="metric-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ 
                  width: `${metric.percentage}%`,
                  backgroundColor: getCoverageColor(metric.percentage)
                }"
              ></div>
            </div>
            <div class="progress-text">
              {{ metric.covered }} / {{ metric.total }}
            </div>
          </div>
          
          <div class="metric-status" :class="getCoverageStatus(metric.percentage)">
            {{ getCoverageStatusText(metric.percentage) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed View -->
    <div v-else class="detailed-view">
      <!-- File-level coverage breakdown -->
      <div v-if="selectedSuite !== 'overall'" class="file-coverage-section">
        <h4 class="section-title">File Coverage Breakdown</h4>
        <div class="file-coverage-list">
          <div 
            v-for="file in currentTestFiles" 
            :key="file.id"
            class="file-coverage-item"
            :class="{ expanded: expandedFiles.has(file.id) }"
          >
            <div class="file-header" @click="toggleFileExpansion(file.id)">
              <div class="file-info">
                <div class="file-name">{{ getFileName(file.filePath) }}</div>
                <div class="file-path">{{ file.filePath }}</div>
              </div>
              <div class="file-coverage-summary">
                <div class="coverage-badge" :style="{ backgroundColor: getCoverageColor(file.coverage.lines.percentage) }">
                  {{ file.coverage.lines.percentage.toFixed(1) }}%
                </div>
                <div class="expand-icon">
                  {{ expandedFiles.has(file.id) ? '▼' : '▶' }}
                </div>
              </div>
            </div>
            
            <div v-if="expandedFiles.has(file.id)" class="file-details">
              <div class="file-metrics">
                <div class="file-metric">
                  <span class="metric-label">Lines:</span>
                  <div class="metric-bar">
                    <div 
                      class="metric-fill" 
                      :style="{ 
                        width: `${file.coverage.lines.percentage}%`,
                        backgroundColor: getCoverageColor(file.coverage.lines.percentage)
                      }"
                    ></div>
                  </div>
                  <span class="metric-value">{{ file.coverage.lines.covered }}/{{ file.coverage.lines.total }}</span>
                </div>
                
                <div class="file-metric">
                  <span class="metric-label">Branches:</span>
                  <div class="metric-bar">
                    <div 
                      class="metric-fill" 
                      :style="{ 
                        width: `${file.coverage.branches.percentage}%`,
                        backgroundColor: getCoverageColor(file.coverage.branches.percentage)
                      }"
                    ></div>
                  </div>
                  <span class="metric-value">{{ file.coverage.branches.covered }}/{{ file.coverage.branches.total }}</span>
                </div>
                
                <div class="file-metric">
                  <span class="metric-label">Functions:</span>
                  <div class="metric-bar">
                    <div 
                      class="metric-fill" 
                      :style="{ 
                        width: `${file.coverage.functions.percentage}%`,
                        backgroundColor: getCoverageColor(file.coverage.functions.percentage)
                      }"
                    ></div>
                  </div>
                  <span class="metric-value">{{ file.coverage.functions.covered }}/{{ file.coverage.functions.total }}</span>
                </div>
              </div>
              
              <div class="file-test-info">
                <div class="test-counts">
                  <span class="test-count success">{{ file.passCount }} passed</span>
                  <span class="test-count failure">{{ file.failCount }} failed</span>
                  <span class="test-count skipped">{{ file.skipCount }} skipped</span>
                </div>
                <div class="last-run">
                  Last run: {{ formatTimestamp(file.lastRun) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coverage trends chart -->
      <div v-if="selectedSuite !== 'overall' && coverageTrend" class="trend-section">
        <h4 class="section-title">Coverage Trend</h4>
        <div class="trend-chart">
          <div class="trend-info">
            <div class="trend-direction" :class="coverageTrend.trendDirection">
              {{ getTrendIcon(coverageTrend.trendDirection) }}
              {{ formatTrendDirection(coverageTrend.trendDirection) }}
            </div>
            <div class="trend-stats">
              <div class="trend-stat">
                <span class="stat-label">Average:</span>
                <span class="stat-value">{{ coverageTrend.averageCoverage.lines.percentage.toFixed(1) }}%</span>
              </div>
              <div class="trend-stat">
                <span class="stat-label">Success Rate:</span>
                <span class="stat-value">{{ coverageTrend.successRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
          
          <!-- Simple trend visualization -->
          <div class="trend-bars">
            <div 
              v-for="(snapshot, index) in recentSnapshots" 
              :key="snapshot.id"
              class="trend-bar"
              :style="{ 
                height: `${Math.max(snapshot.coverage.lines.percentage, 5)}%`,
                backgroundColor: getCoverageColor(snapshot.coverage.lines.percentage)
              }"
              :title="`${snapshot.coverage.lines.percentage.toFixed(1)}% - ${formatTimestamp(snapshot.timestamp)}`"
            ></div>
          </div>
        </div>
      </div>

      <!-- Coverage thresholds and recommendations -->
      <div class="recommendations-section">
        <h4 class="section-title">Coverage Analysis</h4>
        <div class="recommendations">
          <div 
            v-for="recommendation in coverageRecommendations" 
            :key="recommendation.type"
            class="recommendation"
            :class="recommendation.severity"
          >
            <div class="recommendation-icon">{{ recommendation.icon }}</div>
            <div class="recommendation-content">
              <div class="recommendation-title">{{ recommendation.title }}</div>
              <div class="recommendation-description">{{ recommendation.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTestMetrics, testMetricsUtils } from '@/composables/useTestMetrics'
import type { ICoverageMetrics, ITestFile, ITestMetricsSnapshot } from '@/types'

// Props
interface Props {
  initialSuite?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialSuite: 'overall'
})

// Composables
const { 
  testSuites, 
  overallCoverage, 
  getTestSuite,
  getSnapshots,
  getTrend
} = useTestMetrics()

// Reactive state
const selectedSuite = ref(props.initialSuite)
const viewMode = ref<'summary' | 'detailed'>('summary')
const expandedFiles = ref(new Set<string>())

// Computed properties
const currentCoverage = computed((): ICoverageMetrics => {
  if (selectedSuite.value === 'overall') {
    return overallCoverage.value
  }
  
  const suite = getTestSuite(selectedSuite.value)
  return suite ? suite.coverage : {
    lines: { covered: 0, total: 0, percentage: 0 },
    branches: { covered: 0, total: 0, percentage: 0 },
    functions: { covered: 0, total: 0, percentage: 0 },
    statements: { covered: 0, total: 0, percentage: 0 }
  }
})

const currentTestFiles = computed((): ITestFile[] => {
  if (selectedSuite.value === 'overall') return []
  
  const suite = getTestSuite(selectedSuite.value)
  return suite ? suite.testFiles : []
})

const coverageTrend = computed(() => {
  if (selectedSuite.value === 'overall') return null
  return getTrend(selectedSuite.value)
})

const recentSnapshots = computed((): ITestMetricsSnapshot[] => {
  if (selectedSuite.value === 'overall') return []
  return getSnapshots(selectedSuite.value, 10)
})

const coverageRecommendations = computed(() => {
  const recommendations = []
  const coverage = currentCoverage.value
  
  // Check line coverage
  if (coverage.lines.percentage < 70) {
    recommendations.push({
      type: 'lines',
      severity: 'high',
      icon: '🚨',
      title: 'Low Line Coverage',
      description: `Line coverage is ${coverage.lines.percentage.toFixed(1)}%. Consider adding more unit tests to improve coverage.`
    })
  } else if (coverage.lines.percentage < 85) {
    recommendations.push({
      type: 'lines',
      severity: 'medium',
      icon: '⚠️',
      title: 'Moderate Line Coverage',
      description: `Line coverage is ${coverage.lines.percentage.toFixed(1)}%. Good progress, but there's room for improvement.`
    })
  } else {
    recommendations.push({
      type: 'lines',
      severity: 'low',
      icon: '✅',
      title: 'Excellent Line Coverage',
      description: `Line coverage is ${coverage.lines.percentage.toFixed(1)}%. Great job maintaining high test coverage!`
    })
  }
  
  // Check branch coverage
  if (coverage.branches.percentage < 70) {
    recommendations.push({
      type: 'branches',
      severity: 'medium',
      icon: '🔀',
      title: 'Branch Coverage Needs Attention',
      description: `Branch coverage is ${coverage.branches.percentage.toFixed(1)}%. Consider testing more conditional logic paths.`
    })
  }
  
  // Check function coverage
  if (coverage.functions.percentage < 80) {
    recommendations.push({
      type: 'functions',
      severity: 'medium',
      icon: '🔧',
      title: 'Function Coverage Could Improve',
      description: `Function coverage is ${coverage.functions.percentage.toFixed(1)}%. Some functions may not be tested.`
    })
  }
  
  return recommendations
})

// Methods
const onSuiteChange = () => {
  expandedFiles.value.clear()
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'summary' ? 'detailed' : 'summary'
}

const toggleFileExpansion = (fileId: string) => {
  if (expandedFiles.value.has(fileId)) {
    expandedFiles.value.delete(fileId)
  } else {
    expandedFiles.value.add(fileId)
  }
}

const formatMetricName = (key: string): string => {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

const getCoverageColor = (percentage: number): string => {
  return testMetricsUtils.getCoverageColor(percentage)
}

const getCoverageStatus = (percentage: number): string => {
  if (percentage >= 90) return 'excellent'
  if (percentage >= 80) return 'good'
  if (percentage >= 70) return 'fair'
  return 'poor'
}

const getCoverageStatusText = (percentage: number): string => {
  if (percentage >= 90) return 'Excellent'
  if (percentage >= 80) return 'Good'
  if (percentage >= 70) return 'Fair'
  return 'Needs Improvement'
}

const getFileName = (filePath: string): string => {
  return filePath.split('/').pop() || filePath
}

const getTrendIcon = (direction: 'improving' | 'declining' | 'stable'): string => {
  return testMetricsUtils.getTrendIcon(direction)
}

const formatTrendDirection = (direction: 'improving' | 'declining' | 'stable'): string => {
  switch (direction) {
    case 'improving': return 'Improving'
    case 'declining': return 'Declining'
    case 'stable': return 'Stable'
    default: return 'Unknown'
  }
}

const formatTimestamp = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}

// Watch for prop changes
watch(() => props.initialSuite, (newSuite) => {
  selectedSuite.value = newSuite
})
</script>

<style scoped>
.coverage-visualizer {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.visualizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.visualizer-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.coverage-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.suite-selector {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
}

.view-toggle {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.view-toggle:hover {
  background: var(--color-background-soft);
}

.view-toggle.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Summary View Styles */
.coverage-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.coverage-metric-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1.25rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.metric-name {
  font-weight: 600;
  color: var(--color-text);
}

.metric-percentage {
  font-size: 1.5rem;
  font-weight: 700;
}

.metric-progress {
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.metric-status {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-status.excellent {
  color: #22c55e;
}

.metric-status.good {
  color: #84cc16;
}

.metric-status.fair {
  color: #eab308;
}

.metric-status.poor {
  color: #ef4444;
}

/* Detailed View Styles */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.file-coverage-section {
  margin-bottom: 2rem;
}

.file-coverage-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-coverage-item {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: var(--color-background);
  transition: background-color 0.2s ease;
}

.file-header:hover {
  background: var(--color-background-soft);
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.file-path {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-family: monospace;
}

.file-coverage-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.coverage-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.expand-icon {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.file-details {
  padding: 1rem;
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
}

.file-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.file-metric {
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  align-items: center;
  gap: 1rem;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.metric-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.metric-value {
  font-size: 0.875rem;
  color: var(--color-text);
  text-align: right;
}

.file-test-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.test-counts {
  display: flex;
  gap: 1rem;
}

.test-count {
  font-size: 0.75rem;
  font-weight: 600;
}

.test-count.success {
  color: #22c55e;
}

.test-count.failure {
  color: #ef4444;
}

.test-count.skipped {
  color: #6b7280;
}

.last-run {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* Trend Section */
.trend-section {
  margin-bottom: 2rem;
}

.trend-chart {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
}

.trend-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.trend-direction {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.trend-direction.improving {
  color: #22c55e;
}

.trend-direction.declining {
  color: #ef4444;
}

.trend-direction.stable {
  color: #6b7280;
}

.trend-stats {
  display: flex;
  gap: 1rem;
}

.trend-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--color-text);
}

.trend-bars {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 60px;
  padding: 0.5rem 0;
}

.trend-bar {
  flex: 1;
  min-height: 2px;
  border-radius: 1px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.trend-bar:hover {
  opacity: 0.8;
}

/* Recommendations Section */
.recommendations-section {
  margin-bottom: 1rem;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid;
}

.recommendation.high {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.recommendation.medium {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.recommendation.low {
  background: #f0fdf4;
  border-left-color: #22c55e;
}

.recommendation-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.recommendation-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .visualizer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .coverage-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .coverage-summary-grid {
    grid-template-columns: 1fr;
  }
  
  .file-metric {
    grid-template-columns: 70px 1fr 60px;
    gap: 0.5rem;
  }
  
  .trend-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .file-test-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>