import { Box, VStack, HStack, Text, Heading, Badge } from '@chakra-ui/react'
import {
  LuShield,
  LuMessagesSquare,
  LuBrain,
  LuSearch,
  LuHeartPulse,
  LuBell,
  LuRadar,
  LuChartBar,
  LuSparkles,
  LuDownload,
  LuGlobe,
  LuUsers,
  LuTrendingUp,
} from 'react-icons/lu'
import { componentStyles } from '../styles/components'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  tier: 'free' | 'pro' | 'creator'
  status: 'planned' | 'coming-soon' | 'available'
  category: 'preservation' | 'intelligence' | 'productivity' | 'collaboration'
}

const features: Feature[] = [
  // Current Free Features
  {
    icon: <LuSearch size={24} />,
    title: 'Smart Search & Filters',
    description: 'Powerful search across all your bookmarks with advanced filters by date, author, media type, and more. Find exactly what you need instantly.',
    tier: 'free',
    status: 'available',
    category: 'productivity',
  },
  {
    icon: <LuChartBar size={24} />,
    title: 'Collections & Organization',
    description: 'Create unlimited collections to organize your bookmarks. Add tags, star favorites, and keep everything neatly categorized.',
    tier: 'free',
    status: 'available',
    category: 'productivity',
  },
  {
    icon: <LuDownload size={24} />,
    title: 'Import & Export',
    description: 'Import your X/Twitter bookmarks and export your data anytime. Full data portability with JSON format support.',
    tier: 'free',
    status: 'available',
    category: 'productivity',
  },

  // Preservation Features
  {
    icon: <LuShield size={24} />,
    title: 'Tweet Preservation Archive',
    description: 'Automatic snapshots of every bookmarked tweet with full thread capture and media. Works even after deletion - never lose important content again.',
    tier: 'pro',
    status: 'planned',
    category: 'preservation',
  },
  {
    icon: <LuMessagesSquare size={24} />,
    title: 'Intelligent Thread Completion',
    description: 'Auto-detects when a bookmark is part of a thread and captures the entire conversation automatically. No more lost context.',
    tier: 'pro',
    status: 'planned',
    category: 'preservation',
  },
  {
    icon: <LuHeartPulse size={24} />,
    title: 'Content Health Monitoring',
    description: 'Weekly health checks for your bookmarks. Detects deleted tweets, broken links, and username changes. Proactive protection for your collection.',
    tier: 'pro',
    status: 'planned',
    category: 'preservation',
  },

  // Intelligence Features
  {
    icon: <LuBrain size={24} />,
    title: 'AI Context Memory',
    description: 'AI automatically adds "why you saved this" notes by analyzing your browsing patterns. Restores the "aha moment" when you revisit old bookmarks.',
    tier: 'pro',
    status: 'coming-soon',
    category: 'intelligence',
  },
  {
    icon: <LuSearch size={24} />,
    title: 'Semantic Search',
    description: 'Natural language queries that understand intent, not just keywords. Find "startup advice from founders I respect" instead of exact text matches.',
    tier: 'pro',
    status: 'coming-soon',
    category: 'intelligence',
  },
  {
    icon: <LuSparkles size={24} />,
    title: 'Collection Intelligence',
    description: 'Auto-suggest collections based on patterns in your bookmarks. "These 12 bookmarks seem related - create \'Startup Growth\' collection?"',
    tier: 'pro',
    status: 'planned',
    category: 'intelligence',
  },

  // Productivity Features
  {
    icon: <LuBell size={24} />,
    title: 'Smart Reminders',
    description: 'Get reminded to actually use saved content. "You bookmarked this tutorial 2 weeks ago - ready to try it?" Action-oriented prompts.',
    tier: 'pro',
    status: 'planned',
    category: 'productivity',
  },
  {
    icon: <LuRadar size={24} />,
    title: 'Personal Content Radar',
    description: 'Track new content from your most-bookmarked authors. "3 new tweets about topics you care about" - stay ahead of the curve.',
    tier: 'pro',
    status: 'planned',
    category: 'productivity',
  },
  {
    icon: <LuChartBar size={24} />,
    title: 'Reading Analytics',
    description: 'Understand your bookmark patterns. "You have 47 unread bookmarks about AI" with priority suggestions and reading time estimates.',
    tier: 'pro',
    status: 'planned',
    category: 'productivity',
  },
  {
    icon: <LuDownload size={24} />,
    title: 'Advanced Import/Export',
    description: 'One-click Twitter archive processing, multiple export formats (Notion, Obsidian, Roam), scheduled backups, and API access for custom workflows.',
    tier: 'pro',
    status: 'planned',
    category: 'productivity',
  },

  // Collaboration Features
  {
    icon: <LuGlobe size={24} />,
    title: 'Public Collections',
    description: 'Share curated bookmark collections publicly with SEO-friendly pages. Perfect for influencers, curators, and educators to monetize their curation work.',
    tier: 'creator',
    status: 'planned',
    category: 'collaboration',
  },
  {
    icon: <LuUsers size={24} />,
    title: 'Team Collaboration',
    description: 'Shared workspaces with role-based permissions, comments, discussions, and task management. Coordinate research and intel with your team.',
    tier: 'creator',
    status: 'planned',
    category: 'collaboration',
  },
  {
    icon: <LuTrendingUp size={24} />,
    title: 'Advanced Analytics',
    description: 'Topic trend analysis, author credibility scores, content gap identification, and virality tracking. Professional insights for researchers and strategists.',
    tier: 'creator',
    status: 'planned',
    category: 'collaboration',
  },
]

const UpcomingFeaturesPage = () => {
  const tierColors = {
    free: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
    pro: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
    creator: { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' },
  }

  const statusColors = {
    available: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
    planned: { bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.3)', text: '#64748b' },
    'coming-soon': { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', text: '#8b5cf6' },
  }

  const categories = [
    { id: 'preservation', label: 'Preservation', icon: <LuShield size={20} /> },
    { id: 'intelligence', label: 'Intelligence', icon: <LuBrain size={20} /> },
    { id: 'productivity', label: 'Productivity', icon: <LuChartBar size={20} /> },
    { id: 'collaboration', label: 'Collaboration', icon: <LuUsers size={20} /> },
  ]

  return (
    <Box {...componentStyles.container.background} h="100vh" w="100%" overflowY="auto">
      <VStack align="stretch" gap={8} maxW="1200px" mx="auto" p={6}>
        {/* Header */}
        <VStack align="stretch" gap={3}>
          <Heading
            fontSize="2xl"
            fontWeight="700"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Upcoming Features
          </Heading>
          <Text
            fontSize="md"
            style={{ color: 'var(--color-text-secondary)' }}
            lineHeight="1.6"
          >
            Exciting features coming to BookmarkHub. We're building powerful tools to help you
            preserve, organize, and get more value from your X/Twitter bookmarks.
          </Text>
        </VStack>

        {/* Feature Tiers Info */}
        <Box
          p={4}
          borderRadius="12px"
          bg="var(--gradient-card)"
          border="1px solid var(--color-border)"
        >
          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
              Feature Categories
            </Text>
            <HStack gap={4} flexWrap="wrap">
              <HStack gap={2}>
                <Box
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={tierColors.free.bg}
                  border="1px solid"
                  style={{ borderColor: tierColors.free.border }}
                >
                  <Text fontSize="xs" fontWeight="600" color={tierColors.free.text}>
                    FREE
                  </Text>
                </Box>
                <Text fontSize="sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  Available now
                </Text>
              </HStack>
              <HStack gap={2}>
                <Box
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={tierColors.pro.bg}
                  border="1px solid"
                  style={{ borderColor: tierColors.pro.border }}
                >
                  <Text fontSize="xs" fontWeight="600" color={tierColors.pro.text}>
                    PRO
                  </Text>
                </Box>
                <Text fontSize="sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  Coming soon
                </Text>
              </HStack>
              <HStack gap={2}>
                <Box
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={tierColors.creator.bg}
                  border="1px solid"
                  style={{ borderColor: tierColors.creator.border }}
                >
                  <Text fontSize="xs" fontWeight="600" color={tierColors.creator.text}>
                    CREATOR
                  </Text>
                </Box>
                <Text fontSize="sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  Coming soon
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        {/* Features by Category */}
        {categories.map((category) => {
          const categoryFeatures = features.filter((f) => f.category === category.id)
          if (categoryFeatures.length === 0) return null

          return (
            <VStack key={category.id} align="stretch" gap={4}>
              <HStack gap={2}>
                <Box style={{ color: 'var(--color-blue)' }}>
                  {category.icon}
                </Box>
                <Heading
                  fontSize="lg"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {category.label}
                </Heading>
              </HStack>

              <VStack align="stretch" gap={3}>
                {categoryFeatures.map((feature, index) => {
                  const tierColor = tierColors[feature.tier]
                  const statusColor = statusColors[feature.status]

                  return (
                    <Box
                      key={index}
                      p={5}
                      borderRadius="12px"
                      bg="var(--color-bg-secondary)"
                      border="1px solid var(--color-border)"
                      transition="all 0.2s ease"
                      _hover={{
                        borderColor: 'var(--color-border-hover)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <HStack align="flex-start" gap={4}>
                        <Box
                          p={3}
                          borderRadius="10px"
                          bg={tierColor.bg}
                          border="1px solid"
                          style={{ borderColor: tierColor.border, color: tierColor.text }}
                          flexShrink={0}
                        >
                          {feature.icon}
                        </Box>

                        <VStack align="stretch" gap={2} flex={1}>
                          <HStack justify="space-between" align="flex-start">
                            <Text
                              fontSize="md"
                              fontWeight="600"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {feature.title}
                            </Text>
                            <HStack gap={2} flexShrink={0}>
                              <Badge
                                px={2}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="600"
                                textTransform="uppercase"
                                bg={tierColor.bg}
                                border="1px solid"
                                style={{ borderColor: tierColor.border }}
                                color={tierColor.text}
                              >
                                {feature.tier}
                              </Badge>
                              <Badge
                                px={2}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="600"
                                textTransform="capitalize"
                                bg={statusColor.bg}
                                border="1px solid"
                                style={{ borderColor: statusColor.border }}
                                color={statusColor.text}
                              >
                                {feature.status.replace('-', ' ')}
                              </Badge>
                            </HStack>
                          </HStack>

                          <Text
                            fontSize="sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                            lineHeight="1.6"
                          >
                            {feature.description}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )
                })}
              </VStack>
            </VStack>
          )
        })}

        {/* Footer Note */}
        <Box
          p={4}
          borderRadius="12px"
          bg="rgba(59, 130, 246, 0.05)"
          border="1px solid rgba(59, 130, 246, 0.2)"
        >
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
              Stay Updated
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }} lineHeight="1.6">
              We're actively developing these features. Our current focus is on providing
              the best free bookmark management experience. Advanced features will be introduced
              as we continue to improve and expand the platform.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}

export default UpcomingFeaturesPage
