import { Box, VStack, HStack, Text, Heading, Badge } from '@chakra-ui/react'
import { LuArrowLeft } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'

interface Release {
  version: string
  date: string
  tag: 'major' | 'minor' | 'patch'
  changes: { type: 'feat' | 'fix' | 'improvement'; text: string }[]
}

const releases: Release[] = [
  {
    version: '1.3.0',
    date: 'April 2026',
    tag: 'minor',
    changes: [
      { type: 'feat', text: 'Share entire collections via public links — no account needed to view' },
      { type: 'feat', text: 'Shared collections page shows all your shared content in one place' },
      { type: 'improvement', text: 'Hover actions on shared collection cards for quick access' },
      { type: 'improvement', text: 'Collection detail page redesign with cleaner layout' },
    ],
  },
  {
    version: '1.2.0',
    date: 'March 2026',
    tag: 'minor',
    changes: [
      { type: 'feat', text: "What's New modal — highlights new features automatically on update" },
      { type: 'feat', text: 'SEO improvements for better discoverability on search engines' },
      { type: 'improvement', text: 'Upcoming Features page is now scrollable on mobile' },
      { type: 'fix', text: 'Fixed stale state overwrite when moving bookmarks between collections' },
      { type: 'fix', text: 'Fixed starred bookmark detection using correct property name' },
    ],
  },
  {
    version: '1.1.0',
    date: 'February 2026',
    tag: 'minor',
    changes: [
      { type: 'feat', text: 'Chrome extension published to the Web Store — one-click install' },
      { type: 'feat', text: 'DEV_MODE configuration for local extension development' },
      { type: 'improvement', text: 'Extension popup UI simplified and improved' },
      { type: 'fix', text: 'Resolved duplicate sync handlers and missing page refresh after import' },
      { type: 'fix', text: 'Fixed service worker syntax errors' },
    ],
  },
  {
    version: '1.0.0',
    date: 'January 2026',
    tag: 'major',
    changes: [
      { type: 'feat', text: 'Initial public release of BookmarkHub' },
      { type: 'feat', text: 'One-click import of all X/Twitter bookmarks via Chrome extension' },
      { type: 'feat', text: 'Collections and unlimited tag organization' },
      { type: 'feat', text: 'Full-text search with advanced filters (date, author, media type)' },
      { type: 'feat', text: 'Smart tag suggestions using NLP and domain patterns' },
      { type: 'feat', text: 'Drag-and-drop to reorganize bookmarks between collections' },
      { type: 'feat', text: 'Bulk actions for batch tagging, moving, and deleting' },
      { type: 'feat', text: 'Export all data as JSON — full data portability, no lock-in' },
      { type: 'feat', text: '100% local storage — no account, no tracking, no servers' },
      { type: 'feat', text: 'Dark and light theme with X/Twitter-inspired design' },
    ],
  },
]

const typeColors: Record<string, string> = {
  feat: 'var(--color-blue)',
  fix: 'var(--color-error)',
  improvement: '#a855f7',
}

const typeLabels: Record<string, string> = {
  feat: 'New',
  fix: 'Fix',
  improvement: 'Improved',
}

const tagColors: Record<string, string> = {
  major: '#f59e0b',
  minor: 'var(--color-blue)',
  patch: 'var(--color-text-tertiary)',
}

export default function ChangelogPage() {
  const navigate = useNavigate()

  return (
    <Box
      minH="100vh"
      bg="var(--color-bg-primary)"
      py={12}
      px={4}
    >
      <Box maxW="700px" mx="auto">
        <HStack mb={8} gap={3} cursor="pointer" onClick={() => navigate(-1)} width="fit-content">
          <LuArrowLeft size={18} color="var(--color-text-tertiary)" />
          <Text color="var(--color-text-tertiary)" fontSize="sm">Back</Text>
        </HStack>

        <VStack align="start" gap={2} mb={10}>
          <Heading size="2xl" color="var(--color-text-primary)" fontWeight="700">
            Changelog
          </Heading>
          <Text color="var(--color-text-tertiary)" fontSize="md">
            What's new in BookmarkHub — updates, fixes, and improvements.
          </Text>
        </VStack>

        <VStack align="stretch" gap={10}>
          {releases.map((release) => (
            <Box key={release.version}>
              <HStack gap={3} mb={5} align="center">
                <Text
                  fontSize="xl"
                  fontWeight="700"
                  color="var(--color-text-primary)"
                >
                  v{release.version}
                </Text>
                <Badge
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="600"
                  color={tagColors[release.tag]}
                  bg={`${tagColors[release.tag]}1a`}
                  border={`1px solid ${tagColors[release.tag]}33`}
                  textTransform="uppercase"
                >
                  {release.tag}
                </Badge>
                <Text color="var(--color-text-tertiary)" fontSize="sm" ml="auto">
                  {release.date}
                </Text>
              </HStack>

              <VStack align="stretch" gap={2.5}>
                {release.changes.map((change, i) => (
                  <HStack key={i} align="start" gap={3}>
                    <Badge
                      mt={0.5}
                      px={1.5}
                      py={0.5}
                      borderRadius="4px"
                      fontSize="10px"
                      fontWeight="700"
                      color={typeColors[change.type]}
                      bg={`${typeColors[change.type]}1a`}
                      flexShrink={0}
                      minW="52px"
                      textAlign="center"
                      textTransform="uppercase"
                    >
                      {typeLabels[change.type]}
                    </Badge>
                    <Text color="var(--color-text-secondary)" fontSize="sm" lineHeight="1.6">
                      {change.text}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Box
                mt={8}
                h="1px"
                bg="var(--color-border)"
                opacity={0.5}
              />
            </Box>
          ))}
        </VStack>

        <Text
          mt={10}
          color="var(--color-text-tertiary)"
          fontSize="sm"
          textAlign="center"
        >
          More coming soon —{' '}
          <Text
            as="span"
            color="var(--color-blue)"
            cursor="pointer"
            onClick={() => navigate('/upcoming-features')}
            _hover={{ textDecoration: 'underline' }}
          >
            see what's planned
          </Text>
        </Text>
      </Box>
    </Box>
  )
}
