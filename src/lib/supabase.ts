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

// Create client only once
let _supabase: ReturnType<typeof createClient<Database>> | null = null
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

export const supabase = hasValidCredentials
  ? (_supabase ??= createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }))
  : null

// Admin client for server-side operations (if needed)
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

const hasValidAdminCredentials =
  hasValidCredentials &&
  supabaseServiceKey &&
  supabaseServiceKey !== 'your_service_role_key_here'

export const supabaseAdmin = hasValidAdminCredentials
  ? (_supabaseAdmin ??= createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }))
  : null