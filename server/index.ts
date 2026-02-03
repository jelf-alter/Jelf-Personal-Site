import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { demoRoutes } from './routes/demo.js';
import { configRoutes } from './routes/config.js';
import { websocketRoutes } from './routes/websocket.js';
import { testRoutes } from './routes/test.js';
import { seoRoutes } from './routes/seo.js';
import { webSocketService } from './services/WebSocketService.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with actual domain
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/demo', demoRoutes);
app.use('/api/config', configRoutes);
app.use('/api/ws', websocketRoutes);
app.use('/api/test', testRoutes);
app.use('/api/seo', seoRoutes);

// SEO files at root level
app.get('/sitemap.xml', (req, res) => {
  res.redirect('/api/seo/sitemap.xml');
});

app.get('/robots.txt', (req, res) => {
  res.redirect('/api/seo/robots.txt');
});

// WebSocket stats endpoint (legacy - now available via /api/ws/stats)
app.get('/api/ws/stats', (req, res) => {
  res.json(webSocketService.getStats());
});

// WebSocket history endpoint (legacy - now available via /api/ws/history/:channel)
app.get('/api/ws/history/:channel', (req, res) => {
  const { channel } = req.params;
  const history = webSocketService.getHistory(channel);
  res.json({ channel, history });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize WebSocket server
  webSocketService.initialize(server);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await webSocketService.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await webSocketService.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;