/**
 * Lazy Loading Utilities
 * Provides utilities for lazy loading components, images, and other assets
 */

import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

/**
 * Create a lazy-loaded component with loading and error states
 */
export function createLazyComponent(
  loader: AsyncComponentLoader,
  options: {
    loadingComponent?: Component
    errorComponent?: Component
    delay?: number
    timeout?: number
    suspensible?: boolean
  } = {}
) {
  return defineAsyncComponent({
    loader,
    loadingComponent: options.loadingComponent || LoadingSpinner,
    errorComponent: options.errorComponent,
    delay: options.delay || 200,
    timeout: options.timeout || 3000,
    suspensible: options.suspensible ?? true
  })
}

/**
 * Lazy load images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null
  private images: Set<HTMLImageElement> = new Set()

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
          ...options
        }
      )
    }
  }

  /**
   * Add image to lazy loading queue
   */
  observe(img: HTMLImageElement): void {
    if (!this.observer) {
      // Fallback: load immediately if IntersectionObserver not supported
      this.loadImage(img)
      return
    }

    this.images.add(img)
    this.observer.observe(img)
  }

  /**
   * Remove image from observation
   */
  unobserve(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.unobserve(img)
    }
    this.images.delete(img)
  }

  /**
   * Handle intersection changes
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        this.loadImage(img)
        this.unobserve(img)
      }
    })
  }

  /**
   * Load image with error handling
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src
    if (!src) return

    // Create a new image to preload
    const imageLoader = new Image()
    
    imageLoader.onload = () => {
      img.src = src
      img.classList.add('loaded')
      img.classList.remove('loading')
    }
    
    imageLoader.onerror = () => {
      img.classList.add('error')
      img.classList.remove('loading')
      // Set fallback image if available
      const fallback = img.dataset.fallback
      if (fallback) {
        img.src = fallback
      }
    }
    
    img.classList.add('loading')
    imageLoader.src = src
  }

  /**
   * Disconnect observer and clean up
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.images.clear()
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string): void {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  
  document.head.appendChild(link)
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Lazy load CSS
 */
export function loadCSS(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Document not available'))
      return
    }

    // Check if already loaded
    const existing = document.querySelector(`link[href="${href}"]`)
    if (existing) {
      resolve()
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`))
    
    document.head.appendChild(link)
  })
}

/**
 * Lazy load JavaScript
 */
export function loadScript(src: string, async = true): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Document not available'))
      return
    }

    // Check if already loaded
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = async
    
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    
    document.head.appendChild(script)
  })
}

/**
 * Intersection Observer utility for general use
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  return new IntersectionObserver(callback, {
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  })
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Export singleton lazy image loader
export const lazyImageLoader = new LazyImageLoader()