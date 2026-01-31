<template>
  <div v-if="showPanel" :class="panelClasses" role="dialog" aria-labelledby="recovery-title" aria-modal="true">
    <div class="panel-overlay" @click="closePanel" aria-hidden="true"></div>
    
    <div class="panel-content">
      <header class="panel-header">
        <h2 id="recovery-title">Error Recovery</h2>
        <button 
          @click="closePanel" 
          class="close-button dismiss-button"
          aria-label="Close recovery panel"
        >
          ✕
        </button>
      </header>

      <div class="error-info" role="alert">
        <div class="error-icon" aria-hidden="true">⚠️</div>
        <div class="error-content">
          <h3>Error Occurred</h3>
          <p class="error-message">{{ error?.message }}</p>
          <div class="error-code">{{ error?.code }}</div>
          <div v-if="error?.details?.originalError" class="error-details">
            Details: {{ error.details.originalError }}
          </div>
          <div v-if="error?.details?.retryCount !== undefined" class="retry-info">
            Retry {{ error.details.retryCount }} of {{ error.details.maxRetries || 3 }} retries
          </div>
          <div class="error-timestamp">
            {{ formatTimestamp(error?.timestamp) }}
          </div>
          <div v-if="error?.severity" class="error-severity">
            {{ error.severity.charAt(0).toUpperCase() + error.severity.slice(1) }}
          </div>
        </div>
      </div>

      <div class="recovery-options">
        <h4>Recovery Options</h4>
        
        <div class="options-list" role="group" aria-label="Recovery options">
          <button
            class="recovery-option"
            data-action="retry"
            :disabled="isProcessingState || isRetryingState"
            @click="handleRetry"
          >
            Retry Step
          </button>
          
          <button
            class="recovery-option"
            data-action="skip"
            :disabled="isProcessingState || isRetryingState"
            @click="handleSkip"
          >
            Skip Step
          </button>
          
          <button
            class="recovery-option"
            data-action="abort"
            :disabled="isProcessingState || isRetryingState"
            @click="handleAbort"
          >
            Abort Pipeline
          </button>
        </div>
      </div>

      <div v-if="isProcessingState" class="processing-indicator" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <span>Processing recovery action...</span>
      </div>

      <div v-if="isRetryingState" class="retry-countdown" role="status" aria-live="polite">
        Retrying in {{ countdownValue }} seconds...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Props {
  error: {
    id: string
    message: string
    code: string
    timestamp: Date
    stepId?: string
    severity?: string
    details?: {
      originalError?: string
      retryCount?: number
      maxRetries?: number
    }
  } | null
  isVisible: boolean
  isRetrying?: boolean
  isProcessing?: boolean
  retryCountdown?: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'retry': []
  'skip': []
  'abort': []
  'recovery-action': [action: string, error: any]
  'dismiss': []
}>()

// Local state
const isRetrying = ref(props.isRetrying || false)
const retryCountdown = ref(0)
const isProcessing = ref(props.isProcessing || false)

// Watch for prop changes
watch(() => props.isRetrying, (newValue) => {
  isRetrying.value = newValue || false
})

watch(() => props.isProcessing, (newValue) => {
  isProcessing.value = newValue || false
})

// Computed properties
const showPanel = computed(() => props.isVisible && props.error)

const panelClasses = computed(() => {
  const classes = ['error-recovery-panel']
  if (props.error?.severity) {
    classes.push(props.error.severity)
  }
  return classes
})

const isRetryingState = computed(() => props.isRetrying || false)
const isProcessingState = computed(() => props.isProcessing || false)
const countdownValue = computed(() => props.retryCountdown || 0)

// Methods
const closePanel = () => {
  emit('close')
  emit('dismiss')
}

const handleRetry = () => {
  isRetrying.value = true
  isProcessing.value = true
  emit('retry')
  emit('recovery-action', 'retry', props.error)
}

const handleSkip = () => {
  isProcessing.value = true
  emit('skip')
  emit('recovery-action', 'skip', props.error)
}

const handleAbort = () => {
  isProcessing.value = true
  emit('abort')
  emit('recovery-action', 'abort', props.error)
}

const formatTimestamp = (timestamp?: Date) => {
  if (!timestamp) return ''
  // Format as HH:MM:SS to match the regex pattern
  return timestamp.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
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