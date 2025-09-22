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
  Portal
} from '@chakra-ui/react'
import { LuCalendar } from 'react-icons/lu'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useBookmarkStore, type DateRangeFilter } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'

const DateRangeFilterComponent = () => {
  const dateRangeFilter = useBookmarkStore((state) => state.dateRangeFilter)
  const setDateRangeFilter = useBookmarkStore((state) => state.setDateRangeFilter)
  const setActiveSidebarItem = useBookmarkStore((state) => state.setActiveSidebarItem)
  const setActiveCollection = useCollectionsStore((state) => state.setActiveCollection)

  const [tempStartDate, setTempStartDate] = useState<Date | null>(dateRangeFilter.customStart || null)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(dateRangeFilter.customEnd || null)
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
    }
  }

  const getDisplayValue = () => {
    if (dateRangeFilter.type === 'custom' && dateRangeFilter.customStart) {
      const startStr = dateRangeFilter.customStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      const endStr = dateRangeFilter.customEnd?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
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
        customEnd: tempEndDate || undefined
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
      <VStack alignItems="start" gap={2} flex="1" minW="220px">
        <HStack gap={2} alignItems="center">
          <LuCalendar size={14} color="#71767b" />
          <Text fontSize="13px" fontWeight="500" color="#e1e5e9">
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
              bg="#1a1d23"
              borderColor="#2a2d35"
              color="#e1e5e9"
              border="1px solid"
              borderRadius="6px"
              px={3}
              py={0}
              _hover={{ borderColor: '#3a3d45', bg: '#252932' }}
              _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
              _open={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
            >
              <Select.ValueText
                placeholder="Select date range"
                color="#e1e5e9"
                fontSize="12px"
              >
                {dateRangeFilter.type === 'custom' && dateRangeFilter.customStart
                  ? getDisplayValue()
                  : undefined
                }
              </Select.ValueText>
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator color="#71767b" />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content
                bg="#1a1d23"
                border="1px solid #2a2d35"
                borderRadius="6px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                maxH="240px"
                overflowY="auto"
              >
                {dateRangeOptions.items.map((option) => (
                  <Select.Item
                    item={option}
                    key={option.value}
                    color="#e1e5e9"
                    fontSize="12px"
                    bg="transparent"
                    _hover={{
                      bg: '#2a2d35',
                      color: '#e1e5e9'
                    }}
                    _focus={{
                      bg: '#2a2d35',
                      color: '#e1e5e9'
                    }}
                    _selected={{
                      bg: '#1d4ed8 !important',
                      color: 'white !important'
                    }}
                    _highlighted={{
                      bg: '#2a2d35',
                      color: '#e1e5e9'
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
            bg="#1a1d23"
            border="1px solid #2a2d35"
            borderRadius="8px"
            p={6}
            w="400px"
            maxW="90vw"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={4} alignItems="stretch">
              <Text fontSize="16px" fontWeight="600" color="#e1e5e9">
                Select Custom Date Range
              </Text>

              <VStack gap={3} alignItems="stretch">
                <Box>
                  <Text fontSize="12px" color="#71767b" mb={2}>
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
                          bg="#1a1d23"
                          borderColor="#2a2d35"
                          color="#e1e5e9"
                          _placeholder={{ color: '#71767b' }}
                          _hover={{ borderColor: '#3a3d45' }}
                          _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                          h="32px"
                          fontSize="12px"
                          placeholder="Select start date"
                        />
                      }
                    />
                  </Box>
                </Box>

                <Box>
                  <Text fontSize="12px" color="#71767b" mb={2}>
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
                          bg="#1a1d23"
                          borderColor="#2a2d35"
                          color="#e1e5e9"
                          _placeholder={{ color: '#71767b' }}
                          _hover={{ borderColor: '#3a3d45' }}
                          _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
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
                  borderColor="#2a2d35"
                  color="#71767b"
                  bg="transparent"
                  fontSize="12px"
                  _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                  onClick={handleCustomRangeCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  bg="#1d4ed8"
                  color="white"
                  fontSize="12px"
                  _hover={{ bg: '#1e40af' }}
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
            background-color: #1a1d23 !important;
            border: 1px solid #2a2d35 !important;
            border-radius: 6px !important;
            color: #e1e5e9 !important;
            font-family: inherit !important;
            font-size: 12px !important;
          }

          .custom-datepicker .react-datepicker__header {
            background-color: #2a2d35 !important;
            border-bottom: 1px solid #3a3d45 !important;
            border-radius: 6px 6px 0 0 !important;
          }

          .custom-datepicker .react-datepicker__current-month {
            color: #e1e5e9 !important;
            font-weight: 600 !important;
          }

          .custom-datepicker .react-datepicker__day-name {
            color: #71767b !important;
            font-weight: 500 !important;
          }

          .custom-datepicker .react-datepicker__day {
            color: #e1e5e9 !important;
          }

          .custom-datepicker .react-datepicker__day:hover {
            background-color: #3a3d45 !important;
            border-radius: 4px !important;
          }

          .custom-datepicker .react-datepicker__day--selected {
            background-color: #1d4ed8 !important;
            color: white !important;
            border-radius: 4px !important;
          }

          .custom-datepicker .react-datepicker__day--today {
            background-color: #2a2d35 !important;
            border-radius: 4px !important;
          }

          .custom-datepicker .react-datepicker__navigation {
            top: 8px !important;
          }

          .custom-datepicker .react-datepicker__navigation--previous {
            border-right-color: #71767b !important;
          }

          .custom-datepicker .react-datepicker__navigation--next {
            border-left-color: #71767b !important;
          }

          .custom-datepicker .react-datepicker__navigation:hover span::before {
            border-color: #e1e5e9 !important;
          }
        `}
      </style>
    </>
  )
}

export default DateRangeFilterComponent