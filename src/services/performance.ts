/**
 * Performance Monitoring Service
 * Tracks Core Web Vitals and other performance metrics
 */

export interface CoreWebVitals {
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
}

export interface PerformanceMetrics {
  pageId: string
  timestamp: Date
  coreWebVitals: CoreWebVitals
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  firstContentfulPaint: number
  timeToInteractive: number
  bundleSize?: number
  resourceCount: number
  memoryUsage?: number
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number }
  fid: { good: number; needsImprovement: number }
  cls: { good: number; needsImprovement: number }
  loadTime: { good: number; needsImprovement: number }
}

class PerformanceService {
  private metrics: PerformanceMetrics[] = []
  private observers: Map<string, PerformanceObserver> = new Map()
  
  // Core Web Vitals thresholds (Google recommendations)
  private readonly thresholds: PerformanceThresholds = {
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    loadTime: { good: 1500, needsImprovement: 3000 }
  }

  constructor() {
    this.initializeObservers()
  }

  /**
   * Initialize performance observers for Core Web Vitals
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    this.observeLCP()
    
    // First Input Delay (FID)
    this.observeFID()
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS()
    
    // Navigation timing
    this.observeNavigation()
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        if (lastEntry) {
          this.updateMetric('lcp', lastEntry.startTime)
        }
      })
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.set('lcp', observer)
    } catch (error) {
      console.warn('LCP observer not supported:', error)
    }
  }

  /**
   * Observe First Input Delay
   */
  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime
            this.updateMetric('fid', fid)
          }
        })
      })
      
      observer.observe({ type: 'first-input', buffered: true })
      this.observers.set('fid', observer)
    } catch (error) {
      console.warn('FID observer not supported:', error)
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      let clsValue = 0
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.updateMetric('cls', clsValue)
          }
        })
      })
      
      observer.observe({ type: 'layout-shift', buffered: true })
      this.observers.set('cls', observer)
    } catch (error) {
      console.warn('CLS observer not supported:', error)
    }
  }

  /**
   * Observe navigation timing
   */
  private observeNavigation(): void {
    if (typeof window === 'undefined' || !window.performance) return

    // Wait for page load to complete
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectNavigationMetrics()
      }, 0)
    })
  }

  /**
   * Collect navigation timing metrics
   */
  private collectNavigationMetrics(): void {
    if (!window.performance || !window.performance.timing) return

    const timing = window.performance.timing
    const navigation = window.performance.navigation

    const metrics = {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      timeToInteractive: this.estimateTimeToInteractive(),
      resourceCount: window.performance.getEntriesByType('resource').length
    }

    this.recordPageMetrics(metrics)
  }

  /**
   * Get First Paint timing
   */
  private getFirstPaint(): number {
    const paintEntries = window.performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : 0
  }

  /**
   * Get First Contentful Paint timing
   */
  private getFirstContentfulPaint(): number {
    const paintEntries = window.performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : 0
  }

  /**
   * Estimate Time to Interactive (simplified)
   */
  private estimateTimeToInteractive(): number {
    // Simplified TTI estimation - in production, use a proper TTI library
    const timing = window.performance.timing
    return timing.domInteractive - timing.navigationStart
  }

  /**
   * Update a specific metric
   */
  private updateMetric(type: string, value: number): void {
    const currentMetrics = this.getCurrentMetrics()
    
    switch (type) {
      case 'lcp':
        currentMetrics.coreWebVitals.lcp = value
        break
      case 'fid':
        currentMetrics.coreWebVitals.fid = value
        break
      case 'cls':
        currentMetrics.coreWebVitals.cls = value
        break
    }

    this.notifyMetricUpdate(type, value)
  }

  /**
   * Record page metrics
   */
  private recordPageMetrics(metrics: Partial<PerformanceMetrics>): void {
    const pageMetrics: PerformanceMetrics = {
      pageId: this.getCurrentPageId(),
      timestamp: new Date(),
      coreWebVitals: this.getCurrentMetrics().coreWebVitals,
      loadTime: metrics.loadTime || 0,
      domContentLoaded: metrics.domContentLoaded || 0,
      firstPaint: metrics.firstPaint || 0,
      firstContentfulPaint: metrics.firstContentfulPaint || 0,
      timeToInteractive: metrics.timeToInteractive || 0,
      resourceCount: metrics.resourceCount || 0,
      memoryUsage: this.getMemoryUsage()
    }

    this.metrics.push(pageMetrics)
    this.sendMetricsToAnalytics(pageMetrics)
  }

  /**
   * Get current page identifier
   */
  private getCurrentPageId(): string {
    return window.location.pathname || 'unknown'
  }

  /**
   * Get current metrics object
   */
  private getCurrentMetrics(): PerformanceMetrics {
    const existing = this.metrics.find(m => m.pageId === this.getCurrentPageId())
    
    if (existing) {
      return existing
    }

    const newMetrics: PerformanceMetrics = {
      pageId: this.getCurrentPageId(),
      timestamp: new Date(),
      coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
      loadTime: 0,
      domContentLoaded: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      timeToInteractive: 0,
      resourceCount: 0
    }

    this.metrics.push(newMetrics)
    return newMetrics
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in window.performance) {
      return (window.performance as any).memory.usedJSHeapSize
    }
    return undefined
  }

  /**
   * Notify metric update (for real-time monitoring)
   */
  private notifyMetricUpdate(type: string, value: number): void {
    // Emit custom event for real-time monitoring
    window.dispatchEvent(new CustomEvent('performance-metric-update', {
      detail: { type, value, timestamp: Date.now() }
    }))
  }

  /**
   * Send metrics to analytics service
   */
  private sendMetricsToAnalytics(metrics: PerformanceMetrics): void {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', metrics)
    }

    // Example: Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'core_web_vitals', {
        lcp: metrics.coreWebVitals.lcp,
        fid: metrics.coreWebVitals.fid,
        cls: metrics.coreWebVitals.cls,
        page_path: metrics.pageId
      })
    }
  }

  /**
   * Get performance score for a metric
   */
  public getMetricScore(type: keyof CoreWebVitals, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.thresholds[type]
    
    if (value <= threshold.good) {
      return 'good'
    } else if (value <= threshold.needsImprovement) {
      return 'needs-improvement'
    } else {
      return 'poor'
    }
  }

  /**
   * Get all recorded metrics
   */
  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Get metrics for current page
   */
  public getCurrentPageMetrics(): PerformanceMetrics | undefined {
    return this.metrics.find(m => m.pageId === this.getCurrentPageId())
  }

  /**
   * Get Core Web Vitals summary
   */
  public getCoreWebVitalsSummary(): {
    lcp: { value: number; score: string }
    fid: { value: number; score: string }
    cls: { value: number; score: string }
  } {
    const current = this.getCurrentPageMetrics()
    
    if (!current) {
      return {
        lcp: { value: 0, score: 'unknown' },
        fid: { value: 0, score: 'unknown' },
        cls: { value: 0, score: 'unknown' }
      }
    }

    return {
      lcp: {
        value: current.coreWebVitals.lcp,
        score: this.getMetricScore('lcp', current.coreWebVitals.lcp)
      },
      fid: {
        value: current.coreWebVitals.fid,
        score: this.getMetricScore('fid', current.coreWebVitals.fid)
      },
      cls: {
        value: current.coreWebVitals.cls,
        score: this.getMetricScore('cls', current.coreWebVitals.cls)
      }
    }
  }

  /**
   * Start monitoring for a specific page
   */
  public startMonitoring(pageId?: string): void {
    if (pageId) {
      // Custom page monitoring
      this.recordPageMetrics({ pageId } as any)
    }
    
    // Ensure observers are running
    this.initializeObservers()
  }

  /**
   * Stop all monitoring
   */
  public stopMonitoring(): void {
    this.observers.forEach(observer => {
      observer.disconnect()
    })
    this.observers.clear()
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = []
  }
}

// Export singleton instance
export const performanceService = new PerformanceService()

// Export types
export type { PerformanceMetrics, CoreWebVitals, PerformanceThresholds }