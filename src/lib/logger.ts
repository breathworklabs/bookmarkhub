/**
 * Centralized logging service for the application
 * Provides structured logging with different levels and optional user notifications
 */

import toast from 'react-hot-toast'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogOptions {
  /** Show toast notification to user */
  notify?: boolean
  /** Toast duration in milliseconds */
  notifyDuration?: number
  /** Additional context data */
  context?: Record<string, unknown>
  /** Whether to log to console in development */
  silent?: boolean
}

class Logger {
  private isDevelopment = import.meta.env.DEV

  /**
   * Log debug information (development only)
   */
  debug(message: string, options?: LogOptions): void {
    if (!this.isDevelopment || options?.silent) return
    console.debug(`[DEBUG] ${message}`, options?.context || '')
  }

  /**
   * Log informational message
   */
  info(message: string, options?: LogOptions): void {
    if (!options?.silent && this.isDevelopment) {
      console.info(`[INFO] ${message}`, options?.context || '')
    }
    if (options?.notify) {
      toast(message, { duration: options.notifyDuration || 2000 })
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, error?: Error | unknown, options?: LogOptions): void {
    if (!options?.silent && this.isDevelopment) {
      console.warn(`[WARN] ${message}`, error || '', options?.context || '')
    }
    if (options?.notify) {
      toast(message, {
        duration: options.notifyDuration || 3000,
        icon: '⚠️',
      })
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    const errorDetails = error instanceof Error ? error.message : String(error)

    if (!options?.silent) {
      console.error(`[ERROR] ${message}`, {
        error: errorDetails,
        ...options?.context,
      })
    }

    if (options?.notify) {
      toast.error(message, { duration: options.notifyDuration || 4000 })
    }

    // In production, you might want to send errors to a service like Sentry
    // if (!this.isDevelopment) {
    //   sendToErrorTracking({ message, error, context: options?.context })
    // }
  }

  /**
   * Log success message
   */
  success(message: string, options?: Omit<LogOptions, 'notify'>): void {
    if (!options?.silent && this.isDevelopment) {
      console.info(`[SUCCESS] ${message}`, options?.context || '')
    }
    toast.success(message, { duration: options?.notifyDuration || 2000 })
  }
}

export const logger = new Logger()
