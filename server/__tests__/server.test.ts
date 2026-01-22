import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Express Server', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Demo Endpoints', () => {
    it('should return all demos', async () => {
      const response = await request(app)
        .get('/api/demo')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should return specific demo by ID', async () => {
      const response = await request(app)
        .get('/api/demo/elt-pipeline')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'elt-pipeline');
      expect(response.body).toHaveProperty('name', 'ELT Data Pipeline');
    });

    it('should return 404 for non-existent demo', async () => {
      const response = await request(app)
        .get('/api/demo/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Demo not found');
    });

    it('should return sample datasets', async () => {
      const response = await request(app)
        .get('/api/demo/elt/datasets')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('schema');
    });

    it('should execute ELT pipeline', async () => {
      const response = await request(app)
        .post('/api/demo/elt/execute')
        .send({ datasetId: 'sales-data' })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('datasetId', 'sales-data');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('steps');
      expect(Array.isArray(response.body.steps)).toBe(true);
    });

    it('should return 400 for ELT pipeline without datasetId', async () => {
      const response = await request(app)
        .post('/api/demo/elt/execute')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Dataset ID is required');
    });
  });

  describe('Configuration Endpoints', () => {
    it('should return app configuration', async () => {
      const response = await request(app)
        .get('/api/config')
        .expect(200);

      expect(response.body).toHaveProperty('siteName');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('features');
    });

    it('should return user profile', async () => {
      const response = await request(app)
        .get('/api/config/profile')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('skills');
      expect(Array.isArray(response.body.skills)).toBe(true);
    });

    it('should return demos configuration', async () => {
      const response = await request(app)
        .get('/api/config/demos')
        .expect(200);

      expect(response.body).toHaveProperty('featured');
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
    });

    it('should return testing configuration', async () => {
      const response = await request(app)
        .get('/api/config/testing')
        .expect(200);

      expect(response.body).toHaveProperty('frameworks');
      expect(response.body).toHaveProperty('coverageThreshold');
      expect(Array.isArray(response.body.frameworks)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });
});