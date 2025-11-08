/**
 * Standardized error handling utilities for the application
 */

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  timestamp?: string
  metadata?: Record<string, any>
}

export interface StandardError {
  message: string
  code?: string
  context?: ErrorContext
  originalError?: unknown
  timestamp: string
}

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  public readonly code: string
  public readonly context: ErrorContext
  public readonly timestamp: string
  public readonly originalError?: unknown

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    context: Partial<ErrorContext> = {},
    originalError?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.context = {
      timestamp: new Date().toISOString(),
      ...context,
    }
    this.timestamp = this.context.timestamp || new Date().toISOString()
    this.originalError = originalError

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  /**
   * Create a user-friendly error message
   */
  toUserMessage(): string {
    const friendlyMessages: Record<string, string> = {
      NOT_FOUND: 'The requested item could not be found',
      STORAGE_FULL: 'Storage is full. Please free up some space and try again',
      INVALID_DATA: 'The data provided is invalid',
      STORAGE_UNAVAILABLE:
        'Storage is currently unavailable. Please try again later',
      NETWORK_ERROR:
        'Network connection failed. Please check your internet connection',
      PERMISSION_DENIED: 'You do not have permission to perform this action',
      VALIDATION_ERROR: 'Please check your input and try again',
      BOOKMARK_NOT_FOUND: 'Bookmark not found',
      COLLECTION_NOT_FOUND: 'Collection not found',
      IMPORT_FAILED: 'Failed to import data',
      EXPORT_FAILED: 'Failed to export data',
      AUTHENTICATION_FAILED: 'Authentication failed',
      RATE_LIMITED: 'Too many requests. Please try again later',
      UNKNOWN_ERROR: 'An unexpected error occurred',
    }

    return friendlyMessages[this.code] || this.message
  }

  /**
   * Convert to StandardError format
   */
  toStandardError(): StandardError {
    return {
      message: this.message,
      code: this.code,
      context: this.context,
      originalError: this.originalError,
      timestamp: this.timestamp,
    }
  }

  /**
   * Add additional context to the error
   */
  withContext(additionalContext: Partial<ErrorContext>): AppError {
    return new AppError(
      this.message,
      this.code,
      { ...this.context, ...additionalContext },
      this.originalError
    )
  }
}

/**
 * Bookmark-specific errors
 */
export class BookmarkError extends AppError {
  constructor(
    message: string,
    code:
      | 'NOT_FOUND'
      | 'INVALID_DATA'
      | 'STORAGE_FULL'
      | 'STORAGE_UNAVAILABLE'
      | 'VALIDATION_ERROR' = 'INVALID_DATA',
    context: Partial<ErrorContext> = {},
    originalError?: unknown
  ) {
    super(message, code, context, originalError)
    this.name = 'BookmarkError'
  }

  static notFound(id: string): BookmarkError {
    return new BookmarkError(`Bookmark with id ${id} not found`, 'NOT_FOUND', {
      action: 'find_bookmark',
      metadata: { bookmarkId: id },
    })
  }

  static invalidData(data: any): BookmarkError {
    return new BookmarkError('Invalid bookmark data provided', 'INVALID_DATA', {
      action: 'validate_bookmark',
      metadata: { data },
    })
  }

  static storageFull(): BookmarkError {
    return new BookmarkError('Storage is full', 'STORAGE_FULL', {
      action: 'save_bookmark',
    })
  }

  static storageUnavailable(): BookmarkError {
    return new BookmarkError('Storage is unavailable', 'STORAGE_UNAVAILABLE', {
      action: 'access_storage',
    })
  }
}

/**
 * Collection-specific errors
 */
export class CollectionError extends AppError {
  constructor(
    message: string,
    code:
      | 'NOT_FOUND'
      | 'INVALID_DATA'
      | 'STORAGE_FULL'
      | 'STORAGE_UNAVAILABLE'
      | 'VALIDATION_ERROR' = 'INVALID_DATA',
    context: Partial<ErrorContext> = {},
    originalError?: unknown
  ) {
    super(message, code, context, originalError)
    this.name = 'CollectionError'
  }

  static notFound(id: string): CollectionError {
    return new CollectionError(
      `Collection with id ${id} not found`,
      'NOT_FOUND',
      { action: 'find_collection', metadata: { collectionId: id } }
    )
  }

  static invalidData(data: any): CollectionError {
    return new CollectionError(
      'Invalid collection data provided',
      'INVALID_DATA',
      { action: 'validate_collection', metadata: { data } }
    )
  }
}

/**
 * Import/Export errors
 */
export class ImportExportError extends AppError {
  constructor(
    message: string,
    code:
      | 'IMPORT_FAILED'
      | 'EXPORT_FAILED'
      | 'INVALID_FORMAT'
      | 'FILE_TOO_LARGE'
      | 'PERMISSION_DENIED' = 'IMPORT_FAILED',
    context: Partial<ErrorContext> = {},
    originalError?: unknown
  ) {
    super(message, code, context, originalError)
    this.name = 'ImportExportError'
  }

  static importFailed(reason: string): ImportExportError {
    return new ImportExportError(`Import failed: ${reason}`, 'IMPORT_FAILED', {
      action: 'import_data',
      metadata: { reason },
    })
  }

  static exportFailed(reason: string): ImportExportError {
    return new ImportExportError(`Export failed: ${reason}`, 'EXPORT_FAILED', {
      action: 'export_data',
      metadata: { reason },
    })
  }

  static invalidFormat(format: string): ImportExportError {
    return new ImportExportError(
      `Invalid file format: ${format}`,
      'INVALID_FORMAT',
      { action: 'validate_format', metadata: { format } }
    )
  }

  static fileTooLarge(size: number, maxSize: number): ImportExportError {
    return new ImportExportError(
      `File too large: ${size} bytes (max: ${maxSize} bytes)`,
      'FILE_TOO_LARGE',
      { action: 'validate_file_size', metadata: { size, maxSize } }
    )
  }
}

/**
 * Network/API errors
 */
export class NetworkError extends AppError {
  constructor(
    message: string,
    code:
      | 'NETWORK_ERROR'
      | 'TIMEOUT'
      | 'RATE_LIMITED'
      | 'SERVER_ERROR' = 'NETWORK_ERROR',
    context: Partial<ErrorContext> = {},
    originalError?: unknown
  ) {
    super(message, code, context, originalError)
    this.name = 'NetworkError'
  }

  static connectionFailed(): NetworkError {
    return new NetworkError('Network connection failed', 'NETWORK_ERROR', {
      action: 'network_request',
    })
  }

  static timeout(duration: number): NetworkError {
    return new NetworkError(
      `Request timed out after ${duration}ms`,
      'TIMEOUT',
      { action: 'network_request', metadata: { timeout: duration } }
    )
  }

  static rateLimited(retryAfter?: number): NetworkError {
    return new NetworkError('Rate limit exceeded', 'RATE_LIMITED', {
      action: 'network_request',
      metadata: { retryAfter },
    })
  }

  static serverError(status: number): NetworkError {
    return new NetworkError(`Server error: ${status}`, 'SERVER_ERROR', {
      action: 'network_request',
      metadata: { status },
    })
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  public readonly field?: string
  public readonly value?: any

  constructor(
    message: string,
    field?: string,
    value?: any,
    context: Partial<ErrorContext> = {},
    originalError?: unknown
  ) {
    super(message, 'VALIDATION_ERROR', context, originalError)
    this.name = 'ValidationError'
    this.field = field
    this.value = value
  }

  static required(field: string): ValidationError {
    return new ValidationError(`${field} is required`, field, undefined, {
      action: 'validate_required',
      metadata: { field },
    })
  }

  static invalidFormat(
    field: string,
    value: any,
    expectedFormat: string
  ): ValidationError {
    return new ValidationError(
      `${field} has invalid format. Expected: ${expectedFormat}`,
      field,
      value,
      { action: 'validate_format', metadata: { field, expectedFormat } }
    )
  }

  static tooLong(
    field: string,
    value: any,
    maxLength: number
  ): ValidationError {
    return new ValidationError(
      `${field} is too long. Maximum length: ${maxLength}`,
      field,
      value,
      { action: 'validate_length', metadata: { field, maxLength } }
    )
  }

  static tooShort(
    field: string,
    value: any,
    minLength: number
  ): ValidationError {
    return new ValidationError(
      `${field} is too short. Minimum length: ${minLength}`,
      field,
      value,
      { action: 'validate_length', metadata: { field, minLength } }
    )
  }
}

/**
 * Create a standardized error handler for a specific context
 */
export const createErrorHandler = (context: string) => {
  return (
    error: unknown,
    additionalContext?: Partial<ErrorContext>
  ): AppError => {
    // If it's already an AppError, just add context
    if (error instanceof AppError) {
      return error.withContext({ component: context, ...additionalContext })
    }

    // Convert unknown error to AppError
    const appError = new AppError(
      getErrorMessage(error),
      getErrorCode(error) || 'UNKNOWN_ERROR',
      {
        component: context,
        ...additionalContext,
      },
      error
    )

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}]`, appError)
    }

    return appError
  }
}

/**
 * Extract a user-friendly error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'An unexpected error occurred'
}

/**
 * Extract error code from various error types
 */
export const getErrorCode = (error: unknown): string | undefined => {
  if (error && typeof error === 'object') {
    if ('code' in error) {
      return String(error.code)
    }
    if ('name' in error) {
      return String(error.name)
    }
  }

  return undefined
}

/**
 * Check if an error is a specific type
 */
export const isErrorType = (error: unknown, type: string): boolean => {
  if (error instanceof Error) {
    return error.name === type
  }

  if (error && typeof error === 'object' && 'name' in error) {
    return error.name === type
  }

  return false
}

/**
 * Create a user-friendly error message for display
 */
export const createUserFriendlyMessage = (
  error: AppError | StandardError
): string => {
  if (error instanceof AppError) {
    return error.toUserMessage()
  }

  const { message, code, context } = error

  // Map technical error codes to user-friendly messages
  const friendlyMessages: Record<string, string> = {
    NOT_FOUND: 'The requested item could not be found',
    STORAGE_FULL: 'Storage is full. Please free up some space and try again',
    INVALID_DATA: 'The data provided is invalid',
    STORAGE_UNAVAILABLE:
      'Storage is currently unavailable. Please try again later',
    NETWORK_ERROR:
      'Network connection failed. Please check your internet connection',
    PERMISSION_DENIED: 'You do not have permission to perform this action',
    VALIDATION_ERROR: 'Please check your input and try again',
  }

  // Return user-friendly message if available, otherwise return original message
  if (code && friendlyMessages[code]) {
    return friendlyMessages[code]
  }

  // For development, include context information
  if (process.env.NODE_ENV === 'development' && context?.component) {
    return `${message} (${context.component})`
  }

  return message
}

/**
 * Handle async operations with standardized error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await operation()
  } catch (error) {
    const errorHandler = createErrorHandler(context)
    const appError = errorHandler(error)

    // Log error
    console.error(`[${context}] Operation failed:`, appError)

    // Return fallback value if provided
    return fallback
  }
}

/**
 * Create a retry mechanism with exponential backoff
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries) {
        const errorHandler = createErrorHandler(context)
        const appError = errorHandler(error, {
          action: `retry_failed_after_${maxRetries}_attempts`,
        })
        throw appError
      }

      // Exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Validate error response and extract meaningful information
 */
export const validateErrorResponse = (response: unknown): AppError => {
  if (response && typeof response === 'object') {
    const error = response as any

    return new AppError(
      error.message || error.error || 'Unknown error occurred',
      error.code || error.status || 'UNKNOWN_ERROR',
      { action: 'validate_response' },
      response
    )
  }

  return new AppError(
    'Invalid error response format',
    'INVALID_RESPONSE',
    { action: 'validate_response' },
    response
  )
}

/**
 * Check if an error is a specific AppError type
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError
}

/**
 * Check if an error is a specific error class
 */
export const isErrorClass = <T extends AppError>(
  error: unknown,
  errorClass: new (...args: any[]) => T
): error is T => {
  return error instanceof errorClass
}

/**
 * Safely extract error information without throwing
 */
export const safeGetErrorInfo = (
  error: unknown
): {
  message: string
  code?: string
  isAppError: boolean
} => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      isAppError: true,
    }
  }

  return {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    isAppError: false,
  }
}

/**
 * Create a safe error boundary handler
 */
export const createSafeErrorHandler = (context: string) => {
  return (
    error: unknown,
    additionalContext?: Partial<ErrorContext>
  ): AppError => {
    try {
      return createErrorHandler(context)(error, additionalContext)
    } catch (handlerError) {
      // If the error handler itself fails, create a basic error
      return new AppError('Error handler failed', 'HANDLER_ERROR', {
        component: context,
        action: 'handle_error',
        metadata: {
          originalError: String(error),
          handlerError: String(handlerError),
        },
      })
    }
  }
}

export default {
  // Error classes
  AppError,
  BookmarkError,
  CollectionError,
  ImportExportError,
  NetworkError,
  ValidationError,

  // Utility functions
  createErrorHandler,
  createSafeErrorHandler,
  getErrorMessage,
  getErrorCode,
  isErrorType,
  isAppError,
  isErrorClass,
  createUserFriendlyMessage,
  withErrorHandling,
  withRetry,
  validateErrorResponse,
  safeGetErrorInfo,
}
