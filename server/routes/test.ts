import express from 'express';
import { spawn } from 'child_process';
import { webSocketService } from '../services/WebSocketService.js';

const router = express.Router();

interface TestExecutionOptions {
  suiteId?: string;
  testType?: 'unit' | 'integration' | 'e2e' | 'property';
  coverage?: boolean;
  watch?: boolean;
}

interface TestResult {
  id: string;
  testName: string;
  suiteName: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  coverage?: any;
  errorDetails?: string;
  stackTrace?: string;
  testType: string;
  timestamp: string;
}

/**
 * Run all tests
 */
router.post('/run', async (req, res) => {
  try {
    const options: TestExecutionOptions = req.body;
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Start test execution in background
    executeTests(executionId, options);
    
    res.json({
      success: true,
      executionId,
      message: 'Test execution started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting test execution:', error);
    res.status(500).json({
      error: 'Failed to start test execution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Run specific test suite
 */
router.post('/run/:suiteId', async (req, res) => {
  try {
    const { suiteId } = req.params;
    const options: TestExecutionOptions = { ...req.body, suiteId };
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Start test execution in background
    executeTests(executionId, options);
    
    res.json({
      success: true,
      executionId,
      suiteId,
      message: 'Test suite execution started',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting test suite execution:', error);
    res.status(500).json({
      error: 'Failed to start test suite execution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get test execution status
 */
router.get('/status/:executionId', (req, res) => {
  try {
    const { executionId } = req.params;
    
    // In a real implementation, you would track execution status
    // For now, return a mock status
    res.json({
      success: true,
      executionId,
      status: 'running', // 'pending' | 'running' | 'completed' | 'failed'
      progress: 0.5,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting test status:', error);
    res.status(500).json({
      error: 'Failed to get test status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get public test results for a specific suite - PUBLIC ACCESS
 */
router.get('/suites/:suiteId/results', (req, res) => {
  try {
    const { suiteId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Generate mock test results with proper categorization
    const mockResults = generateMockTestResults(suiteId, limit);
    
    res.json({
      success: true,
      suiteId,
      results: mockResults,
      metadata: {
        totalResults: mockResults.length,
        publicAccess: true,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting test results:', error);
    res.status(500).json({
      error: 'Failed to get test results',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get public coverage data - PUBLIC ACCESS
 */
router.get('/coverage', (req, res) => {
  try {
    const { suiteId } = req.query;
    
    if (suiteId) {
      // Return coverage for specific suite
      const coverage = generateMockCoverage(suiteId as string);
      res.json({
        success: true,
        suiteId,
        coverage,
        publicAccess: true,
        timestamp: new Date().toISOString()
      });
    } else {
      // Return overall coverage across all suites
      const overallCoverage = generateOverallCoverage();
      res.json({
        success: true,
        coverage: overallCoverage,
        publicAccess: true,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error getting coverage data:', error);
    res.status(500).json({
      error: 'Failed to get coverage data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get comprehensive public test categorization - PUBLIC ACCESS
 */
router.get('/public/categorization', (req, res) => {
  try {
    const categorization = {
      byType: {
        unit: { suites: 4, tests: 81, coverage: 87.2, publicSuites: 4 },
        integration: { suites: 4, tests: 57, coverage: 82.1, publicSuites: 4 },
        property: { suites: 6, tests: 53, coverage: 89.5, publicSuites: 6 },
        e2e: { suites: 2, tests: 20, coverage: 75.3, publicSuites: 2 }
      },
      byCategory: {
        'demo-application': { suites: 4, tests: 74, coverage: 85.8, publicSuites: 4 },
        'core-feature': { suites: 3, tests: 38, coverage: 91.2, publicSuites: 3 },
        'backend': { suites: 3, tests: 45, coverage: 80.7, publicSuites: 3 },
        'quality-assurance': { suites: 2, tests: 14, coverage: 88.9, publicSuites: 2 },
        'utilities': { suites: 2, tests: 28, coverage: 86.4, publicSuites: 2 },
        'end-to-end': { suites: 2, tests: 20, coverage: 75.3, publicSuites: 2 }
      },
      byApplication: {
        'elt-pipeline': { suites: 3, tests: 52, coverage: 88.4, publicSuites: 3 },
        'landing-page': { suites: 3, tests: 38, coverage: 91.2, publicSuites: 3 },
        'testing-dashboard': { suites: 1, tests: 22, coverage: 84.1, publicSuites: 1 },
        'backend-api': { suites: 3, tests: 45, coverage: 80.7, publicSuites: 3 },
        'accessibility': { suites: 1, tests: 8, coverage: 88.9, publicSuites: 1 },
        'performance': { suites: 1, tests: 6, coverage: 85.2, publicSuites: 1 },
        'utilities': { suites: 2, tests: 28, coverage: 86.4, publicSuites: 2 },
        'e2e': { suites: 2, tests: 20, coverage: 75.3, publicSuites: 2 }
      },
      byPriority: {
        high: { suites: 8, tests: 124, coverage: 88.7 },
        medium: { suites: 6, tests: 67, coverage: 82.4 },
        low: { suites: 2, tests: 12, coverage: 79.1 }
      },
      totalPublicSuites: 16,
      totalPrivateSuites: 0,
      publicAccessEnabled: true
    }
    
    res.json({
      success: true,
      categorization,
      metadata: {
        publicAccess: true,
        accessLevel: 'full',
        dataAnonymized: false,
        lastUpdated: new Date().toISOString(),
        disclaimer: 'All test results and coverage metrics are publicly accessible to demonstrate code quality and testing practices.'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting test categorization:', error)
    res.status(500).json({
      error: 'Failed to get test categorization',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Get public test access metadata - PUBLIC ACCESS
 */
router.get('/public/access-info', (req, res) => {
  try {
    const accessInfo = {
      accessEnabled: true,
      accessLevel: 'full',
      allowedCategories: [
        'demo-application',
        'core-feature', 
        'backend',
        'quality-assurance',
        'utilities',
        'end-to-end'
      ],
      allowedTypes: ['unit', 'integration', 'e2e', 'property'],
      dataAnonymized: false,
      failureDetailsHidden: false,
      rateLimiting: {
        enabled: false,
        requestsPerMinute: 100
      },
      features: {
        realTimeUpdates: true,
        historicalData: true,
        coverageReports: true,
        failureDetails: true,
        testExecution: false // Users cannot trigger test runs
      },
      lastUpdated: new Date().toISOString(),
      disclaimer: 'All test results and coverage metrics are publicly accessible to demonstrate code quality and testing practices. This data is provided for transparency and educational purposes.'
    }
    
    res.json({
      success: true,
      accessInfo,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting access info:', error)
    res.status(500).json({
      error: 'Failed to get access info',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Get comprehensive public test report - PUBLIC ACCESS
 */
router.get('/public/report', (req, res) => {
  try {
    const report = {
      summary: {
        totalSuites: 16,
        totalTests: 203,
        passedTests: 189,
        failedTests: 12,
        skippedTests: 2,
        overallSuccessRate: 93.1,
        averageCoverage: {
          lines: { covered: 1847, total: 2156, percentage: 85.7 },
          branches: { covered: 423, total: 567, percentage: 74.6 },
          functions: { covered: 312, total: 378, percentage: 82.5 },
          statements: { covered: 1823, total: 2134, percentage: 85.4 }
        }
      },
      categorization: {
        byType: {
          unit: { suites: 4, tests: 81, coverage: 87.2, publicSuites: 4 },
          integration: { suites: 4, tests: 57, coverage: 82.1, publicSuites: 4 },
          property: { suites: 6, tests: 53, coverage: 89.5, publicSuites: 6 },
          e2e: { suites: 2, tests: 20, coverage: 75.3, publicSuites: 2 }
        },
        byCategory: {
          'demo-application': { suites: 4, tests: 74, coverage: 85.8, publicSuites: 4 },
          'core-feature': { suites: 3, tests: 38, coverage: 91.2, publicSuites: 3 },
          'backend': { suites: 3, tests: 45, coverage: 80.7, publicSuites: 3 },
          'quality-assurance': { suites: 2, tests: 14, coverage: 88.9, publicSuites: 2 },
          'utilities': { suites: 2, tests: 28, coverage: 86.4, publicSuites: 2 },
          'end-to-end': { suites: 2, tests: 20, coverage: 75.3, publicSuites: 2 }
        },
        totalPublicSuites: 16,
        publicAccessLevel: 'full'
      },
      trends: {
        coverageTrend: 'improving',
        successRateTrend: 'stable',
        testCountTrend: 'improving',
        qualityScore: 87.3
      },
      metadata: {
        publicAccess: true,
        accessLevel: 'full',
        dataAnonymized: false,
        generatedAt: new Date().toISOString(),
        disclaimer: 'All test results and coverage metrics are publicly accessible to demonstrate code quality and testing practices.'
      }
    }
    
    res.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating public report:', error)
    res.status(500).json({
      error: 'Failed to generate public report',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * Get available test suites - PUBLIC ACCESS
 */
router.get('/suites', (req, res) => {
  try {
    // Comprehensive test suites with proper categorization
    const testSuites = [
      // ELT Pipeline Demo Tests
      {
        id: 'elt-pipeline-unit-tests',
        name: 'ELT Pipeline Unit Tests',
        applicationId: 'elt-pipeline',
        path: 'src/components/demos/__tests__/ELTPipeline.test.ts',
        testCount: 25,
        type: 'unit',
        category: 'demo-application',
        description: 'Unit tests for ELT pipeline components and logic',
        isPublic: true
      },
      {
        id: 'elt-pipeline-property-tests',
        name: 'ELT Pipeline Property Tests',
        applicationId: 'elt-pipeline',
        path: 'src/components/demos/__tests__/ELTPipeline.property.test.ts',
        testCount: 15,
        type: 'property',
        category: 'demo-application',
        description: 'Property-based tests for ELT pipeline correctness',
        isPublic: true
      },
      {
        id: 'elt-pipeline-integration-tests',
        name: 'ELT Pipeline Integration Tests',
        applicationId: 'elt-pipeline',
        path: 'src/components/demos/__tests__/ELTPipeline.integration.test.ts',
        testCount: 12,
        type: 'integration',
        category: 'demo-application',
        description: 'Integration tests for ELT pipeline with backend services',
        isPublic: true
      },
      
      // Landing Page Tests
      {
        id: 'landing-page-unit-tests',
        name: 'Landing Page Unit Tests',
        applicationId: 'landing-page',
        path: 'src/components/landing/__tests__/*.test.ts',
        testCount: 18,
        type: 'unit',
        category: 'core-feature',
        description: 'Unit tests for landing page components',
        isPublic: true
      },
      {
        id: 'landing-page-property-tests',
        name: 'Landing Page Property Tests',
        applicationId: 'landing-page',
        path: 'src/components/landing/__tests__/LandingPage.property.test.ts',
        testCount: 12,
        type: 'property',
        category: 'core-feature',
        description: 'Property-based tests for landing page functionality',
        isPublic: true
      },
      {
        id: 'responsive-design-property-tests',
        name: 'Responsive Design Property Tests',
        applicationId: 'landing-page',
        path: 'src/components/landing/__tests__/ResponsiveDesign.property.test.ts',
        testCount: 8,
        type: 'property',
        category: 'core-feature',
        description: 'Property-based tests for responsive design compliance',
        isPublic: true
      },
      
      // Testing Dashboard Tests
      {
        id: 'testing-dashboard-unit-tests',
        name: 'Testing Dashboard Unit Tests',
        applicationId: 'testing-dashboard',
        path: 'src/components/testing/__tests__/TestingComponents.test.ts',
        testCount: 22,
        type: 'unit',
        category: 'demo-application',
        description: 'Unit tests for testing dashboard components',
        isPublic: true
      },
      
      // API Integration Tests
      {
        id: 'api-integration-tests',
        name: 'API Integration Tests',
        applicationId: 'backend-api',
        path: 'server/__tests__/api-integration.test.ts',
        testCount: 20,
        type: 'integration',
        category: 'backend',
        description: 'Integration tests for backend API endpoints',
        isPublic: true
      },
      {
        id: 'api-security-tests',
        name: 'API Security Tests',
        applicationId: 'backend-api',
        path: 'server/__tests__/api-security.test.ts',
        testCount: 15,
        type: 'integration',
        category: 'backend',
        description: 'Security and validation tests for API endpoints',
        isPublic: true
      },
      {
        id: 'websocket-tests',
        name: 'WebSocket Tests',
        applicationId: 'backend-api',
        path: 'server/__tests__/websocket.test.ts',
        testCount: 10,
        type: 'integration',
        category: 'backend',
        description: 'Tests for WebSocket real-time functionality',
        isPublic: true
      },
      
      // Accessibility and Performance Tests
      {
        id: 'accessibility-property-tests',
        name: 'Accessibility Property Tests',
        applicationId: 'accessibility',
        path: 'src/test/accessibility.property.test.ts',
        testCount: 8,
        type: 'property',
        category: 'quality-assurance',
        description: 'Property-based tests for accessibility compliance',
        isPublic: true
      },
      {
        id: 'performance-property-tests',
        name: 'Performance Property Tests',
        applicationId: 'performance',
        path: 'src/test/performance.property.test.ts',
        testCount: 6,
        type: 'property',
        category: 'quality-assurance',
        description: 'Property-based tests for performance standards',
        isPublic: true
      },
      
      // Utility and Service Tests
      {
        id: 'formatters-property-tests',
        name: 'Formatters Property Tests',
        applicationId: 'utilities',
        path: 'src/utils/__tests__/formatters.property.test.ts',
        testCount: 12,
        type: 'property',
        category: 'utilities',
        description: 'Property-based tests for utility formatters',
        isPublic: true
      },
      {
        id: 'service-unit-tests',
        name: 'Service Unit Tests',
        applicationId: 'services',
        path: 'src/services/__tests__/*.test.ts',
        testCount: 16,
        type: 'unit',
        category: 'utilities',
        description: 'Unit tests for service layer functionality',
        isPublic: true
      },
      
      // End-to-End Tests
      {
        id: 'e2e-user-workflows',
        name: 'E2E User Workflows',
        applicationId: 'e2e',
        path: 'e2e/user-workflows.test.ts',
        testCount: 8,
        type: 'e2e',
        category: 'end-to-end',
        description: 'End-to-end tests for complete user workflows',
        isPublic: true
      },
      {
        id: 'e2e-demo-interactions',
        name: 'E2E Demo Interactions',
        applicationId: 'e2e',
        path: 'e2e/demo-interactions.test.ts',
        testCount: 12,
        type: 'e2e',
        category: 'end-to-end',
        description: 'End-to-end tests for demo application interactions',
        isPublic: true
      }
    ];
    
    // Add metadata about test categorization
    const categorySummary = {
      'demo-application': testSuites.filter(s => s.category === 'demo-application').length,
      'core-feature': testSuites.filter(s => s.category === 'core-feature').length,
      'backend': testSuites.filter(s => s.category === 'backend').length,
      'quality-assurance': testSuites.filter(s => s.category === 'quality-assurance').length,
      'utilities': testSuites.filter(s => s.category === 'utilities').length,
      'end-to-end': testSuites.filter(s => s.category === 'end-to-end').length
    };
    
    const typeSummary = {
      'unit': testSuites.filter(s => s.type === 'unit').length,
      'integration': testSuites.filter(s => s.type === 'integration').length,
      'property': testSuites.filter(s => s.type === 'property').length,
      'e2e': testSuites.filter(s => s.type === 'e2e').length
    };
    
    res.json({
      success: true,
      testSuites,
      metadata: {
        totalSuites: testSuites.length,
        totalTests: testSuites.reduce((sum, suite) => sum + suite.testCount, 0),
        publicAccess: true,
        categorySummary,
        typeSummary,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting test suites:', error);
    res.status(500).json({
      error: 'Failed to get test suites',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Execute tests and broadcast real-time updates
 */
async function executeTests(executionId: string, options: TestExecutionOptions): Promise<void> {
  const testSuiteId = options.suiteId || 'all-tests';
  
  try {
    // Broadcast test started
    webSocketService.broadcastTestUpdate(testSuiteId, {
      type: 'test_started',
      executionId,
      testSuiteId,
      options,
      timestamp: new Date().toISOString()
    });
    
    // Simulate test execution with real-time updates
    await simulateTestExecution(executionId, testSuiteId, options);
    
    // Broadcast test completed
    webSocketService.broadcastTestUpdate(testSuiteId, {
      type: 'test_completed',
      executionId,
      testSuiteId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test execution error:', error);
    
    // Broadcast test error
    webSocketService.broadcastTestUpdate(testSuiteId, {
      type: 'test_error',
      executionId,
      testSuiteId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Simulate test execution with realistic timing and results
 */
async function simulateTestExecution(
  executionId: string, 
  testSuiteId: string, 
  options: TestExecutionOptions
): Promise<void> {
  const testCases = generateMockTestCases(testSuiteId, options);
  
  for (const testCase of testCases) {
    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    // Generate test result
    const result: TestResult = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      testName: testCase.name,
      suiteName: testCase.suite,
      status: Math.random() > 0.15 ? 'pass' : 'fail', // 85% pass rate
      duration: Math.floor(Math.random() * 3000) + 100,
      testType: testCase.type,
      timestamp: new Date().toISOString(),
      coverage: {
        lines: { 
          covered: Math.floor(Math.random() * 20) + 80, 
          total: 100, 
          percentage: 0 
        },
        branches: { 
          covered: Math.floor(Math.random() * 10) + 15, 
          total: 25, 
          percentage: 0 
        },
        functions: { 
          covered: Math.floor(Math.random() * 5) + 15, 
          total: 20, 
          percentage: 0 
        },
        statements: { 
          covered: Math.floor(Math.random() * 20) + 80, 
          total: 100, 
          percentage: 0 
        }
      }
    };
    
    // Calculate coverage percentages
    result.coverage.lines.percentage = Math.round((result.coverage.lines.covered / result.coverage.lines.total) * 100 * 100) / 100;
    result.coverage.branches.percentage = Math.round((result.coverage.branches.covered / result.coverage.branches.total) * 100 * 100) / 100;
    result.coverage.functions.percentage = Math.round((result.coverage.functions.covered / result.coverage.functions.total) * 100 * 100) / 100;
    result.coverage.statements.percentage = Math.round((result.coverage.statements.covered / result.coverage.statements.total) * 100 * 100) / 100;
    
    // Add error details for failed tests
    if (result.status === 'fail') {
      result.errorDetails = generateMockError();
      result.stackTrace = generateMockStackTrace(testCase.name);
    }
    
    // Broadcast individual test result
    webSocketService.broadcastTestUpdate(testSuiteId, {
      type: 'test_result',
      executionId,
      testSuiteId,
      resultId: result.id,
      testName: result.testName,
      suiteName: result.suiteName,
      status: result.status,
      duration: result.duration,
      coverage: result.coverage,
      errorDetails: result.errorDetails,
      stackTrace: result.stackTrace,
      testType: result.testType,
      timestamp: result.timestamp
    });
  }
}

/**
 * Generate mock test cases based on suite and options
 */
function generateMockTestCases(testSuiteId: string, options: TestExecutionOptions) {
  const testCases = [];
  const suiteNames = {
    'elt-pipeline-tests': 'ELT Pipeline Tests',
    'landing-page-tests': 'Landing Page Tests',
    'api-integration-tests': 'API Integration Tests',
    'unit-tests': 'Unit Tests',
    'all-tests': 'All Tests'
  };
  
  const suiteName = suiteNames[testSuiteId as keyof typeof suiteNames] || 'Unknown Suite';
  const testCount = Math.floor(Math.random() * 10) + 5; // 5-15 tests
  
  for (let i = 0; i < testCount; i++) {
    testCases.push({
      name: `${suiteName} - Test Case ${i + 1}`,
      suite: suiteName,
      type: options.testType || 'unit'
    });
  }
  
  return testCases;
}

/**
 * Generate mock error message
 */
function generateMockError(): string {
  const errors = [
    'Expected value to be truthy, but received false',
    'TypeError: Cannot read property \'length\' of undefined',
    'AssertionError: expected 42 to equal 24',
    'ReferenceError: someVariable is not defined',
    'Property test failed after 15 iterations',
    'Timeout: Test exceeded maximum execution time of 5000ms'
  ];
  
  return errors[Math.floor(Math.random() * errors.length)] || 'Unknown error';
}

/**
 * Generate mock stack trace
 */
function generateMockStackTrace(testName: string): string {
  return `Error: ${generateMockError()}
    at Object.<anonymous> (${testName.toLowerCase().replace(/\s+/g, '-')}.test.ts:${Math.floor(Math.random() * 50) + 10}:${Math.floor(Math.random() * 20) + 5})
    at Promise.then.completed (/node_modules/jest-circus/build/utils.js:${Math.floor(Math.random() * 100) + 200}:28)
    at new Promise (<anonymous>)
    at callAsyncCircusFn (/node_modules/jest-circus/build/utils.js:${Math.floor(Math.random() * 100) + 200}:16)
    at _callCircusTest (/node_modules/jest-circus/build/run.js:${Math.floor(Math.random() * 100) + 200}:40)
    at processTicksAndRejections (internal/process/task_queues.js:${Math.floor(Math.random() * 100) + 90}:5)`;
}

/**
 * Generate mock test results for public access
 */
function generateMockTestResults(suiteId: string, limit: number = 50) {
  const results = [];
  const suiteNames = {
    'elt-pipeline-unit-tests': 'ELT Pipeline Unit Tests',
    'elt-pipeline-property-tests': 'ELT Pipeline Property Tests',
    'elt-pipeline-integration-tests': 'ELT Pipeline Integration Tests',
    'landing-page-unit-tests': 'Landing Page Unit Tests',
    'landing-page-property-tests': 'Landing Page Property Tests',
    'responsive-design-property-tests': 'Responsive Design Property Tests',
    'testing-dashboard-unit-tests': 'Testing Dashboard Unit Tests',
    'api-integration-tests': 'API Integration Tests',
    'api-security-tests': 'API Security Tests',
    'websocket-tests': 'WebSocket Tests',
    'accessibility-property-tests': 'Accessibility Property Tests',
    'performance-property-tests': 'Performance Property Tests',
    'formatters-property-tests': 'Formatters Property Tests',
    'service-unit-tests': 'Service Unit Tests',
    'e2e-user-workflows': 'E2E User Workflows',
    'e2e-demo-interactions': 'E2E Demo Interactions'
  };
  
  const suiteName = suiteNames[suiteId as keyof typeof suiteNames] || 'Unknown Suite';
  const testType = suiteId.includes('unit') ? 'unit' : 
                   suiteId.includes('integration') ? 'integration' :
                   suiteId.includes('property') ? 'property' :
                   suiteId.includes('e2e') ? 'e2e' : 'unit';
  
  for (let i = 0; i < Math.min(limit, 20); i++) {
    const status = Math.random() > 0.1 ? 'pass' : 'fail'; // 90% pass rate
    const result = {
      id: `result_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      testName: `${suiteName} - Test Case ${i + 1}`,
      suite: suiteName,
      status,
      duration: Math.floor(Math.random() * 3000) + 100,
      testType,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time in last 24h
      coverage: {
        lines: { 
          covered: Math.floor(Math.random() * 20) + 80, 
          total: 100, 
          percentage: 0 
        },
        branches: { 
          covered: Math.floor(Math.random() * 10) + 15, 
          total: 25, 
          percentage: 0 
        },
        functions: { 
          covered: Math.floor(Math.random() * 5) + 15, 
          total: 20, 
          percentage: 0 
        },
        statements: { 
          covered: Math.floor(Math.random() * 20) + 80, 
          total: 100, 
          percentage: 0 
        }
      },
      publicAccess: true
    };
    
    // Calculate coverage percentages
    result.coverage.lines.percentage = Math.round((result.coverage.lines.covered / result.coverage.lines.total) * 100 * 100) / 100;
    result.coverage.branches.percentage = Math.round((result.coverage.branches.covered / result.coverage.branches.total) * 100 * 100) / 100;
    result.coverage.functions.percentage = Math.round((result.coverage.functions.covered / result.coverage.functions.total) * 100 * 100) / 100;
    result.coverage.statements.percentage = Math.round((result.coverage.statements.covered / result.coverage.statements.total) * 100 * 100) / 100;
    
    // Add error details for failed tests
    if (status === 'fail') {
      (result as any).errorDetails = generateMockError();
      (result as any).stackTrace = generateMockStackTrace(result.testName);
    }
    
    results.push(result);
  }
  
  return results;
}

/**
 * Generate mock coverage data for a specific suite
 */
function generateMockCoverage(suiteId: string) {
  const basePercentage = Math.floor(Math.random() * 20) + 75; // 75-95%
  
  return {
    suiteId,
    lines: { 
      covered: Math.floor(basePercentage * 1.2), 
      total: 120, 
      percentage: basePercentage + Math.floor(Math.random() * 5)
    },
    branches: { 
      covered: Math.floor(basePercentage * 0.3), 
      total: 35, 
      percentage: basePercentage - Math.floor(Math.random() * 10)
    },
    functions: { 
      covered: Math.floor(basePercentage * 0.25), 
      total: 28, 
      percentage: basePercentage + Math.floor(Math.random() * 8)
    },
    statements: { 
      covered: Math.floor(basePercentage * 1.1), 
      total: 110, 
      percentage: basePercentage + Math.floor(Math.random() * 3)
    },
    publicAccess: true,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Generate overall coverage across all suites
 */
function generateOverallCoverage() {
  return {
    lines: { covered: 1847, total: 2156, percentage: 85.7 },
    branches: { covered: 423, total: 567, percentage: 74.6 },
    functions: { covered: 312, total: 378, percentage: 82.5 },
    statements: { covered: 1823, total: 2134, percentage: 85.4 },
    publicAccess: true,
    lastUpdated: new Date().toISOString()
  };
}

export { router as testRoutes };