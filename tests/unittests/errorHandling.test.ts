import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  AppError,
  BookmarkError,
  CollectionError,
  ImportExportError,
  NetworkError,
  ErrorContext,
  StandardError,
  createUserFriendlyMessage,
  withErrorHandling,
  withRetry,
  validateErrorResponse,
  isAppError,
  isErrorClass,
  safeGetErrorInfo,
  createSafeErrorHandler
} from '../../src/utils/errorHandling'

describe('errorHandling', () => {
  describe('AppError', () => {
    it('should create an error with message and code', () => {
      const error = new AppError('Test error', 'TEST_ERROR')

      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.name).toBe('AppError')
      expect(error.timestamp).toBeDefined()
    })

    it('should default to UNKNOWN_ERROR code', () => {
      const error = new AppError('Test error')

      expect(error.code).toBe('UNKNOWN_ERROR')
    })

    it('should include context', () => {
      const context: ErrorContext = {
        component: 'BookmarkList',
        action: 'delete',
        metadata: { id: '123' }
      }

      const error = new AppError('Test error', 'TEST_ERROR', context)

      expect(error.context.component).toBe('BookmarkList')
      expect(error.context.action).toBe('delete')
      expect(error.context.metadata).toEqual({ id: '123' })
      expect(error.context.timestamp).toBeDefined()
    })

    it('should preserve original error', () => {
      const originalError = new Error('Original error')
      const error = new AppError('Test error', 'TEST_ERROR', {}, originalError)

      expect(error.originalError).toBe(originalError)
    })

    it('should return user-friendly message', () => {
      const error1 = new AppError('Technical message', 'NOT_FOUND')
      expect(error1.toUserMessage()).toBe('The requested item could not be found')

      const error2 = new AppError('Technical message', 'STORAGE_FULL')
      expect(error2.toUserMessage()).toBe('Storage is full. Please free up some space and try again')

      const error3 = new AppError('Custom message', 'CUSTOM_CODE')
      expect(error3.toUserMessage()).toBe('Custom message')
    })

    it('should convert to standard error format', () => {
      const error = new AppError('Test error', 'TEST_ERROR', { component: 'TestComponent' })
      const standardError: StandardError = error.toStandardError()

      expect(standardError.message).toBe('Test error')
      expect(standardError.code).toBe('TEST_ERROR')
      expect(standardError.context?.component).toBe('TestComponent')
      expect(standardError.timestamp).toBeDefined()
    })

    it('should add context with withContext method', () => {
      const error = new AppError('Test error', 'TEST_ERROR', { component: 'Component1' })
      const enhancedError = error.withContext({ action: 'delete' })

      expect(enhancedError.context.component).toBe('Component1')
      expect(enhancedError.context.action).toBe('delete')
      expect(enhancedError.message).toBe('Test error')
      expect(enhancedError.code).toBe('TEST_ERROR')
    })

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 'TEST_ERROR')

      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('AppError')
    })
  })

  describe('BookmarkError', () => {
    it('should create a bookmark error', () => {
      const error = new BookmarkError('Bookmark error', 'NOT_FOUND')

      expect(error.name).toBe('BookmarkError')
      expect(error.message).toBe('Bookmark error')
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create notFound error with factory method', () => {
      const error = BookmarkError.notFound('bookmark-123')

      expect(error.message).toBe('Bookmark with id bookmark-123 not found')
      expect(error.code).toBe('NOT_FOUND')
      expect(error.context.action).toBe('find_bookmark')
      expect(error.context.metadata?.bookmarkId).toBe('bookmark-123')
    })

    it('should create invalidData error with factory method', () => {
      const invalidData = { url: '' }
      const error = BookmarkError.invalidData(invalidData)

      expect(error.message).toBe('Invalid bookmark data provided')
      expect(error.code).toBe('INVALID_DATA')
      expect(error.context.action).toBe('validate_bookmark')
      expect(error.context.metadata?.data).toEqual(invalidData)
    })

    it('should create storageFull error with factory method', () => {
      const error = BookmarkError.storageFull()

      expect(error.message).toBe('Storage is full')
      expect(error.code).toBe('STORAGE_FULL')
      expect(error.context.action).toBe('save_bookmark')
      expect(error.toUserMessage()).toBe('Storage is full. Please free up some space and try again')
    })

    it('should create storageUnavailable error with factory method', () => {
      const error = BookmarkError.storageUnavailable()

      expect(error.message).toBe('Storage is unavailable')
      expect(error.code).toBe('STORAGE_UNAVAILABLE')
      expect(error.context.action).toBe('access_storage')
      expect(error.toUserMessage()).toBe('Storage is currently unavailable. Please try again later')
    })

    it('should default to INVALID_DATA code', () => {
      const error = new BookmarkError('Test error')

      expect(error.code).toBe('INVALID_DATA')
    })
  })

  describe('CollectionError', () => {
    it('should create a collection error', () => {
      const error = new CollectionError('Collection error', 'NOT_FOUND')

      expect(error.name).toBe('CollectionError')
      expect(error.message).toBe('Collection error')
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create notFound error with factory method', () => {
      const error = CollectionError.notFound('collection-456')

      expect(error.message).toBe('Collection with id collection-456 not found')
      expect(error.code).toBe('NOT_FOUND')
      expect(error.context.action).toBe('find_collection')
      expect(error.context.metadata?.collectionId).toBe('collection-456')
    })

    it('should create invalidData error with factory method', () => {
      const invalidData = { name: '' }
      const error = CollectionError.invalidData(invalidData)

      expect(error.message).toBe('Invalid collection data provided')
      expect(error.code).toBe('INVALID_DATA')
      expect(error.context.action).toBe('validate_collection')
      expect(error.context.metadata?.data).toEqual(invalidData)
    })

    it('should default to INVALID_DATA code', () => {
      const error = new CollectionError('Test error')

      expect(error.code).toBe('INVALID_DATA')
    })
  })

  describe('ImportExportError', () => {
    it('should create an import/export error', () => {
      const error = new ImportExportError('Import failed', 'IMPORT_FAILED')

      expect(error.name).toBe('ImportExportError')
      expect(error.message).toBe('Import failed')
      expect(error.code).toBe('IMPORT_FAILED')
    })

    it('should create importFailed error with factory method', () => {
      const error = ImportExportError.importFailed('Invalid JSON format')

      expect(error.message).toBe('Import failed: Invalid JSON format')
      expect(error.code).toBe('IMPORT_FAILED')
      expect(error.context.action).toBe('import_data')
      expect(error.context.metadata?.reason).toBe('Invalid JSON format')
    })

    it('should create exportFailed error with factory method', () => {
      const error = ImportExportError.exportFailed('Disk full')

      expect(error.message).toBe('Export failed: Disk full')
      expect(error.code).toBe('EXPORT_FAILED')
      expect(error.context.action).toBe('export_data')
      expect(error.context.metadata?.reason).toBe('Disk full')
    })

    it('should create invalidFormat error with factory method', () => {
      const error = ImportExportError.invalidFormat('.xyz')

      expect(error.message).toBe('Invalid file format: .xyz')
      expect(error.code).toBe('INVALID_FORMAT')
      expect(error.context.action).toBe('validate_format')
      expect(error.context.metadata?.format).toBe('.xyz')
    })

    it('should create fileTooLarge error with factory method', () => {
      const error = ImportExportError.fileTooLarge(10000000, 5000000)

      expect(error.message).toBe('File too large: 10000000 bytes (max: 5000000 bytes)')
      expect(error.code).toBe('FILE_TOO_LARGE')
      expect(error.context.action).toBe('validate_file_size')
      expect(error.context.metadata?.size).toBe(10000000)
      expect(error.context.metadata?.maxSize).toBe(5000000)
    })

    it('should default to IMPORT_FAILED code', () => {
      const error = new ImportExportError('Test error')

      expect(error.code).toBe('IMPORT_FAILED')
    })
  })

  describe('NetworkError', () => {
    it('should create a network error', () => {
      const error = new NetworkError('Network error', 'NETWORK_ERROR')

      expect(error.name).toBe('NetworkError')
      expect(error.message).toBe('Network error')
      expect(error.code).toBe('NETWORK_ERROR')
    })

    it('should create connectionFailed error with factory method', () => {
      const error = NetworkError.connectionFailed()

      expect(error.message).toBe('Network connection failed')
      expect(error.code).toBe('NETWORK_ERROR')
      expect(error.context.action).toBe('network_request')
      expect(error.toUserMessage()).toBe('Network connection failed. Please check your internet connection')
    })

    it('should default to NETWORK_ERROR code', () => {
      const error = new NetworkError('Test error')

      expect(error.code).toBe('NETWORK_ERROR')
    })
  })

  describe('Error inheritance and polymorphism', () => {
    it('should be instances of Error', () => {
      const appError = new AppError('Test')
      const bookmarkError = new BookmarkError('Test')
      const collectionError = new CollectionError('Test')

      expect(appError instanceof Error).toBe(true)
      expect(bookmarkError instanceof Error).toBe(true)
      expect(collectionError instanceof Error).toBe(true)
    })

    it('should be instances of AppError', () => {
      const bookmarkError = new BookmarkError('Test')
      const collectionError = new CollectionError('Test')
      const importError = new ImportExportError('Test')
      const networkError = new NetworkError('Test')

      expect(bookmarkError instanceof AppError).toBe(true)
      expect(collectionError instanceof AppError).toBe(true)
      expect(importError instanceof AppError).toBe(true)
      expect(networkError instanceof AppError).toBe(true)
    })

    it('should have correct constructor names', () => {
      expect(new BookmarkError('Test').name).toBe('BookmarkError')
      expect(new CollectionError('Test').name).toBe('CollectionError')
      expect(new ImportExportError('Test').name).toBe('ImportExportError')
      expect(new NetworkError('Test').name).toBe('NetworkError')
    })
  })

  describe('Error chaining and context', () => {
    it('should chain errors with withContext', () => {
      const error = new AppError('Initial error', 'TEST_ERROR', { component: 'Component1' })
      const step2 = error.withContext({ action: 'step2' })
      const step3 = step2.withContext({ metadata: { step: 3 } })

      expect(step3.context.component).toBe('Component1')
      expect(step3.context.action).toBe('step2')
      expect(step3.context.metadata?.step).toBe(3)
    })

    it('should preserve original error through chain', () => {
      const original = new Error('Original')
      const error = new AppError('Wrapped', 'TEST_ERROR', {}, original)
      const enhanced = error.withContext({ action: 'enhanced' })

      expect(enhanced.originalError).toBe(original)
    })
  })

  describe('Timestamp handling', () => {
    it('should generate timestamps automatically', () => {
      const before = new Date().toISOString()
      const error = new AppError('Test')
      const after = new Date().toISOString()

      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(error.timestamp >= before).toBe(true)
      expect(error.timestamp <= after).toBe(true)
    })

    it('should include timestamp in context', () => {
      const error = new AppError('Test')

      expect(error.context.timestamp).toBe(error.timestamp)
    })
  })

  describe('createUserFriendlyMessage', () => {
    it('should return AppError toUserMessage', () => {
      const error = new BookmarkError('Bookmark not found', 'NOT_FOUND')
      const message = createUserFriendlyMessage(error)

      // createUserFriendlyMessage calls error.toUserMessage() for AppError instances
      // which returns the friendly message based on code
      expect(message).toBe('The requested item could not be found')
    })

    it('should map standard error codes to friendly messages', () => {
      expect(createUserFriendlyMessage({ message: 'Test', code: 'NOT_FOUND', context: {} }))
        .toBe('The requested item could not be found')

      expect(createUserFriendlyMessage({ message: 'Test', code: 'STORAGE_FULL', context: {} }))
        .toBe('Storage is full. Please free up some space and try again')

      expect(createUserFriendlyMessage({ message: 'Test', code: 'NETWORK_ERROR', context: {} }))
        .toBe('Network connection failed. Please check your internet connection')
    })

    it('should return original message if code not mapped', () => {
      const message = createUserFriendlyMessage({
        message: 'Custom error',
        code: 'CUSTOM_CODE',
        context: {}
      })

      expect(message).toBe('Custom error')
    })
  })

  describe('withErrorHandling', () => {
    it('should return operation result on success', async () => {
      const operation = vi.fn(async () => 'success')
      const result = await withErrorHandling(operation, 'test-context')

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should return fallback value on error', async () => {
      const operation = vi.fn(async () => {
        throw new Error('Operation failed')
      })
      const result = await withErrorHandling(operation, 'test-context', 'fallback')

      expect(result).toBe('fallback')
    })

    it('should return undefined if no fallback provided', async () => {
      const operation = vi.fn(async () => {
        throw new Error('Operation failed')
      })
      const result = await withErrorHandling(operation, 'test-context')

      expect(result).toBeUndefined()
    })

    it('should log error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const operation = vi.fn(async () => {
        throw new Error('Test error')
      })

      await withErrorHandling(operation, 'test-context')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('withRetry', () => {
    it('should return result on first attempt if successful', async () => {
      const operation = vi.fn(async () => 'success')
      const result = await withRetry(operation, 'test-context')

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0
      const operation = vi.fn(async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return 'success'
      })

      const result = await withRetry(operation, 'test-context', 3, 10)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should throw AppError after max retries', async () => {
      const operation = vi.fn(async () => {
        throw new Error('Permanent failure')
      })

      await expect(
        withRetry(operation, 'test-context', 2, 10)
      ).rejects.toThrow(AppError)

      expect(operation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should use exponential backoff', async () => {
      const delays: number[] = []
      const originalSetTimeout = global.setTimeout

      vi.spyOn(global, 'setTimeout').mockImplementation(((callback: Function, delay: number) => {
        delays.push(delay)
        callback()
        return 0 as any
      }) as any)

      const operation = vi.fn(async () => {
        throw new Error('Failure')
      })

      try {
        await withRetry(operation, 'test-context', 2, 100)
      } catch (e) {
        // Expected to fail
      }

      expect(delays).toEqual([100, 200]) // 100 * 2^0, 100 * 2^1
      ;(global.setTimeout as any).mockRestore()
    })
  })

  describe('validateErrorResponse', () => {
    it('should create AppError from error object with message', () => {
      const response = { message: 'API error', code: 'API_ERROR' }
      const error = validateErrorResponse(response)

      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('API error')
      expect(error.code).toBe('API_ERROR')
    })

    it('should use error field if message not present', () => {
      const response = { error: 'Something went wrong', status: 500 }
      const error = validateErrorResponse(response)

      expect(error.message).toBe('Something went wrong')
      expect(error.code).toBe(500) // Code is returned as-is, not stringified
    })

    it('should handle non-object responses', () => {
      const error1 = validateErrorResponse('string error')
      expect(error1.message).toBe('Invalid error response format')
      expect(error1.code).toBe('INVALID_RESPONSE')

      const error2 = validateErrorResponse(null)
      expect(error2.message).toBe('Invalid error response format')
      expect(error2.code).toBe('INVALID_RESPONSE')
    })
  })

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new AppError('Test')
      expect(isAppError(error)).toBe(true)
    })

    it('should return true for derived error classes', () => {
      expect(isAppError(new BookmarkError('Test'))).toBe(true)
      expect(isAppError(new CollectionError('Test'))).toBe(true)
      expect(isAppError(new NetworkError('Test'))).toBe(true)
    })

    it('should return false for regular errors', () => {
      expect(isAppError(new Error('Test'))).toBe(false)
      expect(isAppError('string')).toBe(false)
      expect(isAppError(null)).toBe(false)
    })
  })

  describe('isErrorClass', () => {
    it('should identify specific error classes', () => {
      const bookmarkError = new BookmarkError('Test')
      const collectionError = new CollectionError('Test')

      expect(isErrorClass(bookmarkError, BookmarkError)).toBe(true)
      expect(isErrorClass(bookmarkError, CollectionError)).toBe(false)
      expect(isErrorClass(collectionError, CollectionError)).toBe(true)
    })

    it('should return false for non-matching types', () => {
      const error = new Error('Test')
      expect(isErrorClass(error, BookmarkError)).toBe(false)
      expect(isErrorClass('string', BookmarkError)).toBe(false)
    })
  })

  describe('safeGetErrorInfo', () => {
    it('should extract info from AppError', () => {
      const error = new BookmarkError('Test error', 'TEST_CODE')
      const info = safeGetErrorInfo(error)

      expect(info.message).toBe('Test error')
      expect(info.code).toBe('TEST_CODE')
      expect(info.isAppError).toBe(true)
    })

    it('should extract info from regular errors', () => {
      const error = new Error('Regular error')
      const info = safeGetErrorInfo(error)

      expect(info.message).toBe('Regular error')
      expect(info.code).toBe('Error') // getErrorCode returns error.name for regular errors
      expect(info.isAppError).toBe(false)
    })

    it('should handle non-error values', () => {
      const info1 = safeGetErrorInfo('string error')
      expect(info1.message).toBe('string error')
      expect(info1.isAppError).toBe(false)

      const info2 = safeGetErrorInfo(null)
      expect(info2.message).toBe('An unexpected error occurred') // getErrorMessage returns this for null/undefined
      expect(info2.isAppError).toBe(false)
    })
  })

  describe('createSafeErrorHandler', () => {
    it('should create working error handler', () => {
      const handler = createSafeErrorHandler('test-component')
      const error = handler(new Error('Test'))

      expect(error).toBeInstanceOf(AppError)
      expect(error.context.component).toBe('test-component')
    })

    it('should handle handler failures gracefully', () => {
      const handler = createSafeErrorHandler('test-component')

      // Create a problematic error that might cause handler to fail
      const circularRef: any = {}
      circularRef.self = circularRef

      const error = handler(circularRef)

      // Should still return an AppError, even if handler had issues
      expect(error).toBeInstanceOf(AppError)
    })

    it('should add additional context', () => {
      const handler = createSafeErrorHandler('test-component')
      const error = handler(new Error('Test'), { action: 'process_data' })

      expect(error.context.component).toBe('test-component')
      expect(error.context.action).toBe('process_data')
    })
  })
})
