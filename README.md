# Personal Website & Demo Platform

A Vue.js-based personal website showcasing full-stack development capabilities, featuring transparent data processing demonstrations and comprehensive public testing visibility.

## Features

- **Professional Landing Page**: Resume highlights and skills showcase
- **ELT Pipeline Demo**: Interactive data processing visualization (coming soon)
- **Testing Dashboard**: Public visibility into code quality and coverage
- **Responsive Design**: Mobile-first, accessible design
- **Modern Stack**: Vue.js 3, TypeScript, Vite, Vitest

## Prerequisites

Before running this project, make sure you have Node.js installed:

1. **Install Node.js**: Download and install from [nodejs.org](https://nodejs.org/)
   - Recommended version: 18.x or higher
   - This will also install npm (Node Package Manager)

2. **Verify Installation**:
   ```bash
   node --version
   npm --version
   ```

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

3. **Run Tests**:
   ```bash
   npm run test
   ```

4. **Run Tests with Coverage**:
   ```bash
   npm run test:coverage
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Preview Production Build**:
   ```bash
   npm run preview
   ```

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/         # Reusable Vue components
├── views/             # Page-level components
├── router/            # Vue Router configuration
├── stores/            # Pinia state management
├── assets/            # Static assets and styles
└── utils/             # Helper functions
```

## Technology Stack

- **Frontend**: Vue.js 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest + Vue Test Utils
- **Routing**: Vue Router
- **State Management**: Pinia
- **Styling**: CSS3 with modern features
- **Code Quality**: ESLint + Prettier

## Next Steps

This is the foundation setup. The following features will be implemented in subsequent tasks:

1. Enhanced landing page components
2. ELT pipeline demo with real-time visualization
3. Comprehensive testing dashboard
4. Backend API integration
5. Property-based testing implementation
6. Performance optimization
7. Deployment configuration

## Contributing

This is a personal project, but feedback and suggestions are welcome!