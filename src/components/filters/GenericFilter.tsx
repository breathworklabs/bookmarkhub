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
        <Icon size={14} color="var(--color-text-tertiary)" />
        <Text fontSize="13px" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
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
            style={{background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            border="1px solid"
            borderRadius="6px"
            px={3}
            py={0}
            _placeholder={{ color: 'var(--color-text-tertiary)' }}
            _hover={{ borderColor: 'var(--color-border-hover)' }}
            _focus={{ borderColor: 'var(--color-blue)', boxShadow: '0 0 0 1px var(--color-blue)' }}
          />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger
              style={{color: 'var(--color-text-tertiary)', background: 'var(--color-bg-tertiary)'}}
              border="0"
              h="30px"
              mr="-7px"
              borderLeft="0px"
              borderRadius="0"
              w="28px"
              p="0"
            />
            <Combobox.Trigger
              style={{color: 'var(--color-text-tertiary)', background: 'var(--color-bg-tertiary)'}}
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
              style={{ background: 'var(--color-bg-tertiary)' }}
              border="1px solid var(--color-border)"
              borderRadius="6px"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
              maxH="240px"
              overflowY="auto"
            >
              <Combobox.Empty
                style={{ color: 'var(--color-text-tertiary)' }}
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
                  style={{ color: 'var(--color-text-primary)' }}
                  fontSize="12px"
                  bg="transparent"
                  _hover={{
                    bg: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  _focus={{
                    bg: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  _selected={{
                    bg: 'var(--color-blue) !important',
                    color: 'white !important'
                  }}
                  _highlighted={{
                    bg: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
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
