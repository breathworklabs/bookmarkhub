import { Box, Button, VStack, Text, HStack, Portal } from '@chakra-ui/react'
import { LuBug, LuLightbulb, LuMessageSquare, LuX } from 'react-icons/lu'
import { Dialog } from '@chakra-ui/react'
import { memo } from 'react'
import toast from 'react-hot-toast'
import { APP_NAME, APP_VERSION } from '../constants/app'

interface FeedbackMenuProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackType = 'bug' | 'feature' | 'general'

const getSystemInfo = () => {
  return {
    browser: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    platform: navigator.platform,
    language: navigator.language,
  }
}

const generateEmailLink = (type: FeedbackType): string => {
  const systemInfo = getSystemInfo()
  const email = 'hello@breathworklabs.com'

  const templates = {
    bug: {
      subject: `Bug Report - ${APP_NAME}`,
      body: `Hi ${APP_NAME} Team,

I found a bug:

**What I expected to happen:**


**What actually happened:**


**Steps to reproduce:**
1.
2.
3.

**Additional details:**


---
System Information:
Browser: ${systemInfo.browser}
Platform: ${systemInfo.platform}
Version: ${systemInfo.version}
URL: ${systemInfo.url}
Timestamp: ${systemInfo.timestamp}
`,
    },
    feature: {
      subject: `Feature Request - ${APP_NAME}`,
      body: `Hi ${APP_NAME} Team,

I'd like to suggest a new feature:

**Feature description:**


**Why it would be useful:**


**How I imagine it could work:**


**Alternative solutions I've considered:**


Thanks for considering this!

---
Submitted from: ${systemInfo.url}
`,
    },
    general: {
      subject: `Feedback - ${APP_NAME}`,
      body: `Hi ${APP_NAME} Team,

My feedback:



---
System Information:
Browser: ${systemInfo.browser}
URL: ${systemInfo.url}
Timestamp: ${systemInfo.timestamp}
`,
    },
  }

  const template = templates[type]
  return `mailto:${email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`
}

const handleFeedback = (type: FeedbackType, onClose: () => void) => {
  const mailtoLink = generateEmailLink(type)
  window.location.href = mailtoLink

  // Show confirmation toast
  setTimeout(() => {
    toast.success('Email client opened! Thank you for your feedback.')
  }, 500)

  onClose()
}

export const FeedbackMenu = memo<FeedbackMenuProps>(({ isOpen, onClose }) => {
  return (
    <Portal>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(e) => !e.open && onClose()}
        placement="center"
      >
        <Dialog.Backdrop bg="rgba(0, 0, 0, 0.85)" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="var(--color-bg-primary)"
            border="1px solid var(--color-border)"
            borderRadius="16px"
            boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
            maxW="480px"
            w="90vw"
            overflow="hidden"
          >
            <Dialog.Header
              bg="var(--gradient-modal)"
              borderBottom="1px solid var(--color-border)"
              p={6}
            >
              <HStack justify="space-between" w="100%">
                <Dialog.Title>
                  <Text
                    fontSize="xl"
                    fontWeight="700"
                    color="var(--color-text-primary)"
                  >
                    Share Your Feedback
                  </Text>
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={onClose}>
                    <LuX size={18} />
                  </Button>
                </Dialog.CloseTrigger>
              </HStack>
            </Dialog.Header>

            <Dialog.Body p={6}>
              <VStack gap={4} alignItems="stretch">
                <Text
                  fontSize="sm"
                  color="var(--color-text-tertiary)"
                  lineHeight="1.6"
                >
                  Help us improve {APP_NAME}! Choose how you'd like to share your
                  feedback:
                </Text>

                {/* Bug Report */}
                <Button
                  onClick={() => handleFeedback('bug', onClose)}
                  size="lg"
                  variant="outline"
                  justifyContent="flex-start"
                  p={4}
                  h="auto"
                  borderColor="var(--color-border)"
                  color="var(--color-text-primary)"
                  _hover={{
                    bg: 'var(--color-bg-hover)',
                    borderColor: 'var(--color-border-hover)',
                  }}
                >
                  <HStack alignItems="flex-start" gap={3} w="100%">
                    <Box color="var(--color-danger)" mt="2px" flexShrink={0}>
                      <LuBug size={20} />
                    </Box>
                    <VStack alignItems="flex-start" gap={1} flex={1}>
                      <Text fontWeight="600" fontSize="sm">
                        Report a Bug
                      </Text>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-tertiary)"
                        lineHeight="1.4"
                      >
                        Something not working right? Let us know so we can fix it.
                      </Text>
                    </VStack>
                  </HStack>
                </Button>

                {/* Feature Request */}
                <Button
                  onClick={() => handleFeedback('feature', onClose)}
                  size="lg"
                  variant="outline"
                  justifyContent="flex-start"
                  p={4}
                  h="auto"
                  borderColor="var(--color-border)"
                  color="var(--color-text-primary)"
                  _hover={{
                    bg: 'var(--color-bg-hover)',
                    borderColor: 'var(--color-border-hover)',
                  }}
                >
                  <HStack alignItems="flex-start" gap={3} w="100%">
                    <Box color="var(--color-warning)" mt="2px" flexShrink={0}>
                      <LuLightbulb size={20} />
                    </Box>
                    <VStack alignItems="flex-start" gap={1} flex={1}>
                      <Text fontWeight="600" fontSize="sm">
                        Request a Feature
                      </Text>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-tertiary)"
                        lineHeight="1.4"
                      >
                        Have an idea for a new feature? We'd love to hear it!
                      </Text>
                    </VStack>
                  </HStack>
                </Button>

                {/* General Feedback */}
                <Button
                  onClick={() => handleFeedback('general', onClose)}
                  size="lg"
                  variant="outline"
                  justifyContent="flex-start"
                  p={4}
                  h="auto"
                  borderColor="var(--color-border)"
                  color="var(--color-text-primary)"
                  _hover={{
                    bg: 'var(--color-bg-hover)',
                    borderColor: 'var(--color-border-hover)',
                  }}
                >
                  <HStack alignItems="flex-start" gap={3} w="100%">
                    <Box color="var(--color-primary)" mt="2px" flexShrink={0}>
                      <LuMessageSquare size={20} />
                    </Box>
                    <VStack alignItems="flex-start" gap={1} flex={1}>
                      <Text fontWeight="600" fontSize="sm">
                        General Feedback
                      </Text>
                      <Text
                        fontSize="xs"
                        color="var(--color-text-tertiary)"
                        lineHeight="1.4"
                      >
                        Share your thoughts, suggestions, or questions with us.
                      </Text>
                    </VStack>
                  </HStack>
                </Button>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              bg="var(--gradient-modal)"
              borderTop="1px solid var(--color-border)"
              p={6}
            >
              <VStack gap={1} w="100%">
                <Text
                  fontSize="xs"
                  color="var(--color-text-tertiary)"
                  lineHeight="1.6"
                  textAlign="center"
                >
                  Your email client will open with a pre-filled template.
                </Text>
                <Text
                  fontSize="xs"
                  color="var(--color-text-tertiary)"
                  lineHeight="1.6"
                  textAlign="center"
                >
                  We typically respond within 24-48 hours.
                </Text>
              </VStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Portal>
  )
})

FeedbackMenu.displayName = 'FeedbackMenu'
