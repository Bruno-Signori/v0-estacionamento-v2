import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { obterDataHoraAtualBrasil, calcularDiferencaMinutos } from "@/lib/utils/date-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketId, valorPago, metodoPagamento } = body

    console.log("Dados recebidos para saída:", { ticketId, valorPago, metodoPagamento })

    if (!ticketId) {
      return NextResponse.json({ error: "ID do ticket é obrigatório" }, { status: 400 })
    }

    // Buscar o ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("ticket")
      .select(`
        id,
        nr_ticket,
        nr_placa,
        dt_entrada,
        dt_saida,
        id_tipo_veiculo,
        tipo_veiculo:id_tipo_veiculo (
          id,
          nm_tipo,
          vl_preco_hora
        )
      `)
      .eq("id", ticketId)
      .single()

    if (ticketError || !ticket) {
      console.error("Erro ao buscar ticket:", ticketError)
      return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 })
    }

    if (ticket.dt_saida) {
      return NextResponse.json({ error: "Ticket já possui saída registrada" }, { status: 409 })
    }

    // Obter data/hora atual no horário de Brasília
    const dataSaidaBrasil = obterDataHoraAtualBrasil()

    // Calcular tempo de permanência em minutos
    const tempoMinutos = calcularDiferencaMinutos(ticket.dt_entrada, dataSaidaBrasil)

    console.log("Calculando saída:", {
      entrada: ticket.dt_entrada,
      saida: dataSaidaBrasil,
      tempoMinutos,
      valorPago,
    })

    // Atualizar ticket com saída
    const { data: ticketAtualizado, error: atualizacaoError } = await supabase
      .from("ticket")
      .update({
        dt_saida: dataSaidaBrasil,
        nr_tempo_permanencia: tempoMinutos,
        vl_pago: valorPago || null,
        ds_metodo_pagamento: metodoPagamento || null,
      })
      .eq("id", ticketId)
      .select(`
        id,
        nr_ticket,
        nr_placa,
        dt_entrada,
        dt_saida,
        nr_tempo_permanencia,
        vl_pago,
        ds_metodo_pagamento,
        tipo_veiculo:id_tipo_veiculo (
          id,
          nm_tipo,
          vl_preco_hora
        )
      `)
      .single()

    if (atualizacaoError) {
      console.error("Erro ao atualizar ticket:", atualizacaoError)
      return NextResponse.json({ error: "Erro ao registrar saída" }, { status: 500 })
    }

    console.log("Saída registrada com sucesso:", ticketAtualizado)

    return NextResponse.json({
      success: true,
      ticket: ticketAtualizado,
      message: "Saída registrada com sucesso",
    })
  } catch (error) {
    console.error("Erro na API de saída:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
