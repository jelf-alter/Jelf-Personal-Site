import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export interface WebSocketMessage {
  type: 'pipeline_update' | 'test_update' | 'error' | 'connection_status';
  data: any;
  timestamp: string;
  id?: string;
}

export interface ClientConnection {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  subscriptions: Set<string>;
  connectedAt: Date;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientConnection> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHistory: Map<string, WebSocketMessage[]> = new Map();
  private readonly MAX_HISTORY_SIZE = 100;

  constructor() {
    this.setupHeartbeat();
  }

  /**
   * Initialize WebSocket server
   */
  public initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      clientTracking: true
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      this.handleConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket Server Error:', error);
    });

    console.log('WebSocket server initialized on /ws');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, request: any): void {
    const clientId = this.generateClientId();
    const client: ClientConnection = {
      id: clientId,
      ws,
      isAlive: true,
      subscriptions: new Set(),
      connectedAt: new Date()
    };

    this.clients.set(clientId, client);

    // Send connection confirmation
    this.sendToClient(clientId, {
      type: 'connection_status',
      data: { 
        status: 'connected', 
        clientId,
        serverTime: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleClientMessage(clientId, message);
      } catch (error) {
        console.error('Invalid message from client:', clientId, error);
        this.sendError(clientId, 'Invalid message format');
      }
    });

    // Handle connection close
    ws.on('close', (code: number, reason: Buffer) => {
      console.log(`Client ${clientId} disconnected: ${code} ${reason.toString()}`);
      this.clients.delete(clientId);
    });

    // Handle connection errors
    ws.on('error', (error: Error) => {
      console.error(`Client ${clientId} error:`, error);
      this.clients.delete(clientId);
    });

    // Handle pong responses for heartbeat
    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.isAlive = true;
      }
    });

    console.log(`New WebSocket client connected: ${clientId}`);
  }

  /**
   * Handle messages from clients
   */
  private handleClientMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        if (message.channel && typeof message.channel === 'string') {
          client.subscriptions.add(message.channel);
          this.sendToClient(clientId, {
            type: 'connection_status',
            data: { 
              status: 'subscribed', 
              channel: message.channel,
              subscriptions: Array.from(client.subscriptions)
            },
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'unsubscribe':
        if (message.channel && typeof message.channel === 'string') {
          client.subscriptions.delete(message.channel);
          this.sendToClient(clientId, {
            type: 'connection_status',
            data: { 
              status: 'unsubscribed', 
              channel: message.channel,
              subscriptions: Array.from(client.subscriptions)
            },
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'ping':
        this.sendToClient(clientId, {
          type: 'connection_status',
          data: { status: 'pong' },
          timestamp: new Date().toISOString()
        });
        break;

      default:
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Broadcast pipeline update to subscribed clients
   */
  public broadcastPipelineUpdate(pipelineId: string, data: any): void {
    const message: WebSocketMessage = {
      type: 'pipeline_update',
      data: {
        pipelineId,
        ...data
      },
      timestamp: new Date().toISOString(),
      id: this.generateMessageId()
    };

    this.broadcast(message, 'pipeline');
    this.addToHistory('pipeline', message);
  }

  /**
   * Broadcast test update to subscribed clients
   */
  public broadcastTestUpdate(testSuiteId: string, data: any): void {
    const message: WebSocketMessage = {
      type: 'test_update',
      data: {
        testSuiteId,
        ...data
      },
      timestamp: new Date().toISOString(),
      id: this.generateMessageId()
    };

    this.broadcast(message, 'testing');
    this.addToHistory('testing', message);
  }

  /**
   * Send error message to specific client
   */
  private sendError(clientId: string, errorMessage: string): void {
    this.sendToClient(clientId, {
      type: 'error',
      data: { 
        error: errorMessage,
        clientId
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send message to client ${clientId}:`, error);
      this.clients.delete(clientId);
    }
  }

  /**
   * Broadcast message to all clients subscribed to a channel
   */
  private broadcast(message: WebSocketMessage, channel?: string): void {
    const clientsToNotify = Array.from(this.clients.values()).filter(client => {
      if (!channel) return true;
      return client.subscriptions.has(channel) || client.subscriptions.size === 0;
    });

    clientsToNotify.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Failed to broadcast to client ${client.id}:`, error);
          this.clients.delete(client.id);
        }
      }
    });

    console.log(`Broadcasted ${message.type} to ${clientsToNotify.length} clients`);
  }

  /**
   * Add message to history for late-joining clients
   */
  private addToHistory(channel: string, message: WebSocketMessage): void {
    if (!this.messageHistory.has(channel)) {
      this.messageHistory.set(channel, []);
    }

    const history = this.messageHistory.get(channel)!;
    history.push(message);

    // Keep only recent messages
    if (history.length > this.MAX_HISTORY_SIZE) {
      history.splice(0, history.length - this.MAX_HISTORY_SIZE);
    }
  }

  /**
   * Get message history for a channel
   */
  public getHistory(channel: string): WebSocketMessage[] {
    return this.messageHistory.get(channel) || [];
  }

  /**
   * Setup heartbeat to detect dead connections
   */
  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          console.log(`Terminating dead connection: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }

        client.isAlive = false;
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        }
      });
    }, 30000); // 30 seconds
  }

  /**
   * Get connection statistics
   */
  public getStats(): {
    totalConnections: number;
    activeConnections: number;
    channels: string[];
    uptime: number;
  } {
    const channels = new Set<string>();
    this.clients.forEach(client => {
      client.subscriptions.forEach(sub => channels.add(sub));
    });

    return {
      totalConnections: this.clients.size,
      activeConnections: Array.from(this.clients.values())
        .filter(client => client.ws.readyState === WebSocket.OPEN).length,
      channels: Array.from(channels),
      uptime: process.uptime()
    };
  }

  /**
   * Gracefully shutdown WebSocket server
   */
  public shutdown(): Promise<void> {
    return new Promise((resolve) => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Close all client connections
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.close(1000, 'Server shutdown');
        }
      });

      this.clients.clear();

      if (this.wss) {
        this.wss.close(() => {
          console.log('WebSocket server closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();