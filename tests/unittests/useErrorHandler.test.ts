import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useErrorHandler } from '../../src/hooks/useErrorHandler'
import { AppError } from '../../src/utils/errorHandling'

describe('useErrorHandler', () => {
  it('should create error handler with context', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'))

    expect(result.current.handleError).toBeDefined()
    expect(typeof result.current.handleError).toBe('function')
  })

  it('should handle errors with context', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'))

    const error = result.current.handleError(new Error('Test error'))

    expect(error).toBeInstanceOf(AppError)
    expect(error.context.component).toBe('TestComponent')
    expect(error.message).toBe('Test error')
  })

  it('should add additional context when provided', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'))

    const error = result.current.handleError(new Error('Test error'), {
      action: 'save_data'
    })

    expect(error.context.component).toBe('TestComponent')
    expect(error.context.action).toBe('save_data')
  })

  it('should handle non-Error objects', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'))

    const error = result.current.handleError('String error')

    expect(error).toBeInstanceOf(AppError)
    expect(error.message).toBe('String error')
    expect(error.context.component).toBe('TestComponent')
  })

  it('should handle AppError instances', () => {
    const { result } = renderHook(() => useErrorHandler('TestComponent'))

    const appError = new AppError('App error', 'TEST_ERROR')
    const error = result.current.handleError(appError)

    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe('TEST_ERROR')
    expect(error.context.component).toBe('TestComponent')
  })
})
