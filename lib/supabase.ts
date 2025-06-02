import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Criar cliente Supabase para o servidor
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
})

// Cliente para o navegador (singleton)
let browserSupabase: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseBrowser() {
  if (browserSupabase) return browserSupabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  browserSupabase = createClient<Database>(supabaseUrl, supabaseKey)
  return browserSupabase
}
