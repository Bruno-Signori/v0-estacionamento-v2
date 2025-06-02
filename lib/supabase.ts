import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente Supabase para uso geral
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente Supabase para o lado do cliente (browser)
let clientSupabase: ReturnType<typeof createClient> | null = null

export const getClientSupabase = () => {
  if (!clientSupabase && typeof window !== "undefined") {
    clientSupabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return clientSupabase || supabase
}
