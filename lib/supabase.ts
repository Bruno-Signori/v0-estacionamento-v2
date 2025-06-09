import { createClient } from "@supabase/supabase-js"

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente do Supabase não encontradas!")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Definida" : "❌ Não definida")
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅ Definida" : "❌ Não definida")
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl || "", supabaseKey || "")

// Função para criar cliente (para compatibilidade)
export function createSupabaseClient() {
  return createClient(supabaseUrl || "", supabaseKey || "")
}

// Cliente para o navegador (singleton)
let browserSupabase: ReturnType<typeof createClient> | null = null

export function getClientSupabase() {
  if (typeof window === "undefined") {
    return supabase
  }

  if (browserSupabase) return browserSupabase

  browserSupabase = supabase
  return browserSupabase
}

// Export default para compatibilidade
export default supabase
