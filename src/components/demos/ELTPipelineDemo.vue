<template>
  <div class="elt-pipeline-demo" role="main" aria-labelledby="demo-title">
    <header class="demo-header">
      <h1 id="demo-title">ELT Pipeline Visualization</h1>
      <p class="demo-description">
        Interactive demonstration of Extract, Load, Transform data processing with real-time visualization
      </p>
    </header>

    <!-- Dataset Selection -->
    <section class="dataset-selection" aria-labelledby="dataset-title">
      <h2 id="dataset-title">Select Dataset</h2>
      <div class="dataset-grid" role="group" aria-label="Available datasets">
        <div
          v-for="dataset in sampleDatasets"
          :key="dataset.id"
          class="dataset-card"
          :class="{ selected: selectedDataset?.id === dataset.id }"
          @click="selectDataset(dataset)"
          @keydown.enter="selectDataset(dataset)"
          @keydown.space.prevent="selectDataset(dataset)"
          tabindex="0"
          role="button"
          :aria-pressed="selectedDataset?.id === dataset.id"
          :aria-describedby="`dataset-${dataset.id}-desc`"
        >
          <h3>{{ dataset.name }}</h3>
          <p :id="`dataset-${dataset.id}-desc`">{{ dataset.description }}</p>
          <div class="dataset-meta">
            <span class="format-badge">{{ dataset.format.toUpperCase() }}</span>
            <span class="size-info">{{ dataset.sampleData?.length || 0 }} records</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Pipeline Controls -->
    <section class="pipeline-controls" aria-labelledby="controls-title">
      <h2 id="controls-title">Pipeline Controls</h2>
      <div class="control-buttons" role="group" aria-label="Pipeline execution controls">
        <BaseButton
          @click="executePipeline"
          :disabled="!selectedDataset || isExecuting"
          variant="primary"
          size="large"
          :aria-describedby="!selectedDataset ? 'no-dataset-help' : 'execute-help'"
        >
          <span v-if="isExecuting">Executing...</span>
          <span v-else>Execute Pipeline</span>
        </BaseButton>
        
        <BaseButton
          v-if="isExecuting"
          @click="cancelExecution"
          variant="secondary"
          size="large"
          aria-describedby="cancel-help"
        >
          Cancel
        </BaseButton>
        
        <BaseButton
          v-if="lastExecution?.status === 'failed'"
          @click="retryExecution"
          variant="secondary"
          size="large"
          aria-describedby="retry-help"
        >
          Retry
        </BaseButton>
      </div>
      
      <!-- Help text for screen readers -->
      <div class="sr-only">
        <div id="no-dataset-help">Please select a dataset before executing the pipeline</div>
        <div id="execute-help">Start the ELT pipeline processing with the selected dataset</div>
        <div id="cancel-help">Cancel the currently running pipeline execution</div>
        <div id="retry-help">Retry the failed pipeline execution</div>
      </div>
    </section>

    <!-- Pipeline Visualization -->
    <section class="pipeline-visualization" aria-labelledby="viz-title">
      <h2 id="viz-title">Pipeline Visualization</h2>
      
      <!-- Execution Summary -->
      <div v-if="executionSummary" class="execution-summary" role="status" aria-live="polite">
        <div class="summary-header">
          <h3>Execution Status</h3>
          <div class="status-badge" :class="executionSummary.status">
            {{ executionSummary.status.toUpperCase() }}
          </div>
        </div>
        
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-label">Progress</span>
            <span class="stat-value">{{ Math.round(executionSummary.progress) }}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">Steps</span>
            <span class="stat-value">{{ executionSummary.completedSteps }}/{{ executionSummary.totalSteps }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Records</span>
            <span class="stat-value">{{ executionSummary.inputRecords }} → {{ executionSummary.outputRecords }}</span>
          </div>
          <div v-if="executionSummary.duration > 0" class="stat">
            <span class="stat-label">Duration</span>
            <span class="stat-value">{{ formatDuration(executionSummary.duration) }}</span>
          </div>
        </div>
      </div>

      <!-- Pipeline Visualizer Component -->
      <PipelineVisualizer
        v-if="currentExecution"
        :execution="currentExecution"
        :selected-step="selectedStep"
        :is-executing="isExecuting"
        @step-clicked="handleStepClick"
      />
      
      <!-- Placeholder when no execution -->
      <div v-else class="no-execution-placeholder" role="status">
        <p>Select a dataset and click "Execute Pipeline" to see the visualization</p>
      </div>
    </section>

    <!-- Data Display -->
    <section v-if="currentExecution" class="data-display" aria-labelledby="data-title">
      <h2 id="data-title">Data Flow</h2>
      
      <div class="data-tabs" role="tablist" aria-label="Data flow stages">
        <button
          v-for="(tab, index) in dataTabs"
          :key="tab.id"
          :id="`tab-${tab.id}`"
          class="data-tab"
          :class="{ active: activeTab === tab.id }"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`panel-${tab.id}`"
          :tabindex="activeTab === tab.id ? 0 : -1"
          @click="activeTab = tab.id"
          @keydown.arrow-right.prevent="navigateTab(1)"
          @keydown.arrow-left.prevent="navigateTab(-1)"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="tab-count">({{ tab.count }})</span>
        </button>
      </div>
      
      <div
        v-for="tab in dataTabs"
        :key="`panel-${tab.id}`"
        :id="`panel-${tab.id}`"
        class="data-panel"
        :class="{ active: activeTab === tab.id }"
        role="tabpanel"
        :aria-labelledby="`tab-${tab.id}`"
        :hidden="activeTab !== tab.id"
      >
        <div v-if="tab.data" class="data-content">
          <pre class="data-json" :aria-label="`${tab.label} data`">{{ formatJSON(tab.data) }}</pre>
        </div>
        <div v-else class="no-data" role="status">
          <p>{{ tab.emptyMessage || 'No data available' }}</p>
        </div>
      </div>
    </section>

    <!-- Error Recovery Panel -->
    <ErrorRecoveryPanel
      :error="currentExecutionError"
      :is-visible="showErrorRecovery"
      @close="showErrorRecovery = false"
      @recovery-action="handleRecoveryAction"
    />

    <!-- Error Display -->
    <div v-if="error && !showErrorRecovery" class="error-display" role="alert" aria-live="assertive">
      <h3>Pipeline Error</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <BaseButton @click="showErrorRecovery = true" variant="primary" size="small">
          Show Recovery Options
        </BaseButton>
        <BaseButton @click="clearError" variant="secondary" size="small">
          Dismiss
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useELTPipeline } from '@/composables/useELTPipeline'
import PipelineVisualizer from './PipelineVisualizer.vue'
import ErrorRecoveryPanel from './ErrorRecoveryPanel.vue'
import BaseButton from '../common/BaseButton.vue'
import type { IDataset, IPipelineStep } from '@/types'

// Composables
const {
  sampleDatasets,
  selectedDataset,
  currentExecution,
  isExecuting,
  executionSummary,
  lastExecution,
  error,
  selectDataset,
  executePipeline: executeELTPipeline,
  cancelExecution,
  retryExecution,
  initialize,
  cleanup
} = useELTPipeline()

// Local state
const activeTab = ref('input')
const selectedStep = ref<IPipelineStep | null>(null)
const showErrorRecovery = ref(false)

// Computed properties
const dataTabs = computed(() => {
  if (!currentExecution.value) return []

  const execution = currentExecution.value
  const tabs = [
    {
      id: 'input',
      label: 'Input Data',
      data: execution.inputDataset.sampleData,
      count: execution.inputDataset.sampleData?.length,
      emptyMessage: 'No input data available'
    }
  ]

  // Add step data tabs
  execution.steps.forEach((step, index) => {
    if (step.outputData) {
      tabs.push({
        id: `step-${index}`,
        label: `${step.name} Output`,
        data: step.outputData,
        count: step.outputData.data?.length,
        emptyMessage: `No output data from ${step.name}`
      })
    }
  })

  return tabs
})

const currentExecutionError = computed(() => {
  if (!currentExecution.value || currentExecution.value.status !== 'failed') {
    return null
  }

  const failedStep = currentExecution.value.steps.find(step => step.status === 'failed')
  
  return {
    id: `error-${currentExecution.value.id}`,
    message: currentExecution.value.errorMessage || failedStep?.errorMessage || 'Pipeline execution failed',
    code: 'PIPELINE_EXECUTION_ERROR',
    timestamp: currentExecution.value.endTime || new Date(),
    stepId: failedStep?.id,
    severity: 'error',
    details: {
      originalError: failedStep?.errorMessage,
      retryCount: 0,
      maxRetries: 3
    }
  }
})

// Methods
const executePipeline = async () => {
  if (!selectedDataset.value) return
  
  try {
    await executeELTPipeline()
  } catch (err) {
    console.error('Failed to execute pipeline:', err)
  }
}

const handleStepClick = (step: IPipelineStep) => {
  selectedStep.value = step
  
  // Switch to the appropriate data tab
  const stepIndex = currentExecution?.steps.findIndex(s => s.id === step.id)
  if (stepIndex !== undefined && stepIndex >= 0) {
    activeTab.value = `step-${stepIndex}`
  }
}

const navigateTab = (direction: number) => {
  const tabs = dataTabs.value
  const currentIndex = tabs.findIndex(tab => tab.id === activeTab.value)
  const newIndex = (currentIndex + direction + tabs.length) % tabs.length
  activeTab.value = tabs[newIndex].id
}

const formatJSON = (data: any) => {
  return JSON.stringify(data, null, 2)
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const clearError = () => {
  // Clear error from store if needed
  console.log('Clearing error')
}

const handleRecoveryAction = (action: string, error: any) => {
  console.log(`Recovery action ${action} executed for error:`, error)
  
  switch (action) {
    case 'retry':
      retryExecution()
      break
    case 'skip':
      // Handle skip logic if needed
      break
    case 'abort':
      cancelExecution()
      break
  }
  
  showErrorRecovery.value = false
}

// Watch for execution status changes to show error recovery
watch(
  () => currentExecution.value?.status,
  (newStatus) => {
    if (newStatus === 'failed') {
      // Auto-show error recovery panel after a brief delay
      setTimeout(() => {
        showErrorRecovery.value = true
      }, 1000)
    } else if (newStatus === 'completed') {
      showErrorRecovery.value = false
    }
  }
)

// Lifecycle
onMounted(async () => {
  try {
    await initialize()
  } catch (err) {
    console.error('Failed to initialize ELT pipeline demo:', err)
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.elt-pipeline-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}

/* Dataset Selection */
.dataset-selection {
  margin-bottom: 3rem;
}

.dataset-selection h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.dataset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.dataset-card {
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.dataset-card:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.dataset-card:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.dataset-card.selected {
  border-color: #3498db;
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.dataset-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.dataset-card p {
  margin: 0 0 1rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.dataset-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.format-badge {
  background: #3498db;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
}

.size-info {
  color: #7f8c8d;
  font-size: 0.8rem;
}

/* Pipeline Controls */
.pipeline-controls {
  margin-bottom: 3rem;
  text-align: center;
}

.pipeline-controls h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.control-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Pipeline Visualization */
.pipeline-visualization {
  margin-bottom: 3rem;
}

.pipeline-visualization h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.execution-summary {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.running {
  background: #f39c12;
  color: white;
}

.status-badge.completed {
  background: #27ae60;
  color: white;
}

.status-badge.failed {
  background: #e74c3c;
  color: white;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.2rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

.no-execution-placeholder {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
}

/* Data Display */
.data-display {
  margin-bottom: 3rem;
}

.data-display h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.data-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.data-tab {
  padding: 0.8rem 1.2rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: #7f8c8d;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.data-tab:hover {
  color: #2c3e50;
  background: #f8f9fa;
}

.data-tab.active {
  color: #3498db;
  border-bottom-color: #3498db;
  background: #f8f9fa;
}

.data-tab:focus {
  outline: 2px solid #3498db;
  outline-offset: -2px;
}

.tab-count {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.7;
}

.data-panel {
  display: none;
}

.data-panel.active {
  display: block;
}

.data-content {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.data-json {
  margin: 0;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.4;
  overflow-x: auto;
  background: #f8f9fa;
  color: #2c3e50;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
}

/* Error Display */
.error-display {
  background: #fdf2f2;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 2rem;
}

.error-display h3 {
  margin: 0 0 0.5rem 0;
  color: #721c24;
}

.error-display p {
  margin: 0 0 1rem 0;
  color: #721c24;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

/* Responsive Design */
@media (max-width: 768px) {
  .elt-pipeline-demo {
    padding: 1rem;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .dataset-grid {
    grid-template-columns: 1fr;
  }
  
  .control-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .data-tabs {
    flex-wrap: wrap;
  }
}
</style>