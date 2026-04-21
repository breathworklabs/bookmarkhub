import type { NamedSet } from 'zustand/middleware'
import { createErrorHandler } from '@/utils/errorHandling'
import { logger } from '@/lib/logger'

interface ErrorOptions {
  isLoading?: boolean
  notify?: boolean
  extra?: Record<string, unknown>
}

/**
 * Unified error handler for Zustand store actions.
 * Converts error to user-friendly message, logs it, and sets store state.
 */
export const handleStoreError = <
  T extends { error: string | null; isLoading: boolean },
>(
  set: NamedSet<T>,
  error: unknown,
  operation: string,
  options: ErrorOptions = {}
): void => {
  const { isLoading = false, notify = false, extra = {} } = options

  const errorHandler = createErrorHandler(operation)
  const appError = errorHandler(error)

  if (notify) {
    logger.error(`${operation} failed`, error, { notify: true })
  } else {
    logger.error(`${operation} failed`, error)
  }

  set(
    {
      error: appError.toUserMessage(),
      isLoading,
      ...extra,
    } as Partial<T>,
    false,
    `${operation}:error`
  )
}
