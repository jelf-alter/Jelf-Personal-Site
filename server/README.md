# Personal Website Backend API

This is the Node.js/Express backend server for the personal website and demo platform.

## Features

- RESTful API endpoints for demo applications and configuration
- ELT pipeline simulation with real-time progress tracking
- CORS support for frontend integration
- Rate limiting and security middleware
- TypeScript implementation with comprehensive type definitions
- Comprehensive test coverage

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Demo Endpoints
- `GET /api/demo` - Get all available demos
- `GET /api/demo/:id` - Get specific demo by ID
- `GET /api/demo/elt/datasets` - Get sample datasets for ELT pipeline
- `POST /api/demo/elt/execute` - Execute ELT pipeline with dataset
- `GET /api/demo/elt/status/:executionId` - Get pipeline execution status

### Configuration Endpoints
- `GET /api/config` - Get application configuration
- `GET /api/config/profile` - Get user profile information
- `GET /api/config/demos` - Get demo applications configuration
- `GET /api/config/testing` - Get testing configuration

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Running the Server
```bash
# Development mode with hot reload
npm run dev:server

# Production build
npm run build:server
npm start
```

### Testing
```bash
# Run server tests
npm run test:server

# Run server tests in watch mode
npm run test:server:watch
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Features

- Helmet.js for security headers
- CORS configuration for cross-origin requests
- Rate limiting to prevent abuse
- Input validation and sanitization
- Error handling with appropriate HTTP status codes

## Architecture

The server follows a modular architecture:

- `index.ts` - Main server setup and middleware configuration
- `routes/` - API route handlers
- `services/` - Business logic and data management
- `types/` - TypeScript interface definitions
- `__tests__/` - Test files

## ELT Pipeline Simulation

The server includes a simulated ELT (Extract, Load, Transform) pipeline that:

1. Accepts sample datasets for processing
2. Simulates realistic processing times and progress updates
3. Provides real-time status updates
4. Returns processed results with metadata

This demonstrates data processing capabilities and real-time visualization support.