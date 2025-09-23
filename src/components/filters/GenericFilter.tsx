import { useMemo } from 'react'
import {
  VStack,
  HStack,
  Text,
  Combobox,
  Portal,
  useFilter,
  useListCollection
} from '@chakra-ui/react'
import { LuChevronDown } from 'react-icons/lu'

interface FilterOption {
  label: string
  value: string
}

interface GenericFilterProps {
  type: 'author' | 'domain' | 'contentType'
  label: string
  icon: React.ComponentType<{ size?: number; color?: string }>
  placeholder: string
  value: string
  onChange: (value: string) => void
  onReset: () => void
  options: FilterOption[]
  emptyMessage?: string
}

export const GenericFilter: React.FC<GenericFilterProps> = ({
  type,
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  onReset,
  options,
  emptyMessage = `No ${type}s found`
}) => {
  const { contains } = useFilter({ sensitivity: 'base' })

  const processedOptions = useMemo(() =>
    options.map(option => ({
      label: option.label,
      value: option.value
    })), [options]
  )

  const { collection, filter } = useListCollection({
    initialItems: processedOptions,
    filter: contains,
  })

  const handleInputValueChange = (details: { inputValue: string }) => {
    filter(details.inputValue)
  }

  const handleValueChange = (details: { value: string[] }) => {
    const selectedValue = details.value[0] || ''
    onChange(selectedValue)
    onReset()
  }

  return (
    <VStack alignItems="start" gap={2} flex="1" minW="220px" maxW="25%">
      <HStack gap={2} alignItems="center">
        <Icon size={14} color="#71767b" />
        <Text fontSize="13px" fontWeight="500" color="#e1e5e9">
          {label}
        </Text>
      </HStack>

      <Combobox.Root
        collection={collection}
        value={value ? [value] : []}
        onInputValueChange={handleInputValueChange}
        onValueChange={handleValueChange}
        allowCustomValue
        width="100%"
      >
        <Combobox.Control h="32px">
          <Combobox.Input
            placeholder={placeholder}
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
            _placeholder={{ color: '#71767b' }}
            _hover={{ borderColor: '#3a3d45' }}
            _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
          />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger
              color="#71767b"
              bg="#1a1d23"
              border="0"
              h="30px"
              mr="-7px"
              borderLeft="0px"
              borderRadius="0"
              w="28px"
              p="0"
            />
            <Combobox.Trigger
              color="#71767b"
              bg="#1a1d23"
              border="0"
              h="30px"
              mr="-7px"
              borderLeft="0px"
              borderRadius="0"
              w="28px"
              p="0"
            >
              <LuChevronDown size={12} />
            </Combobox.Trigger>
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content
              bg="#1a1d23"
              border="1px solid #2a2d35"
              borderRadius="6px"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
              maxH="240px"
              overflowY="auto"
            >
              <Combobox.Empty
                color="#71767b"
                fontSize="12px"
                px={3}
                py={2}
              >
                {emptyMessage}
              </Combobox.Empty>
              {collection.items.map((item) => (
                <Combobox.Item
                  item={item}
                  key={item.value}
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
                  {item.label}
                  <Combobox.ItemIndicator color="currentColor" />
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </VStack>
  )
}

export default GenericFilter
