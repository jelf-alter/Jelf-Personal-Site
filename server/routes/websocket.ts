import { Router } from 'express';
import { webSocketService } from '../services/WebSocketService.js';

const router = Router();

/**
 * Trigger pipeline update broadcast
 */
router.post('/pipeline/:pipelineId/update', (req, res) => {
  try {
    const { pipelineId } = req.params;
    const updateData = req.body;

    // Validate required fields
    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({
        error: 'Invalid update data',
        message: 'Request body must contain update data object'
      });
    }

    // Broadcast the update
    webSocketService.broadcastPipelineUpdate(pipelineId, updateData);

    res.json({
      success: true,
      message: 'Pipeline update broadcasted',
      pipelineId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Pipeline update broadcast error:', error);
    res.status(500).json({
      error: 'Failed to broadcast pipeline update',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Trigger test update broadcast
 */
router.post('/test/:testSuiteId/update', (req, res) => {
  try {
    const { testSuiteId } = req.params;
    const updateData = req.body;

    // Validate required fields
    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({
        error: 'Invalid update data',
        message: 'Request body must contain update data object'
      });
    }

    // Broadcast the update
    webSocketService.broadcastTestUpdate(testSuiteId, updateData);

    res.json({
      success: true,
      message: 'Test update broadcasted',
      testSuiteId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test update broadcast error:', error);
    res.status(500).json({
      error: 'Failed to broadcast test update',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get WebSocket connection statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = webSocketService.getStats();
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('WebSocket stats error:', error);
    res.status(500).json({
      error: 'Failed to get WebSocket stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get message history for a channel
 */
router.get('/history/:channel', (req, res) => {
  try {
    const { channel } = req.params;
    const { limit } = req.query;
    
    let history = webSocketService.getHistory(channel);
    
    // Apply limit if specified
    if (limit && !isNaN(Number(limit))) {
      const limitNum = Math.max(1, Math.min(100, Number(limit))); // Between 1 and 100
      history = history.slice(-limitNum);
    }

    res.json({
      success: true,
      channel,
      history,
      count: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('WebSocket history error:', error);
    res.status(500).json({
      error: 'Failed to get message history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as websocketRoutes };