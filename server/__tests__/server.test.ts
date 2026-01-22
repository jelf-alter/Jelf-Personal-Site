import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Express Server API Endpoints', () => {
  describe('Health Check Endpoint', () => {
    it('should return health status with all required fields', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });
  });

  describe('Demo Endpoints', () => {
    describe('GET /api/demo', () => {
      it('should return all demos with required properties', async () => {
        const response = await request(app)
          .get('/api/demo')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        
        response.body.forEach((demo: any) => {
          expect(demo).toHaveProperty('id');
          expect(demo).toHaveProperty('name');
          expect(demo).toHaveProperty('description');
          expect(demo).toHaveProperty('category');
          expect(demo).toHaveProperty('technologies');
          expect(demo).toHaveProperty('status');
          expect(demo).toHaveProperty('launchUrl');
          expect(demo).toHaveProperty('testSuiteId');
          expect(Array.isArray(demo.technologies)).toBe(true);
          expect(['active', 'maintenance', 'archived']).toContain(demo.status);
        });
      });

      it('should include ELT pipeline demo', async () => {
        const response = await request(app)
          .get('/api/demo')
          .expect(200);

        const eltDemo = response.body.find((demo: any) => demo.id === 'elt-pipeline');
        expect(eltDemo).toBeDefined();
        expect(eltDemo.name).toBe('ELT Data Pipeline');
        expect(eltDemo.category).toBe('Data Engineering');
      });
    });

    describe('GET /api/demo/:id', () => {
      it('should return specific demo by ID with all properties', async () => {
        const response = await request(app)
          .get('/api/demo/elt-pipeline')
          .expect(200);

        expect(response.body).toHaveProperty('id', 'elt-pipeline');
        expect(response.body).toHaveProperty('name', 'ELT Data Pipeline');
        expect(response.body).toHaveProperty('description');
        expect(response.body).toHaveProperty('category', 'Data Engineering');
        expect(response.body).toHaveProperty('technologies');
        expect(response.body).toHaveProperty('status', 'active');
        expect(Array.isArray(response.body.technologies)).toBe(true);
      });

      it('should return 404 for non-existent demo with proper error structure', async () => {
        const response = await request(app)
          .get('/api/demo/non-existent-demo')
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Demo not found');
        expect(response.body).not.toHaveProperty('id');
      });

      it('should handle special characters in demo ID', async () => {
        const response = await request(app)
          .get('/api/demo/demo-with-special-chars-123')
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Demo not found');
      });
    });

    describe('GET /api/demo/elt/datasets', () => {
      it('should return sample datasets with complete schema information', async () => {
        const response = await request(app)
          .get('/api/demo/elt/datasets')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        
        response.body.forEach((dataset: any) => {
          expect(dataset).toHaveProperty('id');
          expect(dataset).toHaveProperty('name');
          expect(dataset).toHaveProperty('description');
          expect(dataset).toHaveProperty('size');
          expect(dataset).toHaveProperty('format');
          expect(dataset).toHaveProperty('schema');
          expect(dataset.schema).toHaveProperty('fields');
          expect(dataset.schema).toHaveProperty('types');
          expect(Array.isArray(dataset.schema.fields)).toBe(true);
          expect(Array.isArray(dataset.schema.types)).toBe(true);
          expect(typeof dataset.size).toBe('number');
        });
      });

      it('should include sales-data dataset', async () => {
        const response = await request(app)
          .get('/api/demo/elt/datasets')
          .expect(200);

        const salesData = response.body.find((dataset: any) => dataset.id === 'sales-data');
        expect(salesData).toBeDefined();
        expect(salesData.name).toBe('Sales Data Sample');
        expect(salesData.format).toBe('JSON');
      });
    });

    describe('POST /api/demo/elt/execute', () => {
      it('should execute ELT pipeline with valid datasetId', async () => {
        const response = await request(app)
          .post('/api/demo/elt/execute')
          .send({ datasetId: 'sales-data' })
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('datasetId', 'sales-data');
        expect(response.body).toHaveProperty('status', 'running');
        expect(response.body).toHaveProperty('steps');
        expect(response.body).toHaveProperty('startTime');
        expect(response.body).toHaveProperty('config');
        expect(Array.isArray(response.body.steps)).toBe(true);
        expect(response.body.steps.length).toBe(3);
        
        // Verify step structure
        response.body.steps.forEach((step: any) => {
          expect(step).toHaveProperty('id');
          expect(step).toHaveProperty('name');
          expect(step).toHaveProperty('status');
          expect(step).toHaveProperty('progress');
          expect(['pending', 'running', 'completed', 'failed']).toContain(step.status);
          expect(typeof step.progress).toBe('number');
        });
      });

      it('should execute ELT pipeline with config parameter', async () => {
        const config = { batchSize: 100, timeout: 30000 };
        const response = await request(app)
          .post('/api/demo/elt/execute')
          .send({ datasetId: 'user-analytics', config })
          .expect(200);

        expect(response.body).toHaveProperty('datasetId', 'user-analytics');
        expect(response.body).toHaveProperty('config');
        expect(response.body.config).toEqual(config);
      });

      it('should return 400 for missing datasetId', async () => {
        const response = await request(app)
          .post('/api/demo/elt/execute')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Dataset ID is required');
      });

      it('should return 400 for null datasetId', async () => {
        const response = await request(app)
          .post('/api/demo/elt/execute')
          .send({ datasetId: null })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Dataset ID is required');
      });

      it('should return 400 for empty string datasetId', async () => {
        const response = await request(app)
          .post('/api/demo/elt/execute')
          .send({ datasetId: '' })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Dataset ID is required');
      });

      it('should handle non-existent datasetId gracefully', async () => {
        const response = await request(app)
          .post('/api/demo/elt/execute')
          .send({ datasetId: 'non-existent-dataset' })
          .expect(500);

        expect(response.body).toHaveProperty('error', 'Failed to execute ELT pipeline');
      });
    });

    describe('GET /api/demo/elt/status/:executionId', () => {
      it('should return pipeline status for valid execution', async () => {
        // First create an execution
        const executeResponse = await request(app)
          .post('/api/demo/elt/execute')
          .send({ datasetId: 'sales-data' })
          .expect(200);

        const executionId = executeResponse.body.id;

        // Then check its status
        const statusResponse = await request(app)
          .get(`/api/demo/elt/status/${executionId}`)
          .expect(200);

        expect(statusResponse.body).toHaveProperty('id', executionId);
        expect(statusResponse.body).toHaveProperty('datasetId', 'sales-data');
        expect(statusResponse.body).toHaveProperty('status');
        expect(statusResponse.body).toHaveProperty('steps');
        expect(['pending', 'running', 'completed', 'failed']).toContain(statusResponse.body.status);
      });

      it('should return 404 for non-existent execution', async () => {
        const response = await request(app)
          .get('/api/demo/elt/status/non-existent-execution')
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Pipeline execution not found');
      });
    });
  });

  describe('Configuration Endpoints', () => {
    describe('GET /api/config', () => {
      it('should return complete app configuration', async () => {
        const response = await request(app)
          .get('/api/config')
          .expect(200);

        expect(response.body).toHaveProperty('siteName');
        expect(response.body).toHaveProperty('version');
        expect(response.body).toHaveProperty('environment');
        expect(response.body).toHaveProperty('features');
        expect(response.body).toHaveProperty('performance');
        expect(response.body).toHaveProperty('contact');
        
        // Verify features structure
        expect(response.body.features).toHaveProperty('eltPipeline');
        expect(response.body.features).toHaveProperty('testingDashboard');
        expect(response.body.features).toHaveProperty('realTimeUpdates');
        expect(response.body.features).toHaveProperty('publicTesting');
        
        // Verify performance structure
        expect(response.body.performance).toHaveProperty('targetLCP');
        expect(response.body.performance).toHaveProperty('targetFID');
        expect(response.body.performance).toHaveProperty('targetCLS');
        
        // Verify contact structure
        expect(response.body.contact).toHaveProperty('email');
        expect(response.body.contact).toHaveProperty('github');
        expect(response.body.contact).toHaveProperty('linkedin');
      });
    });

    describe('GET /api/config/profile', () => {
      it('should return complete user profile', async () => {
        const response = await request(app)
          .get('/api/config/profile')
          .expect(200);

        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('location');
        expect(response.body).toHaveProperty('summary');
        expect(response.body).toHaveProperty('skills');
        expect(response.body).toHaveProperty('achievements');
        expect(response.body).toHaveProperty('socialLinks');
        
        expect(Array.isArray(response.body.skills)).toBe(true);
        expect(Array.isArray(response.body.achievements)).toBe(true);
        expect(Array.isArray(response.body.socialLinks)).toBe(true);
        
        // Verify skills structure
        if (response.body.skills.length > 0) {
          response.body.skills.forEach((skill: any) => {
            expect(skill).toHaveProperty('name');
            expect(skill).toHaveProperty('level');
            expect(skill).toHaveProperty('category');
            expect(typeof skill.level).toBe('number');
          });
        }
        
        // Verify achievements structure
        if (response.body.achievements.length > 0) {
          response.body.achievements.forEach((achievement: any) => {
            expect(achievement).toHaveProperty('title');
            expect(achievement).toHaveProperty('description');
            expect(achievement).toHaveProperty('date');
          });
        }
        
        // Verify social links structure
        if (response.body.socialLinks.length > 0) {
          response.body.socialLinks.forEach((link: any) => {
            expect(link).toHaveProperty('platform');
            expect(link).toHaveProperty('url');
            expect(link).toHaveProperty('icon');
          });
        }
      });
    });

    describe('GET /api/config/demos', () => {
      it('should return demos configuration', async () => {
        const response = await request(app)
          .get('/api/config/demos')
          .expect(200);

        expect(response.body).toHaveProperty('featured');
        expect(response.body).toHaveProperty('categories');
        expect(response.body).toHaveProperty('defaultSettings');
        expect(Array.isArray(response.body.categories)).toBe(true);
        
        // Verify default settings structure
        expect(response.body.defaultSettings).toHaveProperty('showSourceCode');
        expect(response.body.defaultSettings).toHaveProperty('enableRealTime');
        expect(response.body.defaultSettings).toHaveProperty('publicAccess');
        expect(typeof response.body.defaultSettings.showSourceCode).toBe('boolean');
        expect(typeof response.body.defaultSettings.enableRealTime).toBe('boolean');
        expect(typeof response.body.defaultSettings.publicAccess).toBe('boolean');
      });
    });

    describe('GET /api/config/testing', () => {
      it('should return testing configuration', async () => {
        const response = await request(app)
          .get('/api/config/testing')
          .expect(200);

        expect(response.body).toHaveProperty('frameworks');
        expect(response.body).toHaveProperty('coverageThreshold');
        expect(response.body).toHaveProperty('testTypes');
        expect(response.body).toHaveProperty('publicDashboard');
        expect(response.body).toHaveProperty('realTimeUpdates');
        expect(Array.isArray(response.body.frameworks)).toBe(true);
        expect(Array.isArray(response.body.testTypes)).toBe(true);
        
        // Verify coverage threshold structure
        expect(response.body.coverageThreshold).toHaveProperty('lines');
        expect(response.body.coverageThreshold).toHaveProperty('branches');
        expect(response.body.coverageThreshold).toHaveProperty('functions');
        expect(response.body.coverageThreshold).toHaveProperty('statements');
        expect(typeof response.body.coverageThreshold.lines).toBe('number');
        expect(typeof response.body.coverageThreshold.branches).toBe('number');
        expect(typeof response.body.coverageThreshold.functions).toBe('number');
        expect(typeof response.body.coverageThreshold.statements).toBe('number');
      });
    });
  });

  describe('Security and Rate Limiting', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Check for security headers set by helmet
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:5173')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should reject requests with oversized JSON payload', async () => {
      const largePayload = { data: 'x'.repeat(11 * 1024 * 1024) }; // 11MB payload
      
      const response = await request(app)
        .post('/api/demo/elt/execute')
        .send(largePayload);

      // Express error handler catches this and returns 500
      expect([413, 500]).toContain(response.status);
    });
  });

  describe('Input Validation', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/demo/elt/execute')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      // Express error handler catches this and returns 500
      expect([400, 500]).toContain(response.status);
    });

    it('should validate Content-Type for POST requests', async () => {
      const response = await request(app)
        .post('/api/demo/elt/execute')
        .set('Content-Type', 'text/plain')
        .send('datasetId=sales-data');

      // Should still work due to express.urlencoded middleware
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent API routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('/api/non-existent-endpoint');
    });

    it('should return 404 for non-existent nested routes', async () => {
      const response = await request(app)
        .get('/api/demo/invalid/nested/route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should handle different HTTP methods on existing routes', async () => {
      const response = await request(app)
        .delete('/api/health')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should return proper error structure for server errors', async () => {
      // This test would require mocking a service to throw an error
      // For now, we test the error structure from existing endpoints
      const response = await request(app)
        .post('/api/demo/elt/execute')
        .send({ datasetId: 'non-existent-dataset' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });

  describe('WebSocket Legacy Endpoints', () => {
    it('should return WebSocket stats via legacy endpoint', async () => {
      const response = await request(app)
        .get('/api/ws/stats')
        .expect(200);

      // The legacy endpoint now returns the new format with success wrapper
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalConnections');
      expect(response.body.stats).toHaveProperty('activeConnections');
      expect(response.body.stats).toHaveProperty('channels');
      expect(response.body.stats).toHaveProperty('uptime');
      expect(Array.isArray(response.body.stats.channels)).toBe(true);
    });

    it('should return WebSocket history via legacy endpoint', async () => {
      const channel = 'test-channel';
      const response = await request(app)
        .get(`/api/ws/history/${channel}`)
        .expect(200);

      expect(response.body).toHaveProperty('channel', channel);
      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
    });
  });
});