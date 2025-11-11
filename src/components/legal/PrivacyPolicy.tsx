import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Separator,
} from '@chakra-ui/react'
import {
  LuArrowLeft,
  LuShield,
  LuEye,
  LuDatabase,
  LuLock,
  LuUserCheck,
} from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

const PrivacyPolicy = () => {
  const navigate = useNavigate()

  return (
    <Flex h="100vh" w="100vw">

        {/* Main Content */}
        <Flex
          flex={1}
          direction="column"
          w="100%"
          overflowY="auto"
          p={8}
          style={{ background: 'var(--color-bg-primary)' }}
        >
          <Box maxW="800px" mx="auto" w="100%">
            {/* Back Button */}
            <Button
              onClick={() => navigate('/settings')}
              variant="ghost"
              style={{ color: 'var(--color-text-secondary)' }}
              _hover={{
                color: 'var(--color-blue)',
                bg: 'var(--color-bg-hover)',
              }}
              _focus={{
                boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.2)',
                outline: 'none',
              }}
              mb={6}
              size="sm"
            >
              <LuArrowLeft size={18} style={{ marginRight: '8px' }} />
              Back to Settings
            </Button>

            {/* Privacy Policy Card */}
            <Box
              style={{ background: 'var(--color-bg-tertiary)' }}
              borderRadius="12px"
              border="1px solid var(--color-border)"
              overflow="hidden"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
            >
              {/* Header */}
              <HStack
                p={6}
                borderBottomWidth="1px"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <LuShield
                  size={20}
                  style={{ color: 'var(--color-text-primary)' }}
                />
                <Text
                  fontSize="lg"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Privacy Policy
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-tertiary)',
                    marginLeft: 'auto',
                  }}
                >
                  Last updated: January 2025
                </Text>
              </HStack>

              {/* Content */}
              <VStack alignItems="stretch" p={6} gap={6}>
                {/* Introduction */}
                <VStack alignItems="stretch" gap={4}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Your Privacy is Our Priority
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    X Bookmark Manager is built with privacy as a fundamental
                    principle. This Privacy Policy explains how we handle your
                    data and what information we collect (spoiler: it's
                    minimal).
                  </Text>
                </VStack>

                <Separator />

                {/* Core Privacy Principles */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <LuLock size={20} color="var(--color-blue)" />
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Core Privacy Principles
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    We follow these fundamental principles:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Local-First:</strong> Your data stays on your
                      device
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>No Tracking:</strong> We don't track your
                      browsing or usage
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>No Data Collection:</strong> We don't collect
                      personal information
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Transparency:</strong> This policy clearly
                      explains our practices
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* Information We Don't Collect */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <LuEye size={20} color="var(--color-green)" />
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Information We DON'T Collect
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    We are proud to say that we do NOT collect:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Your bookmarks or bookmark content
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Your personal information (name, email, etc.)
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Your browsing history or search queries
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Usage analytics or behavioral data
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Device identifiers or IP addresses
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Location data or other sensitive information
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* Local Storage */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <LuDatabase size={20} color="var(--color-blue)" />
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Local Data Storage
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    All your data is stored locally in your browser using
                    localStorage:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Bookmarks:</strong> Your saved bookmarks and
                      their metadata
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Collections:</strong> Your bookmark collections
                      and organization
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Settings:</strong> Your app preferences and
                      configuration
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Tags:</strong> Your custom tags and
                      categorization
                    </Text>
                  </VStack>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    This data never leaves your device and is not transmitted to
                    any servers.
                  </Text>
                </VStack>

                <Separator />

                {/* Chrome Extension Privacy */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Chrome Extension Privacy
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Our Chrome extension has minimal permissions and operates
                    with strict privacy controls:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Cookie Access:</strong> Only to authenticate
                      with X/Twitter for bookmark import
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Storage Access:</strong> Only to save imported
                      bookmarks locally
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>No Background Activity:</strong> Only runs when
                      you explicitly use it
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>No Data Transmission:</strong> All processing
                      happens locally
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* Third-Party Services */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Third-Party Services
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    X Bookmark Manager does not integrate with third-party
                    analytics, advertising, or tracking services. We do not use:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Google Analytics or similar tracking services
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Advertising networks or ad serving technologies
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Social media tracking pixels or widgets
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Third-party data brokers or marketing services
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* Data Security */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <LuShield size={20} color="var(--color-green)" />
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Data Security
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Since your data is stored locally, security is primarily
                    your responsibility:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Keep your browser and device updated
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Use strong device passwords and screen locks
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Regularly export your data as backups
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Be cautious with browser extensions and plugins
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* Your Rights */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <LuUserCheck size={20} color="var(--color-blue)" />
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Your Rights
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    You have complete control over your data:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Access:</strong> View all your data through the
                      app interface
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Export:</strong> Download your data in JSON
                      format
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Delete:</strong> Remove individual bookmarks or
                      clear all data
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Modify:</strong> Edit, organize, and manage your
                      bookmarks
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* GDPR Compliance */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    GDPR and Privacy Law Compliance
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    X Bookmark Manager is designed to comply with privacy laws
                    including GDPR, CCPA, and others:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Data Minimization:</strong> We don't collect
                      unnecessary data
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Purpose Limitation:</strong> No data is used for
                      purposes other than the app
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Storage Limitation:</strong> Data is stored only
                      as long as you use the app
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • <strong>Transparency:</strong> This policy clearly
                      explains our practices
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* Children's Privacy */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Children's Privacy
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    X Bookmark Manager does not knowingly collect personal
                    information from children under 13. Since we don't collect
                    personal information from anyone, this is not a concern, but
                    we want to be explicit about our commitment to protecting
                    children's privacy.
                  </Text>
                </VStack>

                <Separator />

                {/* Changes to Privacy Policy */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Changes to This Privacy Policy
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    We may update this Privacy Policy from time to time. We will
                    notify users of any material changes by updating the "Last
                    updated" date at the top of this page. Since we don't
                    collect contact information, we cannot send direct
                    notifications of changes.
                  </Text>
                </VStack>

                <Separator />

                {/* Contact */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Questions About Privacy
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    If you have any questions about this Privacy Policy or our
                    privacy practices, please contact us at{' '}
                    <a
                      href="mailto:hello@breathworklabs.com"
                      style={{
                        color: 'var(--color-blue)',
                        textDecoration: 'none',
                      }}
                    >
                      hello@breathworklabs.com
                    </a>
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    <strong>Breathwork Labs</strong>
                    <br />
                    Website:{' '}
                    <a
                      href="https://breathworklabs.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--color-blue)',
                        textDecoration: 'none',
                      }}
                    >
                      breathworklabs.com
                    </a>
                  </Text>
                </VStack>

                <Separator />

                {/* Effective Date */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Effective Date
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    This Privacy Policy is effective as of January 2025 and will
                    remain in effect until modified or terminated.
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Flex>
  )
}

export default PrivacyPolicy
