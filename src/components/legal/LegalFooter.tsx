import { Box, HStack, Text, Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

interface LegalFooterProps {
  variant?: 'minimal' | 'full'
}

const LegalFooter = ({ variant = 'minimal' }: LegalFooterProps) => {
  const navigate = useNavigate()

  if (variant === 'minimal') {
    return (
      <Box
        p={4}
        borderTopWidth="1px"
        style={{ borderColor: 'var(--color-border)' }}
        bg="var(--color-bg-primary)"
      >
        <HStack gap={4} justifyContent="center" flexWrap="wrap">
          <Button
            onClick={() => navigate('/terms')}
            variant="ghost"
            size="sm"
            style={{ color: 'var(--color-text-tertiary)' }}
            _hover={{ color: 'var(--color-text-secondary)' }}
            fontSize="12px"
          >
            Terms of Service
          </Button>
          <Text fontSize="12px" style={{ color: 'var(--color-text-tertiary)' }}>
            •
          </Text>
          <Button
            onClick={() => navigate('/privacy')}
            variant="ghost"
            size="sm"
            style={{ color: 'var(--color-text-tertiary)' }}
            _hover={{ color: 'var(--color-text-secondary)' }}
            fontSize="12px"
          >
            Privacy Policy
          </Button>
        </HStack>
      </Box>
    )
  }

  return (
    <Box
      p={6}
      borderTopWidth="1px"
      style={{ borderColor: 'var(--color-border)' }}
      bg="var(--color-bg-secondary)"
    >
      <HStack gap={6} justifyContent="center" flexWrap="wrap">
        <Button
          onClick={() => navigate('/terms')}
          variant="ghost"
          size="sm"
          style={{ color: 'var(--color-text-secondary)' }}
          _hover={{ color: 'var(--color-blue)' }}
          fontSize="13px"
        >
          Terms of Service
        </Button>
        <Button
          onClick={() => navigate('/privacy')}
          variant="ghost"
          size="sm"
          style={{ color: 'var(--color-text-secondary)' }}
          _hover={{ color: 'var(--color-blue)' }}
          fontSize="13px"
        >
          Privacy Policy
        </Button>
        <Text fontSize="13px" style={{ color: 'var(--color-text-tertiary)' }}>
          X Bookmark Manager - Privacy-First Design
        </Text>
      </HStack>
    </Box>
  )
}

export default LegalFooter
