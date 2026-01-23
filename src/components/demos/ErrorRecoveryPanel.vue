<template>
  <div v-if="showPanel" class="error-recovery-panel" role="dialog" aria-labelledby="recovery-title" aria-modal="true">
    <div class="panel-overlay" @click="closePanel" aria-hidden="true"></div>
    
    <div class="panel-content">
      <header class="panel-header">
        <h2 id="recovery-title">Pipeline Error Recovery</h2>
        <BaseButton 
          @click="closePanel" 
          variant="ghost" 
          size="small" 
          aria-label="Close recovery panel"
          class="close-button"
        >
          ✕
        </BaseButton>
      </header>

      <div class="error-details" role="alert">
        <div class="error-icon" aria-hidden="true">⚠️</div>
        <div class="error-content">
          <h3>Pipeline Execution Failed</h3>
          <p v-if="failedStep" class="error-message">
            The <strong>{{ failedStep.name }}</strong> step failed with the following error:
          </p>
          <div v-if="failedStep?.errorMessage" class="error-text">
            {{ failedStep.errorMessage }}
          </div>
          <div v-if="execution?.errorMessage && execution.errorMessage !== failedStep?.errorMessage" class="execution-error">
            <strong>Execution Error:</strong> {{ execution.errorMessage }}
          </div>
        </div>
      </div>

      <div v-if="failedStep" class="step-context">
        <h4>Step Information</h4>
        <div class="context-grid">
          <div class="context-item">
            <span class="context-label">Step Type:</span>
            <span class="context-value">{{ failedStep.stepType.toUpperCase() }}</span>
          </div>
          <div class="context-item">
            <span class="context-label">Progress:</span>
            <span class="context-value">{{ Math.round(failedStep.progress) }}%</span>
          </div>
          <div v-if="failedStep.startTime" class="context-item">
            <span class="context-label">Started:</span>
            <span class="context-value">{{ formatTime(failedStep.startTime) }}</span>
          </div>
          <div v-if="getStepDuration(failedStep) > 0" class="context-item">
            <span class="context-label">Duration:</span>
            <span class="context-value">{{ formatDuration(getStepDuration(failedStep)) }}</span>
          </div>
        </div>
      </div>

      <div class="recovery-options">
        <h4>Recovery Options</h4>
        <p class="options-description">
          Choose how you would like to handle this error:
        </p>
        
        <div class="options-list" role="group" aria-label="Recovery options">
          <div
            v-for="option in recoveryOptions"
            :key="option.strategy"
            class="recovery-option"
            :class="{ selected: selectedStrategy === option.strategy }"
            @click="selectedStrategy = option.strategy"
            @keydown.enter="selectedStrategy = option.strategy"
            @keydown.space.prevent="selectedStrategy = option.strategy"
            tabindex="0"
            role="radio"
            :aria-checked="selectedStrategy === option.strategy"
            :aria-describedby="`option-${option.strategy}-desc`"
          >
            <div class="option-header">
              <div class="option-radio" :class="{ checked: selectedStrategy === option.strategy }" aria-hidden="true">
                <div v-if="selectedStrategy === option.strategy" class="radio-dot"></div>
              </div>
              <h5>{{ option.label }}</h5>
              <div class="risk-badge" :class="option.risk">{{ option.risk.toUpperCase() }} RISK</div>
            </div>
            <p :id="`option-${option.strategy}-desc`" class="option-description">
              {{ option.description }}
            </p>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <BaseButton
          @click="executeRecovery"
          :disabled="!selectedStrategy || isRecovering"
          variant="primary"
          size="large"
          :aria-describedby="!selectedStrategy ? 'no-strategy-help' : 'execute-recovery-help'"
        >
          <span v-if="isRecovering">Executing Recovery...</span>
          <span v-else>Execute Recovery</span>
        </BaseButton>
        
        <BaseButton
          @click="closePanel"
          variant="secondary"
          size="large"
          :disabled="isRecovering"
        >
          Cancel
        </BaseButton>
      </div>

      <!-- Help text for screen readers -->
      <div class="sr-only">
        <div id="no-strategy-help">Please select a recovery strategy before proceeding</div>
        <div id="execute-recovery-help">Execute the selected recovery strategy to handle the pipeline error</div>
      </div>

      <!-- Recovery Progress -->
      <div v-if="isRecovering" class="recovery-progress" role="status" aria-live="polite">
        <div class="progress-indicator">
          <div class="spinner" aria-hidden="true"></div>
          <span>Executing recovery strategy...</span>
        </div>
      </div>

      <!-- Recovery Result -->
      <div v-if="recoveryResult" class="recovery-result" :class="recoveryResult.success ? 'success' : 'error'" role="alert">
        <div class="result-icon" aria-hidden="true">
          {{ recoveryResult.success ? '✅' : '❌' }}
        </div>
        <div class="result-content">
          <h4>{{ recoveryResult.success ? 'Recovery Successful' : 'Recovery Failed' }}</h4>
          <p>{{ recoveryResult.message }}</p>
          <BaseButton
            v-if="recoveryResult.success"
            @click="closePanel"
            variant="primary"
            size="small"
          >
            Continue
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import type { IPipelineExecution, IPipelineStep } from '@/types'

// Props
interface Props {
  execution: IPipelineExecution | null
  show: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'recovery-executed': [strategy: string, success: boolean]
}>()

// Local state
const selectedStrategy = ref<'retry' | 'skip' | 'restart' | null>(null)
const isRecovering = ref(false)
const recoveryResult = ref<{ success: boolean; message: string } | null>(null)

// Computed properties
const showPanel = computed(() => props.show && props.execution?.status === 'failed')

const failedStep = computed(() => {
  if (!props.execution) return null
  return props.execution.steps.find(step => step.status === 'failed') || null
})

const recoveryOptions = computed(() => {
  if (!props.execution || !failedStep.value) return []

  const options = [
    {
      strategy: 'retry' as const,
      label: 'Retry Failed Step',
      description: `Retry the ${failedStep.value.name} step that failed. This will attempt to run the step again with the same input data.`,
      risk: 'low'
    },
    {
      strategy: 'restart' as const,
      label: 'Restart Entire Pipeline',
      description: 'Start the entire pipeline from the beginning. This will re-execute all steps including the ones that previously succeeded.',
      risk: 'medium'
    }
  ]

  // Only offer skip option if it's not the last step
  const stepIndex = props.execution.steps.findIndex(s => s.id === failedStep.value?.id)
  if (stepIndex < props.execution.steps.length - 1) {
    options.splice(1, 0, {
      strategy: 'skip' as const,
      label: 'Skip Failed Step',
      description: `Skip the ${failedStep.value.name} step and continue with the remaining steps. This may result in incomplete data processing.`,
      risk: 'high'
    })
  }

  return options
})

// Methods
const closePanel = () => {
  if (!isRecovering.value) {
    selectedStrategy.value = null
    recoveryResult.value = null
    emit('close')
  }
}

const executeRecovery = async () => {
  if (!selectedStrategy.value || !props.execution) return

  isRecovering.value = true
  recoveryResult.value = null

  try {
    // Simulate recovery execution
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate success/failure based on strategy
    const success = Math.random() > 0.2 // 80% success rate for demo

    recoveryResult.value = {
      success,
      message: success 
        ? getSuccessMessage(selectedStrategy.value)
        : getFailureMessage(selectedStrategy.value)
    }

    emit('recovery-executed', selectedStrategy.value, success)

    if (success) {
      // Auto-close after successful recovery
      setTimeout(() => {
        closePanel()
      }, 3000)
    }

  } catch (error) {
    recoveryResult.value = {
      success: false,
      message: `Recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    emit('recovery-executed', selectedStrategy.value, false)
  } finally {
    isRecovering.value = false
  }
}

const getSuccessMessage = (strategy: string) => {
  switch (strategy) {
    case 'retry':
      return 'The failed step has been successfully retried and completed.'
    case 'skip':
      return 'The failed step has been skipped and the pipeline continued with remaining steps.'
    case 'restart':
      return 'The pipeline has been restarted and completed successfully.'
    default:
      return 'Recovery completed successfully.'
  }
}

const getFailureMessage = (strategy: string) => {
  switch (strategy) {
    case 'retry':
      return 'The retry attempt failed. The step encountered the same error again.'
    case 'skip':
      return 'Unable to skip the step. The remaining steps depend on this step\'s output.'
    case 'restart':
      return 'The pipeline restart failed. The same error occurred during re-execution.'
    default:
      return 'Recovery attempt failed. Please try a different strategy.'
  }
}

const getStepDuration = (step: IPipelineStep) => {
  if (step.endTime && step.startTime) {
    return step.endTime.getTime() - step.startTime.getTime()
  }
  return 0
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// Watch for panel visibility changes
watch(showPanel, (isVisible) => {
  if (isVisible) {
    // Reset state when panel opens
    selectedStrategy.value = null
    recoveryResult.value = null
    isRecovering.value = false
  }
})

// Keyboard navigation for options
const handleKeyNavigation = (event: KeyboardEvent) => {
  if (!showPanel.value) return

  const options = recoveryOptions.value
  if (options.length === 0) return

  const currentIndex = selectedStrategy.value 
    ? options.findIndex(opt => opt.strategy === selectedStrategy.value)
    : -1

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      const nextIndex = (currentIndex + 1) % options.length
      selectedStrategy.value = options[nextIndex].strategy
      break
    case 'ArrowUp':
      event.preventDefault()
      const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1
      selectedStrategy.value = options[prevIndex].strategy
      break
    case 'Escape':
      event.preventDefault()
      closePanel()
      break
  }
}

// Add keyboard event listener when component mounts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeyNavigation)
}
</script>

<style scoped>
.error-recovery-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.panel-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1.5rem;
}

.panel-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-button {
  font-size: 1.2rem;
  line-height: 1;
}

.error-details {
  display: flex;
  gap: 1rem;
  padding: 0 1.5rem;
  margin-bottom: 2rem;
  background: #fdf2f2;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  padding: 1.5rem;
}

.error-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.error-content h3 {
  margin: 0 0 0.5rem 0;
  color: #721c24;
  font-size: 1.2rem;
}

.error-message {
  margin: 0 0 1rem 0;
  color: #721c24;
}

.error-text {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  color: #721c24;
  margin-bottom: 0.5rem;
}

.execution-error {
  color: #721c24;
  font-size: 0.9rem;
}

.step-context {
  padding: 0 1.5rem;
  margin-bottom: 2rem;
}

.step-context h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.context-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.context-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.context-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: bold;
}

.context-value {
  font-size: 0.9rem;
  color: #2c3e50;
}

.recovery-options {
  padding: 0 1.5rem;
  margin-bottom: 2rem;
}

.recovery-options h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.options-description {
  margin: 0 0 1.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recovery-option {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.recovery-option:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.recovery-option:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.recovery-option.selected {
  border-color: #3498db;
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.option-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.option-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #bdc3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.option-radio.checked {
  border-color: #3498db;
  background: #3498db;
}

.radio-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.option-header h5 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
  flex-grow: 1;
}

.risk-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.risk-badge.low {
  background: #d4edda;
  color: #155724;
}

.risk-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.risk-badge.high {
  background: #f8d7da;
  color: #721c24;
}

.option-description {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.recovery-progress {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #7f8c8d;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.recovery-result {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.recovery-result.success {
  background: #d4edda;
  border-top-color: #c3e6cb;
}

.recovery-result.error {
  background: #f8d7da;
  border-top-color: #f5c6cb;
}

.result-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.result-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.result-content p {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.recovery-result.success .result-content h4,
.recovery-result.success .result-content p {
  color: #155724;
}

.recovery-result.error .result-content h4,
.recovery-result.error .result-content p {
  color: #721c24;
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
  .error-recovery-panel {
    padding: 0.5rem;
  }
  
  .panel-content {
    max-height: 95vh;
  }
  
  .context-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .option-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>