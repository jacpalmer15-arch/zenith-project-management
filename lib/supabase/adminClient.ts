import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// IMPORTANT: Only use this for server-side operations that require service role
// DO NOT expose the service key to the client
// For MVP, we will avoid using this unless absolutely necessary

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase admin credentials. This client should only be used server-side.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
