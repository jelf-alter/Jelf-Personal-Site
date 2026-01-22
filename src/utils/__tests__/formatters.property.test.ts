import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { propertyTestConfig, arbSafeString } from '@/test/property-generators'
import {
  formatPercentage,
  formatDuration,
  formatRelativeTime,
  formatDate,
  formatFileSize,
  formatNumber,
  truncateText,
  capitalize,
  toKebabCase,
  toCamelCase
} from '../formatters'

describe('Formatters Property-Based Tests', () => {
  describe('**Feature: personal-website, Property 10: Percentage Formatting**', () => {
    it('should always format percentages correctly for any valid number', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          fc.integer({ min: 0, max: 5 }),
          (value, decimals) => {
            const result = formatPercentage(value, decimals)
            
            // Property: Result should always end with '%'
            expect(result).toMatch(/%$/)
            
            // Property: Result should contain the value with correct decimal places
            const expectedValue = value.toFixed(decimals)
            expect(result).toBe(`${expectedValue}%`)
            
            // Property: Result should be a valid string representation
            expect(typeof result).toBe('string')
            expect(result.length).toBeGreaterThan(1) // At least number + %
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 11: Duration Formatting**', () => {
    it('should always format durations correctly for any positive number', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3600000 }), // 0 to 1 hour in milliseconds
          (milliseconds) => {
            const result = formatDuration(milliseconds)
            
            // Property: Result should always be a non-empty string
            expect(typeof result).toBe('string')
            expect(result.length).toBeGreaterThan(0)
            
            if (milliseconds < 1000) {
              // Property: Values less than 1000ms should end with 'ms'
              expect(result).toMatch(/ms$/)
              expect(result).toBe(`${milliseconds}ms`)
            } else if (milliseconds < 60000) {
              // Property: Values less than 60s should end with 's'
              expect(result).toMatch(/s$/)
            } else {
              // Property: Values 60s or more should contain 'm' and 's'
              expect(result).toMatch(/m.*s$/)
            }
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 12: File Size Formatting**', () => {
    it('should always format file sizes correctly for any non-negative number', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1024 * 1024 * 1024 }), // 0 to 1GB
          (bytes) => {
            const result = formatFileSize(bytes)
            
            // Property: Result should always be a non-empty string
            expect(typeof result).toBe('string')
            expect(result.length).toBeGreaterThan(0)
            
            // Property: Result should contain a valid unit
            expect(result).toMatch(/\s(B|KB|MB|GB|TB)$/)
            
            if (bytes === 0) {
              // Property: Zero bytes should return '0 B'
              expect(result).toBe('0 B')
            } else {
              // Property: Non-zero values should have a numeric part
              expect(result).toMatch(/^[\d.]+\s/)
            }
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 13: Text Truncation**', () => {
    it('should always truncate text correctly for any string and length', () => {
      fc.assert(
        fc.property(
          arbSafeString(0, 200),
          fc.integer({ min: 1, max: 100 }),
          (text, maxLength) => {
            const result = truncateText(text, maxLength)
            
            // Property: Result should never exceed maxLength
            expect(result.length).toBeLessThanOrEqual(maxLength)
            
            if (text.length <= maxLength) {
              // Property: Short text should remain unchanged
              expect(result).toBe(text)
            } else if (maxLength <= 3) {
              // Property: Very short maxLength should just truncate
              expect(result).toBe(text.substring(0, maxLength))
            } else {
              // Property: Long text should be truncated with ellipsis
              expect(result).toMatch(/\.\.\.$/)
              expect(result.length).toBe(maxLength)
              
              // Property: Truncated text should be a prefix of original
              const withoutEllipsis = result.slice(0, -3)
              expect(text.startsWith(withoutEllipsis)).toBe(true)
            }
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 14: String Capitalization**', () => {
    it('should always capitalize strings correctly for any non-empty string', () => {
      fc.assert(
        fc.property(
          arbSafeString(1, 100),
          (str) => {
            const result = capitalize(str)
            
            // Property: Result should have same length as input
            expect(result.length).toBe(str.length)
            
            // Property: First character should be uppercase
            expect(result[0]).toBe(str[0].toUpperCase())
            
            // Property: Rest of string should remain unchanged
            if (str.length > 1) {
              expect(result.slice(1)).toBe(str.slice(1))
            }
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 15: Kebab Case Conversion**', () => {
    it('should always convert to kebab-case correctly for any string', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')), { minLength: 1, maxLength: 50 }),
          (str) => {
            const result = toKebabCase(str)
            
            // Property: Result should be lowercase
            expect(result).toBe(result.toLowerCase())
            
            // Property: Result should not contain uppercase letters
            expect(result).not.toMatch(/[A-Z]/)
            
            // Property: Result should only contain lowercase letters, numbers, and hyphens
            expect(result).toMatch(/^[a-z0-9-]*$/)
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 16: Camel Case Conversion**', () => {
    it('should always convert kebab-case to camelCase correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          (words) => {
            const kebabCase = words.join('-')
            const result = toCamelCase(kebabCase)
            
            // Property: Result should not contain hyphens
            expect(result).not.toMatch(/-/)
            
            // Property: First word should remain lowercase
            if (words.length > 0) {
              expect(result.startsWith(words[0])).toBe(true)
            }
            
            // Property: Result should only contain letters and numbers
            expect(result).toMatch(/^[a-zA-Z0-9]*$/)
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 17: Number Formatting**', () => {
    it('should always format numbers with proper thousand separators', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000000, max: 1000000 }),
          (num) => {
            const result = formatNumber(num)
            
            // Property: Result should be a string
            expect(typeof result).toBe('string')
            
            // Property: Result should represent the same numeric value
            const parsed = parseFloat(result.replace(/,/g, ''))
            expect(parsed).toBe(num)
            
            // Property: Large numbers should contain commas
            if (Math.abs(num) >= 1000) {
              expect(result).toMatch(/,/)
            }
            
            // Property: Small numbers should not contain commas
            if (Math.abs(num) < 1000) {
              expect(result).not.toMatch(/,/)
            }
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 18: Date Formatting**', () => {
    it('should always format dates consistently for any valid date', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
          (date) => {
            const result = formatDate(date)
            
            // Property: Result should be a non-empty string
            expect(typeof result).toBe('string')
            expect(result.length).toBeGreaterThan(0)
            
            // Property: Result should contain month, day, and year
            expect(result).toMatch(/\w+\s+\d+,\s+\d{4}/)
            
            // Property: Result should be parseable back to a date
            const parsed = new Date(result)
            expect(parsed.getFullYear()).toBe(date.getFullYear())
            expect(parsed.getMonth()).toBe(date.getMonth())
            expect(parsed.getDate()).toBe(date.getDate())
          }
        ),
        propertyTestConfig
      )
    })
  })

  describe('**Feature: personal-website, Property 19: Relative Time Formatting**', () => {
    it('should always format relative time correctly for any past date', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 365 * 24 * 60 * 60 * 1000 }), // 0 to 1 year in milliseconds
          (millisecondsAgo) => {
            const pastDate = new Date(Date.now() - millisecondsAgo)
            const result = formatRelativeTime(pastDate)
            
            // Property: Result should be a non-empty string
            expect(typeof result).toBe('string')
            expect(result.length).toBeGreaterThan(0)
            
            if (millisecondsAgo < 60000) {
              // Property: Recent times should say "just now"
              expect(result).toBe('just now')
            } else {
              // Property: Older times should contain "ago"
              expect(result).toMatch(/ago$/)
            }
            
            // Property: Result should contain time units
            expect(result).toMatch(/(just now|minute|hour|day|month|year)/)
          }
        ),
        propertyTestConfig
      )
    })
  })
})