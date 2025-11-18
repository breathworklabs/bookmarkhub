import {
  Dialog,
  Portal,
  Box,
  VStack,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react'
import { LuSparkles, LuInfo } from 'react-icons/lu'

interface DemoModeInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DemoModeInfoModal = ({ isOpen, onClose }: DemoModeInfoModalProps) => {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop
          bg="rgba(0, 0, 0, 0.85)"
          backdropFilter="blur(4px)"
        />
        <Dialog.Positioner>
          <Dialog.Content
            style={{
              background: 'var(--color-bg-primary)',
            }}
            border="1px solid var(--color-border)"
            borderRadius="16px"
            boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
            maxW="500px"
            w="90vw"
            overflow="hidden"
          >
            <Dialog.Header
              bg="var(--gradient-modal)"
              borderBottomWidth="1px"
              style={{ borderColor: 'var(--color-border)' }}
              p={6}
            >
              <Dialog.Title>
                <HStack gap={2}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w="32px"
                    h="32px"
                    borderRadius="8px"
                    bg="rgba(59, 130, 246, 0.1)"
                  >
                    <LuSparkles size={20} color="var(--color-blue)" />
                  </Box>
                  <Text fontSize="lg" fontWeight="600">
                    Demo Mode
                  </Text>
                </HStack>
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body p={6}>
          <VStack align="stretch" gap={4} mt={2}>
            <Text
              fontSize="md"
              style={{ color: 'var(--color-text-secondary)' }}
              lineHeight="1.6"
            >
              You're exploring BookmarkHub with live demo data from popular tech accounts on X/Twitter.
            </Text>

            <Box
              p={4}
              borderRadius="8px"
              bg="rgba(59, 130, 246, 0.05)"
              border="1px solid rgba(59, 130, 246, 0.2)"
            >
              <VStack align="stretch" gap={3}>
                <HStack gap={2} align="flex-start">
                  <Box
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    bg="rgba(59, 130, 246, 0.2)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    mt="2px"
                  >
                    <Text fontSize="xs" fontWeight="600" color="var(--color-blue)">
                      1
                    </Text>
                  </Box>
                  <VStack align="flex-start" gap={0.5}>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Real tweets, real interactions
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Demo data is fetched from @vercel, @reactjs, @typescript, @AnthropicAI, and other tech accounts
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={2} align="flex-start">
                  <Box
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    bg="rgba(59, 130, 246, 0.2)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    mt="2px"
                  >
                    <Text fontSize="xs" fontWeight="600" color="var(--color-blue)">
                      2
                    </Text>
                  </Box>
                  <VStack align="flex-start" gap={0.5}>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Try all features
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Star, tag, organize into collections, search, and filter - everything works!
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={2} align="flex-start">
                  <Box
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    bg="rgba(59, 130, 246, 0.2)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    mt="2px"
                  >
                    <Text fontSize="xs" fontWeight="600" color="var(--color-blue)">
                      3
                    </Text>
                  </Box>
                  <VStack align="flex-start" gap={0.5}>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Privacy-first
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      All data stays local in your browser - nothing is sent to our servers
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            <Box
              p={3}
              borderRadius="8px"
              bg="rgba(234, 179, 8, 0.05)"
              border="1px solid rgba(234, 179, 8, 0.2)"
            >
              <HStack gap={2} align="flex-start">
                <LuInfo size={16} color="var(--color-warning)" style={{ marginTop: '2px' }} />
                <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Demo data is temporary and will be cleared when you import your real bookmarks from X/Twitter
                </Text>
              </HStack>
            </Box>
          </VStack>
            </Dialog.Body>

            <Dialog.Footer
              bg="var(--gradient-modal)"
              borderTopWidth="1px"
              style={{ borderColor: 'var(--color-border)' }}
              p={6}
            >
              <Button
                onClick={onClose}
                size="md"
                w="full"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
                fontWeight="600"
                _hover={{
                  opacity: 0.9,
                }}
              >
                Got it, let's explore!
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
