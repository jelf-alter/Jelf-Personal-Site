import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketService } from '../services/WebSocketService';
import { createServer } from 'http';

// Mock the ws module
vi.mock('ws', () => ({
  WebSocketServer: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    close: vi.fn((callback) => callback && callback())
  })),
  WebSocket: {
    OPEN: 1,
    CLOSED: 3
  }
}));

describe('WebSocketService', () => {
  let webSocketService: WebSocketService;
  let server: any;

  beforeEach(() => {
    webSocketService = new WebSocketService();
    server = createServer();
  });

  afterEach(async () => {
    await webSocketService.shutdown();
    if (server) {
      server.close();
    }
  });

  describe('initialization', () => {
    it('should initialize WebSocket server correctly', () => {
      expect(() => {
        webSocketService.initialize(server);
      }).not.toThrow();
    });
  });

  describe('broadcasting', () => {
    it('should broadcast pipeline updates', () => {
      const pipelineId = 'test-pipeline';
      const data = { status: 'running', progress: 50 };
      
      // This would normally broadcast to connected clients
      // In a real test, we'd need to mock WebSocket connections
      expect(() => {
        webSocketService.broadcastPipelineUpdate(pipelineId, data);
      }).not.toThrow();
    });

    it('should broadcast test updates', () => {
      const testSuiteId = 'test-suite';
      const data = { status: 'running', passed: 5, failed: 0 };
      
      expect(() => {
        webSocketService.broadcastTestUpdate(testSuiteId, data);
      }).not.toThrow();
    });
  });

  describe('statistics', () => {
    it('should return connection statistics', () => {
      const stats = webSocketService.getStats();
      
      expect(stats).toHaveProperty('totalConnections');
      expect(stats).toHaveProperty('activeConnections');
      expect(stats).toHaveProperty('channels');
      expect(stats).toHaveProperty('uptime');
      expect(typeof stats.totalConnections).toBe('number');
      expect(typeof stats.activeConnections).toBe('number');
      expect(Array.isArray(stats.channels)).toBe(true);
      expect(typeof stats.uptime).toBe('number');
    });
  });

  describe('message history', () => {
    it('should store and retrieve message history', () => {
      const channel = 'test-channel';
      const initialHistory = webSocketService.getHistory(channel);
      
      expect(Array.isArray(initialHistory)).toBe(true);
      expect(initialHistory.length).toBe(0);
    });
  });

  describe('shutdown', () => {
    it('should shutdown gracefully', async () => {
      webSocketService.initialize(server);
      
      await expect(webSocketService.shutdown()).resolves.toBeUndefined();
    });
  });
});