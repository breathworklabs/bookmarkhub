import { Box } from '@chakra-ui/react'
import { memo } from 'react'
import { useSelectionStyles } from '../../hooks/useStyles'

interface SelectionCheckboxProps {
  isSelected: boolean
  onToggle: () => void
}

const SelectionCheckbox = memo(({ isSelected, onToggle }: SelectionCheckboxProps) => {
  const selectionStyles = useSelectionStyles(isSelected)

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
    >
      <Box
        {...selectionStyles}
        data-testid="bookmark-checkbox"
        onClick={onToggle}
        // Prevent any layout shifts
        flexShrink={0}
      >
        {isSelected && (
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="white"
            flexShrink={0}
          />
        )}
      </Box>
    </Box>
  )
})

SelectionCheckbox.displayName = 'SelectionCheckbox'

export default SelectionCheckbox
