// Simple server test script
import express from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`✅ Try: http://localhost:${PORT}/api/health`);
  console.log(`✅ Try: http://localhost:${PORT}/test`);
});