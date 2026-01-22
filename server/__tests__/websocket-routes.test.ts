import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { websocketRoutes } from '../routes/websocket';

// Mock the WebSocketService
vi.mock('../services/WebSocketService', () => ({
  webSocketService: {
    broadcastPipelineUpdate: vi.fn(),
    broadcastTestUpdate: vi.fn(),
    getStats: vi.fn(() => ({
      totalConnections: 0,
      activeConnections: 0,
      channels: [],
      uptime: 123
    })),
    getHistory: vi.fn(() => [])
  }
}));

describe('WebSocket Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/ws', websocketRoutes);
  });

  describe('POST /api/ws/pipeline/:pipelineId/update', () => {
    it('should broadcast pipeline update successfully', async () => {
      const pipelineId = 'test-pipeline';
      const updateData = { status: 'running', progress: 50 };

      const response = await request(app)
        .post(`/api/ws/pipeline/${pipelineId}/update`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Pipeline update broadcasted',
        pipelineId,
        timestamp: expect.any(String)
      });
    });

    it('should return 400 for invalid update data', async () => {
      const pipelineId = 'test-pipeline';

      const response = await request(app)
        .post(`/api/ws/pipeline/${pipelineId}/update`)
        .send(null)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Invalid update data',
        message: 'Request body must contain update data object'
      });
    });
  });

  describe('POST /api/ws/test/:testSuiteId/update', () => {
    it('should broadcast test update successfully', async () => {
      const testSuiteId = 'test-suite';
      const updateData = { status: 'running', passed: 5, failed: 0 };

      const response = await request(app)
        .post(`/api/ws/test/${testSuiteId}/update`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Test update broadcasted',
        testSuiteId,
        timestamp: expect.any(String)
      });
    });

    it('should return 400 for invalid update data', async () => {
      const testSuiteId = 'test-suite';

      const response = await request(app)
        .post(`/api/ws/test/${testSuiteId}/update`)
        .send('')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Invalid update data',
        message: 'Request body must contain update data object'
      });
    });
  });

  describe('GET /api/ws/stats', () => {
    it('should return WebSocket statistics', async () => {
      const response = await request(app)
        .get('/api/ws/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        stats: {
          totalConnections: expect.any(Number),
          activeConnections: expect.any(Number),
          channels: expect.any(Array),
          uptime: expect.any(Number)
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('GET /api/ws/history/:channel', () => {
    it('should return message history for a channel', async () => {
      const channel = 'test-channel';

      const response = await request(app)
        .get(`/api/ws/history/${channel}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        channel,
        history: expect.any(Array),
        count: expect.any(Number),
        timestamp: expect.any(String)
      });
    });

    it('should apply limit parameter', async () => {
      const channel = 'test-channel';
      const limit = 5;

      const response = await request(app)
        .get(`/api/ws/history/${channel}?limit=${limit}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        channel,
        history: expect.any(Array),
        count: expect.any(Number),
        timestamp: expect.any(String)
      });
    });
  });
});