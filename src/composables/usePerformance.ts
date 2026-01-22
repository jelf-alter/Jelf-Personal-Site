/**
 * Performance Monitoring Composable
 * Vue composable for tracking and displaying performance metrics
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { performanceService, type PerformanceMetrics, type CoreWebVitals } from '@/services/performance'

export function usePerformance() {
  const metrics = ref<PerformanceMetrics | null>(null)
  const isMonitoring = ref(false)
  const lastUpdate = ref<Date | null>(null)

  // Reactive Core Web Vitals
  const coreWebVitals = computed(() => {
    if (!metrics.value) {
      return { lcp: 0, fid: 0, cls: 0 }
    }
    return metrics.value.coreWebVitals
  })

  // Performance scores
  const performanceScores = computed(() => {
    return performanceService.getCoreWebVitalsSummary()
  })

  // Overall performance grade
  const overallGrade = computed(() => {
    const scores = performanceScores.value
    const goodCount = Object.values(scores).filter(s => s.score === 'good').length
    const needsImprovementCount = Object.values(scores).filter(s => s.score === 'needs-improvement').length
    
    if (goodCount === 3) return 'A'
    if (goodCount === 2) return 'B'
    if (goodCount === 1 || needsImprovementCount >= 2) return 'C'
    return 'D'
  })

  // Format metrics for display
  const formattedMetrics = computed(() => {
    if (!metrics.value) return null

    return {
      lcp: `${Math.round(metrics.value.coreWebVitals.lcp)}ms`,
      fid: `${Math.round(metrics.value.coreWebVitals.fid)}ms`,
      cls: metrics.value.coreWebVitals.cls.toFixed(3),
      loadTime: `${Math.round(metrics.value.loadTime)}ms`,
      domContentLoaded: `${Math.round(metrics.value.domContentLoaded)}ms`,
      firstPaint: `${Math.round(metrics.value.firstPaint)}ms`,
      firstContentfulPaint: `${Math.round(metrics.value.firstContentfulPaint)}ms`,
      timeToInteractive: `${Math.round(metrics.value.timeToInteractive)}ms`,
      resourceCount: metrics.value.resourceCount.toString(),
      memoryUsage: metrics.value.memoryUsage 
        ? `${Math.round(metrics.value.memoryUsage / 1024 / 1024)}MB`
        : 'N/A'
    }
  })

  // Performance recommendations
  const recommendations = computed(() => {
    const scores = performanceScores.value
    const recs: string[] = []

    if (scores.lcp.score !== 'good') {
      recs.push('Optimize Largest Contentful Paint by reducing server response times and optimizing images')
    }
    
    if (scores.fid.score !== 'good') {
      recs.push('Improve First Input Delay by reducing JavaScript execution time and using web workers')
    }
    
    if (scores.cls.score !== 'good') {
      recs.push('Reduce Cumulative Layout Shift by setting dimensions for images and avoiding dynamic content insertion')
    }

    return recs
  })

  /**
   * Start performance monitoring
   */
  const startMonitoring = () => {
    if (isMonitoring.value) return

    isMonitoring.value = true
    performanceService.startMonitoring()
    
    // Update metrics periodically
    updateMetrics()
    
    // Listen for metric updates
    window.addEventListener('performance-metric-update', handleMetricUpdate)
  }

  /**
   * Stop performance monitoring
   */
  const stopMonitoring = () => {
    if (!isMonitoring.value) return

    isMonitoring.value = false
    window.removeEventListener('performance-metric-update', handleMetricUpdate)
  }

  /**
   * Update current metrics
   */
  const updateMetrics = () => {
    const currentMetrics = performanceService.getCurrentPageMetrics()
    if (currentMetrics) {
      metrics.value = currentMetrics
      lastUpdate.value = new Date()
    }
  }

  /**
   * Handle metric update events
   */
  const handleMetricUpdate = (event: CustomEvent) => {
    updateMetrics()
  }

  /**
   * Get performance report
   */
  const getPerformanceReport = () => {
    return {
      metrics: metrics.value,
      scores: performanceScores.value,
      grade: overallGrade.value,
      recommendations: recommendations.value,
      timestamp: lastUpdate.value
    }
  }

  /**
   * Export metrics as JSON
   */
  const exportMetrics = () => {
    const report = getPerformanceReport()
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Clear all metrics
   */
  const clearMetrics = () => {
    performanceService.clearMetrics()
    metrics.value = null
    lastUpdate.value = null
  }

  // Lifecycle hooks
  onMounted(() => {
    startMonitoring()
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    metrics,
    isMonitoring,
    lastUpdate,
    
    // Computed
    coreWebVitals,
    performanceScores,
    overallGrade,
    formattedMetrics,
    recommendations,
    
    // Methods
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    getPerformanceReport,
    exportMetrics,
    clearMetrics
  }
}

/**
 * Lightweight performance hook for basic monitoring
 */
export function useBasicPerformance() {
  const loadTime = ref(0)
  const isLoaded = ref(false)

  onMounted(() => {
    const startTime = performance.now()
    
    window.addEventListener('load', () => {
      loadTime.value = performance.now() - startTime
      isLoaded.value = true
    })
  })

  return {
    loadTime,
    isLoaded
  }
}