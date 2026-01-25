// Test individual imports to find the issue
console.log('Testing imports...');

try {
  console.log('1. Testing express...');
  const express = await import('express');
  console.log('✓ express imported');

  console.log('2. Testing cors...');
  const cors = await import('cors');
  console.log('✓ cors imported');

  console.log('3. Testing helmet...');
  const helmet = await import('helmet');
  console.log('✓ helmet imported');

  console.log('4. Testing express-rate-limit...');
  const rateLimit = await import('express-rate-limit');
  console.log('✓ express-rate-limit imported');

  console.log('5. Testing http...');
  const { createServer } = await import('http');
  console.log('✓ http imported');

  console.log('6. Testing demo routes...');
  const { demoRoutes } = await import('./server/routes/demo.js');
  console.log('✓ demo routes imported');

  console.log('7. Testing config routes...');
  const { configRoutes } = await import('./server/routes/config.js');
  console.log('✓ config routes imported');

  console.log('8. Testing websocket routes...');
  const { websocketRoutes } = await import('./server/routes/websocket.js');
  console.log('✓ websocket routes imported');

  console.log('9. Testing WebSocket service...');
  const { webSocketService } = await import('./server/services/WebSocketService.js');
  console.log('✓ WebSocket service imported');

  console.log('All imports successful!');
} catch (error) {
  console.error('Import failed:', error);
}