import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Cliente para uso no servidor
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Cliente para uso no cliente (browser)
export function getClientSupabase() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Função para obter cliente com configurações específicas
export function createSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}
