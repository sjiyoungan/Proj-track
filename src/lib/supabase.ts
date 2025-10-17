import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock client for build time if environment variables are missing
const createMockClient = () => ({
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null }),
    upsert: () => ({ data: [], error: null })
  })
})

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any
