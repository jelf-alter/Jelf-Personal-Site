import { ref, type Ref } from 'vue'
import type { IApiResponse } from '@/types'

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface UseApiReturn<T> {
  data: Ref<T | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

/**
 * Composable for making API calls with loading and error states
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<IApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const data = ref<T | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (...args: any[]): Promise<T | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiFunction(...args)
      
      if (response.success && response.data) {
        data.value = response.data
        options.onSuccess?.(response.data)
        return response.data
      } else {
        const errorMessage = response.error || response.message || 'An error occurred'
        error.value = errorMessage
        options.onError?.(errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      error.value = errorMessage
      options.onError?.(errorMessage)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    data.value = null
    isLoading.value = false
    error.value = null
  }

  // Execute immediately if requested
  if (options.immediate) {
    execute()
  }

  return {
    data,
    isLoading,
    error,
    execute,
    reset
  }
}

/**
 * Composable for handling WebSocket connections
 */
export function useWebSocket(url: string) {
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const socket = ref<WebSocket | null>(null)

  const connect = () => {
    try {
      socket.value = new WebSocket(url)
      
      socket.value.onopen = () => {
        isConnected.value = true
        error.value = null
      }
      
      socket.value.onclose = () => {
        isConnected.value = false
      }
      
      socket.value.onerror = () => {
        error.value = 'WebSocket connection error'
        isConnected.value = false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create WebSocket'
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
  }

  const send = (data: any) => {
    if (socket.value && isConnected.value) {
      socket.value.send(JSON.stringify(data))
    }
  }

  const onMessage = (callback: (data: any) => void) => {
    if (socket.value) {
      socket.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          callback(data)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }
    }
  }

  return {
    isConnected,
    error,
    connect,
    disconnect,
    send,
    onMessage
  }
}