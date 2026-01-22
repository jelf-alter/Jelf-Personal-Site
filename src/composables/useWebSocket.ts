import { ref, onMounted, onUnmounted, Ref } from 'vue';
import { webSocketClient, WebSocketMessage, WebSocketEventHandler, ConnectionStatusHandler } from '../services/websocket';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  channels?: string[];
}

export interface UseWebSocketReturn {
  isConnected: Ref<boolean>;
  connectionStatus: Ref<'connecting' | 'connected' | 'disconnected' | 'error'>;
  lastMessage: Ref<WebSocketMessage | null>;
  connect: () => void;
  disconnect: () => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  on: (eventType: string, handler: WebSocketEventHandler) => void;
  off: (eventType: string, handler: WebSocketEventHandler) => void;
}

/**
 * Vue composable for WebSocket functionality
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, channels = [] } = options;
  
  const isConnected = ref(false);
  const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const lastMessage = ref<WebSocketMessage | null>(null);
  
  // Track handlers for cleanup
  const eventHandlers = new Map<string, WebSocketEventHandler>();
  let connectionStatusHandler: ConnectionStatusHandler | null = null;

  /**
   * Connect to WebSocket
   */
  const connect = () => {
    webSocketClient.connect();
  };

  /**
   * Disconnect from WebSocket
   */
  const disconnect = () => {
    webSocketClient.disconnect();
  };

  /**
   * Subscribe to a channel
   */
  const subscribe = (channel: string) => {
    webSocketClient.subscribe(channel);
  };

  /**
   * Unsubscribe from a channel
   */
  const unsubscribe = (channel: string) => {
    webSocketClient.unsubscribe(channel);
  };

  /**
   * Add event handler
   */
  const on = (eventType: string, handler: WebSocketEventHandler) => {
    webSocketClient.on(eventType, handler);
    eventHandlers.set(eventType, handler);
  };

  /**
   * Remove event handler
   */
  const off = (eventType: string, handler: WebSocketEventHandler) => {
    webSocketClient.off(eventType, handler);
    eventHandlers.delete(eventType);
  };

  /**
   * Setup connection status tracking
   */
  const setupConnectionTracking = () => {
    connectionStatusHandler = (status) => {
      connectionStatus.value = status;
      isConnected.value = status === 'connected';
    };
    
    webSocketClient.onConnectionStatus(connectionStatusHandler);
    
    // Set initial status
    connectionStatus.value = webSocketClient.getConnectionStatus();
    isConnected.value = webSocketClient.isConnected();
  };

  /**
   * Setup general message handler to track last message
   */
  const setupMessageTracking = () => {
    const messageHandler: WebSocketEventHandler = (message) => {
      lastMessage.value = message;
    };
    
    webSocketClient.on('*', messageHandler);
    eventHandlers.set('*', messageHandler);
  };

  /**
   * Cleanup handlers
   */
  const cleanup = () => {
    // Remove all event handlers
    eventHandlers.forEach((handler, eventType) => {
      webSocketClient.off(eventType, handler);
    });
    eventHandlers.clear();
    
    // Remove connection status handler
    if (connectionStatusHandler) {
      webSocketClient.offConnectionStatus(connectionStatusHandler);
      connectionStatusHandler = null;
    }
  };

  onMounted(() => {
    setupConnectionTracking();
    setupMessageTracking();
    
    // Subscribe to initial channels
    channels.forEach(channel => {
      subscribe(channel);
    });
    
    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    on,
    off
  };
}

/**
 * Composable specifically for pipeline updates
 */
export function usePipelineWebSocket(pipelineId?: string) {
  const webSocket = useWebSocket({
    autoConnect: true,
    channels: ['pipeline']
  });

  const pipelineUpdates = ref<any[]>([]);
  const currentPipelineStatus = ref<any>(null);

  // Handle pipeline updates
  webSocket.on('pipeline_update', (message: WebSocketMessage) => {
    if (!pipelineId || message.data.pipelineId === pipelineId) {
      pipelineUpdates.value.push(message.data);
      currentPipelineStatus.value = message.data;
    }
  });

  return {
    ...webSocket,
    pipelineUpdates,
    currentPipelineStatus
  };
}

/**
 * Composable specifically for test updates
 */
export function useTestWebSocket(testSuiteId?: string) {
  const webSocket = useWebSocket({
    autoConnect: true,
    channels: ['testing']
  });

  const testUpdates = ref<any[]>([]);
  const currentTestStatus = ref<any>(null);

  // Handle test updates
  webSocket.on('test_update', (message: WebSocketMessage) => {
    if (!testSuiteId || message.data.testSuiteId === testSuiteId) {
      testUpdates.value.push(message.data);
      currentTestStatus.value = message.data;
    }
  });

  return {
    ...webSocket,
    testUpdates,
    currentTestStatus
  };
}