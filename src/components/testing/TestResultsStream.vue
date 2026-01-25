<template>
  <div class="test-results-stream">
    <div class="stream-header">
      <h3 class="stream-title">Test Results Stream</h3>
      <div class="stream-controls">
        <div class="filter-controls">
          <select v-model="statusFilter" class="status-filter">
            <option value="all">All Status</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
            <option value="skip">Skipped</option>
          </select>
          
          <select v-model="suiteFilter" class="suite-filter">
            <option value="all">All Suites</option>
            <option 
              v-for="suite in testSuites" 
              :key="suite.id" 
              :value="suite.id"
            >
              {{ suite.name }}
            </option>
          </select>
          
          <select v-model="typeFilter" class="type-filter">
            <option value="all">All Types</option>
            <option value="unit">Unit</option>
            <option value="integration">Integration</option>
            <option value="e2e">E2E</option>
            <option value="property">Property</option>
          </select>
        </div>
        
        <div class="action-controls">
          <button 
            class="auto-refresh-toggle"
            :class="{ active: autoRefresh }"
            @click="toggleAutoRefresh"
            :title="autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'"
          >
            {{ autoRefresh ? '⏸️' : '▶️' }} Auto
          </button>
          
          <button 
            class="clear-results"
            @click="clearResults"
            title="Clear all results"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Real-time status indicator -->
    <div class="status-indicator" :class="{ active: isRunningTests }">
      <div class="status-dot"></div>
      <span class="status-text">
        {{ isRunningTests ? 'Tests Running...' : 'Idle' }}
      </span>
      <div v-if="isRunningTests" class="running-suite">
        Running: {{ currentTestRun || 'All Suites' }}
      </div>
    </div>

    <!-- Results summary -->
    <div class="results-summary">
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-value">{{ filteredResults.length }}</span>
          <span class="stat-label">Results</span>
        </div>
        <div class="stat-item success">
          <span class="stat-value">{{ passedCount }}</span>
          <span class="stat-label">Passed</span>
        </div>
        <div class="stat-item failure">
          <span class="stat-value">{{ failedCount }}</span>
          <span class="stat-label">Failed</span>
        </div>
        <div class="stat-item skipped">
          <span class="stat-value">{{ skippedCount }}</span>
          <span class="stat-label">Skipped</span>
        </div>
      </div>
      
      <div class="summary-actions">
        <button 
          class="run-tests-btn"
          :disabled="isRunningTests"
          @click="runAllTests"
        >
          {{ isRunningTests ? '⏳ Running...' : '▶️ Run Tests' }}
        </button>
      </div>
    </div>

    <!-- Test results list -->
    <div class="results-container">
      <div v-if="filteredResults.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">No test results</div>
        <div class="empty-description">
          {{ getEmptyStateMessage() }}
        </div>
      </div>
      
      <div v-else class="results-list">
        <div 
          v-for="result in paginatedResults" 
          :key="result.id"
          class="result-item"
          :class="[result.status, { expanded: expandedResults.has(result.id) }]"
        >
          <div class="result-header" @click="toggleResultExpansion(result.id)">
            <div class="result-status">
              <div class="status-icon" :class="result.status">
                {{ getStatusIcon(result.status) }}
              </div>
            </div>
            
            <div class="result-info">
              <div class="result-name">{{ result.testName }}</div>
              <div class="result-meta">
                <span class="result-suite">{{ result.suite }}</span>
                <span class="result-type">{{ result.testType }}</span>
                <span class="result-duration">{{ formatDuration(result.duration) }}</span>
                <span class="result-timestamp">{{ formatTimestamp(result.timestamp) }}</span>
              </div>
            </div>
            
            <div class="result-actions">
              <div class="expand-toggle">
                {{ expandedResults.has(result.id) ? '▼' : '▶' }}
              </div>
            </div>
          </div>
          
          <div v-if="expandedResults.has(result.id)" class="result-details">
            <!-- Coverage information -->
            <div class="detail-section">
              <h5 class="detail-title">Coverage</h5>
              <div class="coverage-details">
                <div class="coverage-metric">
                  <span class="metric-name">Lines:</span>
                  <div class="metric-bar">
                    <div 
                      class="metric-fill" 
                      :style="{ 
                        width: `${result.coverage.lines.percentage}%`,
                        backgroundColor: getCoverageColor(result.coverage.lines.percentage)
                      }"
                    ></div>
                  </div>
                  <span class="metric-percentage">{{ result.coverage.lines.percentage.toFixed(1) }}%</span>
                </div>
                
                <div class="coverage-metric">
                  <span class="metric-name">Branches:</span>
                  <div class="metric-bar">
                    <div 
                      class="metric-fill" 
                      :style="{ 
                        width: `${result.coverage.branches.percentage}%`,
                        backgroundColor: getCoverageColor(result.coverage.branches.percentage)
                      }"
                    ></div>
                  </div>
                  <span class="metric-percentage">{{ result.coverage.branches.percentage.toFixed(1) }}%</span>
                </div>
                
                <div class="coverage-metric">
                  <span class="metric-name">Functions:</span>
                  <div class="metric-bar">
                    <div 
                      class="metric-fill" 
                      :style="{ 
                        width: `${result.coverage.functions.percentage}%`,
                        backgroundColor: getCoverageColor(result.coverage.functions.percentage)
                      }"
                    ></div>
                  </div>
                  <span class="metric-percentage">{{ result.coverage.functions.percentage.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
            
            <!-- Error details for failed tests -->
            <div v-if="result.status === 'fail' && (result.errorDetails || result.stackTrace)" class="detail-section">
              <h5 class="detail-title">Error Details</h5>
              <div class="error-details">
                <div v-if="result.errorDetails" class="error-message">
                  <strong>Error:</strong>
                  <pre class="error-text">{{ result.errorDetails }}</pre>
                </div>
                
                <div v-if="result.stackTrace" class="stack-trace">
                  <strong>Stack Trace:</strong>
                  <pre class="stack-text">{{ result.stackTrace }}</pre>
                </div>
              </div>
            </div>
            
            <!-- Test metadata -->
            <div class="detail-section">
              <h5 class="detail-title">Test Information</h5>
              <div class="test-metadata">
                <div class="metadata-item">
                  <span class="metadata-label">Test ID:</span>
                  <span class="metadata-value">{{ result.id }}</span>
                </div>
                <div class="metadata-item">
                  <span class="metadata-label">Duration:</span>
                  <span class="metadata-value">{{ formatDuration(result.duration) }}</span>
                </div>
                <div class="metadata-item">
                  <span class="metadata-label">Timestamp:</span>
                  <span class="metadata-value">{{ result.timestamp.toLocaleString() }}</span>
                </div>
                <div class="metadata-item">
                  <span class="metadata-label">Type:</span>
                  <span class="metadata-value">{{ result.testType }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ← Previous
        </button>
        
        <div class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
          ({{ filteredResults.length }} results)
        </div>
        
        <button 
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTestMetrics, testMetricsUtils } from '@/composables/useTestMetrics'
import type { ITestResult } from '@/types'

// Props
interface Props {
  maxResults?: number
  pageSize?: number
  autoRefreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxResults: 1000,
  pageSize: 20,
  autoRefreshInterval: 5000
})

// Composables
const { 
  testSuites, 
  recentResults, 
  isRunningTests, 
  currentTestRun,
  runTests,
  formatDuration,
  loadTestMetrics
} = useTestMetrics()

// Reactive state
const statusFilter = ref<'all' | 'pass' | 'fail' | 'skip'>('all')
const suiteFilter = ref<string>('all')
const typeFilter = ref<'all' | 'unit' | 'integration' | 'e2e' | 'property'>('all')
const autoRefresh = ref(false)
const expandedResults = ref(new Set<string>())
const currentPage = ref(1)
const refreshInterval = ref<number | null>(null)

// Computed properties
const filteredResults = computed((): ITestResult[] => {
  const results = recentResults.value
  if (!Array.isArray(results)) {
    return []
  }
  
  let filteredList = [...results]
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    filteredList = filteredList.filter(result => result.status === statusFilter.value)
  }
  
  // Apply suite filter
  if (suiteFilter.value !== 'all') {
    filteredList = filteredList.filter(result => {
      const suite = testSuites.value.find(s => s.id === suiteFilter.value)
      return suite ? result.suite === suite.name : false
    })
  }
  
  // Apply type filter
  if (typeFilter.value !== 'all') {
    filteredList = filteredList.filter(result => result.testType === typeFilter.value)
  }
  
  // Sort by timestamp (newest first)
  filteredList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  
  // Limit results
  return filteredList.slice(0, props.maxResults)
})

const paginatedResults = computed((): ITestResult[] => {
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredResults.value.slice(start, end)
})

const totalPages = computed((): number => {
  return Math.ceil(filteredResults.value.length / props.pageSize)
})

const passedCount = computed((): number => {
  return filteredResults.value.filter(r => r.status === 'pass').length
})

const failedCount = computed((): number => {
  return filteredResults.value.filter(r => r.status === 'fail').length
})

const skippedCount = computed((): number => {
  return filteredResults.value.filter(r => r.status === 'skip').length
})

// Methods
const toggleResultExpansion = (resultId: string) => {
  if (expandedResults.value.has(resultId)) {
    expandedResults.value.delete(resultId)
  } else {
    expandedResults.value.add(resultId)
  }
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  
  refreshInterval.value = window.setInterval(() => {
    if (!isRunningTests.value) {
      loadTestMetrics()
    }
  }, props.autoRefreshInterval)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const clearResults = () => {
  // This would typically clear the results from storage
  // For now, we'll just collapse all expanded results
  expandedResults.value.clear()
  currentPage.value = 1
}

const runAllTests = async () => {
  try {
    await runTests()
  } catch (error) {
    console.error('Failed to run tests:', error)
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    expandedResults.value.clear() // Collapse expanded results when changing pages
  }
}

const getStatusIcon = (status: 'pass' | 'fail' | 'skip'): string => {
  switch (status) {
    case 'pass': return '✅'
    case 'fail': return '❌'
    case 'skip': return '⏭️'
    default: return '❓'
  }
}

const getCoverageColor = (percentage: number): string => {
  return testMetricsUtils.getCoverageColor(percentage)
}

const formatTimestamp = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}

const getEmptyStateMessage = (): string => {
  if (statusFilter.value !== 'all' || suiteFilter.value !== 'all' || typeFilter.value !== 'all') {
    return 'No results match the current filters. Try adjusting your filter criteria.'
  }
  return 'No test results available. Run some tests to see results here.'
}

// Lifecycle hooks
onMounted(() => {
  loadTestMetrics()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.test-results-stream {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.stream-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.stream-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
}

.status-filter, .suite-filter, .type-filter {
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
  min-width: 100px;
}

.action-controls {
  display: flex;
  gap: 0.5rem;
}

.auto-refresh-toggle, .clear-results {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.auto-refresh-toggle:hover, .clear-results:hover {
  background: var(--color-background-soft);
}

.auto-refresh-toggle.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  margin-bottom: 1rem;
}

.status-indicator.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
  transition: background-color 0.2s ease;
}

.status-indicator.active .status-dot {
  background: var(--color-primary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-weight: 500;
  color: var(--color-text);
}

.running-suite {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.results-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  margin-bottom: 1rem;
}

.summary-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.stat-item.success .stat-value {
  color: #22c55e;
}

.stat-item.failure .stat-value {
  color: #ef4444;
}

.stat-item.skipped .stat-value {
  color: #6b7280;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.run-tests-btn {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.run-tests-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.run-tests-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.results-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  flex: 1;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.empty-description {
  color: var(--color-text-secondary);
  max-width: 400px;
}

.results-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-item.pass {
  border-left: 4px solid #22c55e;
}

.result-item.fail {
  border-left: 4px solid #ef4444;
}

.result-item.skip {
  border-left: 4px solid #6b7280;
}

.result-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: var(--color-background);
  transition: background-color 0.2s ease;
}

.result-header:hover {
  background: var(--color-background-soft);
}

.result-status {
  margin-right: 1rem;
}

.status-icon {
  font-size: 1.25rem;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.result-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.result-suite {
  font-weight: 500;
}

.result-type {
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background: var(--color-background-soft);
  border-radius: 3px;
}

.result-actions {
  margin-left: 1rem;
}

.expand-toggle {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.result-details {
  padding: 1rem;
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

.coverage-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coverage-metric {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 1rem;
}

.metric-name {
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

.metric-percentage {
  font-size: 0.875rem;
  color: var(--color-text);
  text-align: right;
}

.error-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-message, .stack-trace {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-text, .stack-text {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 0.75rem;
  font-family: monospace;
  font-size: 0.875rem;
  color: #991b1b;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.test-metadata {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
}

.metadata-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.metadata-value {
  font-size: 0.875rem;
  color: var(--color-text);
  font-family: monospace;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  margin-top: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-background-soft);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .stream-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stream-controls {
    align-items: stretch;
  }
  
  .filter-controls {
    flex-wrap: wrap;
  }
  
  .results-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .summary-stats {
    justify-content: space-around;
    width: 100%;
  }
  
  .result-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .coverage-metric {
    grid-template-columns: 70px 1fr 50px;
    gap: 0.5rem;
  }
  
  .test-metadata {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>