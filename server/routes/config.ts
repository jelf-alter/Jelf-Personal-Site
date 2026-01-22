import express from 'express';
import { ConfigService } from '../services/ConfigService.js';

const router = express.Router();
const configService = new ConfigService();

// Get application configuration
router.get('/', async (req, res) => {
  try {
    const config = await configService.getAppConfig();
    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Get user profile information
router.get('/profile', async (req, res) => {
  try {
    const profile = await configService.getUserProfile();
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get demo applications configuration
router.get('/demos', async (req, res) => {
  try {
    const demosConfig = await configService.getDemosConfig();
    res.json(demosConfig);
  } catch (error) {
    console.error('Error fetching demos config:', error);
    res.status(500).json({ error: 'Failed to fetch demos configuration' });
  }
});

// Get testing configuration
router.get('/testing', async (req, res) => {
  try {
    const testingConfig = await configService.getTestingConfig();
    res.json(testingConfig);
  } catch (error) {
    console.error('Error fetching testing config:', error);
    res.status(500).json({ error: 'Failed to fetch testing configuration' });
  }
});

export { router as configRoutes };