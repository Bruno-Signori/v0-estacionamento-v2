import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Definir headers explicitamente
  const headers = {
    "Content-Type": "application/json",
  }

  try {
    console.log("=== TESTE DE CONEXÃO INICIADO ===")

    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Verificando variáveis de ambiente...")
    console.log("SUPABASE_URL existe:", !!supabaseUrl)
    console.log("SUPABASE_KEY existe:", !!supabaseKey)

    if (!supabaseUrl || !supabaseKey) {
      console.error("Variáveis de ambiente não encontradas")
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Variáveis de ambiente do Supabase não configuradas",
          details: {
            url: !!supabaseUrl,
            key: !!supabaseKey,
          },
        }),
        {
          status: 500,
          headers,
        },
      )
    }

    // Tentar importar o Supabase
    console.log("Importando cliente Supabase...")
    const { createClient } = await import("@supabase/supabase-js")

    console.log("Criando cliente Supabase...")
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Teste simples - apenas verificar se conseguimos fazer uma query
    console.log("Executando query de teste...")
    const { data, error } = await supabase.from("tipo_veiculo").select("id, nm_tipo").limit(1)

    if (error) {
      console.error("Erro na query Supabase:", error)
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: `Erro do Supabase: ${error.message}`,
          code: error.code,
          hint: error.hint,
        }),
        {
          status: 500,
          headers,
        },
      )
    }

    console.log("Query executada com sucesso:", data)

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Conexão com Supabase OK",
        data: {
          recordsFound: data?.length || 0,
          sampleRecord: data?.[0] || null,
        },
      }),
      {
        status: 200,
        headers,
      },
    )
  } catch (error) {
    console.error("Erro inesperado:", error)

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: `Erro inesperado: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        stack: error instanceof Error ? error.stack : null,
      }),
      {
        status: 500,
        headers,
      },
    )
  }
}
