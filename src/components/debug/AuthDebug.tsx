import { Box, Text, VStack, Button } from '@chakra-ui/react'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { supabase } from '../../lib/supabase'
import { useState, useEffect } from 'react'

export const AuthDebug = () => {
  const currentUserId = useBookmarkStore((state) => state.currentUserId)
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const isLoading = useBookmarkStore((state) => state.isLoading)
  const error = useBookmarkStore((state) => state.error)
  const initialize = useBookmarkStore((state) => state.initialize)

  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  // Log state changes
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-5), `${timestamp}: User ID changed to ${currentUserId || 'null'}`])
  }, [currentUserId])

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-5), `${timestamp}: Bookmarks count: ${bookmarks.length}`])
  }, [bookmarks.length])

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-5), `${timestamp}: AuthDebug component mounted`])
  }, [])

  const checkAuthState = async () => {
    if (!supabase) {
      setDebugInfo({ error: 'Supabase not configured' })
      return
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()

      setDebugInfo({
        user: user ? { id: user.id, email: user.email } : null,
        session: session ? { user: session.user?.id, expires_at: session.expires_at } : null,
        error: error?.message || null
      })
    } catch (err) {
      setDebugInfo({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  if (!supabase) {
    return (
      <Box
        position="fixed"
        top="10px"
        right="10px"
        bg="#1a1d23"
        border="1px solid #2a2d35"
        borderRadius="8px"
        p={3}
        fontSize="xs"
        maxW="300px"
        zIndex={9999}
      >
        <Text color="#e1e5e9" fontWeight="bold">⚠️ Supabase Not Configured</Text>
        <Text color="#71767b">Using mock data only</Text>
      </Box>
    )
  }

  return (
    <Box
      position="fixed"
      top="10px"
      right="10px"
      bg="#1a1d23"
      border="1px solid #2a2d35"
      borderRadius="8px"
      p={3}
      fontSize="xs"
      maxW="300px"
      zIndex={9999}
    >
      <VStack alignItems="stretch" spacing={2}>
        <Text color="#e1e5e9" fontWeight="bold">🐛 Auth Debug</Text>

        <VStack alignItems="stretch" spacing={1}>
          <Text color="#71767b">Store State:</Text>
          <Text color={currentUserId ? '#10b981' : '#ef4444'}>
            User ID: {currentUserId || 'null'}
          </Text>
          <Text color="#71767b">
            Bookmarks: {bookmarks.length}
          </Text>
          <Text color={isLoading ? '#f59e0b' : '#10b981'}>
            Loading: {isLoading.toString()}
          </Text>
          {error && (
            <Text color="#ef4444">
              Error: {error}
            </Text>
          )}
        </VStack>

        <Button
          size="xs"
          onClick={checkAuthState}
          bg="#1d4ed8"
          color="white"
          _hover={{ bg: '#1e40af' }}
        >
          Check Auth
        </Button>

        <Button
          size="xs"
          onClick={() => initialize()}
          bg="#059669"
          color="white"
          _hover={{ bg: '#047857' }}
        >
          Reinitialize
        </Button>

        {logs.length > 0 && (
          <VStack alignItems="stretch" spacing={1}>
            <Text color="#71767b">Recent Logs:</Text>
            <Box bg="#0f1419" p={2} borderRadius="4px" maxH="100px" overflowY="auto">
              {logs.map((log, i) => (
                <Text key={i} fontSize="9px" color="#e1e5e9" fontFamily="mono">
                  {log}
                </Text>
              ))}
            </Box>
          </VStack>
        )}

        {debugInfo && (
          <VStack alignItems="stretch" spacing={1}>
            <Text color="#71767b">Supabase State:</Text>
            <Box bg="#0f1419" p={2} borderRadius="4px">
              <pre style={{ fontSize: '10px', color: '#e1e5e9' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}