// Property-based testing generators using fast-check
import * as fc from 'fast-check'
import type { 
  IUserProfile, 
  ISkill, 
  IAchievement, 
  ISocialLink,
  IDemoApplication,
  ITestSuite,
  ICoverageMetrics,
  IPipelineStep,
  IELTPipeline
} from '@/types'

// Safe string generators that avoid HTML-like content
export const arbSafeString = (minLength = 1, maxLength = 50) => 
  fc.stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_'.split('')), 
    { minLength, maxLength }
  ).filter(s => s.trim().length >= minLength)

export const arbString = (minLength = 1, maxLength = 50) => 
  arbSafeString(minLength, maxLength)

export const arbEmail = () => 
  fc.emailAddress()

export const arbUrl = () => 
  fc.webUrl()

export const arbPercentage = () => 
  fc.float({ min: 0, max: 100 })

export const arbPositiveInteger = (max = 1000) => 
  fc.integer({ min: 1, max })

export const arbNonNegativeInteger = (max = 1000) => 
  fc.integer({ min: 0, max })

export const arbDate = () => 
  fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })

export const arbPastDate = () => 
  fc.date({ min: new Date('2020-01-01'), max: new Date() })

export const arbFutureDate = () => 
  fc.date({ min: new Date(), max: new Date('2030-12-31') })

// Skill level generator
export const arbSkillLevel = () => 
  fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert')

// Social platform generator
export const arbSocialPlatform = () => 
  fc.constantFrom('github', 'linkedin', 'twitter', 'email', 'website', 'other')

// Demo status generator
export const arbDemoStatus = () => 
  fc.constantFrom('active', 'maintenance', 'archived')

// Test status generator
export const arbTestStatus = () => 
  fc.constantFrom('pass', 'fail', 'skip')

// Pipeline step status generator
export const arbPipelineStepStatus = () => 
  fc.constantFrom('pending', 'running', 'completed', 'failed')

// Pipeline step type generator
export const arbPipelineStepType = () => 
  fc.constantFrom('extract', 'load', 'transform')

// Achievement category generator
export const arbAchievementCategory = () => 
  fc.constantFrom('project', 'certification', 'award', 'milestone')

// Complex object generators
export const arbSkill = (): fc.Arbitrary<ISkill> => 
  fc.record({
    id: arbSafeString(1, 20),
    name: arbSafeString(2, 30),
    category: arbSafeString(2, 20),
    level: arbSkillLevel(),
    yearsOfExperience: fc.option(arbPositiveInteger(20)),
    description: fc.option(arbSafeString(10, 100))
  })

export const arbAchievement = (): fc.Arbitrary<IAchievement> => 
  fc.record({
    id: arbSafeString(1, 20),
    title: arbSafeString(5, 50),
    description: arbSafeString(10, 200),
    date: arbPastDate(),
    category: arbAchievementCategory(),
    url: fc.option(arbUrl())
  })

export const arbSocialLink = (): fc.Arbitrary<ISocialLink> => 
  fc.record({
    id: arbSafeString(1, 20),
    platform: arbSocialPlatform(),
    url: arbUrl(),
    displayName: arbSafeString(2, 30),
    icon: fc.option(arbSafeString(1, 10))
  })

export const arbUserProfile = (): fc.Arbitrary<IUserProfile> => 
  fc.record({
    name: arbSafeString(2, 50),
    title: arbSafeString(5, 50),
    email: arbEmail(),
    location: arbSafeString(2, 50),
    summary: arbSafeString(20, 300),
    skills: fc.array(arbSkill(), { minLength: 0, maxLength: 20 }),
    achievements: fc.array(arbAchievement(), { minLength: 0, maxLength: 10 }),
    socialLinks: fc.array(arbSocialLink(), { minLength: 0, maxLength: 5 })
  })

export const arbCoverageMetrics = (): fc.Arbitrary<ICoverageMetrics> => 
  fc.record({
    lines: fc.record({
      covered: arbNonNegativeInteger(1000),
      total: arbPositiveInteger(1000),
      percentage: arbPercentage()
    }),
    branches: fc.record({
      covered: arbNonNegativeInteger(100),
      total: arbPositiveInteger(100),
      percentage: arbPercentage()
    }),
    functions: fc.record({
      covered: arbNonNegativeInteger(100),
      total: arbPositiveInteger(100),
      percentage: arbPercentage()
    }),
    statements: fc.record({
      covered: arbNonNegativeInteger(1000),
      total: arbPositiveInteger(1000),
      percentage: arbPercentage()
    })
  })

export const arbDemoApplication = (): fc.Arbitrary<IDemoApplication> => 
  fc.record({
    id: arbSafeString(3, 30),
    name: arbSafeString(5, 50),
    description: arbSafeString(20, 200),
    category: arbSafeString(3, 30),
    technologies: fc.array(arbSafeString(2, 20), { minLength: 1, maxLength: 10 }),
    status: arbDemoStatus(),
    launchUrl: arbSafeString(5, 100),
    sourceUrl: fc.option(arbUrl()),
    testSuiteId: arbSafeString(3, 30),
    featured: fc.option(fc.boolean()),
    screenshots: fc.option(fc.array(arbUrl(), { maxLength: 5 })),
    createdDate: arbPastDate(),
    lastUpdated: arbDate()
  })

export const arbPipelineStep = (): fc.Arbitrary<IPipelineStep> => 
  fc.record({
    id: arbSafeString(3, 20),
    name: arbSafeString(5, 30),
    status: arbPipelineStepStatus(),
    progress: arbPercentage(),
    startTime: fc.option(arbPastDate()),
    endTime: fc.option(arbDate()),
    inputData: fc.option(fc.anything()),
    outputData: fc.option(fc.anything()),
    errorMessage: fc.option(arbSafeString(10, 100)),
    stepType: arbPipelineStepType(),
    metadata: fc.option(fc.dictionary(arbSafeString(1, 20), fc.anything()))
  })

// Viewport size generator for responsive testing
export const arbViewportSize = () => 
  fc.record({
    width: fc.integer({ min: 320, max: 1920 }),
    height: fc.integer({ min: 568, max: 1080 })
  })

// Performance metrics generator
export const arbCoreWebVitals = () => 
  fc.record({
    lcp: fc.float({ min: 0, max: 10 }), // Largest Contentful Paint
    fid: fc.float({ min: 0, max: 1000 }), // First Input Delay
    cls: fc.float({ min: 0, max: 1 }) // Cumulative Layout Shift
  })

// Test data generators for specific scenarios
export const arbValidEmail = () => 
  fc.tuple(
    arbSafeString(1, 20),
    arbSafeString(1, 20),
    arbSafeString(2, 10)
  ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`)

export const arbValidUrl = () => 
  fc.tuple(
    fc.constantFrom('http', 'https'),
    arbSafeString(1, 20),
    arbSafeString(2, 10)
  ).map(([protocol, domain, tld]) => `${protocol}://${domain}.${tld}`)

// Generator for testing edge cases (but safe for Vue templates)
export const arbEdgeCaseString = () => 
  fc.oneof(
    fc.constant('Test'),
    fc.constant('A'),
    fc.constant('Hello World'),
    arbSafeString(1, 1),
    arbSafeString(50, 100)
  )

// Generator for testing boundary values
export const arbBoundaryNumber = () => 
  fc.oneof(
    fc.constant(0),
    fc.constant(-1),
    fc.constant(1),
    fc.constant(1000),
    fc.constant(-1000)
  )

// Custom generators for specific business logic
export const arbValidSkillLevel = () => 
  fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert')

export const arbValidPercentage = () => 
  fc.float({ min: 0, max: 100, noNaN: true })

export const arbValidCoverageData = () => 
  fc.tuple(arbNonNegativeInteger(1000), arbNonNegativeInteger(1000))
    .filter(([covered, total]) => covered <= total)
    .map(([covered, total]) => ({
      covered,
      total,
      percentage: total > 0 ? (covered / total) * 100 : 0
    }))

// Property test configuration
export const propertyTestConfig = {
  numRuns: 100, // Minimum iterations as specified in design
  timeout: 5000,
  verbose: true
}