<template>
  <div class="websocket-demo">
    <div class="connection-status">
      <h3>WebSocket Connection</h3>
      <div class="status-indicator" :class="connectionStatus">
        <span class="status-dot"></span>
        <span class="status-text">{{ connectionStatusText }}</span>
      </div>
      <div class="connection-actions">
        <button @click="connect" :disabled="isConnected" class="btn btn-primary">
          Connect
        </button>
        <button @click="disconnect" :disabled="!isConnected" class="btn btn-secondary">
          Disconnect
        </button>
      </div>
    </div>

    <div class="subscriptions">
      <h3>Channel Subscriptions</h3>
      <div class="subscription-controls">
        <button @click="subscribe('pipeline')" class="btn btn-outline">
          Subscribe to Pipeline Updates
        </button>
        <button @click="subscribe('testing')" class="btn btn-outline">
          Subscribe to Test Updates
        </button>
        <button @click="unsubscribe('pipeline')" class="btn btn-outline">
          Unsubscribe from Pipeline
        </button>
        <button @click="unsubscribe('testing')" class="btn btn-outline">
          Unsubscribe from Testing
        </button>
      </div>
    </div>

    <div class="message-log">
      <h3>Real-time Messages</h3>
      <div class="message-count">
        Total messages received: {{ messages.length }}
      </div>
      <div class="messages-container">
        <div
          v-for="message in recentMessages"
          :key="message.id || message.timestamp"
          class="message-item"
          :class="message.type"
        >
          <div class="message-header">
            <span class="message-type">{{ message.type }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-content">
            <pre>{{ JSON.stringify(message.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div class="test-actions">
      <h3>Test WebSocket Broadcasting</h3>
      <div class="test-controls">
        <button @click="triggerPipelineUpdate" class="btn btn-primary">
          Trigger Pipeline Update
        </button>
        <button @click="triggerTestUpdate" class="btn btn-primary">
          Trigger Test Update
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWebSocket } from '../../composables/useWebSocket';
import type { WebSocketMessage } from '../../services/websocket';

const webSocket = useWebSocket({ autoConnect: false });
const messages = ref<WebSocketMessage[]>([]);

// Computed properties
const connectionStatusText = computed(() => {
  switch (webSocket.connectionStatus.value) {
    case 'connecting':
      return 'Connecting...';
    case 'connected':
      return 'Connected';
    case 'disconnected':
      return 'Disconnected';
    case 'error':
      return 'Connection Error';
    default:
      return 'Unknown';
  }
});

const recentMessages = computed(() => {
  return messages.value.slice(-10).reverse(); // Show last 10 messages, newest first
});

// Methods
const connect = () => {
  webSocket.connect();
};

const disconnect = () => {
  webSocket.disconnect();
};

const subscribe = (channel: string) => {
  webSocket.subscribe(channel);
};

const unsubscribe = (channel: string) => {
  webSocket.unsubscribe(channel);
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString();
};

const triggerPipelineUpdate = async () => {
  try {
    const response = await fetch('/api/ws/pipeline/demo-pipeline/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test_broadcast',
        status: 'running',
        progress: Math.floor(Math.random() * 100),
        message: 'Test pipeline update from WebSocket demo'
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to trigger pipeline update');
    }
  } catch (error) {
    console.error('Error triggering pipeline update:', error);
  }
};

const triggerTestUpdate = async () => {
  try {
    const response = await fetch('/api/ws/test/demo-test-suite/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test_broadcast',
        status: 'running',
        passed: Math.floor(Math.random() * 50),
        failed: Math.floor(Math.random() * 5),
        message: 'Test update from WebSocket demo'
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to trigger test update');
    }
  } catch (error) {
    console.error('Error triggering test update:', error);
  }
};

// Setup message handling
onMounted(() => {
  // Listen to all message types
  webSocket.on('*', (message: WebSocketMessage) => {
    messages.value.push(message);
    
    // Keep only last 100 messages to prevent memory issues
    if (messages.value.length > 100) {
      messages.value = messages.value.slice(-100);
    }
  });
});

// Destructure reactive properties
const { isConnected, connectionStatus } = webSocket;
</script>

<style scoped>
.websocket-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.websocket-demo h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.connection-status {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.status-indicator.connected .status-dot {
  background-color: #27ae60;
}

.status-indicator.connecting .status-dot {
  background-color: #f39c12;
  animation: pulse 1s infinite;
}

.status-indicator.disconnected .status-dot {
  background-color: #95a5a6;
}

.status-indicator.error .status-dot {
  background-color: #e74c3c;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.connection-actions {
  display: flex;
  gap: 0.5rem;
}

.subscriptions {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.subscription-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.message-log {
  margin-bottom: 2rem;
}

.message-count {
  margin-bottom: 1rem;
  font-weight: bold;
  color: #7f8c8d;
}

.messages-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.message-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.message-item:last-child {
  border-bottom: none;
}

.message-item.pipeline_update {
  border-left: 4px solid #3498db;
}

.message-item.test_update {
  border-left: 4px solid #27ae60;
}

.message-item.error {
  border-left: 4px solid #e74c3c;
}

.message-item.connection_status {
  border-left: 4px solid #9b59b6;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-type {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #2c3e50;
}

.message-time {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.message-content pre {
  margin: 0;
  font-size: 0.8rem;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
}

.test-actions {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.test-controls {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.btn-outline {
  background-color: transparent;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn-outline:hover {
  background-color: #3498db;
  color: white;
}
</style>