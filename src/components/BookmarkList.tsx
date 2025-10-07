import { memo, useState } from 'react'
import { Box, HStack, VStack, Text } from '@chakra-ui/react'
import { LuStar, LuExternalLink, LuGripVertical } from 'react-icons/lu'
import { useDrag } from 'react-dnd'
import type { Bookmark } from '../types/bookmark'
import { useBookmarkStore } from '../store/bookmarkStore'
import { ItemTypes } from '../types/dnd'
import TagChip from './tags/TagChip'
import LazyImage from './LazyImage'
import { formatDistanceToNow } from 'date-fns'

interface BookmarkListProps {
  bookmarks: Bookmark[]
}

interface BookmarkListItemProps {
  bookmark: Bookmark
}

const BookmarkListItem = memo(({ bookmark }: BookmarkListItemProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const selectedBookmarks = useBookmarkStore((state) => state.selectedBookmarks)
  const toggleBookmarkSelection = useBookmarkStore((state) => state.toggleBookmarkSelection)
  const toggleStarBookmark = useBookmarkStore((state) => state.toggleStarBookmark)
  const setSelectedTags = useBookmarkStore((state) => state.setSelectedTags)

  const isSelected = selectedBookmarks.includes(bookmark.id)
  const isInBulkMode = selectedBookmarks.length > 0

  // Helper functions to get author data (same as BookmarkHeader)
  const getAuthorName = () => {
    if (typeof bookmark.author === 'string') {
      return bookmark.author || 'Unknown'
    }
    return (bookmark as any).author?.name || 'Unknown'
  }

  const getAuthorInitial = () => {
    const name = getAuthorName()
    return name.charAt(0).toUpperCase()
  }

  const getProfileImage = () => {
    const metadata = (bookmark as any).metadata
    if (metadata && metadata.profile_image_normal) {
      return metadata.profile_image_normal
    }
    if ((bookmark as any).favicon_url && !(bookmark as any).favicon_url.includes('favicon.ico')) {
      return (bookmark as any).favicon_url
    }
    return null
  }

  // Drag and drop functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BOOKMARK,
    item: () => {
      // If this bookmark is selected and there are multiple selected, include all selected IDs
      if (isSelected && selectedBookmarks.length > 1) {
        return { bookmarkIds: selectedBookmarks, isMultiple: true }
      }
      return { bookmarkIds: [bookmark.id], isMultiple: false }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [bookmark.id, selectedBookmarks, isSelected])

  const handleRowClick = (e: React.MouseEvent) => {
    // In bulk mode, clicking the row toggles selection
    if (isInBulkMode) {
      e.preventDefault()
      toggleBookmarkSelection(bookmark.id)
    } else {
      // Normal mode - open link
      window.open(bookmark.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleStarBookmark(bookmark.id)
  }

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTags([tag])
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    toggleBookmarkSelection(bookmark.id)
  }

  return (
    <Box
      ref={drag}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRowClick}
      opacity={isDragging ? 0.5 : 1}
      cursor={isInBulkMode ? 'pointer' : 'default'}
      bg={isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)'}
      borderBottom="1px solid var(--color-border)"
      _hover={{ bg: 'var(--color-bg-tertiary)' }}
      transition="all 0.2s"
      position="relative"
    >
      <HStack gap={3} px={4} py={3} align="center">
        {/* Drag handle */}
        <Box
          color="var(--color-text-tertiary)"
          opacity={isHovered || isDragging ? 1 : 0}
          transition="opacity 0.2s"
          cursor="grab"
          _active={{ cursor: 'grabbing' }}
        >
          <LuGripVertical size={16} />
        </Box>

        {/* Checkbox (visible in bulk mode or when hovered) */}
        <Box
          opacity={(isInBulkMode || isHovered || isSelected) ? 1 : 0}
          transition="opacity 0.2s"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer',
              accentColor: 'var(--color-accent)'
            }}
          />
        </Box>

        {/* Star */}
        <Box
          onClick={handleStarClick}
          cursor="pointer"
          color={bookmark.is_starred ? 'var(--color-star)' : 'var(--color-text-tertiary)'}
          _hover={{ color: bookmark.is_starred ? 'var(--color-star-hover)' : 'var(--color-text-secondary)' }}
          transition="color 0.2s"
        >
          <LuStar size={16} fill={bookmark.is_starred ? 'currentColor' : 'none'} />
        </Box>

        {/* Title & URL - takes most space */}
        <VStack align="stretch" flex={1} gap={0} minW={0}>
          <HStack gap={2}>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color="var(--color-text-primary)"
              truncate
              _hover={{ color: 'var(--color-accent)' }}
              transition="color 0.2s"
            >
              {bookmark.title}
            </Text>
            {bookmark.is_archived && (
              <Text fontSize="xs" color="var(--color-text-tertiary)">
                (Archived)
              </Text>
            )}
          </HStack>
          <HStack gap={2} fontSize="xs" color="var(--color-text-tertiary)">
            <LuExternalLink size={10} />
            <Text truncate>{bookmark.url}</Text>
          </HStack>
        </VStack>

        {/* Author - medium width */}
        <HStack w="150px" gap={2} display={{ base: 'none', md: 'flex' }}>
          <Box
            w="24px"
            h="24px"
            borderRadius="full"
            overflow="hidden"
            bg="var(--gradient-avatar)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            fontWeight="bold"
            color="white"
            flexShrink={0}
            position="relative"
          >
            {getProfileImage() ? (
              <LazyImage
                src={getProfileImage()}
                alt={`${getAuthorName()} profile`}
                w="100%"
                h="100%"
                objectFit="cover"
                position="absolute"
                top={0}
                left={0}
                fallback={
                  <Box
                    w="100%"
                    h="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="var(--gradient-avatar)"
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {getAuthorInitial()}
                  </Box>
                }
              />
            ) : (
              <Text fontSize="xs" fontWeight="bold">
                {getAuthorInitial()}
              </Text>
            )}
          </Box>
          <Text fontSize="sm" color="var(--color-text-secondary)" truncate flex={1}>
            {getAuthorName()}
          </Text>
        </HStack>

        {/* Domain - small width */}
        <Box w="120px" display={{ base: 'none', lg: 'block' }}>
          <Text fontSize="sm" color="var(--color-text-tertiary)" truncate>
            {bookmark.domain}
          </Text>
        </Box>

        {/* Tags - medium width */}
        <HStack gap={1} w="200px" display={{ base: 'none', xl: 'flex' }} flexWrap="wrap">
          {bookmark.tags.slice(0, 2).map((tag) => (
            <Box
              key={tag}
              onClick={(e) => handleTagClick(tag, e)}
            >
              <TagChip
                tag={tag}
                size="sm"
              />
            </Box>
          ))}
          {bookmark.tags.length > 2 && (
            <Text fontSize="xs" color="var(--color-text-tertiary)">
              +{bookmark.tags.length - 2}
            </Text>
          )}
        </HStack>

        {/* Date - small width */}
        <Box w="100px" display={{ base: 'none', lg: 'block' }}>
          <Text fontSize="xs" color="var(--color-text-tertiary)">
            {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
          </Text>
        </Box>
      </HStack>
    </Box>
  )
})

BookmarkListItem.displayName = 'BookmarkListItem'

const BookmarkList = memo(({ bookmarks }: BookmarkListProps) => {
  return (
    <Box>
      {/* Table Header */}
      <Box
        bg="var(--color-bg-primary)"
        borderBottom="2px solid var(--color-border)"
        position="sticky"
        top={0}
        zIndex={1}
      >
        <HStack gap={3} px={4} py={2} align="center">
          <Box w="16px" /> {/* Drag handle space */}
          <Box w="16px" /> {/* Checkbox space */}
          <Box w="16px" /> {/* Star space */}

          <Text flex={1} fontSize="xs" fontWeight="bold" color="var(--color-text-secondary)" textTransform="uppercase">
            Title
          </Text>

          <Text w="150px" fontSize="xs" fontWeight="bold" color="var(--color-text-secondary)" textTransform="uppercase" display={{ base: 'none', md: 'block' }}>
            Author
          </Text>

          <Text w="120px" fontSize="xs" fontWeight="bold" color="var(--color-text-secondary)" textTransform="uppercase" display={{ base: 'none', lg: 'block' }}>
            Domain
          </Text>

          <Text w="200px" fontSize="xs" fontWeight="bold" color="var(--color-text-secondary)" textTransform="uppercase" display={{ base: 'none', xl: 'block' }}>
            Tags
          </Text>

          <Text w="100px" fontSize="xs" fontWeight="bold" color="var(--color-text-secondary)" textTransform="uppercase" display={{ base: 'none', lg: 'block' }}>
            Date
          </Text>
        </HStack>
      </Box>

      {/* Table Body */}
      <VStack gap={0} align="stretch">
        {bookmarks.map((bookmark) => (
          <BookmarkListItem key={bookmark.id} bookmark={bookmark} />
        ))}
      </VStack>

      {bookmarks.length === 0 && (
        <Box py={12} textAlign="center">
          <Text color="var(--color-text-tertiary)">No bookmarks found</Text>
        </Box>
      )}
    </Box>
  )
})

BookmarkList.displayName = 'BookmarkList'

export default BookmarkList
