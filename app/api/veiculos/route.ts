import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== INICIANDO BUSCA DE VEÍCULOS ===")

    // Primeiro, vamos testar uma consulta simples
    const { data: veiculos, error } = await supabase
      .from("veiculo")
      .select("*")
      .order("dt_criacao", { ascending: false })

    if (error) {
      console.error("Erro do Supabase ao buscar veículos:", error)
      return NextResponse.json(
        {
          error: `Erro do Supabase: ${error.message}`,
          code: error.code,
          hint: error.hint,
          details: error.details,
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    console.log(`✅ ${veiculos?.length || 0} veículos encontrados`)

    // Se temos veículos, vamos buscar os tipos separadamente
    if (veiculos && veiculos.length > 0) {
      const { data: tipos, error: tiposError } = await supabase.from("tipo_veiculo").select("*")

      if (!tiposError && tipos) {
        // Mapear os tipos para os veículos
        const veiculosComTipos = veiculos.map((veiculo) => {
          const tipo = tipos.find((t) => t.id === veiculo.id_tipo_veiculo)
          return {
            ...veiculo,
            tipo_veiculo: tipo || null,
          }
        })

        return NextResponse.json(veiculosComTipos, {
          headers: {
            "Content-Type": "application/json",
          },
        })
      }
    }

    return NextResponse.json(veiculos || [], {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("❌ Erro inesperado ao buscar veículos:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : null,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== INICIANDO CRIAÇÃO DE VEÍCULO ===")

    const body = await request.json()
    console.log("Dados recebidos:", body)

    // Validar dados obrigatórios
    if (!body.nr_placa || !body.id_tipo_veiculo) {
      return NextResponse.json(
        { error: "Placa e tipo de veículo são obrigatórios" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Formatar placa
    const placaFormatada = body.nr_placa.toUpperCase().replace(/\s+/g, "")

    // Verificar se a placa já existe
    const { data: existingVeiculo, error: checkError } = await supabase
      .from("veiculo")
      .select("nr_placa")
      .eq("nr_placa", placaFormatada)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Erro ao verificar placa existente:", checkError)
      return NextResponse.json(
        {
          error: `Erro ao verificar placa: ${checkError.message}`,
          code: checkError.code,
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    if (existingVeiculo) {
      return NextResponse.json(
        { error: "Já existe um veículo cadastrado com esta placa" },
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Criar o veículo
    const { data: novoVeiculo, error } = await supabase
      .from("veiculo")
      .insert({
        nr_placa: placaFormatada,
        id_tipo_veiculo: Number(body.id_tipo_veiculo),
        nm_modelo: body.nm_modelo || null,
        nm_cor: body.nm_cor || null,
        fl_mensalista: body.fl_mensalista || false,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Erro ao criar veículo:", error)
      return NextResponse.json(
        {
          error: `Erro ao criar veículo: ${error.message}`,
          code: error.code,
          hint: error.hint,
          details: error.details,
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Buscar o tipo do veículo para retornar completo
    const { data: tipoVeiculo } = await supabase
      .from("tipo_veiculo")
      .select("*")
      .eq("id", novoVeiculo.id_tipo_veiculo)
      .single()

    const veiculoCompleto = {
      ...novoVeiculo,
      tipo_veiculo: tipoVeiculo || null,
    }

    console.log("✅ Veículo criado com sucesso:", veiculoCompleto)
    return NextResponse.json(veiculoCompleto, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("❌ Erro inesperado ao criar veículo:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : null,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
