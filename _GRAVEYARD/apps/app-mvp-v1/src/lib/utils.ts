import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with clsx support.
 * Resolves conflicts (e.g. bg-red + bg-blue → bg-blue).
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs))
}

// ============================================================================
// Date Formatting Utilities (pt-BR locale)
// ============================================================================

/**
 * Format a date to Brazilian Portuguese locale
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', options).format(dateObj)
}

/**
 * Format a date to short format (DD/MM/YYYY)
 * @param date - Date to format
 * @returns Short date string
 */
export function formatDateShort(date: Date | string | number): string {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Format a date to include time (DD/MM/YYYY HH:MM)
 * @param date - Date to format
 * @returns Date and time string
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a date to relative time (e.g., "há 2 dias", "em 3 horas")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
  
  const intervals = [
    { seconds: 31536000, unit: 'year' as Intl.RelativeTimeFormatUnit },
    { seconds: 2592000, unit: 'month' as Intl.RelativeTimeFormatUnit },
    { seconds: 86400, unit: 'day' as Intl.RelativeTimeFormatUnit },
    { seconds: 3600, unit: 'hour' as Intl.RelativeTimeFormatUnit },
    { seconds: 60, unit: 'minute' as Intl.RelativeTimeFormatUnit },
  ]
  
  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds)
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? count : -count, interval.unit)
    }
  }
  
  return rtf.format(-diffInSeconds, 'second')
}

/**
 * Calculate days until a deadline
 * @param deadline - Deadline date
 * @returns Number of days (negative if past deadline)
 */
export function daysUntil(deadline: Date | string | number): number {
  const deadlineObj = typeof deadline === 'string' || typeof deadline === 'number' ? new Date(deadline) : deadline
  const now = new Date()
  const diffInMs = deadlineObj.getTime() - now.getTime()
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
}

/**
 * Format a deadline with urgency context
 * @param deadline - Deadline date
 * @returns Formatted deadline string with context
 */
export function formatDeadline(deadline: Date | string | number): string {
  const days = daysUntil(deadline)
  
  if (days < 0) {
    return `Venceu há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`
  } else if (days === 0) {
    return 'Vence hoje'
  } else if (days === 1) {
    return 'Vence amanhã'
  } else if (days <= 7) {
    return `Vence em ${days} dias`
  } else {
    return formatDateShort(deadline)
  }
}

// ============================================================================
// Number and Currency Formatting Utilities (pt-BR locale)
// ============================================================================

/**
 * Format a number to Brazilian Portuguese locale
 * @param value - Number to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('pt-BR', options).format(value)
}

/**
 * Format a currency value in Brazilian Reais (BRL)
 * @param value - Amount to format
 * @param currency - Currency code (default: BRL)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'BRL'
): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value)
}

/**
 * Format a percentage value
 * @param value - Decimal value (e.g., 0.75 for 75%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimals: number = 0
): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a compact number (e.g., 1.5K, 2.3M)
 * @param value - Number to format
 * @returns Compact number string
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

// ============================================================================
// Debounce and Throttle Helpers
// ============================================================================

/**
 * Debounce a function call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle a function call
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Truncate a string to a maximum length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 */
export function truncate(
  str: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert a string to kebab-case
 * @param str - String to convert
 * @returns Kebab-cased string
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate an email address
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate a URL
 * @param url - URL to validate
 * @returns True if valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Group an array of objects by a key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 */
export function groupBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Remove duplicates from an array
 * @param array - Array to deduplicate
 * @returns Array without duplicates
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

// ============================================================================
// Miscellaneous Utilities
// ============================================================================

/**
 * Sleep for a specified duration
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a random ID
 * @param prefix - Optional prefix
 * @returns Random ID string
 */
export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).substring(2, 11)
  return prefix ? `${prefix}-${id}` : id
}

/**
 * Clamp a number between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Format duration in months to a readable string
 * @param months - Number of months
 * @returns Formatted duration string
 */
export function formatDuration(months: number): string {
  if (months < 1) return 'Menos de 1 mês'
  if (months === 1) return '1 mês'
  if (months < 12) return `${months} meses`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} meses`
}

/**
 * Format a price value
 * @param price - Price value
 * @returns Formatted price string
 */
export function formatPrice(price: number | string | null): string {
  if (price == null || price === '') return 'Sob consulta'
  return formatCurrency(Number(price))
}
