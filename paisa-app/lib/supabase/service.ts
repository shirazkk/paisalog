import { createClient } from '@supabase/supabase-js'

// This client uses the service role key which bypasses Row Level Security (RLS).
// WARNING: Only use this server-side in API routes. Never expose this on the client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
