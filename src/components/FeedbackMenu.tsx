import { Box, Button, VStack, Text } from '@chakra-ui/react'
import { LuBug, LuLightbulb, LuMessageSquare } from 'react-icons/lu'
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
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '90%',
          }}
        >
          <Dialog.Header
            style={{
              borderBottom: '1px solid var(--color-border)',
              padding: '20px',
            }}
          >
            <Dialog.Title
              style={{
                color: 'var(--color-text-primary)',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              Share Your Feedback
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body
            style={{
              padding: '24px 20px',
            }}
          >
            <VStack gap={4} alignItems="stretch">
              <Text
                fontSize="sm"
                style={{ color: 'var(--color-text-tertiary)' }}
                lineHeight="1.6"
              >
                Help us improve {APP_NAME}! Choose how you'd like to share your feedback:
              </Text>

              {/* Bug Report */}
              <Button
                onClick={() => handleFeedback('bug', onClose)}
                size="lg"
                variant="outline"
                style={{
                  justifyContent: 'flex-start',
                  padding: '16px',
                  height: 'auto',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                _hover={{
                  bg: 'var(--color-bg-hover)',
                  borderColor: 'var(--color-border-hover)',
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={3} width="100%">
                  <Box
                    style={{
                      color: 'var(--color-danger)',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <LuBug size={20} />
                  </Box>
                  <VStack alignItems="flex-start" gap={1} flex={1}>
                    <Text fontWeight="600" fontSize="sm">
                      Report a Bug
                    </Text>
                    <Text
                      fontSize="xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      lineHeight="1.4"
                    >
                      Something not working right? Let us know so we can fix it.
                    </Text>
                  </VStack>
                </Box>
              </Button>

              {/* Feature Request */}
              <Button
                onClick={() => handleFeedback('feature', onClose)}
                size="lg"
                variant="outline"
                style={{
                  justifyContent: 'flex-start',
                  padding: '16px',
                  height: 'auto',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                _hover={{
                  bg: 'var(--color-bg-hover)',
                  borderColor: 'var(--color-border-hover)',
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={3} width="100%">
                  <Box
                    style={{
                      color: 'var(--color-warning)',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <LuLightbulb size={20} />
                  </Box>
                  <VStack alignItems="flex-start" gap={1} flex={1}>
                    <Text fontWeight="600" fontSize="sm">
                      Request a Feature
                    </Text>
                    <Text
                      fontSize="xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      lineHeight="1.4"
                    >
                      Have an idea for a new feature? We'd love to hear it!
                    </Text>
                  </VStack>
                </Box>
              </Button>

              {/* General Feedback */}
              <Button
                onClick={() => handleFeedback('general', onClose)}
                size="lg"
                variant="outline"
                style={{
                  justifyContent: 'flex-start',
                  padding: '16px',
                  height: 'auto',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                _hover={{
                  bg: 'var(--color-bg-hover)',
                  borderColor: 'var(--color-border-hover)',
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={3} width="100%">
                  <Box
                    style={{
                      color: 'var(--color-primary)',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <LuMessageSquare size={20} />
                  </Box>
                  <VStack alignItems="flex-start" gap={1} flex={1}>
                    <Text fontWeight="600" fontSize="sm">
                      General Feedback
                    </Text>
                    <Text
                      fontSize="xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      lineHeight="1.4"
                    >
                      Share your thoughts, suggestions, or questions with us.
                    </Text>
                  </VStack>
                </Box>
              </Button>

              <Box
                pt={3}
                borderTopWidth="1px"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Text
                  fontSize="xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  lineHeight="1.6"
                  textAlign="center"
                >
                  Your email client will open with a pre-filled template.
                  <br />
                  We typically respond within 24-48 hours.
                </Text>
              </Box>
            </VStack>
          </Dialog.Body>

          <Dialog.CloseTrigger
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              color: 'var(--color-text-tertiary)',
            }}
          />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
})

FeedbackMenu.displayName = 'FeedbackMenu'
