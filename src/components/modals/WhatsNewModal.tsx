import {
  Dialog,
  Portal,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
} from '@chakra-ui/react'
import { LuScrollText } from 'react-icons/lu'
import { CHANGELOG } from '@/data/changelog'

interface WhatsNewModalProps {
  isOpen: boolean
  onClose: () => void
}

const typeConfig = {
  feature: {
    label: 'Feature',
    bg: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--color-blue)',
  },
  improvement: {
    label: 'Improvement',
    bg: 'rgba(34, 197, 94, 0.1)',
    color: 'var(--color-success)',
  },
  fix: {
    label: 'Fix',
    bg: 'rgba(234, 179, 8, 0.1)',
    color: 'var(--color-warning)',
  },
}

export const WhatsNewModal = ({ isOpen, onClose }: WhatsNewModalProps) => {
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
            maxW="520px"
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
                    <LuScrollText size={20} color="var(--color-blue)" />
                  </Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="lg" fontWeight="600">
                      What's New
                    </Text>
                    <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      Latest updates and improvements
                    </Text>
                  </VStack>
                </HStack>
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body p={6} maxH="60vh" overflowY="auto">
              <VStack align="stretch" gap={4}>
                {CHANGELOG.map((entry) => (
                  <Box
                    key={entry.version}
                    p={4}
                    borderRadius="10px"
                    border="1px solid var(--color-border)"
                    bg="rgba(255, 255, 255, 0.02)"
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {entry.title}
                      </Text>
                      <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {entry.date}
                      </Text>
                    </HStack>
                    <VStack align="stretch" gap={2}>
                      {entry.changes.map((change, i) => {
                        const cfg = typeConfig[change.type]
                        return (
                          <HStack key={i} gap={2} align="flex-start">
                            <Badge
                              flexShrink={0}
                              bg={cfg.bg}
                              color={cfg.color}
                              fontSize="10px"
                              px={2}
                              py="2px"
                              borderRadius="4px"
                              mt="1px"
                            >
                              {cfg.label}
                            </Badge>
                            <Text
                              fontSize="sm"
                              style={{ color: 'var(--color-text-secondary)' }}
                              lineHeight="1.5"
                            >
                              {change.description}
                            </Text>
                          </HStack>
                        )
                      })}
                    </VStack>
                  </Box>
                ))}
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
                style={{ background: 'var(--color-blue)' }}
                color="white"
                fontWeight="600"
                borderRadius="8px"
                _hover={{ bg: 'var(--color-blue-hover)' }}
              >
                Got it!
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
