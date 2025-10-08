import { useEffect, useState } from 'react'
import { Box, HStack, Text, Button } from '@chakra-ui/react'

const CONSENT_KEY = 'xbm_cookie_consent'

type ConsentValue = 'accepted' | 'rejected'

const getStoredConsent = (): ConsentValue | null => {
  try {
    const value = localStorage.getItem(CONSENT_KEY)
    if (value === 'accepted' || value === 'rejected') return value
    return null
  } catch {
    return null
  }
}

const CookieConsentBanner = () => {
  const [consent, setConsent] = useState<ConsentValue | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const stored = getStoredConsent()
    setConsent(stored)
    setIsVisible(stored === null)
  }, [])

  const handleChoice = (value: ConsentValue) => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
      setConsent(value)
      setIsVisible(false)
    } catch {
      // ignore storage errors; banner will reappear next load
      setIsVisible(false)
    }
  }

  if (!isVisible) return null

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={1000}
      borderTop="1px solid var(--color-border)"
      style={{ background: 'var(--color-bg-secondary)' }}
      px={4}
      py={3}
    >
      <HStack justify="space-between" align="flex-start" gap={4} maxW="1200px" mx="auto">
        <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
          We do not use tracking cookies. We only store essential data locally on your device to make the
          app work. See our Cookie Policy.
        </Text>
        <HStack gap={2}>
          <Button size="sm" variant="ghost" onClick={() => handleChoice('rejected')} _focus={{ boxShadow: 'none' }}>
            Reject
          </Button>
          <Button size="sm" onClick={() => handleChoice('accepted')} _focus={{ boxShadow: 'none' }}>
            Accept
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}

export default CookieConsentBanner
