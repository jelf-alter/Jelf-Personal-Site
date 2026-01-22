// Utility functions for data validation

/**
 * Check if a value is not null, undefined, or empty string
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if string meets minimum length requirement
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

/**
 * Check if string doesn't exceed maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}

/**
 * Validate that a number is within a specified range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * Check if a value matches a regex pattern
 */
export const matchesPattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value)
}

/**
 * Validate that a value is a positive number
 */
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value > 0 && !isNaN(value)
}

/**
 * Validate that a value is a non-negative number
 */
export const isNonNegativeNumber = (value: number): boolean => {
  return typeof value === 'number' && value >= 0 && !isNaN(value)
}

/**
 * Check if a string contains only alphanumeric characters
 */
export const isAlphanumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value)
}

/**
 * Validate phone number format (basic validation)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Check if a date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  return date.getTime() > Date.now()
}

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  return date.getTime() < Date.now()
}

/**
 * Validate that a percentage is between 0 and 100
 */
export const isValidPercentage = (value: number): boolean => {
  return isInRange(value, 0, 100)
}

/**
 * Check if an array has a minimum number of items
 */
export const hasMinItems = <T>(array: T[], minItems: number): boolean => {
  return Array.isArray(array) && array.length >= minItems
}

/**
 * Check if an array doesn't exceed maximum number of items
 */
export const hasMaxItems = <T>(array: T[], maxItems: number): boolean => {
  return Array.isArray(array) && array.length <= maxItems
}

/**
 * Validate that all items in an array are unique
 */
export const hasUniqueItems = <T>(array: T[]): boolean => {
  return Array.isArray(array) && new Set(array).size === array.length
}

/**
 * Type guard to check if a value is a string
 */
export const isString = (value: any): value is string => {
  return typeof value === 'string'
}

/**
 * Type guard to check if a value is a number
 */
export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Type guard to check if a value is a boolean
 */
export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean'
}

/**
 * Type guard to check if a value is an object
 */
export const isObject = (value: any): value is object => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Type guard to check if a value is an array
 */
export const isArray = (value: any): value is any[] => {
  return Array.isArray(value)
}

/**
 * Comprehensive validation function that takes multiple validators
 */
export const validate = (
  value: any,
  validators: Array<(val: any) => boolean | string>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  for (const validator of validators) {
    const result = validator(value)
    if (result === false) {
      errors.push('Validation failed')
    } else if (typeof result === 'string') {
      errors.push(result)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}