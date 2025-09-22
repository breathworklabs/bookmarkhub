import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input
} from '@chakra-ui/react'
import { LuCalendar, LuChevronDown } from 'react-icons/lu'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useBookmarkStore, type DateRangeFilter } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useClickOutside } from '../hooks/useClickOutside'

const DateRangeFilterComponent = () => {
  const dateRangeFilter = useBookmarkStore((state) => state.dateRangeFilter)
  const setDateRangeFilter = useBookmarkStore((state) => state.setDateRangeFilter)
  const setActiveSidebarItem = useBookmarkStore((state) => state.setActiveSidebarItem)
  const setActiveCollection = useCollectionsStore((state) => state.setActiveCollection)

  const [tempStartDate, setTempStartDate] = useState<Date | null>(dateRangeFilter.customStart || null)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(dateRangeFilter.customEnd || null)
  const [showOptions, setShowOptions] = useState(false)
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  const dateRangeOptions = [
    { label: 'All Time', value: 'all' as const },
    { label: 'Today', value: 'today' as const },
    { label: 'This Week', value: 'week' as const },
    { label: 'This Month', value: 'month' as const },
    { label: 'Custom Range', value: 'custom' as const }
  ]

  // Close dropdown when clicking outside using custom hook
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setShowOptions(false)
  }, showOptions)

  const handleOptionSelect = (type: DateRangeFilter['type']) => {
    setShowOptions(false)
    if (type === 'custom') {
      setShowCustomPicker(true)
    } else {
      const newFilter: DateRangeFilter = { type }
      setDateRangeFilter(newFilter)
      setActiveSidebarItem('All Bookmarks')
      setActiveCollection(null)
    }
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

  const getDisplayLabel = () => {
    switch (dateRangeFilter.type) {
      case 'all':
        return 'All Time'
      case 'today':
        return 'Today'
      case 'week':
        return 'This Week'
      case 'month':
        return 'This Month'
      case 'custom':
        if (dateRangeFilter.customStart) {
          const startStr = dateRangeFilter.customStart.toLocaleDateString()
          const endStr = dateRangeFilter.customEnd?.toLocaleDateString() || 'Present'
          return `${startStr} - ${endStr}`
        }
        return 'Custom Range'
      default:
        return 'All Time'
    }
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

        <Box position="relative" width="100%" ref={dropdownRef}>
          <Button
            size="sm"
            w="100%"
            justifyContent="space-between"
            bg="#1a1d23"
            borderColor="#2a2d35"
            color="#e1e5e9"
            border="1px solid"
            _hover={{ borderColor: '#3a3d45', bg: '#252932' }}
            _active={{ borderColor: '#1d4ed8', bg: '#252932' }}
            h="32px"
            fontSize="12px"
            fontWeight="400"
            px={3}
            onClick={() => setShowOptions(!showOptions)}
          >
            <HStack justify="space-between" w="100%">
              <Text truncate>{getDisplayLabel()}</Text>
              <LuChevronDown size={12} />
            </HStack>
          </Button>

          {showOptions && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              bg="#1a1d23"
              border="1px solid #2a2d35"
              borderRadius="6px"
              mt={1}
              zIndex={9999}
              maxH="240px"
              overflowY="auto"
              minW="200px"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"

            >
              {dateRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  w="100%"
                  bg="transparent"
                  color="#e1e5e9"
                  fontSize="12px"
                  fontWeight="400"
                  h="32px"
                  borderRadius="0"
                  border="none"
                  justifyContent="flex-start"
                  _hover={{ bg: '#2a2d35' }}
                  _focus={{ bg: '#2a2d35' }}
                >
                  {option.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>
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