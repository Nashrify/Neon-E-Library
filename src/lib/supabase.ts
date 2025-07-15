import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Resource {
  id: string
  title: string
  description: string
  subject: string
  level: string
  category: string
  file_url: string
  file_type: string
  download_count: number
  created_at: string
  updated_at: string
}

export interface ResourceInsert {
  title: string
  description: string
  subject: string
  level: string
  category: string
  file_url: string
  file_type: string
}