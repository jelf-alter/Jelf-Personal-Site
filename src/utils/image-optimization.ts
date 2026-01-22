/**
 * Image Optimization Utilities
 * Provides utilities for optimizing images, generating responsive images, and lazy loading
 */

export interface ImageFormat {
  format: 'webp' | 'avif' | 'jpeg' | 'png'
  quality?: number
  progressive?: boolean
}

export interface ResponsiveImageConfig {
  src: string
  alt: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  formats?: ImageFormat[]
  breakpoints?: number[]
}

/**
 * Generate responsive image sources
 */
export function generateResponsiveImages(config: ResponsiveImageConfig): {
  srcSet: string
  sizes: string
  src: string
} {
  const { src, sizes = '100vw', breakpoints = [320, 640, 768, 1024, 1280, 1920] } = config

  // Generate srcset for different breakpoints
  const srcSet = breakpoints
    .map(width => `${generateImageUrl(src, { width })} ${width}w`)
    .join(', ')

  return {
    srcSet,
    sizes,
    src: generateImageUrl(src, { width: 1024 }) // Default fallback
  }
}

/**
 * Generate optimized image URL (placeholder for actual image service)
 */
export function generateImageUrl(
  src: string, 
  options: {
    width?: number
    height?: number
    quality?: number
    format?: string
  } = {}
): string {
  // In a real application, this would integrate with an image optimization service
  // like Cloudinary, ImageKit, or a custom solution
  
  const { width, height, quality = 80, format } = options
  
  // For now, return the original src with query parameters
  // In production, replace this with actual image service integration
  const url = new URL(src, window.location.origin)
  
  if (width) url.searchParams.set('w', width.toString())
  if (height) url.searchParams.set('h', height.toString())
  if (quality !== 80) url.searchParams.set('q', quality.toString())
  if (format) url.searchParams.set('f', format)
  
  return url.toString()
}

/**
 * Create optimized image element
 */
export function createOptimizedImage(config: ResponsiveImageConfig): HTMLImageElement {
  const img = document.createElement('img')
  const { srcSet, sizes, src } = generateResponsiveImages(config)
  
  img.srcset = srcSet
  img.sizes = sizes
  img.src = src
  img.alt = config.alt
  img.loading = config.loading || 'lazy'
  img.decoding = config.decoding || 'async'
  
  // Add CSS classes for styling
  img.classList.add('optimized-image')
  
  return img
}

/**
 * Preload critical images
 */
export function preloadCriticalImages(images: string[]): Promise<void[]> {
  return Promise.all(
    images.map(src => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to preload image: ${src}`))
        img.src = src
      })
    })
  )
}

/**
 * Generate WebP fallback
 */
export function generateWebPFallback(src: string): {
  webp: string
  fallback: string
} {
  return {
    webp: generateImageUrl(src, { format: 'webp' }),
    fallback: src
  }
}

/**
 * Check WebP support
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise(resolve => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * Check AVIF support
 */
export function supportsAVIF(): Promise<boolean> {
  return new Promise(resolve => {
    const avif = new Image()
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2)
    }
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })
}

/**
 * Image compression utility (client-side)
 */
export function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: string
  } = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = 'image/jpeg' } = options
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        format,
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Generate placeholder image (base64 encoded)
 */
export function generatePlaceholder(
  width: number,
  height: number,
  color = '#f0f0f0'
): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''
  
  canvas.width = width
  canvas.height = height
  
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/png')
}

/**
 * Calculate image aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(width, height)
  
  return `${width / divisor}:${height / divisor}`
}

/**
 * Estimate image file size
 */
export function estimateImageSize(
  width: number,
  height: number,
  format: 'jpeg' | 'png' | 'webp' | 'avif' = 'jpeg',
  quality = 0.8
): number {
  const pixels = width * height
  
  // Rough estimates in bytes per pixel
  const bytesPerPixel = {
    jpeg: 0.5 * quality + 0.1,
    png: 3,
    webp: 0.4 * quality + 0.05,
    avif: 0.3 * quality + 0.03
  }
  
  return Math.round(pixels * bytesPerPixel[format])
}

// CSS for optimized images
export const optimizedImageCSS = `
.optimized-image {
  max-width: 100%;
  height: auto;
  transition: opacity 0.3s ease;
}

.optimized-image.loading {
  opacity: 0.5;
}

.optimized-image.loaded {
  opacity: 1;
}

.optimized-image.error {
  opacity: 0.3;
  filter: grayscale(100%);
}

/* Aspect ratio containers */
.image-container {
  position: relative;
  overflow: hidden;
}

.image-container.aspect-16-9 {
  aspect-ratio: 16 / 9;
}

.image-container.aspect-4-3 {
  aspect-ratio: 4 / 3;
}

.image-container.aspect-1-1 {
  aspect-ratio: 1 / 1;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
`