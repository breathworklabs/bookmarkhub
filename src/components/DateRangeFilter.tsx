import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  createListCollection,
  Portal,
} from '@chakra-ui/react'
import { LuCalendar } from 'react-icons/lu'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useBookmarkStore, type DateRangeFilter } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'

const DateRangeFilterComponent = () => {
  const dateRangeFilter = useBookmarkStore((state) => state.dateRangeFilter)
  const setDateRangeFilter = useBookmarkStore(
    (state) => state.setDateRangeFilter
  )
  const setActiveSidebarItem = useBookmarkStore(
    (state) => state.setActiveSidebarItem
  )
  const setActiveTab = useBookmarkStore((state) => state.setActiveTab)
  const setActiveCollection = useCollectionsStore(
    (state) => state.setActiveCollection
  )

  const [tempStartDate, setTempStartDate] = useState<Date | null>(
    dateRangeFilter.customStart || null
  )
  const [tempEndDate, setTempEndDate] = useState<Date | null>(
    dateRangeFilter.customEnd || null
  )
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  const dateRangeOptions = createListCollection({
    items: [
      { label: 'All Time', value: 'all' },
      { label: 'Today', value: 'today' },
      { label: 'This Week', value: 'week' },
      { label: 'This Month', value: 'month' },
      { label: 'Custom Range', value: 'custom' },
    ],
  })

  const handleSelectChange = (details: { value: string[] }) => {
    const type = details.value[0] as DateRangeFilter['type']

    if (type === 'custom') {
      setShowCustomPicker(true)
    } else {
      const newFilter: DateRangeFilter = { type }
      setDateRangeFilter(newFilter)
      setActiveSidebarItem('All Bookmarks')
      setActiveCollection(null)

      // Sync with FilterBar tabs
      // FilterBar tabs: 0=All, 1=Today, 2=This Week, 3=Threads, 4=Media
      if (type === 'all') {
        setActiveTab(0)
      } else if (type === 'today') {
        setActiveTab(1)
      } else if (type === 'week') {
        setActiveTab(2)
      }
      // month and custom don't have corresponding tabs, leave as-is
    }
  }

  const getDisplayValue = () => {
    if (dateRangeFilter.type === 'custom' && dateRangeFilter.customStart) {
      const startStr = dateRangeFilter.customStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const endStr =
        dateRangeFilter.customEnd?.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) || 'Present'
      return `${startStr} - ${endStr}`
    }
    return dateRangeFilter.type
  }

  const handleCustomRangeApply = () => {
    if (tempStartDate) {
      const newFilter: DateRangeFilter = {
        type: 'custom',
        customStart: tempStartDate,
        customEnd: tempEndDate || undefined,
      }
      setDateRangeFilter(newFilter)
      setActiveSidebarItem('All Bookmarks')
      setActiveCollection(null)
      setShowCustomPicker(false)
    }
  }

  const handleCustomRangeCancel = () => {
    setTempStartDate(dateRangeFilter.customStart || null)
    setTempEndDate(dateRangeFilter.customEnd || null)
    setShowCustomPicker(false)
  }

  return (
    <>
      <VStack
        alignItems="start"
        gap={2}
        flex="1"
        minW={{ base: '100%', md: '220px' }}
        w={{ base: '100%', md: 'auto' }}
      >
        <HStack gap={2} alignItems="center">
          <LuCalendar
            size={14}
            style={{ color: 'var(--color-text-tertiary)' }}
          />
          <Text
            fontSize="13px"
            fontWeight="500"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Date Range
          </Text>
        </HStack>

        <Select.Root
          collection={dateRangeOptions}
          value={[dateRangeFilter.type]}
          onValueChange={handleSelectChange}
          size="sm"
        >
          <Select.HiddenSelect />
          <Select.Control h="32px">
            <Select.Trigger
              h="32px"
              minH="32px"
              maxH="32px"
              fontSize="12px"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
              }}
              border="1px solid"
              borderRadius="6px"
              px={3}
              py={0}
              _hover={{
                borderColor: 'var(--color-border-hover)',
                bg: 'var(--color-bg-hover)',
              }}
              _focus={{
                borderColor: 'var(--color-blue)',
                boxShadow: '0 0 0 1px var(--color-blue)',
              }}
              _open={{
                borderColor: 'var(--color-blue)',
                boxShadow: '0 0 0 1px var(--color-blue)',
              }}
            >
              <Select.ValueText
                placeholder="Select date range"
                style={{ color: 'var(--color-text-primary)' }}
                fontSize="12px"
              >
                {dateRangeFilter.type === 'custom' &&
                dateRangeFilter.customStart
                  ? getDisplayValue()
                  : undefined}
              </Select.ValueText>
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content
                style={{ background: 'var(--color-bg-tertiary)' }}
                border="1px solid var(--color-border)"
                borderRadius="6px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                maxH="240px"
                overflowY="auto"
              >
                {dateRangeOptions.items.map((option) => (
                  <Select.Item
                    item={option}
                    key={option.value}
                    style={{ color: 'var(--color-text-primary)' }}
                    fontSize="12px"
                    bg="transparent"
                    _hover={{
                      bg: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    _focus={{
                      bg: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    _selected={{
                      bg: 'var(--color-blue) !important',
                      color: 'white !important',
                    }}
                    _highlighted={{
                      bg: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    px={3}
                    py={2}
                    cursor="pointer"
                  >
                    {option.label}
                    <Select.ItemIndicator color="currentColor" />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </VStack>

      {/* Custom Date Range Picker */}
      {showCustomPicker && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={2000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => setShowCustomPicker(false)}
        >
          <Box
            style={{ background: 'var(--color-bg-tertiary)' }}
            border="1px solid var(--color-border)"
            borderRadius="8px"
            p={6}
            w="400px"
            maxW="90vw"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={4} alignItems="stretch">
              <Text
                fontSize="16px"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Select Custom Date Range
              </Text>

              <VStack gap={3} alignItems="stretch">
                <Box>
                  <Text
                    fontSize="12px"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    mb={2}
                  >
                    Start Date
                  </Text>
                  <Box className="custom-datepicker" w="100%">
                    <DatePicker
                      selected={tempStartDate}
                      onChange={(date) => setTempStartDate(date)}
                      maxDate={tempEndDate || undefined}
                      wrapperClassName="react-datepicker-wrapper-full-width"
                      customInput={
                        <Input
                          size="sm"
                          w="100%"
                          style={{
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border)',
                          }}
                          _placeholder={{ color: 'var(--color-text-tertiary)' }}
                          _hover={{ borderColor: 'var(--color-border-hover)' }}
                          _focus={{
                            borderColor: 'var(--color-blue)',
                            boxShadow: '0 0 0 1px var(--color-blue)',
                          }}
                          h="32px"
                          fontSize="12px"
                          placeholder="Select start date"
                        />
                      }
                    />
                  </Box>
                </Box>

                <Box>
                  <Text
                    fontSize="12px"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    mb={2}
                  >
                    End Date (Optional)
                  </Text>
                  <Box className="custom-datepicker" w="100%">
                    <DatePicker
                      selected={tempEndDate || undefined}
                      onChange={(date) => setTempEndDate(date)}
                      minDate={tempStartDate || undefined}
                      maxDate={new Date()}
                      wrapperClassName="react-datepicker-wrapper-full-width"
                      customInput={
                        <Input
                          size="sm"
                          w="100%"
                          style={{
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text-primary)',
                            borderColor: 'var(--color-border)',
                          }}
                          _placeholder={{ color: 'var(--color-text-tertiary)' }}
                          _hover={{ borderColor: 'var(--color-border-hover)' }}
                          _focus={{
                            borderColor: 'var(--color-blue)',
                            boxShadow: '0 0 0 1px var(--color-blue)',
                          }}
                          h="32px"
                          fontSize="12px"
                          placeholder="Select end date"
                        />
                      }
                      isClearable
                    />
                  </Box>
                </Box>
              </VStack>

              <HStack gap={2} justify="flex-end" pt={2}>
                <Button
                  size="sm"
                  variant="outline"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-tertiary)',
                    background: 'transparent',
                  }}
                  fontSize="12px"
                  _hover={{
                    color: 'var(--color-text-primary)',
                    bg: 'var(--color-border)',
                  }}
                  onClick={handleCustomRangeCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  style={{ background: 'var(--color-blue)' }}
                  color="white"
                  fontSize="12px"
                  _hover={{ bg: 'var(--color-blue-hover)' }}
                  onClick={handleCustomRangeApply}
                  disabled={!tempStartDate}
                >
                  Apply
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      <style>
        {`
          .react-datepicker-wrapper-full-width {
            width: 100% !important;
            display: block !important;
          }

          .react-datepicker-wrapper-full-width .react-datepicker__input-container {
            width: 100% !important;
            display: block !important;
          }

          .custom-datepicker .react-datepicker {
            background-color: var(--color-bg-tertiary) !important;
            border: 1px solid var(--color-border) !important;
            border-radius: 6px !important;
            color: var(--color-text-primary) !important;
            font-family: inherit !important;
            font-size: 12px !important;
          }

          .custom-datepicker .react-datepicker__header {
            background-color: var(--color-border) !important;
            border-bottom: 1px solid var(--color-border-hover) !important;
            border-radius: 6px 6px 0 0 !important;
          }

          .custom-datepicker .react-datepicker__current-month {
            color: var(--color-text-primary) !important;
            font-weight: 600 !important;
          }

          .custom-datepicker .react-datepicker__day-name {
            color: var(--color-text-tertiary) !important;
            font-weight: 500 !important;
          }

          .custom-datepicker .react-datepicker__day {
            color: var(--color-text-primary) !important;
          }

          .custom-datepicker .react-datepicker__day:hover {
            background-color: var(--color-border-hover) !important;
            border-radius: 4px !important;
          }

          .custom-datepicker .react-datepicker__day--selected {
            background-color: var(--color-blue) !important;
            color: white !important;
            border-radius: 4px !important;
          }

          .custom-datepicker .react-datepicker__day--today {
            background-color: var(--color-border) !important;
            border-radius: 4px !important;
          }

          .custom-datepicker .react-datepicker__navigation {
            top: 8px !important;
          }

          .custom-datepicker .react-datepicker__navigation--previous {
            border-right-color: var(--color-text-tertiary) !important;
          }

          .custom-datepicker .react-datepicker__navigation--next {
            border-left-color: var(--color-text-tertiary) !important;
          }

          .custom-datepicker .react-datepicker__navigation:hover span::before {
            border-color: var(--color-text-primary) !important;
          }
        `}
      </style>
    </>
  )
}

export default DateRangeFilterComponent
