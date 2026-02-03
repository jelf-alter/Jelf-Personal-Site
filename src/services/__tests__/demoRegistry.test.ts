import { describe, it, expect } from 'vitest'
import { demoRegistry } from '../demoRegistry'

describe('Demo Registry', () => {
  it('should initialize with demo configurations', () => {
    const demos = demoRegistry.getAllDemos()
    expect(demos.length).toBeGreaterThan(0)
  })

  it('should get demo by ID', () => {
    const demo = demoRegistry.getDemo('elt-pipeline')
    expect(demo).toBeDefined()
    expect(demo?.name).toBe('ELT Pipeline Visualization')
  })

  it('should get active demos', () => {
    const activeDemos = demoRegistry.getActiveDemos()
    expect(activeDemos.length).toBeGreaterThan(0)
    activeDemos.forEach(demo => {
      expect(demo.status).toBe('active')
    })
  })

  it('should get featured demos', () => {
    const featuredDemos = demoRegistry.getFeaturedDemos()
    expect(featuredDemos.length).toBeGreaterThan(0)
    featuredDemos.forEach(demo => {
      expect(demo.featured).toBe(true)
      expect(demo.status).toBe('active')
    })
  })

  it('should get demos by category', () => {
    const dataProcessingDemos = demoRegistry.getDemosByCategory('data-processing')
    expect(dataProcessingDemos.length).toBeGreaterThan(0)
    dataProcessingDemos.forEach(demo => {
      expect(demo.category).toBe('data-processing')
    })
  })

  it('should get all categories', () => {
    const categories = demoRegistry.getAllCategories()
    expect(categories.length).toBeGreaterThan(0)
    expect(categories[0]).toHaveProperty('id')
    expect(categories[0]).toHaveProperty('name')
    expect(categories[0]).toHaveProperty('order')
  })

  it('should convert config to application format', () => {
    const config = demoRegistry.getDemo('elt-pipeline')
    expect(config).toBeDefined()
    
    if (config) {
      const application = demoRegistry.configToApplication(config)
      expect(application).toHaveProperty('id')
      expect(application).toHaveProperty('name')
      expect(application).toHaveProperty('description')
      expect(application).toHaveProperty('category')
      expect(application).toHaveProperty('technologies')
      expect(application).toHaveProperty('status')
      expect(application).toHaveProperty('launchUrl')
      expect(application).toHaveProperty('testSuiteId')
    }
  })

  it('should search demos', () => {
    const results = demoRegistry.searchDemos('pipeline')
    expect(results.length).toBeGreaterThan(0)
    
    const pipelineDemo = results.find(demo => demo.id === 'elt-pipeline')
    expect(pipelineDemo).toBeDefined()
  })

  it('should get statistics', () => {
    const stats = demoRegistry.getStatistics()
    expect(stats).toHaveProperty('total')
    expect(stats).toHaveProperty('active')
    expect(stats).toHaveProperty('categories')
    expect(stats).toHaveProperty('technologies')
    expect(stats.total).toBeGreaterThan(0)
    expect(stats.technologies.length).toBeGreaterThan(0)
  })

  it('should validate demo configuration', () => {
    const validConfig = {
      id: 'test-demo',
      name: 'Test Demo',
      description: 'A test demo',
      category: 'data-processing',
      technologies: ['Vue.js'],
      route: '/demos/test',
      testSuiteId: 'test-suite'
    }

    const validation = demoRegistry.validateDemo(validConfig)
    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('should reject invalid demo configuration', () => {
    const invalidConfig = {
      id: '', // Invalid: empty ID
      name: 'Test Demo',
      // Missing required fields
    }

    const validation = demoRegistry.validateDemo(invalidConfig)
    expect(validation.valid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })
})