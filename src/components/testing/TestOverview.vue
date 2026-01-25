<template>
  <div class="test-overview">
    <div class="overview-header">
      <h2 class="overview-title">Test Overview</h2>
      <div class="last-updated">
        Last updated: {{ formatTimestamp(overallStats.lastUpdated) }}
      </div>
    </div>

    <!-- High-level metrics cards -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">🧪</div>
        <div class="metric-content">
          <div class="metric-value">{{ overallStats.totalTests }}</div>
          <div class="metric-label">Total Tests</div>
        </div>
      </div>

      <div class="metric-card success">
        <div class="metric-icon">✅</div>
        <div class="metric-content">
          <div class="metric-value">{{ overallStats.passedTests }}</div>
          <div class="metric-label">Passed</div>
          <div class="metric-percentage">
            {{ calculateSuccessRate() }}%
          </div>
        </div>
      </div>

      <div class="metric-card failure">
        <div class="metric-icon">❌</div>
        <div class="metric-content">
          <div class="metric-value">{{ overallStats.failedTests }}</div>
          <div class="metric-label">Failed</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📊</div>
        <div class="metric-content">
          <div class="metric-value">{{ overallStats.totalSuites }}</div>
          <div class="metric-label">Test Suites</div>
        </div>
      </div>
    </div>

    <!-- Overall coverage display -->
    <div class="coverage-section">
      <h3 class="section-title">Overall Coverage</h3>
      <div class="coverage-grid">
        <div class="coverage-item">
          <div class="coverage-label">Lines</div>
          <div class="coverage-bar">
            <div 
              class="coverage-fill" 
              :style="{ 
                width: `${overallStats.overallCoverage.lines.percentage}%`,
                backgroundColor: getCoverageColor(overallStats.overallCoverage.lines.percentage)
              }"
            ></div>
          </div>
          <div class="coverage-percentage">
            {{ overallStats.overallCoverage.lines.percentage.toFixed(1) }}%
          </div>
        </div>

        <div class="coverage-item">
          <div class="coverage-label">Branches</div>
          <div class="coverage-bar">
            <div 
              class="coverage-fill" 
              :style="{ 
                width: `${overallStats.overallCoverage.branches.percentage}%`,
                backgroundColor: getCoverageColor(overallStats.overallCoverage.branches.percentage)
              }"
            ></div>
          </div>
          <div class="coverage-percentage">
            {{ overallStats.overallCoverage.branches.percentage.toFixed(1) }}%
          </div>
        </div>

        <div class="coverage-item">
          <div class="coverage-label">Functions</div>
          <div class="coverage-bar">
            <div 
              class="coverage-fill" 
              :style="{ 
                width: `${overallStats.overallCoverage.functions.percentage}%`,
                backgroundColor: getCoverageColor(overallStats.overallCoverage.functions.percentage)
              }"
            ></div>
          </div>
          <div class="coverage-percentage">
            {{ overallStats.overallCoverage.functions.percentage.toFixed(1) }}%
          </div>
        </div>

        <div class="coverage-item">
          <div class="coverage-label">Statements</div>
          <div class="coverage-bar">
            <div 
              class="coverage-fill" 
              :style="{ 
                width: `${overallStats.overallCoverage.statements.percentage}%`,
                backgroundColor: getCoverageColor(overallStats.overallCoverage.statements.percentage)
              }"
            ></div>
          </div>
          <div class="coverage-percentage">
            {{ overallStats.overallCoverage.statements.percentage.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Test suites status -->
    <div class="suites-section">
      <h3 class="section-title">Test Suites Status</h3>
      <div class="suites-grid">
        <div 
          v-for="suite in testSuites" 
          :key="suite.id"
          class="suite-card"
          :class="suite.status"
        >
          <div class="suite-header">
            <div class="suite-name">{{ suite.name }}</div>
            <div class="suite-status" :class="suite.status">
              {{ getStatusIcon(suite.status) }} {{ suite.status }}
            </div>
          </div>
          
          <div class="suite-metrics">
            <div class="suite-metric">
              <span class="metric-label">Tests:</span>
              <span class="metric-value">{{ suite.totalTests }}</span>
            </div>
            <div class="suite-metric">
              <span class="metric-label">Passed:</span>
              <span class="metric-value success">{{ suite.passedTests }}</span>
            </div>
            <div class="suite-metric">
              <span class="metric-label">Failed:</span>
              <span class="metric-value failure">{{ suite.failedTests }}</span>
            </div>
          </div>

          <div class="suite-coverage">
            <div class="coverage-summary">
              Lines: {{ suite.coverage.lines.percentage.toFixed(1) }}%
            </div>
            <div class="coverage-bar-small">
              <div 
                class="coverage-fill-small" 
                :style="{ 
                  width: `${suite.coverage.lines.percentage}%`,
                  backgroundColor: getCoverageColor(suite.coverage.lines.percentage)
                }"
              ></div>
            </div>
          </div>

          <div class="suite-last-run">
            Last run: {{ formatTimestamp(suite.lastRun) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Recent test trends -->
    <div class="trends-section" v-if="trends.length > 0">
      <h3 class="section-title">Recent Trends</h3>
      <div class="trends-grid">
        <div 
          v-for="trend in trends" 
          :key="trend.suiteId"
          class="trend-card"
        >
          <div class="trend-header">
            <div class="trend-suite">{{ getSuiteName(trend.suiteId) }}</div>
            <div class="trend-direction" :class="trend.trendDirection">
              {{ getTrendIcon(trend.trendDirection) }}
            </div>
          </div>
          
          <div class="trend-metrics">
            <div class="trend-metric">
              <span class="metric-label">Success Rate:</span>
              <span class="metric-value">{{ trend.successRate.toFixed(1) }}%</span>
            </div>
            <div class="trend-metric">
              <span class="metric-label">Avg Duration:</span>
              <span class="metric-value">{{ formatDuration(trend.averageDuration) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTestMetrics, testMetricsUtils } from '@/composables/useTestMetrics'

// Props
interface Props {
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  refreshInterval: 30000
})

// Composables
const { 
  overallStats, 
  testSuites, 
  getAllTrends,
  formatDuration,
  startAutoRefresh,
  stopAutoRefresh
} = useTestMetrics()

// Computed
const trends = computed(() => getAllTrends())

// Methods
const calculateSuccessRate = (): number => {
  const stats = overallStats.value
  if (!stats || typeof stats.totalTests !== 'number' || typeof stats.passedTests !== 'number') {
    return 0
  }
  const total = stats.totalTests
  const passed = stats.passedTests
  return total > 0 ? Math.round((passed / total) * 100) : 0
}

const getCoverageColor = (percentage: number): string => {
  return testMetricsUtils.getCoverageColor(percentage)
}

const getStatusIcon = (status: 'passing' | 'failing' | 'unknown'): string => {
  switch (status) {
    case 'passing': return '✅'
    case 'failing': return '❌'
    case 'unknown': return '❓'
    default: return '❓'
  }
}

const getTrendIcon = (direction: 'improving' | 'declining' | 'stable'): string => {
  return testMetricsUtils.getTrendIcon(direction)
}

const getSuiteName = (suiteId: string): string => {
  const suite = testSuites.value.find(s => s.id === suiteId)
  return suite ? suite.name : suiteId
}

const formatTimestamp = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}

// Auto-refresh setup
if (props.refreshInterval > 0) {
  startAutoRefresh(props.refreshInterval)
}
</script>

<style scoped>
.test-overview {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.overview-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.last-updated {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-card.success {
  border-color: #22c55e;
}

.metric-card.failure {
  border-color: #ef4444;
}

.metric-icon {
  font-size: 2rem;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.metric-percentage {
  font-size: 0.75rem;
  color: #22c55e;
  font-weight: 600;
  margin-top: 0.25rem;
}

.coverage-section, .suites-section, .trends-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.coverage-grid {
  display: grid;
  gap: 1rem;
}

.coverage-item {
  display: grid;
  grid-template-columns: 100px 1fr 80px;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--color-background-soft);
  border-radius: 6px;
}

.coverage-label {
  font-weight: 600;
  color: var(--color-text);
}

.coverage-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.coverage-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.coverage-percentage {
  text-align: right;
  font-weight: 600;
  color: var(--color-text);
}

.suites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.suite-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.suite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.suite-card.passing {
  border-left: 4px solid #22c55e;
}

.suite-card.failing {
  border-left: 4px solid #ef4444;
}

.suite-card.unknown {
  border-left: 4px solid #6b7280;
}

.suite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.suite-name {
  font-weight: 600;
  color: var(--color-text);
}

.suite-status {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.suite-status.passing {
  background: #dcfce7;
  color: #166534;
}

.suite-status.failing {
  background: #fef2f2;
  color: #991b1b;
}

.suite-status.unknown {
  background: #f3f4f6;
  color: #374151;
}

.suite-metrics {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.suite-metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.suite-metric .metric-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.suite-metric .metric-value {
  font-weight: 600;
  color: var(--color-text);
}

.suite-metric .metric-value.success {
  color: #22c55e;
}

.suite-metric .metric-value.failure {
  color: #ef4444;
}

.suite-coverage {
  margin-bottom: 1rem;
}

.coverage-summary {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.coverage-bar-small {
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.coverage-fill-small {
  height: 100%;
  transition: width 0.3s ease;
}

.suite-last-run {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.trends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.trend-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.trend-suite {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.875rem;
}

.trend-direction {
  font-size: 1.25rem;
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

.trend-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trend-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-metric .metric-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.trend-metric .metric-value {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .test-overview {
    padding: 1rem;
  }
  
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .coverage-item {
    grid-template-columns: 80px 1fr 60px;
    gap: 0.5rem;
  }
  
  .suite-metrics {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>