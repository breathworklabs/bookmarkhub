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
  LuFileText,
  LuShield,
  LuUsers,
  LuInfo,
} from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

const TermsOfService = () => {
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
              onClick={() => navigate(-1)}
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
              Back
            </Button>

            {/* Terms of Service Card */}
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
                <LuFileText
                  size={20}
                  style={{ color: 'var(--color-text-primary)' }}
                />
                <Text
                  fontSize="lg"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Terms of Service
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
                    Welcome to BookmarkHub
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    These Terms of Service ("Terms") govern your use of
                    BookmarkHub, a privacy-focused bookmark management
                    application. By using our service, you agree to be bound by
                    these Terms.
                  </Text>
                </VStack>

                <Separator />

                {/* Privacy-First Approach */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <LuShield size={20} color="var(--color-blue)" />
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Privacy-First Design
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    BookmarkHub is designed with privacy as a core
                    principle. All your data is stored locally on your device
                    and is never transmitted to our servers. We do not collect,
                    store, or process your personal information or bookmark
                    data.
                  </Text>
                </VStack>

                <Separator />

                {/* Local Storage */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Local Data Storage
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Your bookmarks, collections, and settings are stored
                    exclusively in your browser's local storage. This means:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Your data never leaves your device
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • We cannot access your bookmarks or personal information
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • You have complete control over your data
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Data is not synchronized across devices by default
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* Chrome Extension */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Chrome Extension
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Our Chrome extension allows you to import bookmarks from
                    X/Twitter. The extension:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Only accesses your X/Twitter bookmarks when you
                      explicitly request it
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Processes data locally on your device
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Does not transmit data to external servers
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Requires your explicit permission for each import
                      operation
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* User Responsibilities */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <LuUsers size={20} color="var(--color-blue)" />
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Your Responsibilities
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    As a user of BookmarkHub, you agree to:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Use the service in compliance with applicable laws and
                      regulations
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Not use the service for illegal or harmful purposes
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Respect the intellectual property rights of others
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Maintain the security of your device and browser
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* Disclaimers */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <LuInfo size={20} color="var(--color-warning)" />
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Disclaimers
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    BookmarkHub is provided "as is" without warranties of
                    any kind. We disclaim all warranties, express or implied,
                    including but not limited to:
                  </Text>
                  <VStack alignItems="stretch" gap={2} pl={4}>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Warranties of merchantability and fitness for a
                      particular purpose
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Warranties regarding the accuracy, reliability, or
                      availability of the service
                    </Text>
                    <Text
                      fontSize="sm"
                      style={{
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      • Warranties that the service will be uninterrupted or
                      error-free
                    </Text>
                  </VStack>
                </VStack>

                <Separator />

                {/* Limitation of Liability */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Limitation of Liability
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    To the maximum extent permitted by law, BookmarkHub
                    and its developers shall not be liable for any indirect,
                    incidental, special, consequential, or punitive damages,
                    including but not limited to loss of profits, data, or use,
                    arising out of or relating to your use of the service.
                  </Text>
                </VStack>

                <Separator />

                {/* Data Backup */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Data Backup and Recovery
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Since your data is stored locally, you are responsible for
                    backing up your bookmarks. We recommend using the export
                    functionality regularly to create backups of your data. We
                    are not responsible for data loss due to browser issues,
                    device problems, or user error.
                  </Text>
                </VStack>

                <Separator />

                {/* Changes to Terms */}
                <VStack alignItems="stretch" gap={3}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Changes to These Terms
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    We may update these Terms of Service from time to time. We
                    will notify users of any material changes by updating the
                    "Last updated" date at the top of this page. Your continued
                    use of the service after such changes constitutes acceptance
                    of the new Terms.
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
                    Contact Information
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    If you have any questions about these Terms of Service,
                    please contact us at{' '}
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
                    These Terms of Service are effective as of January 2025 and
                    will remain in effect until modified or terminated.
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Flex>
  )
}

export default TermsOfService
