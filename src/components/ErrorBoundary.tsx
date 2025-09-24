import { Component, ErrorInfo, ReactNode } from 'react'
import { Box, VStack, Text, Button, HStack } from '@chakra-ui/react'
import { LuTriangleAlert, LuRefreshCw } from 'react-icons/lu'
import { createErrorHandler, createUserFriendlyMessage, type AppError } from '../utils/errorHandling'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: AppError) => void
  context?: string
}

interface State {
  hasError: boolean
  error: AppError | null
}

/**
 * Error Boundary component for catching and handling React errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    const errorHandler = createErrorHandler('ErrorBoundary')
    const standardError = errorHandler(error)

    return {
      hasError: true,
      error: standardError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorHandler = createErrorHandler(this.props.context || 'ErrorBoundary')
    const standardError = errorHandler(error, {
      action: 'componentDidCatch',
      component: errorInfo.componentStack || undefined
    })

    this.setState({ error: standardError })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(standardError)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Box
          p={8}
          bg="#1a1d23"
          border="1px solid #dc2626"
          borderRadius="8px"
          maxW="500px"
          mx="auto"
          mt={8}
        >
          <VStack gap={4} alignItems="center" textAlign="center">
            <Box color="#dc2626">
              <LuTriangleAlert size={48} />
            </Box>

            <VStack gap={2}>
              <Text fontSize="18px" fontWeight="600" color="#e1e5e9">
                Something went wrong
              </Text>

              {this.state.error && (
                <Text fontSize="14px" color="#71767b" maxW="400px">
                  {createUserFriendlyMessage(this.state.error)}
                </Text>
              )}
            </VStack>

            <HStack gap={3}>
              <Button
                size="sm"
                bg="#1d4ed8"
                color="white"
                _hover={{ bg: '#1e40af' }}
                onClick={this.handleRetry}
              >
                <LuRefreshCw size={16} style={{ marginRight: '8px' }} />
                Try Again
              </Button>

              <Button
                size="sm"
                variant="outline"
                borderColor="#2a2d35"
                color="#71767b"
                _hover={{ borderColor: '#3a3d45', color: '#e1e5e9' }}
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </HStack>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                mt={4}
                p={3}
                bg="#0f1419"
                border="1px solid #2a2d35"
                borderRadius="4px"
                w="100%"
              >
                <Text fontSize="12px" color="#71767b" fontFamily="mono">
                  <strong>Error Details:</strong><br />
                  {this.state.error.message}<br />
                  {this.state.error.context?.component && (
                    <>Component: {this.state.error.context.component}<br /></>
                  )}
                  {this.state.error.timestamp && (
                    <>Time: {new Date(this.state.error.timestamp).toLocaleString()}</>
                  )}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}


export default ErrorBoundary
