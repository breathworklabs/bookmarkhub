import { createErrorHandler } from '../utils/errorHandling'

/**
 * Hook for using error boundary functionality in functional components
 */
export const useErrorHandler = (context: string) => {
  const errorHandler = createErrorHandler(context)

  return {
    handleError: (error: unknown, additionalContext?: Partial<{ action: string; component: string }>) => {
      return errorHandler(error, additionalContext)
    }
  }
}
