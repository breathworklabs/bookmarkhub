import { Box, Input, VStack, Text, HStack, For, Badge } from '@chakra-ui/react'
import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useTagCategoriesStore } from '../../store/tagCategoriesStore'
import TagChip from './TagChip'

interface TagInputProps {
  selectedTags: string[]
  onTagAdd: (tag: string) => void
  onTagRemove: (tag: string) => void
  placeholder?: string
  maxSuggestions?: number
  size?: 'sm' | 'md' | 'lg'
}

const TagInput = memo(
  ({
    selectedTags = [],
    onTagAdd,
    onTagRemove,
    placeholder = 'Add tags...',
    maxSuggestions = 8,
    size = 'md',
  }: TagInputProps) => {
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Get all available tags from bookmarks and categories
    const filterOptions = useBookmarkStore((state) => state.filterOptions)
    const categories = useTagCategoriesStore((state) => state.categories)
    const getCategoryForTag = useTagCategoriesStore(
      (state) => state.getCategoryForTag
    )

    const allTags = useMemo(
      () => filterOptions.tags || [],
      [filterOptions.tags]
    )

    // Generate hierarchical tag suggestions based on input
    const suggestions = useMemo(() => {
      if (!inputValue.trim()) return []

      const input = inputValue.toLowerCase()
      const suggestions: Array<{
        tag: string
        type: 'existing' | 'hierarchical' | 'category'
      }> = []

      // Check for existing tags that match
      const existingMatches = allTags
        .filter(
          (tag) =>
            tag.toLowerCase().includes(input) && !selectedTags.includes(tag)
        )
        .map((tag) => ({ tag, type: 'existing' as const }))

      // Check for category prefixes (e.g., "work:" should suggest hierarchical tags)
      const colonIndex = input.indexOf(':')
      if (colonIndex > 0) {
        const categoryPart = input.substring(0, colonIndex)
        const tagPart = input.substring(colonIndex + 1)

        const matchingCategory = categories.find(
          (cat) =>
            cat.id.toLowerCase() === categoryPart ||
            cat.name.toLowerCase() === categoryPart
        )

        if (matchingCategory && tagPart.length > 0) {
          // Suggest hierarchical tags for this category
          const hierarchicalSuggestion = `${matchingCategory.id}:${tagPart}`
          if (!selectedTags.includes(hierarchicalSuggestion)) {
            suggestions.push({
              tag: hierarchicalSuggestion,
              type: 'hierarchical',
            })
          }
        }
      } else {
        // Suggest category prefixes if input matches a category name
        const categoryMatches = categories
          .filter(
            (cat) =>
              (cat.id.toLowerCase().includes(input) ||
                cat.name.toLowerCase().includes(input)) &&
              input.length > 1
          )
          .map((cat) => ({ tag: `${cat.id}:`, type: 'category' as const }))

        suggestions.push(...categoryMatches)
      }

      // Combine and limit suggestions
      return [...existingMatches, ...suggestions].slice(0, maxSuggestions)
    }, [inputValue, allTags, selectedTags, maxSuggestions, categories])

    // Handle input changes
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)
        setShowSuggestions(value.trim().length > 0)
        setFocusedIndex(-1)
      },
      []
    )

    // Handle adding a tag
    const handleAddTag = useCallback(
      (tag: string) => {
        const trimmedTag = tag.trim()
        if (trimmedTag && !selectedTags.includes(trimmedTag)) {
          onTagAdd(trimmedTag)
          setInputValue('')
          setShowSuggestions(false)
          setFocusedIndex(-1)
        }
      },
      [selectedTags, onTagAdd]
    )

    // Handle keyboard events
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          if (focusedIndex >= 0 && suggestions[focusedIndex]) {
            handleAddTag(suggestions[focusedIndex].tag)
          } else if (inputValue.trim()) {
            handleAddTag(inputValue.trim())
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setFocusedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        } else if (e.key === 'Escape') {
          setShowSuggestions(false)
          setFocusedIndex(-1)
        } else if (
          e.key === 'Backspace' &&
          !inputValue &&
          selectedTags.length > 0
        ) {
          // Remove last tag when backspace is pressed on empty input
          onTagRemove(selectedTags[selectedTags.length - 1])
        }
      },
      [
        focusedIndex,
        suggestions,
        inputValue,
        handleAddTag,
        selectedTags,
        onTagRemove,
      ]
    )

    // Handle input focus
    const handleFocus = useCallback(() => {
      if (inputValue.trim()) {
        setShowSuggestions(true)
      }
    }, [inputValue])

    // Handle input blur (with delay to allow for suggestion clicks)
    const handleBlur = useCallback(() => {
      setTimeout(() => {
        setShowSuggestions(false)
        setFocusedIndex(-1)
      }, 150)
    }, [])

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false)
          setFocusedIndex(-1)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getSizeStyles = () => {
      switch (size) {
        case 'lg':
          return {
            input: { h: '48px', fontSize: 'md' },
            suggestion: { py: 3, fontSize: 'sm' },
          }
        case 'sm':
          return {
            input: { h: '32px', fontSize: 'sm' },
            suggestion: { py: 1, fontSize: 'xs' },
          }
        case 'md':
        default:
          return {
            input: { h: '40px', fontSize: 'sm' },
            suggestion: { py: 2, fontSize: 'sm' },
          }
      }
    }

    const sizeStyles = getSizeStyles()

    return (
      <Box ref={containerRef} position="relative" w="100%">
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <HStack gap={2} mb={2} flexWrap="wrap">
            <For each={selectedTags}>
              {(tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  isRemovable={true}
                  variant="editable"
                  size={size}
                  onRemove={onTagRemove}
                />
              )}
            </For>
          </HStack>
        )}

        {/* Input Field */}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          bg="var(--color-bg-tertiary)"
          border="1px solid var(--color-border)"
          borderRadius="8px"
          color="var(--color-text-primary)"
          _placeholder={{ color: 'var(--color-text-tertiary)' }}
          _hover={{
            borderColor: 'var(--color-border-hover)',
          }}
          _focus={{
            borderColor: 'var(--color-blue)',
            boxShadow: '0 0 0 1px var(--color-blue)',
          }}
          {...sizeStyles.input}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            mt={1}
            bg="var(--color-bg-tertiary)"
            border="1px solid var(--color-border)"
            borderRadius="8px"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
            zIndex={1000}
            maxH="200px"
            overflowY="auto"
          >
            <VStack align="stretch" gap={0}>
              <For each={suggestions}>
                {(suggestion, index) => {
                  const category = getCategoryForTag(suggestion.tag)
                  return (
                    <Box
                      key={suggestion.tag}
                      px={3}
                      cursor="pointer"
                      bg={
                        focusedIndex === index
                          ? 'var(--color-border)'
                          : 'transparent'
                      }
                      color={
                        focusedIndex === index
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-secondary)'
                      }
                      _hover={{
                        bg: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                      onClick={() => handleAddTag(suggestion.tag)}
                      transition="all 0.15s ease"
                      {...sizeStyles.suggestion}
                    >
                      <HStack justify="space-between" align="center">
                        <HStack gap={2} align="center">
                          <Text>#{suggestion.tag}</Text>
                          {suggestion.type === 'category' && (
                            <Badge
                              bg="rgba(29, 78, 216, 0.2)"
                              color="var(--color-blue)"
                              fontSize="xs"
                              px={2}
                              py={0.5}
                              borderRadius="4px"
                            >
                              category
                            </Badge>
                          )}
                          {suggestion.type === 'hierarchical' && (
                            <Badge
                              bg="rgba(34, 197, 94, 0.2)"
                              color="var(--color-accent)"
                              fontSize="xs"
                              px={2}
                              py={0.5}
                              borderRadius="4px"
                            >
                              new
                            </Badge>
                          )}
                        </HStack>
                        {category && (
                          <Badge
                            bg={category.color + '20'}
                            color={category.color}
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="4px"
                          >
                            {category.name}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  )
                }}
              </For>

              {/* Option to create new tag if input doesn't match any suggestion */}
              {inputValue.trim() &&
                !suggestions.some(
                  (s) => s.tag.toLowerCase() === inputValue.toLowerCase()
                ) && (
                  <Box
                    px={3}
                    cursor="pointer"
                    bg={
                      focusedIndex === suggestions.length
                        ? 'var(--color-border)'
                        : 'transparent'
                    }
                    color={
                      focusedIndex === suggestions.length
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-tertiary)'
                    }
                    borderTop="1px solid var(--color-border)"
                    _hover={{
                      bg: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onClick={() => handleAddTag(inputValue.trim())}
                    transition="all 0.15s ease"
                    {...sizeStyles.suggestion}
                  >
                    <Text>Create "#{inputValue.trim()}"</Text>
                  </Box>
                )}
            </VStack>
          </Box>
        )}
      </Box>
    )
  }
)

TagInput.displayName = 'TagInput'

export default TagInput
