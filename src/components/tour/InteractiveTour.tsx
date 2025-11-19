import { Portal } from '@chakra-ui/react'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { memo, useEffect, useState, useRef } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import {
  getTourStepByIndex,
  isValidStepIndex,
  getTourStepCount,
} from './tourSteps'

interface TargetPosition {
  top: number
  left: number
  width: number
  height: number
}

const InteractiveTour = memo(() => {
  const currentStep = useSettingsStore((state) => state.tour.currentStep)
  const hasCompletedTour = useSettingsStore(
    (state) => state.tour.hasCompletedTour
  )
  const tourDismissed = useSettingsStore((state) => state.tour.tourDismissed)
  const setTourStep = useSettingsStore((state) => state.setTourStep)
  const nextTourStep = useSettingsStore((state) => state.nextTourStep)
  const previousTourStep = useSettingsStore((state) => state.previousTourStep)
  const skipTour = useSettingsStore((state) => state.skipTour)
  const setTourCompleted = useSettingsStore((state) => state.setTourCompleted)

  const [targetPosition, setTargetPosition] = useState<TargetPosition | null>(
    null
  )
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Determine if tour should be active
  const isTourActive =
    currentStep !== null &&
    !hasCompletedTour &&
    !tourDismissed &&
    isValidStepIndex(currentStep)

  // Get current step data
  const activeStep =
    currentStep !== null ? getTourStepByIndex(currentStep) : null
  const totalSteps = getTourStepCount()
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  // Update target element position
  useEffect(() => {
    if (!isTourActive || !activeStep) {
      setTargetPosition(null)
      return
    }

    let retryCount = 0
    const maxRetries = 20 // Try for up to 2 seconds
    let retryTimer: NodeJS.Timeout

    const updatePosition = () => {
      const targetSelector = activeStep.target
      const element = document.querySelector(targetSelector)

      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        })
      } else if (retryCount < maxRetries) {
        // Element not found, retry after a short delay
        retryCount++
        retryTimer = setTimeout(updatePosition, 100)
      } else {
        // Give up after max retries - skip to next step
        console.warn(`Tour: Could not find target element: ${targetSelector}`)
        nextTourStep()
      }
    }

    // Initial position with small delay to allow DOM to settle
    const initialTimer = setTimeout(updatePosition, 100)

    // Update on resize/scroll
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      clearTimeout(initialTimer)
      clearTimeout(retryTimer)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isTourActive, activeStep, nextTourStep])

  // Handle step actions
  useEffect(() => {
    if (activeStep && isTourActive) {
      // Execute beforeShow action if defined
      if (activeStep.actions?.beforeShow) {
        activeStep.actions.beforeShow()
      }

      // Execute afterShow action if defined (after a small delay)
      const afterShowTimer = setTimeout(() => {
        if (activeStep.actions?.afterShow) {
          activeStep.actions.afterShow()
        }
      }, 300)

      return () => clearTimeout(afterShowTimer)
    }
  }, [activeStep, isTourActive])

  // Handle tour completion
  const handleComplete = () => {
    setTourCompleted(true)
    setTourStep(null)
  }

  // Handle next step
  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      nextTourStep()
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (!isFirstStep) {
      previousTourStep()
    }
  }

  // Handle skip/dismiss
  const handleSkip = () => {
    skipTour()
  }

  if (!isTourActive || !activeStep || !targetPosition) {
    return null
  }

  // Calculate tooltip position based on placement
  const getTooltipPosition = () => {
    const padding = activeStep.spotlightPadding || 12
    const offset = activeStep.offset || { x: 0, y: 0 }

    switch (activeStep.placement) {
      case 'top':
        return {
          top: targetPosition.top - padding + offset.y - 20,
          left: targetPosition.left + targetPosition.width / 2 + offset.x,
          transform: 'translate(-50%, -100%)',
        }
      case 'bottom':
        return {
          top: targetPosition.top + targetPosition.height + padding + offset.y + 20,
          left: targetPosition.left + targetPosition.width / 2 + offset.x,
          transform: 'translate(-50%, 0)',
        }
      case 'left':
        return {
          top: targetPosition.top + targetPosition.height / 2 + offset.y,
          left: targetPosition.left - padding + offset.x - 20,
          transform: 'translate(-100%, -50%)',
        }
      case 'right':
        return {
          top: targetPosition.top + targetPosition.height / 2 + offset.y,
          left: targetPosition.left + targetPosition.width + padding + offset.x + 20,
          transform: 'translate(0, -50%)',
        }
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }
    }
  }

  const tooltipPosition = getTooltipPosition()
  const spotlightPadding = activeStep.spotlightPadding || 12

  return (
    <Portal>
      {/* Backdrop with spotlight cutout */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={9998}
        pointerEvents="none"
      >
        {/* Top section */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height={`${targetPosition.top - spotlightPadding}px`}
          bg="rgba(0, 0, 0, 0.6)"
          backdropFilter="blur(4px)"
          pointerEvents="auto"
        />

        {/* Bottom section */}
        <Box
          position="absolute"
          top={`${targetPosition.top + targetPosition.height + spotlightPadding}px`}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.6)"
          backdropFilter="blur(4px)"
          pointerEvents="auto"
        />

        {/* Left section */}
        <Box
          position="absolute"
          top={`${targetPosition.top - spotlightPadding}px`}
          left={0}
          width={`${targetPosition.left - spotlightPadding}px`}
          height={`${targetPosition.height + spotlightPadding * 2}px`}
          bg="rgba(0, 0, 0, 0.6)"
          backdropFilter="blur(4px)"
          pointerEvents="auto"
        />

        {/* Right section */}
        <Box
          position="absolute"
          top={`${targetPosition.top - spotlightPadding}px`}
          left={`${targetPosition.left + targetPosition.width + spotlightPadding}px`}
          right={0}
          height={`${targetPosition.height + spotlightPadding * 2}px`}
          bg="rgba(0, 0, 0, 0.6)"
          backdropFilter="blur(4px)"
          pointerEvents="auto"
        />

        {/* Spotlight border */}
        <Box
          position="absolute"
          top={`${targetPosition.top - spotlightPadding}px`}
          left={`${targetPosition.left - spotlightPadding}px`}
          width={`${targetPosition.width + spotlightPadding * 2}px`}
          height={`${targetPosition.height + spotlightPadding * 2}px`}
          border="2px solid var(--color-accent)"
          borderRadius="12px"
          boxShadow="0 0 0 9999px rgba(0, 0, 0, 0)"
          pointerEvents="none"
          zIndex={9999}
        />
      </Box>

      {/* Tooltip */}
      <Box
        ref={tooltipRef}
        position="fixed"
        {...tooltipPosition}
        zIndex={10000}
        pointerEvents="auto"
      >
        <Box
          background="var(--gradient-modal)"
          border="1px solid var(--color-border)"
          borderRadius="16px"
          padding="24px"
          maxWidth="420px"
          boxShadow="0 12px 32px rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(20px)"
        >
          <VStack alignItems="stretch" gap={4}>
            {/* Header */}
            <HStack justify="space-between" alignItems="flex-start">
              <VStack alignItems="flex-start" gap={1} flex={1}>
                <Text
                  fontSize="lg"
                  fontWeight="600"
                  color="var(--color-text-primary)"
                >
                  {activeStep.title}
                </Text>
                <Text
                  fontSize="xs"
                  color="var(--color-text-tertiary)"
                  fontWeight="500"
                >
                  Step {currentStep + 1} of {totalSteps}
                </Text>
              </VStack>

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                minW="auto"
                p={1}
                style={{ color: 'var(--color-text-tertiary)' }}
                _hover={{
                  bg: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                aria-label="Skip tour"
              >
                <LuX size={18} />
              </Button>
            </HStack>

            {/* Description */}
            <Text
              fontSize="sm"
              color="var(--color-text-secondary)"
              lineHeight="1.6"
            >
              {activeStep.description}
            </Text>

            {/* Progress bar */}
            <Box
              w="full"
              h="2px"
              bg="var(--color-border)"
              borderRadius="full"
              overflow="hidden"
            >
              <Box
                h="full"
                bg="var(--color-accent)"
                borderRadius="full"
                style={{
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                }}
                transition="width 0.3s ease"
              />
            </Box>

            {/* Actions */}
            <HStack justify="space-between" alignItems="center">
              {/* Skip button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                style={{ color: 'var(--color-text-tertiary)' }}
                _hover={{
                  bg: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Skip Tour
              </Button>

              {/* Navigation buttons */}
              <HStack gap={2}>
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    style={{
                      color: 'var(--color-text-secondary)',
                      borderColor: 'var(--color-border)',
                    }}
                    _hover={{
                      bg: 'var(--color-border)',
                      borderColor: 'var(--color-border-hover)',
                    }}
                  >
                    <HStack gap={1}>
                      <LuChevronLeft size={16} />
                      <Text>Back</Text>
                    </HStack>
                  </Button>
                )}

                <Button
                  variant="solid"
                  size="sm"
                  onClick={handleNext}
                  style={{
                    background: 'var(--color-accent)',
                    color: 'white',
                  }}
                  _hover={{
                    background: 'var(--color-accent-hover)',
                  }}
                >
                  <HStack gap={1}>
                    <Text>{isLastStep ? 'Complete' : 'Next'}</Text>
                    {!isLastStep && <LuChevronRight size={16} />}
                  </HStack>
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Portal>
  )
})

InteractiveTour.displayName = 'InteractiveTour'

export default InteractiveTour
