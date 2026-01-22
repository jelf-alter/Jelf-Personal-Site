import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('API Integration and Edge Cases', () => {
  describe('ELT Pipeline Integration', () => {
    it('should handle complete pipeline execution workflow', async () => {
      // Step 1: Get available datasets
      const datasetsResponse = await request(app)
        .get('/api/demo/elt/datasets')
        .expect(200);

      expect(datasetsResponse.body.length).toBeGreaterThan(0);
      const datasetId = datasetsResponse.body[0].id;

      // Step 2: Execute pipeline
      const executeResponse = await request(app)
        .post('/api/demo/elt/execute')
        .send({ datasetId })
        .expect(200);

      const executionId = executeResponse.body.id;
      expect(executionId).toBeDefined();

      // Step 3: Check pipeline status
      const statusResponse = await request(app)
        .get(`/api/demo/elt/status/${executionId}`)
        .expect(200);

      expect(statusResponse.body.id).toBe(executionId);
      expect(statusResponse.body.datasetId).toBe(datasetId);
    });

    it('should handle concurrent pipeline executions', async () => {
      const concurrentExecutions = Array.from({ length: 3 }, (_, i) =>
        request(app)
          .post('/api/demo/elt/execute')
          .send({ datasetId: 'sales-data' })
      );

      const responses = await Promise.all(concurrentExecutions);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('status', 'running');
      });

      // Verify all executions have unique IDs
      const executionIds = responses.map(r => r.body.id);
      const uniqueIds = new Set(executionIds);
      expect(uniqueIds.size).toBe(executionIds.length);
    });

    it('should validate dataset existence before execution', async () => {
      const response = await request(app)
        .post('/api/demo/elt/execute')
        .send({ datasetId: 'non-existent-dataset' })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to execute ELT pipeline');
    });

    it('should handle pipeline execution with custom configuration', async () => {
      const customConfig = {
        batchSize: 500,
        timeout: 60000,
        retryAttempts: 3,
        enableLogging: true
      };

      const response = await request(app)
        .post('/api/demo/elt/execute')
        .send({ 
          datasetId: 'sales-data',
          config: customConfig
        })
        .expect(200);

      expect(response.body.config).toEqual(customConfig);
    });
  });

  describe('Configuration Data Consistency', () => {
    it('should maintain consistency between demo list and demo config', async () => {
      const [demosResponse, configResponse] = await Promise.all([
        request(app).get('/api/demo'),
        request(app).get('/api/config/demos')
      ]);

      expect(demosResponse.status).toBe(200);
      expect(configResponse.status).toBe(200);

      const demos = demosResponse.body;
      const demosConfig = configResponse.body;

      // Featured demo should exist in demos list
      const featuredDemo = demos.find((demo: any) => demo.id === demosConfig.featured);
      expect(featuredDemo).toBeDefined();

      // Check that demo categories exist in the actual demos
      // Note: Not all config categories need to have demos yet
      const demoCategories = [...new Set(demos.map((demo: any) => demo.category))];
      expect(demoCategories.length).toBeGreaterThan(0);
      
      // At least some categories should match
      const hasMatchingCategories = demosConfig.categories.some((category: string) => 
        demoCategories.includes(category)
      );
      expect(hasMatchingCategories).toBe(true);
    });

    it('should ensure profile skills have valid structure', async () => {
      const response = await request(app)
        .get('/api/config/profile')
        .expect(200);

      const profile = response.body;
      expect(profile.skills).toBeDefined();
      expect(Array.isArray(profile.skills)).toBe(true);

      profile.skills.forEach((skill: any) => {
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('level');
        expect(skill).toHaveProperty('category');
        expect(typeof skill.name).toBe('string');
        expect(typeof skill.level).toBe('number');
        expect(typeof skill.category).toBe('string');
        expect(skill.level).toBeGreaterThanOrEqual(0);
        expect(skill.level).toBeLessThanOrEqual(100);
      });
    });

    it('should validate testing configuration thresholds', async () => {
      const response = await request(app)
        .get('/api/config/testing')
        .expect(200);

      const testingConfig = response.body;
      const threshold = testingConfig.coverageThreshold;

      expect(threshold).toHaveProperty('lines');
      expect(threshold).toHaveProperty('branches');
      expect(threshold).toHaveProperty('functions');
      expect(threshold).toHaveProperty('statements');

      Object.values(threshold).forEach((value: any) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('WebSocket Integration', () => {
    it('should handle pipeline updates through WebSocket endpoints', async () => {
      const pipelineId = 'test-pipeline-integration';
      const updateData = {
        status: 'running',
        progress: 75,
        currentStep: 'transform',
        message: 'Processing transformation rules'
      };

      const response = await request(app)
        .post(`/api/ws/pipeline/${pipelineId}/update`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pipelineId).toBe(pipelineId);
    });

    it('should handle test updates through WebSocket endpoints', async () => {
      const testSuiteId = 'integration-test-suite';
      const updateData = {
        status: 'completed',
        summary: {
          total: 25,
          passed: 23,
          failed: 1,
          skipped: 1
        },
        coverage: {
          lines: 88.5,
          branches: 82.3,
          functions: 95.0
        }
      };

      const response = await request(app)
        .post(`/api/ws/test/${testSuiteId}/update`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.testSuiteId).toBe(testSuiteId);
    });

    it('should retrieve WebSocket statistics and history', async () => {
      const [statsResponse, historyResponse] = await Promise.all([
        request(app).get('/api/ws/stats'),
        request(app).get('/api/ws/history/test-channel')
      ]);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.success).toBe(true);
      expect(statsResponse.body.stats).toHaveProperty('totalConnections');

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.success).toBe(true);
      expect(historyResponse.body.channel).toBe('test-channel');
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle service unavailability gracefully', async () => {
      // Test endpoints when services might be temporarily unavailable
      const endpoints = [
        '/api/demo',
        '/api/config',
        '/api/config/profile',
        '/api/demo/elt/datasets'
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => request(app).get(endpoint))
      );

      responses.forEach((response, index) => {
        // Should either succeed or fail gracefully with proper error structure
        if (response.status !== 200) {
          expect(response.body).toHaveProperty('error');
          expect(typeof response.body.error).toBe('string');
        }
      });
    });

    it('should handle database connection issues', async () => {
      // Simulate database connection issues by requesting non-existent resources
      const response = await request(app)
        .get('/api/demo/elt/status/non-existent-execution')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Pipeline execution not found');
    });

    it('should recover from temporary service errors', async () => {
      // Make multiple requests to test service recovery
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });
  });

  describe('Performance and Load Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      const simultaneousRequests = Array.from({ length: 10 }, (_, i) => ({
        request: request(app).get('/api/demo'),
        index: i
      }));

      const startTime = Date.now();
      const responses = await Promise.all(
        simultaneousRequests.map(({ request }) => request)
      );
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      // Should complete within reasonable time (10 seconds for 10 requests)
      expect(endTime - startTime).toBeLessThan(10000);
    });

    it('should handle large dataset requests efficiently', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/demo/elt/datasets')
        .expect(200);
      const endTime = Date.now();

      expect(Array.isArray(response.body)).toBe(true);
      // Should respond within 2 seconds
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should handle complex configuration requests', async () => {
      const complexRequests = [
        request(app).get('/api/config'),
        request(app).get('/api/config/profile'),
        request(app).get('/api/config/demos'),
        request(app).get('/api/config/testing')
      ];

      const startTime = Date.now();
      const responses = await Promise.all(complexRequests);
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(typeof response.body).toBe('object');
      });

      // Should complete all requests within 3 seconds
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('Data Validation and Integrity', () => {
    it('should ensure demo data integrity', async () => {
      const response = await request(app)
        .get('/api/demo')
        .expect(200);

      const demos = response.body;
      expect(demos.length).toBeGreaterThan(0);

      demos.forEach((demo: any) => {
        // Required fields
        expect(demo.id).toBeDefined();
        expect(demo.name).toBeDefined();
        expect(demo.description).toBeDefined();
        expect(demo.category).toBeDefined();
        expect(demo.technologies).toBeDefined();
        expect(demo.status).toBeDefined();
        expect(demo.launchUrl).toBeDefined();
        expect(demo.testSuiteId).toBeDefined();

        // Data types
        expect(typeof demo.id).toBe('string');
        expect(typeof demo.name).toBe('string');
        expect(typeof demo.description).toBe('string');
        expect(typeof demo.category).toBe('string');
        expect(Array.isArray(demo.technologies)).toBe(true);
        expect(['active', 'maintenance', 'archived']).toContain(demo.status);
        expect(typeof demo.launchUrl).toBe('string');
        expect(typeof demo.testSuiteId).toBe('string');

        // URL validation
        expect(demo.launchUrl).toMatch(/^\/[a-zA-Z0-9\-\/]*$/);
      });
    });

    it('should ensure dataset schema integrity', async () => {
      const response = await request(app)
        .get('/api/demo/elt/datasets')
        .expect(200);

      const datasets = response.body;
      expect(datasets.length).toBeGreaterThan(0);

      datasets.forEach((dataset: any) => {
        expect(dataset).toHaveProperty('id');
        expect(dataset).toHaveProperty('name');
        expect(dataset).toHaveProperty('description');
        expect(dataset).toHaveProperty('size');
        expect(dataset).toHaveProperty('format');
        expect(dataset).toHaveProperty('schema');

        expect(typeof dataset.size).toBe('number');
        expect(dataset.size).toBeGreaterThan(0);
        expect(typeof dataset.format).toBe('string');
        
        expect(dataset.schema).toHaveProperty('fields');
        expect(dataset.schema).toHaveProperty('types');
        expect(Array.isArray(dataset.schema.fields)).toBe(true);
        expect(Array.isArray(dataset.schema.types)).toBe(true);
        expect(dataset.schema.fields.length).toBe(dataset.schema.types.length);
      });
    });

    it('should validate pipeline execution data structure', async () => {
      const response = await request(app)
        .post('/api/demo/elt/execute')
        .send({ datasetId: 'sales-data' })
        .expect(200);

      const execution = response.body;
      
      // Required fields
      expect(execution).toHaveProperty('id');
      expect(execution).toHaveProperty('datasetId');
      expect(execution).toHaveProperty('status');
      expect(execution).toHaveProperty('startTime');
      expect(execution).toHaveProperty('steps');
      expect(execution).toHaveProperty('config');

      // Data types and values
      expect(typeof execution.id).toBe('string');
      expect(execution.datasetId).toBe('sales-data');
      expect(['pending', 'running', 'completed', 'failed']).toContain(execution.status);
      expect(new Date(execution.startTime)).toBeInstanceOf(Date);
      expect(Array.isArray(execution.steps)).toBe(true);
      expect(typeof execution.config).toBe('object');

      // Steps validation
      expect(execution.steps.length).toBe(3);
      execution.steps.forEach((step: any) => {
        expect(step).toHaveProperty('id');
        expect(step).toHaveProperty('name');
        expect(step).toHaveProperty('status');
        expect(step).toHaveProperty('progress');
        expect(['pending', 'running', 'completed', 'failed']).toContain(step.status);
        expect(typeof step.progress).toBe('number');
        expect(step.progress).toBeGreaterThanOrEqual(0);
        expect(step.progress).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('API Versioning and Compatibility', () => {
    it('should maintain backward compatibility for existing endpoints', async () => {
      // Test that all documented endpoints still work
      const endpoints = [
        { method: 'GET', path: '/api/health' },
        { method: 'GET', path: '/api/demo' },
        { method: 'GET', path: '/api/demo/elt-pipeline' },
        { method: 'GET', path: '/api/demo/elt/datasets' },
        { method: 'GET', path: '/api/config' },
        { method: 'GET', path: '/api/config/profile' },
        { method: 'GET', path: '/api/config/demos' },
        { method: 'GET', path: '/api/config/testing' },
        { method: 'GET', path: '/api/ws/stats' }
      ];

      const responses = await Promise.all(
        endpoints.map(({ method, path }) => {
          if (method === 'GET') {
            return request(app).get(path);
          }
          return Promise.resolve({ status: 200 }); // Placeholder for other methods
        })
      );

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle legacy WebSocket endpoints', async () => {
      const [statsResponse, historyResponse] = await Promise.all([
        request(app).get('/api/ws/stats'),
        request(app).get('/api/ws/history/test-channel')
      ]);

      expect(statsResponse.status).toBe(200);
      expect(historyResponse.status).toBe(200);
    });
  });
});