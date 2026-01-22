import express from 'express';
import { DemoService } from '../services/DemoService.js';

const router = express.Router();
const demoService = new DemoService();

// Get all available demos
router.get('/', async (req, res) => {
  try {
    const demos = await demoService.getAllDemos();
    res.json(demos);
  } catch (error) {
    console.error('Error fetching demos:', error);
    res.status(500).json({ error: 'Failed to fetch demos' });
  }
});

// Get specific demo by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const demo = await demoService.getDemoById(id);
    
    if (!demo) {
      return res.status(404).json({ error: 'Demo not found' });
    }
    
    return res.json(demo);
  } catch (error) {
    console.error('Error fetching demo:', error);
    return res.status(500).json({ error: 'Failed to fetch demo' });
  }
});

// Get sample datasets for ELT pipeline
router.get('/elt/datasets', async (req, res) => {
  try {
    const datasets = await demoService.getSampleDatasets();
    res.json(datasets);
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// Execute ELT pipeline
router.post('/elt/execute', async (req, res) => {
  try {
    const { datasetId, config } = req.body;
    
    if (!datasetId) {
      return res.status(400).json({ error: 'Dataset ID is required' });
    }
    
    const result = await demoService.executeELTPipeline(datasetId, config);
    return res.json(result);
  } catch (error) {
    console.error('Error executing ELT pipeline:', error);
    return res.status(500).json({ error: 'Failed to execute ELT pipeline' });
  }
});

// Get ELT pipeline status
router.get('/elt/status/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    const status = await demoService.getPipelineStatus(executionId);
    
    if (!status) {
      return res.status(404).json({ error: 'Pipeline execution not found' });
    }
    
    return res.json(status);
  } catch (error) {
    console.error('Error fetching pipeline status:', error);
    return res.status(500).json({ error: 'Failed to fetch pipeline status' });
  }
});

export { router as demoRoutes };