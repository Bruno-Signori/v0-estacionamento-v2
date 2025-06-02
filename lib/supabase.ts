import { createClient } from "@supabase/supabase-js"

// Criar cliente Supabase para o servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

// Cliente para o navegador (singleton)
let browserSupabase: ReturnType<typeof createClient> | null = null

export function getClientSupabase() {
  if (typeof window === "undefined") {
    return supabase
  }

  if (browserSupabase) return browserSupabase

  browserSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  return browserSupabase
}
