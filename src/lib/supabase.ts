import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if we have valid credentials
const hasValidCredentials =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://'))

if (!hasValidCredentials) {
  console.info('Supabase not configured - using mock data')
} else {
  console.info('✅ Supabase connected successfully')
}

// Create client only once using lazy initialization
let _supabase: ReturnType<typeof createClient<Database>> | null = null

const createSupabaseClient = () => {
  if (!_supabase && hasValidCredentials) {
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'x-bookmark-manager-auth', // Unique storage key
        flowType: 'pkce'
      }
    })
  }
  return _supabase
}

export const supabase = hasValidCredentials ? createSupabaseClient() : null

// Admin client for server-side operations (if needed) - removed for now to prevent multiple instances
// Only use the main client for this application