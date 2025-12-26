import { NextResponse } from "next/server"
import { registrarSaida } from "@/lib/api/ticket"
import { registrarOperacao } from "@/lib/api/historico"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ticketId, tempoEstacionado, valorPago, tabelaPrecoId, tipoPagamento } = body

    if (!ticketId || tempoEstacionado === undefined || !valorPago || !tabelaPrecoId || !tipoPagamento) {
      return NextResponse.json(
        {
          error:
            "Todos os campos são obrigatórios: ticketId, tempoEstacionado, valorPago, tabelaPrecoId, tipoPagamento",
        },
        { status: 400 },
      )
    }

    const ticket = await registrarSaida(ticketId, {
      dt_saida: new Date().toISOString(),
      nr_tempo_permanencia: tempoEstacionado,
      id_tabela_preco: tabelaPrecoId,
      vl_pago: valorPago,
      tp_pagamento: tipoPagamento,
      fl_pago: true,
    })

    // Registrar operação no histórico
    await registrarOperacao(
      "saida",
      ticket.id,
      null, // usuarioId (será implementado com autenticação)
      {
        placa: ticket.nr_placa,
        ticketNumber: ticket.nr_ticket,
        tempoEstacionado,
        valorPago,
        tipoPagamento,
      },
    )

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Erro ao registrar saída:", error)
    return NextResponse.json({ error: "Erro ao registrar saída" }, { status: 500 })
  }
}
