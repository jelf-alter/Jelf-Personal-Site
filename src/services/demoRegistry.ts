/**
 * Demo Registry Service
 * 
 * Provides centralized configuration and management for demo applications.
 * This service handles demo registration, configuration, and routing logic.
 */

import type { IDemoApplication } from '@/types'
import type { Component } from 'vue'

// Demo configuration interface
export interface IDemoConfig {
  id: string
  name: string
  description: string
  category: string
  technologies: string[]
  status: 'active' | 'maintenance' | 'archived'
  featured?: boolean
  component?: Component | (() => Promise<Component>)
  route: string
  testSuiteId: string
  sourceUrl?: string
  screenshots?: string[]
  requirements?: string[]
  documentation?: string
  apiEndpoints?: string[]
  websocketEvents?: string[]
  createdDate: Date
  lastUpdated: Date
  metadata?: Record<string, any>
}

// Demo category configuration
export interface IDemoCategory {
  id: string
  name: string
  description: string
  icon?: string
  order: number
}

// Demo registry class
export class DemoRegistry {
  private demos = new Map<string, IDemoConfig>()
  private categories = new Map<string, IDemoCategory>()
  private routeMap = new Map<string, string>()

  constructor() {
    this.initializeCategories()
    this.initializeDemos()
  }

  /**
   * Initialize demo categories
   */
  private initializeCategories(): void {
    const categories: IDemoCategory[] = [
      {
        id: 'data-processing',
        name: 'Data Processing',
        description: 'Advanced demonstrations of data transformation, pipeline operations, and ETL/ELT workflows. Features our flagship ELT Pipeline demo showcasing enterprise-grade data engineering capabilities.',
        icon: '🔄',
        order: 1
      },
      {
        id: 'real-time',
        name: 'Real-time Applications',
        description: 'Live data streaming, WebSocket communication, and real-time user interaction demos. Showcases modern patterns for building responsive, real-time web applications.',
        icon: '⚡',
        order: 2
      },
      {
        id: 'data-visualization',
        name: 'Data Visualization',
        description: 'Interactive charts, graphs, dashboards, and visual data representations. Demonstrates modern data visualization techniques with responsive design and real-time updates.',
        icon: '📊',
        order: 3
      },
      {
        id: 'development-tools',
        name: 'Development Tools',
        description: 'Utilities and tools for software development, API testing, and debugging workflows. Practical demonstrations of developer productivity tools and methodologies.',
        icon: '🛠️',
        order: 4
      },
      {
        id: 'testing',
        name: 'Testing & Quality',
        description: 'Testing frameworks, coverage tools, quality assurance demos, and comprehensive testing strategies. Showcases modern testing practices and quality assurance methodologies.',
        icon: '🧪',
        order: 5
      }
    ]

    categories.forEach(category => {
      this.categories.set(category.id, category)
    })
  }

  /**
   * Initialize demo configurations
   */
  private initializeDemos(): void {
    const demos: IDemoConfig[] = [
      {
        id: 'elt-pipeline',
        name: 'ELT Pipeline Visualization',
        description: 'Interactive demonstration of Extract, Load, Transform data processing with real-time visualization and transparent data flow monitoring. This flagship demo showcases advanced data engineering capabilities with comprehensive error handling and recovery mechanisms.',
        category: 'data-processing',
        technologies: ['Vue.js', 'WebSockets', 'D3.js', 'Node.js', 'TypeScript'],
        status: 'active',
        featured: true,
        component: () => import('@/components/demos/ELTPipelineDemo.vue'),
        route: '/demos/elt-pipeline',
        testSuiteId: 'elt-pipeline-tests',
        sourceUrl: 'https://github.com/example/elt-pipeline-demo',
        requirements: [
          'Real-time pipeline visualization with SVG-based flow diagrams',
          'Transparent data transformation showing input, process, and output',
          'Comprehensive error handling with recovery options and retry logic',
          'Progress tracking and monitoring with WebSocket updates',
          'Support for multiple data formats (JSON, CSV, XML)',
          'Interactive step-by-step execution with detailed logging'
        ],
        documentation: `
# ELT Pipeline Visualization Demo

## Overview
This flagship demonstration showcases a complete Extract, Load, Transform (ELT) data processing pipeline with real-time visualization and transparent data flow monitoring. The demo emphasizes data engineering best practices with comprehensive error handling and user-friendly interfaces.

## Key Features
- **Real-time Visualization**: SVG-based pipeline flow diagrams with animated progress indicators
- **Data Transparency**: Complete visibility into data transformations at each step
- **Error Recovery**: Intelligent error detection with actionable recovery options
- **Multiple Datasets**: Pre-configured sample datasets in various formats
- **WebSocket Integration**: Live updates and progress streaming
- **Interactive Controls**: Start, stop, retry, and monitor pipeline execution

## How to Use
1. **Select Dataset**: Choose from available sample datasets (JSON, CSV, XML formats)
2. **Execute Pipeline**: Click "Execute Pipeline" to start the ELT process
3. **Monitor Progress**: Watch real-time visualization and progress indicators
4. **View Data Flow**: Examine input, intermediate, and output data at each step
5. **Handle Errors**: Use recovery options if errors occur during processing

## Technical Implementation
- **Frontend**: Vue.js 3 with Composition API for reactive state management
- **Visualization**: D3.js for SVG-based pipeline diagrams and data charts
- **Real-time Updates**: WebSocket connections for live progress streaming
- **Error Handling**: Comprehensive error detection with recovery strategies
- **Data Processing**: Node.js backend with configurable transformation logic

## Educational Value
This demo demonstrates:
- Modern data pipeline architecture patterns
- Real-time data processing visualization techniques
- Error handling and recovery in distributed systems
- WebSocket communication for live updates
- Responsive UI design for complex data workflows
        `,
        apiEndpoints: ['/api/pipeline/start', '/api/pipeline/status', '/api/pipeline/data'],
        websocketEvents: ['pipeline_progress', 'pipeline_error', 'pipeline_complete'],
        createdDate: new Date('2024-01-01'),
        lastUpdated: new Date(),
        metadata: {
          complexity: 'high',
          estimatedTime: '5-10 minutes',
          datasetSizes: ['small', 'medium', 'large'],
          supportedFormats: ['JSON', 'CSV', 'XML'],
          primaryShowcase: true,
          learningObjectives: [
            'Understanding ELT vs ETL data processing patterns',
            'Real-time data visualization techniques',
            'Error handling in data pipelines',
            'WebSocket communication patterns',
            'Modern frontend architecture for data applications'
          ],
          prerequisites: 'Basic understanding of data processing concepts',
          difficulty: 'Advanced'
        }
      },
      {
        id: 'websocket-demo',
        name: 'WebSocket Communication',
        description: 'Real-time bidirectional communication demonstration with connection management, message broadcasting, and automatic reconnection. Showcases modern real-time web application patterns.',
        category: 'real-time',
        technologies: ['Vue.js', 'WebSockets', 'Node.js', 'Socket.IO'],
        status: 'active',
        featured: false,
        component: () => import('@/components/demos/WebSocketDemo.vue'),
        route: '/demos/websocket',
        testSuiteId: 'websocket-tests',
        requirements: [
          'Real-time message exchange with instant delivery',
          'Connection state management with visual indicators',
          'Automatic reconnection with exponential backoff',
          'Message queuing and delivery guarantees',
          'Broadcasting to multiple connected clients',
          'Error handling and connection recovery'
        ],
        documentation: `
# WebSocket Communication Demo

## Overview
This demonstration showcases real-time bidirectional communication using WebSockets. It illustrates modern patterns for building responsive, real-time web applications with reliable connection management and message delivery.

## Key Features
- **Real-time Messaging**: Instant bidirectional communication between client and server
- **Connection Management**: Visual connection status with automatic reconnection
- **Message Broadcasting**: Send messages to all connected clients simultaneously
- **Error Recovery**: Robust error handling with connection retry mechanisms
- **Live Updates**: Real-time message log with timestamp and message type indicators

## How to Use
1. **Connect**: Click "Connect" to establish WebSocket connection
2. **Send Messages**: Type messages and send them to all connected clients
3. **Monitor Activity**: Watch real-time message log with timestamps
4. **Test Broadcasting**: Use test buttons to trigger pipeline and test updates
5. **Connection Management**: Observe automatic reconnection during network issues

## Technical Implementation
- **WebSocket Client**: Vue.js composable for connection management
- **Message Handling**: Type-safe message routing and processing
- **Connection Recovery**: Automatic reconnection with exponential backoff
- **Real-time UI**: Reactive updates with Vue.js reactivity system
- **Error Handling**: Comprehensive error detection and user feedback

## Educational Value
This demo demonstrates:
- WebSocket connection lifecycle management
- Real-time data synchronization patterns
- Error handling in network communications
- Modern JavaScript async/await patterns
- Reactive UI updates with Vue.js
        `,
        apiEndpoints: ['/api/websocket/connect', '/api/websocket/status'],
        websocketEvents: ['connect', 'disconnect', 'message', 'error'],
        createdDate: new Date('2024-01-15'),
        lastUpdated: new Date(),
        metadata: {
          complexity: 'medium',
          estimatedTime: '2-5 minutes',
          maxConnections: 100,
          messageTypes: ['text', 'json', 'binary'],
          learningObjectives: [
            'Understanding WebSocket communication patterns',
            'Real-time application architecture',
            'Connection state management',
            'Error handling in network applications',
            'Modern JavaScript async programming'
          ],
          prerequisites: 'Basic understanding of web communication protocols',
          difficulty: 'Intermediate'
        }
      },
      {
        id: 'api-testing',
        name: 'API Testing Tool',
        description: 'Interactive API testing interface with request/response visualization, endpoint documentation, and comprehensive HTTP method support. Perfect for API development and debugging workflows.',
        category: 'development-tools',
        technologies: ['Vue.js', 'Axios', 'JSON', 'REST'],
        status: 'maintenance',
        featured: false,
        route: '/demos/api-testing',
        testSuiteId: 'api-testing-tests',
        requirements: [
          'Complete HTTP method support (GET, POST, PUT, DELETE, PATCH)',
          'Request/response visualization with syntax highlighting',
          'Multiple authentication methods (Bearer, Basic, API Key)',
          'Response formatting and validation with JSON/XML support',
          'Request history and saved configurations',
          'Error handling with detailed debugging information'
        ],
        documentation: `
# API Testing Tool Demo

## Overview
A comprehensive API testing interface that provides developers with powerful tools for testing, debugging, and documenting REST APIs. This demo showcases modern API development workflows and testing methodologies.

## Key Features
- **HTTP Methods**: Full support for GET, POST, PUT, DELETE, PATCH, and OPTIONS
- **Authentication**: Multiple auth types including Bearer tokens, Basic auth, and API keys
- **Request Builder**: Intuitive interface for constructing API requests
- **Response Analysis**: Detailed response visualization with syntax highlighting
- **History Management**: Save and replay previous requests
- **Error Debugging**: Comprehensive error analysis and debugging tools

## How to Use
1. **Select Method**: Choose HTTP method from dropdown
2. **Enter URL**: Input the API endpoint URL
3. **Add Headers**: Configure request headers and authentication
4. **Set Body**: Add request body for POST/PUT requests
5. **Send Request**: Execute the API call and analyze response
6. **Save Configuration**: Store frequently used requests for later use

## Technical Implementation
- **HTTP Client**: Axios for reliable API communication
- **Request Builder**: Vue.js reactive forms with validation
- **Response Viewer**: Syntax-highlighted JSON/XML display
- **Authentication**: Secure token management and storage
- **Error Handling**: Detailed error analysis and user feedback

## Educational Value
This demo demonstrates:
- RESTful API design principles and testing
- HTTP protocol methods and status codes
- Authentication patterns in web APIs
- Request/response data structures
- API debugging and troubleshooting techniques

*Note: Currently in maintenance mode - some features may be limited*
        `,
        createdDate: new Date('2024-01-20'),
        lastUpdated: new Date(),
        metadata: {
          complexity: 'medium',
          estimatedTime: '3-7 minutes',
          supportedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          authTypes: ['Bearer', 'Basic', 'API Key'],
          learningObjectives: [
            'Understanding REST API principles',
            'HTTP methods and status codes',
            'API authentication patterns',
            'Request/response data structures',
            'API debugging techniques'
          ],
          prerequisites: 'Basic understanding of HTTP and REST APIs',
          difficulty: 'Intermediate'
        }
      },
      {
        id: 'realtime-dashboard',
        name: 'Real-time Dashboard',
        description: 'Live data dashboard with WebSocket connections, interactive charts, performance monitoring, and responsive design. Demonstrates modern dashboard architecture with real-time data visualization.',
        category: 'data-visualization',
        technologies: ['Vue.js', 'WebSockets', 'Chart.js', 'D3.js'],
        status: 'active',
        featured: false,
        route: '/demos/dashboard',
        testSuiteId: 'dashboard-tests',
        requirements: [
          'Real-time data updates with WebSocket streaming',
          'Interactive chart components with multiple visualization types',
          'Performance metrics display with Core Web Vitals monitoring',
          'Responsive dashboard layout adapting to all screen sizes',
          'Configurable widgets and customizable layouts',
          'Data filtering and time-range selection capabilities'
        ],
        documentation: `
# Real-time Dashboard Demo

## Overview
A comprehensive dashboard showcasing real-time data visualization with multiple chart types, performance monitoring, and responsive design. This demo illustrates modern dashboard architecture patterns and data visualization best practices.

## Key Features
- **Live Data Updates**: Real-time data streaming via WebSocket connections
- **Interactive Charts**: Multiple chart types including line, bar, pie, and scatter plots
- **Performance Monitoring**: Core Web Vitals and application performance metrics
- **Responsive Design**: Adaptive layout for desktop, tablet, and mobile devices
- **Customizable Widgets**: Drag-and-drop widget arrangement and configuration
- **Data Filtering**: Advanced filtering and time-range selection tools

## How to Use
1. **View Metrics**: Observe real-time performance and application metrics
2. **Interact with Charts**: Hover, zoom, and click on chart elements for details
3. **Customize Layout**: Drag widgets to rearrange dashboard layout
4. **Filter Data**: Use time-range selectors and filters to focus on specific data
5. **Monitor Performance**: Track Core Web Vitals and system performance
6. **Export Data**: Download charts and data in various formats

## Technical Implementation
- **Data Visualization**: Chart.js and D3.js for interactive charts and graphs
- **Real-time Updates**: WebSocket connections for live data streaming
- **Responsive Layout**: CSS Grid and Flexbox for adaptive design
- **State Management**: Vue.js reactive state with Pinia store
- **Performance Monitoring**: Integration with Web Vitals API

## Educational Value
This demo demonstrates:
- Real-time data visualization techniques
- Dashboard architecture and design patterns
- WebSocket integration for live updates
- Responsive web design principles
- Performance monitoring and optimization
        `,
        apiEndpoints: ['/api/dashboard/metrics', '/api/dashboard/config'],
        websocketEvents: ['metrics_update', 'alert', 'config_change'],
        createdDate: new Date('2024-02-01'),
        lastUpdated: new Date(),
        metadata: {
          complexity: 'high',
          estimatedTime: '5-10 minutes',
          chartTypes: ['line', 'bar', 'pie', 'scatter'],
          updateFrequency: '1-5 seconds',
          learningObjectives: [
            'Real-time data visualization patterns',
            'Dashboard architecture and design',
            'WebSocket integration techniques',
            'Responsive design principles',
            'Performance monitoring strategies'
          ],
          prerequisites: 'Basic understanding of data visualization and web development',
          difficulty: 'Advanced'
        }
      }
    ]

    demos.forEach(demo => {
      this.registerDemo(demo)
    })
  }

  /**
   * Register a new demo
   */
  registerDemo(config: IDemoConfig): void {
    this.demos.set(config.id, config)
    this.routeMap.set(config.route, config.id)
  }

  /**
   * Get demo by ID
   */
  getDemo(id: string): IDemoConfig | undefined {
    return this.demos.get(id)
  }

  /**
   * Get demo by route
   */
  getDemoByRoute(route: string): IDemoConfig | undefined {
    const demoId = this.routeMap.get(route)
    return demoId ? this.demos.get(demoId) : undefined
  }

  /**
   * Get all demos
   */
  getAllDemos(): IDemoConfig[] {
    return Array.from(this.demos.values())
  }

  /**
   * Get active demos
   */
  getActiveDemos(): IDemoConfig[] {
    return this.getAllDemos().filter(demo => demo.status === 'active')
  }

  /**
   * Get featured demos
   */
  getFeaturedDemos(): IDemoConfig[] {
    return this.getActiveDemos().filter(demo => demo.featured)
  }

  /**
   * Get demos by category
   */
  getDemosByCategory(categoryId: string): IDemoConfig[] {
    return this.getAllDemos().filter(demo => demo.category === categoryId)
  }

  /**
   * Get all categories
   */
  getAllCategories(): IDemoCategory[] {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order)
  }

  /**
   * Get category by ID
   */
  getCategory(id: string): IDemoCategory | undefined {
    return this.categories.get(id)
  }

  /**
   * Convert demo config to IDemoApplication format
   */
  configToApplication(config: IDemoConfig): IDemoApplication {
    return {
      id: config.id,
      name: config.name,
      description: config.description,
      category: this.getCategory(config.category)?.name || config.category,
      technologies: config.technologies,
      status: config.status,
      launchUrl: config.route,
      sourceUrl: config.sourceUrl,
      testSuiteId: config.testSuiteId,
      featured: config.featured,
      screenshots: config.screenshots,
      createdDate: config.createdDate,
      lastUpdated: config.lastUpdated
    }
  }

  /**
   * Get all demos as IDemoApplication array
   */
  getAllDemoApplications(): IDemoApplication[] {
    return this.getAllDemos().map(config => this.configToApplication(config))
  }

  /**
   * Search demos by name, description, or technology
   */
  searchDemos(query: string): IDemoConfig[] {
    const searchTerm = query.toLowerCase()
    return this.getAllDemos().filter(demo => 
      demo.name.toLowerCase().includes(searchTerm) ||
      demo.description.toLowerCase().includes(searchTerm) ||
      demo.technologies.some(tech => tech.toLowerCase().includes(searchTerm)) ||
      demo.category.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Get demo statistics
   */
  getStatistics() {
    const allDemos = this.getAllDemos()
    const categories = this.getAllCategories()
    
    return {
      total: allDemos.length,
      active: allDemos.filter(d => d.status === 'active').length,
      maintenance: allDemos.filter(d => d.status === 'maintenance').length,
      archived: allDemos.filter(d => d.status === 'archived').length,
      featured: allDemos.filter(d => d.featured).length,
      categories: categories.length,
      byCategory: categories.map(cat => ({
        category: cat.name,
        count: this.getDemosByCategory(cat.id).length
      })),
      technologies: this.getUniqueTechnologies(),
      lastUpdated: new Date(Math.max(...allDemos.map(d => d.lastUpdated.getTime())))
    }
  }

  /**
   * Get unique technologies across all demos
   */
  private getUniqueTechnologies(): string[] {
    const technologies = new Set<string>()
    this.getAllDemos().forEach(demo => {
      demo.technologies.forEach(tech => technologies.add(tech))
    })
    return Array.from(technologies).sort()
  }

  /**
   * Validate demo configuration
   */
  validateDemo(config: Partial<IDemoConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.id) errors.push('Demo ID is required')
    if (!config.name) errors.push('Demo name is required')
    if (!config.description) errors.push('Demo description is required')
    if (!config.category) errors.push('Demo category is required')
    if (!config.technologies || config.technologies.length === 0) {
      errors.push('At least one technology is required')
    }
    if (!config.route) errors.push('Demo route is required')
    if (!config.testSuiteId) errors.push('Test suite ID is required')

    // Check for duplicate IDs
    if (config.id && this.demos.has(config.id)) {
      errors.push(`Demo with ID "${config.id}" already exists`)
    }

    // Check for duplicate routes
    if (config.route && this.routeMap.has(config.route)) {
      errors.push(`Route "${config.route}" is already in use`)
    }

    // Validate category exists
    if (config.category && !this.categories.has(config.category)) {
      errors.push(`Category "${config.category}" does not exist`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Create singleton instance
export const demoRegistry = new DemoRegistry()

// Export types
export type { IDemoConfig, IDemoCategory }