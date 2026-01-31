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

    <!-- Test categorization summary -->
    <div class="categorization-section">
      <h3 class="section-title">Test Organization</h3>
      
      <!-- Test Types -->
      <div class="category-group">
        <h4 class="category-title">By Test Type</h4>
        <div class="category-grid">
          <div class="category-card" v-for="(data, type) in testTypesSummary" :key="type">
            <div class="category-icon">{{ getTestTypeIcon(type) }}</div>
            <div class="category-content">
              <div class="category-name">{{ formatTestType(type) }}</div>
              <div class="category-stats">
                <span class="stat-item">{{ data.suites }} suites</span>
                <span class="stat-item">{{ data.tests }} tests</span>
                <span class="stat-item">{{ data.coverage.toFixed(1) }}% coverage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test Categories -->
      <div class="category-group">
        <h4 class="category-title">By Application Category</h4>
        <div class="category-grid">
          <div class="category-card" v-for="(data, category) in testCategoriesSummary" :key="category">
            <div class="category-icon">{{ getCategoryIcon(category) }}</div>
            <div class="category-content">
              <div class="category-name">{{ formatCategory(category) }}</div>
              <div class="category-stats">
                <span class="stat-item">{{ data.suites }} suites</span>
                <span class="stat-item">{{ data.tests }} tests</span>
                <span class="stat-item">{{ data.coverage.toFixed(1) }}% coverage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Public Access Notice -->
      <div class="public-access-notice">
        <div class="notice-icon">🌐</div>
        <div class="notice-content">
          <div class="notice-title">Public Test Access</div>
          <div class="notice-description">
            All test results, coverage metrics, and execution history are publicly accessible without authentication.
            This demonstrates transparency in code quality and testing practices.
          </div>
          <div class="access-details">
            <div class="access-detail">
              <span class="detail-label">Access Level:</span>
              <span class="detail-value">Full Access</span>
            </div>
            <div class="access-detail">
              <span class="detail-label">Public Suites:</span>
              <span class="detail-value">{{ testSuites.filter(s => s.isPublic).length }} / {{ testSuites.length }}</span>
            </div>
            <div class="access-detail">
              <span class="detail-label">Real-time Updates:</span>
              <span class="detail-value">Enabled</span>
            </div>
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

const testTypesSummary = computed(() => {
  const summary: Record<string, { suites: number; tests: number; coverage: number }> = {}
  
  testSuites.value.forEach(suite => {
    const type = suite.testType || 'unit'
    if (!summary[type]) {
      summary[type] = { suites: 0, tests: 0, coverage: 0 }
    }
    summary[type].suites++
    summary[type].tests += suite.totalTests
    summary[type].coverage += suite.coverage.lines.percentage
  })
  
  // Calculate average coverage for each type
  Object.keys(summary).forEach(type => {
    const typeData = summary[type]
    typeData.coverage = typeData.suites > 0 ? typeData.coverage / typeData.suites : 0
  })
  
  return summary
})

const testCategoriesSummary = computed(() => {
  const summary: Record<string, { suites: number; tests: number; coverage: number }> = {}
  
  testSuites.value.forEach(suite => {
    const category = suite.category || 'utilities'
    if (!summary[category]) {
      summary[category] = { suites: 0, tests: 0, coverage: 0 }
    }
    summary[category].suites++
    summary[category].tests += suite.totalTests
    summary[category].coverage += suite.coverage.lines.percentage
  })
  
  // Calculate average coverage for each category
  Object.keys(summary).forEach(category => {
    const categoryData = summary[category]
    categoryData.coverage = categoryData.suites > 0 ? categoryData.coverage / categoryData.suites : 0
  })
  
  return summary
})

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

const getTestTypeIcon = (type: string): string => {
  switch (type) {
    case 'unit': return '🔬'
    case 'integration': return '🔗'
    case 'property': return '⚖️'
    case 'e2e': return '🎭'
    default: return '🧪'
  }
}

const formatTestType = (type: string): string => {
  switch (type) {
    case 'unit': return 'Unit Tests'
    case 'integration': return 'Integration Tests'
    case 'property': return 'Property-Based Tests'
    case 'e2e': return 'End-to-End Tests'
    default: return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'demo-application': return '🎨'
    case 'core-feature': return '🏠'
    case 'backend': return '⚙️'
    case 'quality-assurance': return '✅'
    case 'utilities': return '🛠️'
    case 'end-to-end': return '🎭'
    default: return '📦'
  }
}

const formatCategory = (category: string): string => {
  switch (category) {
    case 'demo-application': return 'Demo Applications'
    case 'core-feature': return 'Core Features'
    case 'backend': return 'Backend Services'
    case 'quality-assurance': return 'Quality Assurance'
    case 'utilities': return 'Utilities'
    case 'end-to-end': return 'End-to-End'
    default: return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
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

.coverage-section, .suites-section, .trends-section, .categorization-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.category-group {
  margin-bottom: 2rem;
}

.category-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.category-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.category-content {
  flex: 1;
}

.category-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.category-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.stat-item {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  background: var(--color-background);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.public-access-notice {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 1.5rem;
}

.notice-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 0.5rem;
}

.notice-description {
  color: #075985;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.access-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.access-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detail-label {
  color: #0c4a6e;
  font-weight: 600;
}

.detail-value {
  color: #075985;
  background: rgba(14, 165, 233, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-weight: 500;
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
  
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .category-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .public-access-notice {
    flex-direction: column;
    text-align: center;
  }
}
</style>