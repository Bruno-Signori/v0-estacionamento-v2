import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Função auxiliar para criar resposta JSON
function createJsonResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

// GET - Buscar veículo por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== GET VEÍCULO - INÍCIO ===")
    console.log("Params recebidos:", params)
    console.log("ID:", params.id)

    if (!params.id) {
      return createJsonResponse({ error: "ID não fornecido" }, 400)
    }

    console.log("Usando cliente Supabase...")

    const { data, error } = await supabase.from("veiculo").select("*").eq("id", params.id).single()

    console.log("Resultado da consulta:", { data, error })

    if (error) {
      if (error.code === "PGRST116") {
        return createJsonResponse({ error: "Veículo não encontrado" }, 404)
      }
      console.error("Erro do Supabase:", error)
      return createJsonResponse({ error: "Erro na consulta", details: error.message }, 500)
    }

    return createJsonResponse(data)
  } catch (error) {
    console.error("❌ Erro geral:", error)
    return createJsonResponse(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      500,
    )
  }
}

// PUT - Atualizar veículo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== PUT VEÍCULO - INÍCIO ===")
    console.log("Params recebidos:", params)
    console.log("ID:", params.id)

    if (!params.id) {
      return createJsonResponse({ error: "ID não fornecido" }, 400)
    }

    const body = await request.json()
    console.log("Body recebido:", body)

    console.log("Usando cliente Supabase...")

    // Verificar se veículo existe
    const { data: existing } = await supabase.from("veiculo").select("id").eq("id", params.id).single()

    if (!existing) {
      return createJsonResponse({ error: "Veículo não encontrado" }, 404)
    }

    // Atualizar veículo
    const updateData = {
      id_tipo_veiculo: body.id_tipo_veiculo,
      nm_modelo: body.nm_modelo || null,
      nm_cor: body.nm_cor || null,
      ds_observacoes: body.ds_observacoes || null,
      fl_mensalista: body.fl_mensalista || false,
      dt_atualizacao: new Date().toISOString(),
    }

    console.log("Dados para atualização:", updateData)

    const { data, error } = await supabase.from("veiculo").update(updateData).eq("id", params.id).select().single()

    console.log("Resultado da atualização:", { data, error })

    if (error) {
      console.error("Erro na atualização:", error)
      return createJsonResponse({ error: "Erro ao atualizar", details: error.message }, 500)
    }

    return createJsonResponse(data)
  } catch (error) {
    console.error("❌ Erro geral:", error)
    return createJsonResponse(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      500,
    )
  }
}

// DELETE - Excluir veículo
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== DELETE VEÍCULO - INÍCIO ===")
    console.log("Params recebidos:", params)
    console.log("ID:", params.id)

    if (!params.id) {
      return createJsonResponse({ error: "ID não fornecido" }, 400)
    }

    console.log("Usando cliente Supabase...")

    // Verificar se há tickets associados
    console.log("Verificando tickets associados...")
    const { data: tickets, error: ticketsError } = await supabase
      .from("ticket")
      .select("id")
      .eq("id_veiculo", params.id)
      .limit(1)

    console.log("Tickets encontrados:", { tickets, ticketsError })

    if (ticketsError) {
      console.error("Erro ao verificar tickets:", ticketsError)
      return createJsonResponse({ error: "Erro ao verificar dependências", details: ticketsError.message }, 500)
    }

    if (tickets && tickets.length > 0) {
      return createJsonResponse(
        { error: "Não é possível excluir o veículo pois existem tickets associados a ele" },
        409,
      )
    }

    // Verificar se há mensalistas associados
    console.log("Verificando mensalistas associados...")
    const { data: mensalistas, error: mensalistasError } = await supabase
      .from("mensalista_veiculo")
      .select("id")
      .eq("id_veiculo", params.id)
      .limit(1)

    console.log("Mensalistas encontrados:", { mensalistas, mensalistasError })

    if (mensalistasError) {
      console.error("Erro ao verificar mensalistas:", mensalistasError)
      return createJsonResponse({ error: "Erro ao verificar dependências", details: mensalistasError.message }, 500)
    }

    if (mensalistas && mensalistas.length > 0) {
      return createJsonResponse(
        { error: "Não é possível excluir o veículo pois ele está associado a um mensalista" },
        409,
      )
    }

    // Excluir veículo
    console.log("Excluindo veículo...")
    const { error } = await supabase.from("veiculo").delete().eq("id", params.id)

    console.log("Resultado da exclusão:", { error })

    if (error) {
      console.error("Erro na exclusão:", error)
      return createJsonResponse({ error: "Erro ao excluir", details: error.message }, 500)
    }

    console.log("✅ Veículo excluído com sucesso!")
    return createJsonResponse({ success: true, message: "Veículo excluído com sucesso" })
  } catch (error) {
    console.error("❌ Erro geral:", error)
    return createJsonResponse(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      500,
    )
  }
}
