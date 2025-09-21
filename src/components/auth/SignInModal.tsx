import {
  VStack,
  Input,
  Button,
  Text,
  HStack,
  Dialog
} from '@chakra-ui/react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useBookmarkStore } from '../../store/bookmarkStore'

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SignInModal = ({ open, onOpenChange }: SignInModalProps) => {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpass123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get store actions
  const initialize = useBookmarkStore((state) => state.initialize)

  const onClose = () => {
    onOpenChange(false)
    setError(null)
  }

  const handleSignIn = async () => {
    if (!supabase) {
      setError('Supabase is not configured')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        console.log('✅ Signed in successfully!')
        // Let the auth state be detected automatically by checking current session
        // Force a refresh by calling initialize to re-check auth state
        await initialize()
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return

    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      console.log('ℹ️ Signed out successfully!')
      // Force a refresh by calling initialize to re-check auth state
      await initialize()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} placement="center">
      <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
      <Dialog.Positioner>
        <Dialog.Content
          bg="#1a1d23"
          border="1px solid #2a2d35"
          borderRadius="16px"
          boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
          maxW="450px"
          w="450px"
        >
          <Dialog.Header
            color="#e1e5e9"
            fontSize="18px"
            fontWeight="600"
            pb={3}
            pt={6}
            px={6}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Dialog.Title>Sign In</Dialog.Title>
            <Button
              variant="ghost"
              size="sm"
              color="#71767b"
              onClick={onClose}
              _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
              minW="auto"
              h="auto"
              p={1}
            >
              ×
            </Button>
          </Dialog.Header>

          <Dialog.Body px={6} pb={4}>
            <VStack spacing={4} alignItems="stretch">
              {/* Error */}
              {error && (
                <HStack
                  bg="#fed7d7"
                  borderRadius="6px"
                  p={3}
                  color="#c53030"
                  spacing={2}
                >
                  <Text fontWeight="bold">⚠</Text>
                  <Text fontSize="sm">{error}</Text>
                </HStack>
              )}

              <Text fontSize="sm" color="#71767b">
                Use the test credentials to sign in and see real database data:
              </Text>

              {/* Email Field */}
              <VStack alignItems="stretch" spacing={2}>
                <Text fontSize="sm" color="#e1e5e9" fontWeight="500">
                  Email
                </Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  bg="#0f1419"
                  borderColor="#2a2d35"
                  color="#e1e5e9"
                  fontSize="14px"
                  h="40px"
                  _placeholder={{ color: '#71767b' }}
                  _hover={{ borderColor: '#3a3d45' }}
                  _focus={{
                    borderColor: '#1d4ed8',
                    boxShadow: '0 0 0 1px #1d4ed8',
                    outline: 'none'
                  }}
                />
              </VStack>

              {/* Password Field */}
              <VStack alignItems="stretch" spacing={2}>
                <Text fontSize="sm" color="#e1e5e9" fontWeight="500">
                  Password
                </Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="testpass123"
                  bg="#0f1419"
                  borderColor="#2a2d35"
                  color="#e1e5e9"
                  fontSize="14px"
                  h="40px"
                  _placeholder={{ color: '#71767b' }}
                  _hover={{ borderColor: '#3a3d45' }}
                  _focus={{
                    borderColor: '#1d4ed8',
                    boxShadow: '0 0 0 1px #1d4ed8',
                    outline: 'none'
                  }}
                />
              </VStack>

              <Text fontSize="xs" color="#71767b" textAlign="center">
                This will load 6 test bookmarks from the real database
              </Text>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer px={6} pb={6} pt={2}>
            <VStack spacing={3} w="full">
              <Button
                size="sm"
                bg="#1d4ed8"
                color="white"
                h="40px"
                w="full"
                _hover={{ bg: '#1e40af' }}
                _disabled={{
                  bg: '#374151',
                  color: '#6b7280',
                  cursor: 'not-allowed'
                }}
                onClick={handleSignIn}
                isDisabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                borderColor="#2a2d35"
                color="#71767b"
                bg="transparent"
                h="40px"
                w="full"
                _hover={{
                  borderColor: '#3a3d45',
                  color: '#e1e5e9',
                  bg: '#252932'
                }}
                onClick={handleSignOut}
                isDisabled={isLoading}
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </VStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}