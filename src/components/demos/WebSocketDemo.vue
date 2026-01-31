<template>
  <div class="websocket-demo" role="main" aria-labelledby="demo-title">
    <h1 id="demo-title" class="sr-only">WebSocket Demo Application</h1>
    
    <section class="connection-status" aria-labelledby="connection-title">
      <h2 id="connection-title">WebSocket Connection</h2>
      <div 
        class="status-indicator" 
        :class="connectionStatus"
        role="status"
        :aria-label="`Connection status: ${connectionStatusText}`"
        aria-live="polite"
      >
        <span class="status-dot" aria-hidden="true"></span>
        <span class="status-text">{{ connectionStatusText }}</span>
      </div>
      <div class="connection-actions" role="group" aria-label="Connection controls">
        <button
          class="connect-button"
          @click="connect" 
          :disabled="isConnected"
          aria-describedby="connect-help"
        >
          Connect
        </button>
        <button
          class="disconnect-button"
          @click="disconnect" 
          :disabled="!isConnected"
          aria-describedby="disconnect-help"
        >
          Disconnect
        </button>
      </div>
      <div class="sr-only">
        <div id="connect-help">Establish WebSocket connection to the server</div>
        <div id="disconnect-help">Close the WebSocket connection</div>
      </div>
    </section>

    <section class="message-input-section" aria-labelledby="input-title">
      <h2 id="input-title">Send Message</h2>
      <div class="input-controls" role="group" aria-label="Message input controls">
        <input
          v-model="messageInput"
          type="text"
          class="message-input"
          placeholder="Enter message to send..."
          :disabled="!isConnected"
          @keydown.enter="sendMessage"
          aria-describedby="input-help"
        />
        <button
          class="send-button"
          @click="sendMessage"
          :disabled="!isConnected || !messageInput.trim()"
          aria-describedby="send-help"
        >
          Send
        </button>
      </div>
      <div class="sr-only">
        <div id="input-help">Type a message to send through the WebSocket connection</div>
        <div id="send-help">Send the message to all connected clients</div>
      </div>
    </section>

    <section class="message-log" aria-labelledby="messages-title">
      <h2 id="messages-title">Real-time Messages</h2>
      <div class="message-count" aria-live="polite">
        Total messages received: {{ messages.length }}
      </div>
      <div 
        class="messages-container"
        role="log"
        aria-label="WebSocket message log"
        aria-live="polite"
        tabindex="0"
      >
        <div
          v-for="message in recentMessages"
          :key="message.id || message.timestamp"
          class="message-item"
          :class="message.type"
          role="article"
          :aria-label="`${message.type} message received at ${formatTime(message.timestamp)}`"
        >
          <div class="message-header">
            <span class="message-type">{{ message.type }}</span>
            <time class="message-time" :datetime="message.timestamp">
              {{ formatTime(message.timestamp) }}
            </time>
          </div>
          <div class="message-content">
            <pre :aria-label="`Message data: ${JSON.stringify(message.data)}`">{{ JSON.stringify(message.data, null, 2) }}</pre>
          </div>
        </div>
        <div v-if="recentMessages.length === 0" class="no-messages" role="status" aria-live="polite">
          No messages received yet. Connect and subscribe to channels to see real-time updates.
        </div>
      </div>
    </section>

    <section class="test-actions" aria-labelledby="test-title">
      <h2 id="test-title">Test WebSocket Broadcasting</h2>
      <div class="test-controls" role="group" aria-label="Test broadcast controls">
        <BaseButton 
          @click="triggerPipelineUpdate" 
          variant="primary"
          :disabled="!isConnected"
          aria-describedby="pipeline-test-help"
        >
          Trigger Pipeline Update
        </BaseButton>
        <BaseButton 
          @click="triggerTestUpdate" 
          variant="primary"
          :disabled="!isConnected"
          aria-describedby="test-test-help"
        >
          Trigger Test Update
        </BaseButton>
      </div>
      <div class="sr-only">
        <div id="pipeline-test-help">Send a test pipeline update message through WebSocket</div>
        <div id="test-test-help">Send a test update message through WebSocket</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWebSocket } from '../../composables/useWebSocket';
import type { WebSocketMessage } from '../../services/websocket';

const webSocket = useWebSocket({ autoConnect: false });
const messages = ref<WebSocketMessage[]>([]);
const messageInput = ref('');

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

const sendMessage = () => {
  if (!messageInput.value.trim() || !isConnected.value) return
  
  // Send message through WebSocket
  webSocket.send({
    type: 'user_message',
    data: { message: messageInput.value.trim() },
    timestamp: new Date().toISOString()
  })
  
  messageInput.value = ''
}

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

.websocket-demo h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  font-size: 1.25rem;
}

.no-messages {
  padding: 2rem;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}

.messages-container:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
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

.connect-button,
.disconnect-button,
.send-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.connect-button {
  background-color: #3498db;
  color: white;
}

.connect-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.disconnect-button,
.send-button {
  background-color: #95a5a6;
  color: white;
}

.disconnect-button:hover:not(:disabled),
.send-button:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.message-input-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.input-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
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