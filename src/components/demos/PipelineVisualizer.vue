<template>
  <div class="pipeline-visualizer" role="img" :aria-label="ariaLabel">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      viewBox="0 0 800 300"
      class="pipeline-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Background -->
      <rect width="800" height="300" fill="#f8f9fa" rx="8" />
      
      <!-- Pipeline Steps -->
      <g v-for="(step, index) in steps" :key="step.id" class="step-group">
        <!-- Step Container -->
        <rect
          :x="stepPositions[index].x"
          :y="stepPositions[index].y"
          :width="stepWidth"
          :height="stepHeight"
          :fill="getStepColor(step)"
          :stroke="getStepBorderColor(step)"
          :stroke-width="step.status === 'running' ? 3 : 2"
          rx="8"
          class="step-rect"
          :class="step.status"
          @click="handleStepClick(step)"
          @keydown.enter="handleStepClick(step)"
          @keydown.space.prevent="handleStepClick(step)"
          tabindex="0"
          role="button"
          :aria-label="getStepAriaLabel(step)"
          :aria-describedby="`step-${step.id}-desc`"
        />
        
        <!-- Step Icon -->
        <g :transform="`translate(${stepPositions[index].x + 20}, ${stepPositions[index].y + 20})`">
          <circle
            r="15"
            :fill="getIconColor(step)"
            stroke="white"
            stroke-width="2"
          />
          <text
            x="0"
            y="5"
            text-anchor="middle"
            fill="white"
            font-size="12"
            font-weight="bold"
          >
            {{ getStepIcon(step) }}
          </text>
        </g>
        
        <!-- Step Name -->
        <text
          :x="stepPositions[index].x + stepWidth / 2"
          :y="stepPositions[index].y + 65"
          text-anchor="middle"
          fill="#2c3e50"
          font-size="14"
          font-weight="bold"
        >
          {{ step.name }}
        </text>
        
        <!-- Progress Bar -->
        <g v-if="step.status === 'running' || step.status === 'completed'">
          <rect
            :x="stepPositions[index].x + 10"
            :y="stepPositions[index].y + stepHeight - 20"
            :width="stepWidth - 20"
            height="8"
            fill="#e0e0e0"
            rx="4"
          />
          <rect
            :x="stepPositions[index].x + 10"
            :y="stepPositions[index].y + stepHeight - 20"
            :width="((stepWidth - 20) * step.progress) / 100"
            height="8"
            :fill="getProgressColor(step)"
            rx="4"
            class="progress-fill"
          />
          <text
            :x="stepPositions[index].x + stepWidth / 2"
            :y="stepPositions[index].y + stepHeight - 8"
            text-anchor="middle"
            fill="#2c3e50"
            font-size="10"
          >
            {{ Math.round(step.progress) }}%
          </text>
        </g>
        
        <!-- Status Indicator -->
        <g :transform="`translate(${stepPositions[index].x + stepWidth - 25}, ${stepPositions[index].y + 15})`">
          <circle
            r="8"
            :fill="getStatusColor(step)"
            :stroke="getStatusBorderColor(step)"
            stroke-width="2"
          />
          <text
            v-if="step.status === 'completed'"
            x="0"
            y="3"
            text-anchor="middle"
            fill="white"
            font-size="10"
            font-weight="bold"
          >
            ✓
          </text>
          <text
            v-else-if="step.status === 'failed'"
            x="0"
            y="3"
            text-anchor="middle"
            fill="white"
            font-size="10"
            font-weight="bold"
          >
            ✗
          </text>
          <circle
            v-else-if="step.status === 'running'"
            r="4"
            fill="white"
            class="running-indicator"
          />
        </g>
        
        <!-- Connection Arrow -->
        <g v-if="index < steps.length - 1" class="connection-arrow">
          <defs>
            <marker
              :id="`arrowhead-${index}`"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                :fill="getArrowColor(step, steps[index + 1])"
              />
            </marker>
          </defs>
          <line
            :x1="stepPositions[index].x + stepWidth"
            :y1="stepPositions[index].y + stepHeight / 2"
            :x2="stepPositions[index + 1].x"
            :y2="stepPositions[index + 1].y + stepHeight / 2"
            :stroke="getArrowColor(step, steps[index + 1])"
            stroke-width="3"
            :marker-end="`url(#arrowhead-${index})`"
            class="connection-line"
            :class="getConnectionClass(step, steps[index + 1])"
          />
        </g>
        
        <!-- Data Flow Indicator -->
        <g v-if="step.status === 'running' && showDataFlow" class="data-flow">
          <circle
            :cx="stepPositions[index].x + stepWidth + 20"
            :cy="stepPositions[index].y + stepHeight / 2"
            r="4"
            fill="#3498db"
            class="data-particle"
          />
        </g>
      </g>
      
      <!-- Overall Progress Indicator -->
      <g class="overall-progress" transform="translate(50, 250)">
        <text x="0" y="0" fill="#2c3e50" font-size="12" font-weight="bold">
          Overall Progress:
        </text>
        <rect
          x="120"
          y="-10"
          width="200"
          height="12"
          fill="#e0e0e0"
          rx="6"
        />
        <rect
          x="120"
          y="-10"
          :width="(200 * overallProgress) / 100"
          height="12"
          fill="#3498db"
          rx="6"
          class="overall-progress-fill"
        />
        <text
          x="330"
          y="2"
          fill="#2c3e50"
          font-size="12"
        >
          {{ Math.round(overallProgress) }}%
        </text>
      </g>
      
      <!-- Execution Time -->
      <g v-if="executionTime > 0" class="execution-time" transform="translate(450, 250)">
        <text x="0" y="0" fill="#2c3e50" font-size="12" font-weight="bold">
          Duration: {{ formatDuration(executionTime) }}
        </text>
      </g>
    </svg>
    
    <!-- Step Details Panel -->
    <div v-if="selectedStep" class="step-details" role="region" :aria-labelledby="`step-${selectedStep.id}-title`">
      <h3 :id="`step-${selectedStep.id}-title`">{{ selectedStep.name }} Details</h3>
      
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Status:</span>
          <span class="detail-value" :class="selectedStep.status">
            {{ selectedStep.status.toUpperCase() }}
          </span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">Progress:</span>
          <span class="detail-value">{{ Math.round(selectedStep.progress) }}%</span>
        </div>
        
        <div v-if="selectedStep.startTime" class="detail-item">
          <span class="detail-label">Started:</span>
          <span class="detail-value">{{ formatTime(selectedStep.startTime) }}</span>
        </div>
        
        <div v-if="selectedStep.endTime" class="detail-item">
          <span class="detail-label">Completed:</span>
          <span class="detail-value">{{ formatTime(selectedStep.endTime) }}</span>
        </div>
        
        <div v-if="getStepDuration(selectedStep) > 0" class="detail-item">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">{{ formatDuration(getStepDuration(selectedStep)) }}</span>
        </div>
        
        <div v-if="selectedStep.inputData" class="detail-item">
          <span class="detail-label">Input Size:</span>
          <span class="detail-value">{{ getDataSize(selectedStep.inputData) }}</span>
        </div>
        
        <div v-if="selectedStep.outputData" class="detail-item">
          <span class="detail-label">Output Size:</span>
          <span class="detail-value">{{ getDataSize(selectedStep.outputData) }}</span>
        </div>
      </div>
      
      <div v-if="selectedStep.errorMessage" class="error-message" role="alert">
        <h4>Error Details:</h4>
        <p>{{ selectedStep.errorMessage }}</p>
      </div>
      
      <div v-if="selectedStep.metadata?.description" class="step-description">
        <h4>Description:</h4>
        <p>{{ selectedStep.metadata.description }}</p>
      </div>
      
      <BaseButton @click="selectedStep = null" variant="secondary" size="small">
        Close Details
      </BaseButton>
    </div>
    
    <!-- Hidden descriptions for screen readers -->
    <div class="sr-only">
      <div
        v-for="step in steps"
        :key="`desc-${step.id}`"
        :id="`step-${step.id}-desc`"
      >
        {{ getStepDescription(step) }}
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
  pipelineSteps: IPipelineStep[]
  currentStep?: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'step-clicked': [step: IPipelineStep]
}>()

// Local state
const selectedStep = ref<IPipelineStep | null>(null)
const showDataFlow = ref(false)

// SVG dimensions
const svgWidth = ref(800)
const svgHeight = ref(300)
const stepWidth = 120
const stepHeight = 80

// Computed properties
const steps = computed(() => props.pipelineSteps || [])

const stepPositions = computed(() => {
  const totalSteps = steps.value.length
  const totalWidth = svgWidth.value - 100 // Leave margins
  const spacing = totalWidth / totalSteps
  
  return steps.value.map((_, index) => ({
    x: 50 + index * spacing + (spacing - stepWidth) / 2,
    y: 80
  }))
})

const overallProgress = computed(() => {
  const completedSteps = steps.value.filter(s => s.status === 'completed').length
  const runningSteps = steps.value.filter(s => s.status === 'running')
  
  let progress = (completedSteps / steps.value.length) * 100
  
  // Add partial progress from running steps
  if (runningSteps.length > 0) {
    const runningProgress = runningSteps.reduce((sum, step) => sum + step.progress, 0)
    progress += (runningProgress / 100) * (1 / steps.value.length) * 100
  }
  
  return Math.min(progress, 100)
})

const executionTime = computed(() => {
  // Calculate based on step times if available
  const completedSteps = steps.value.filter(s => s.endTime && s.startTime)
  if (completedSteps.length === 0) return 0
  
  const earliest = Math.min(...completedSteps.map(s => s.startTime!.getTime()))
  const latest = Math.max(...completedSteps.map(s => s.endTime!.getTime()))
  
  return latest - earliest
})

const ariaLabel = computed(() => {
  const completedSteps = steps.value.filter(s => s.status === 'completed').length
  const totalSteps = steps.value.length
  return `Pipeline visualization showing ${completedSteps} of ${totalSteps} steps completed`
})

// Methods
const handleStepClick = (step: IPipelineStep) => {
  selectedStep.value = selectedStep.value?.id === step.id ? null : step
  emit('step-clicked', step)
}

const getStepColor = (step: IPipelineStep) => {
  switch (step.status) {
    case 'completed': return '#d4edda'
    case 'running': return '#fff3cd'
    case 'failed': return '#f8d7da'
    case 'pending': return '#f8f9fa'
    default: return '#f8f9fa'
  }
}

const getStepBorderColor = (step: IPipelineStep) => {
  switch (step.status) {
    case 'completed': return '#27ae60'
    case 'running': return '#f39c12'
    case 'failed': return '#e74c3c'
    case 'pending': return '#bdc3c7'
    default: return '#bdc3c7'
  }
}

const getIconColor = (step: IPipelineStep) => {
  switch (step.stepType) {
    case 'extract': return '#3498db'
    case 'load': return '#9b59b6'
    case 'transform': return '#e67e22'
    default: return '#95a5a6'
  }
}

const getStepIcon = (step: IPipelineStep) => {
  switch (step.stepType) {
    case 'extract': return 'E'
    case 'load': return 'L'
    case 'transform': return 'T'
    default: return '?'
  }
}

const getProgressColor = (step: IPipelineStep) => {
  switch (step.status) {
    case 'completed': return '#27ae60'
    case 'running': return '#f39c12'
    case 'failed': return '#e74c3c'
    default: return '#bdc3c7'
  }
}

const getStatusColor = (step: IPipelineStep) => {
  switch (step.status) {
    case 'completed': return '#27ae60'
    case 'running': return '#f39c12'
    case 'failed': return '#e74c3c'
    case 'pending': return '#bdc3c7'
    default: return '#bdc3c7'
  }
}

const getStatusBorderColor = (step: IPipelineStep) => {
  return step.status === 'running' ? '#e67e22' : 'transparent'
}

const getArrowColor = (currentStep: IPipelineStep, nextStep: IPipelineStep) => {
  if (currentStep.status === 'completed') {
    return nextStep.status === 'pending' ? '#3498db' : '#27ae60'
  }
  return '#bdc3c7'
}

const getConnectionClass = (currentStep: IPipelineStep, nextStep: IPipelineStep) => {
  if (currentStep.status === 'completed' && nextStep.status === 'running') {
    return 'active-connection'
  }
  if (currentStep.status === 'completed') {
    return 'completed-connection'
  }
  return 'inactive-connection'
}

const getStepAriaLabel = (step: IPipelineStep) => {
  return `${step.name} step, status: ${step.status}, progress: ${Math.round(step.progress)}%`
}

const getStepDescription = (step: IPipelineStep) => {
  let desc = `${step.name} is a ${step.stepType} step with status ${step.status}`
  if (step.progress > 0) {
    desc += ` and ${Math.round(step.progress)}% progress`
  }
  if (step.errorMessage) {
    desc += `. Error: ${step.errorMessage}`
  }
  return desc
}

const getStepDuration = (step: IPipelineStep) => {
  if (step.endTime && step.startTime) {
    return step.endTime.getTime() - step.startTime.getTime()
  }
  return 0
}

const getDataSize = (data: any) => {
  if (!data) return '0 bytes'
  const size = JSON.stringify(data).length
  if (size < 1024) return `${size} bytes`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}

// Watch for execution changes to show data flow animation
watch(
  () => props.currentStep,
  (currentStep) => {
    showDataFlow.value = !!currentStep
  }
)
</script>

<style scoped>
.pipeline-visualizer {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.pipeline-svg {
  width: 100%;
  height: auto;
  max-width: 800px;
  cursor: pointer;
}

.step-rect {
  transition: all 0.3s ease;
  cursor: pointer;
}

.step-rect:hover {
  filter: brightness(0.95);
  stroke-width: 3;
}

.step-rect:focus {
  outline: none;
  stroke: #3498db;
  stroke-width: 4;
}

.step-rect.running {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.running-indicator {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress-fill {
  transition: width 0.3s ease;
}

.overall-progress-fill {
  transition: width 0.5s ease;
}

.connection-line {
  transition: all 0.3s ease;
}

.active-connection {
  stroke-dasharray: 5,5;
  animation: dash 1s linear infinite;
}

@keyframes dash {
  to { stroke-dashoffset: -10; }
}

.completed-connection {
  stroke-width: 4;
}

.inactive-connection {
  opacity: 0.5;
}

.data-particle {
  animation: flow 2s ease-in-out infinite;
}

@keyframes flow {
  0% { transform: translateX(-20px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(20px); opacity: 0; }
}

/* Step Details Panel */
.step-details {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.step-details h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.detail-label {
  font-weight: bold;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.detail-value {
  color: #2c3e50;
  font-size: 0.9rem;
}

.detail-value.completed {
  color: #27ae60;
  font-weight: bold;
}

.detail-value.running {
  color: #f39c12;
  font-weight: bold;
}

.detail-value.failed {
  color: #e74c3c;
  font-weight: bold;
}

.error-message {
  background: #fdf2f2;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.error-message h4 {
  margin: 0 0 0.5rem 0;
  color: #721c24;
  font-size: 1rem;
}

.error-message p {
  margin: 0;
  color: #721c24;
  font-size: 0.9rem;
}

.step-description {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.step-description h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.step-description p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
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
  .pipeline-visualizer {
    padding: 0.5rem;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>