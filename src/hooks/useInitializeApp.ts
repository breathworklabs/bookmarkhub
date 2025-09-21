import { useEffect, useRef } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { supabase } from '../lib/supabase'

export const useInitializeApp = () => {
  const initialize = useBookmarkStore((state) => state.initialize)
  const setCurrentUserId = useBookmarkStore((state) => state.setCurrentUserId)
  const isLoading = useBookmarkStore((state) => state.isLoading)
  const error = useBookmarkStore((state) => state.error)

  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent duplicate initialization
    if (hasInitialized.current) {
      return
    }

    hasInitialized.current = true

    // Initialize the app
    initialize()

    // Listen for auth state changes only if Supabase is configured
    if (!supabase) {
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUserId(session.user.id)
          await initialize()
        } else if (event === 'SIGNED_OUT') {
          setCurrentUserId(null)
          await initialize()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // Remove dependencies to run only once

  return { isLoading, error }
}