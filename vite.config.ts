import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  },
  build: {
    // Performance optimizations
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['@/utils/formatters', '@/utils/validators'],
          services: ['@/services/api', '@/services/websocket', '@/services/performance']
        }
      }
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    chunkSizeWarningLimit: 500, // Warn for chunks larger than 500kb
    sourcemap: false // Disable sourcemaps in production for smaller bundles
  },
  // Asset optimization
  assetsInclude: ['**/*.woff2', '**/*.woff'],
  // Performance optimizations
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['@vueuse/core'] // Exclude large optional dependencies
  },
  // Server configuration for development
  server: {
    // Enable compression
    compress: true,
    // Preload modules
    preTransformRequests: true
  },
  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        // Optimize SCSS compilation
        outputStyle: 'compressed'
      }
    }
  }
})