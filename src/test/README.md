# Testing Framework Documentation

This document describes the comprehensive testing framework set up for the personal website project.

## Overview

The testing framework implements a dual approach combining traditional unit testing with property-based testing to ensure both specific functionality and universal correctness properties.

## Testing Stack

- **Vitest**: Fast unit test runner with native TypeScript support
- **Vue Test Utils**: Official testing utilities for Vue.js components
- **fast-check**: Property-based testing library for JavaScript/TypeScript
- **jsdom**: DOM implementation for Node.js testing environment
- **@vitest/coverage-v8**: Code coverage reporting

## Test Types

### 1. Unit Tests (`*.test.ts`)
- Test specific examples and edge cases
- Component behavior validation
- Store functionality testing
- Utility function verification

### 2. Property-Based Tests (`*.property.test.ts`)
- Verify universal properties across all inputs
- Test correctness properties from design document
- Minimum 100 iterations per property test
- Randomized input generation

### 3. Integration Tests
- API endpoint testing
- Component integration testing
- Store integration with components

### 4. Accessibility Tests
- WCAG 2.1 AA compliance verification
- Keyboard navigation testing
- Screen reader compatibility

### 5. Performance Tests
- Render time measurement
- Bundle size validation
- Core Web Vitals testing

## Directory Structure

```
src/test/
├── setup.ts                 # Global test setup and configuration
├── component-utils.ts        # Component testing utilities
├── property-generators.ts    # Property-based test generators
├── test-config.ts           # Test configuration and constants
└── README.md               # This documentation
```

## Test Configuration

### Vitest Configuration
- **Environment**: jsdom for DOM testing
- **Coverage**: v8 provider with 80% threshold
- **Timeout**: 10 seconds for property tests
- **Setup**: Global test setup with mocks

### Coverage Thresholds
- **Lines**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Statements**: 80%

## Writing Tests

### Unit Tests Example

```typescript
import { describe, it, expect } from 'vitest'
import { mountComponent } from '@/test/component-utils'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mountComponent(MyComponent, {
      props: { title: 'Test Title' }
    })
    
    expect(wrapper.text()).toContain('Test Title')
  })
})
```

### Property-Based Tests Example

```typescript
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { propertyTestConfig, arbString } from '@/test/property-generators'

describe('MyFunction Property Tests', () => {
  it('**Feature: personal-website, Property 1: Function Behavior**', () => {
    fc.assert(
      fc.property(
        arbString(1, 100),
        (input) => {
          const result = myFunction(input)
          
          // Property: Function should always return a string
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
        }
      ),
      propertyTestConfig
    )
  })
})
```

## Test Utilities

### Component Testing
- `mountComponent()`: Enhanced mount with router and store setup
- `triggerAndWait()`: Trigger events and wait for updates
- `setInputValue()`: Simulate user input
- `testKeyboardNavigation()`: Test accessibility
- `testResponsiveBehavior()`: Test responsive design

### Property Generators
- `arbString()`: Generate random strings
- `arbEmail()`: Generate valid email addresses
- `arbUrl()`: Generate valid URLs
- `arbUserProfile()`: Generate user profile objects
- `arbViewportSize()`: Generate viewport dimensions

### Mock Data
- `createMockUser()`: Create mock user profile
- `createMockDemo()`: Create mock demo application
- `createMockTestSuite()`: Create mock test suite
- `mockApiResponse()`: Create mock API responses

## Running Tests

### Basic Commands
```bash
# Run all tests
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Watch mode
npm run test:watch
```

### Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Property-based tests only
npm run test:property

# Component tests only
npm run test:components

# Store tests only
npm run test:stores

# Utility tests only
npm run test:utils
```

## Property-Based Testing Guidelines

### Property Naming Convention
All property tests must follow this format:
```
**Feature: personal-website, Property {number}: {property_description}**
```

### Property Categories
1. **Content Rendering**: UI displays correct content
2. **State Management**: State changes work correctly
3. **Input Validation**: All inputs are properly validated
4. **Error Handling**: Errors are handled gracefully
5. **Performance**: Operations complete within time limits
6. **Accessibility**: Components are accessible
7. **Responsive Design**: Layout adapts to screen sizes

### Writing Good Properties
- Test universal behaviors, not specific examples
- Use meaningful property descriptions
- Include requirement validation comments
- Test edge cases and boundary conditions
- Ensure properties are deterministic

## Coverage Reporting

Coverage reports are generated in multiple formats:
- **Text**: Console output during test runs
- **HTML**: Interactive coverage report in `coverage/` directory
- **JSON**: Machine-readable coverage data
- **LCOV**: For CI/CD integration

## Continuous Integration

The testing framework is designed for CI/CD environments:
- Fast execution with parallel test running
- Comprehensive coverage reporting
- Property-based tests with deterministic seeds
- Accessibility and performance validation

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic
- Test both happy path and error cases

### Property Testing
- Start with simple properties
- Build up to complex behaviors
- Use appropriate generators
- Document property meanings

### Component Testing
- Test user interactions
- Verify accessibility
- Check responsive behavior
- Mock external dependencies

### Performance Testing
- Set realistic thresholds
- Test on different devices
- Monitor bundle size growth
- Validate Core Web Vitals

## Troubleshooting

### Common Issues
1. **Timeout Errors**: Increase timeout for slow tests
2. **Mock Issues**: Ensure mocks are properly reset
3. **Coverage Gaps**: Check excluded files and patterns
4. **Property Failures**: Review generators and shrinking

### Debug Tips
- Use `test.only()` to focus on specific tests
- Add console.log for debugging (remove before commit)
- Use Vitest UI for interactive debugging
- Check test setup and teardown

## Future Enhancements

- Visual regression testing
- Cross-browser testing
- Performance benchmarking
- Mutation testing
- Fuzz testing integration