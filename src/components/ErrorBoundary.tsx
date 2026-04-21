/**
 * React Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire app
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Button, Heading, Text, VStack, Code } from '@chakra-ui/react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context = this.props.context || 'Unknown component'

    logger.error(`Error in ${context}`, error, {
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: context,
      },
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    this.props.onReset?.()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box
          p={8}
          maxW="2xl"
          mx="auto"
          mt={8}
          borderWidth="1px"
          borderRadius="lg"
          bg="red.50"
          borderColor="red.200"
        >
          <VStack gap={4} align="stretch">
            <Heading size="lg" color="red.700">
              Something went wrong
            </Heading>

            <Text color="red.600">
              {this.props.context
                ? `An error occurred in ${this.props.context}`
                : 'An unexpected error occurred'}
            </Text>

            {this.state.error && (
              <Code p={4} borderRadius="md" bg="red.100" color="red.800" fontSize="sm">
                {this.state.error.message}
              </Code>
            )}

            {import.meta.env.DEV && this.state.errorInfo && (
              <details>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Component Stack (Dev Only)
                </summary>
                <Code
                  p={4}
                  mt={2}
                  borderRadius="md"
                  bg="gray.100"
                  fontSize="xs"
                  whiteSpace="pre-wrap"
                  display="block"
                >
                  {this.state.errorInfo.componentStack}
                </Code>
              </details>
            )}

            <Button
              colorScheme="red"
              onClick={this.handleReset}
              size="md"
              mt={4}
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              size="sm"
            >
              Reload Page
            </Button>
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}

export const ErrorBoundarySection = ({
  children,
  sectionName,
  onReset,
}: {
  children: ReactNode
  sectionName: string
  onReset?: () => void
}) => {
  return (
    <ErrorBoundary context={sectionName} onReset={onReset}>
      {children}
    </ErrorBoundary>
  )
}
