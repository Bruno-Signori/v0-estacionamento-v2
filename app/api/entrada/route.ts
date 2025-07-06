import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { obterDataHoraAtualBrasil } from "@/lib/utils/date-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { placa, tipoVeiculo, observacoes } = body

    console.log("Dados recebidos para entrada:", { placa, tipoVeiculo, observacoes })

    if (!placa || !tipoVeiculo) {
      return NextResponse.json({ error: "Placa e tipo de veículo são obrigatórios" }, { status: 400 })
    }

    // Verificar se já existe um ticket ativo para esta placa
    const { data: ticketExistente, error: verificacaoError } = await supabase
      .from("ticket")
      .select("id, nr_ticket, dt_entrada")
      .eq("nr_placa", placa.toUpperCase())
      .is("dt_saida", null)
      .single()

    if (verificacaoError && verificacaoError.code !== "PGRST116") {
      console.error("Erro ao verificar ticket existente:", verificacaoError)
      return NextResponse.json({ error: "Erro ao verificar ticket existente" }, { status: 500 })
    }

    if (ticketExistente) {
      return NextResponse.json(
        {
          error: "Veículo já possui entrada ativa",
          ticket: ticketExistente,
        },
        { status: 409 },
      )
    }

    // Gerar número do ticket
    const agora = new Date()
    const timestamp = agora.getTime().toString().slice(-6)
    const numeroTicket = `T${timestamp}`

    // Obter data/hora atual no horário de Brasília
    const dataEntradaBrasil = obterDataHoraAtualBrasil()

    console.log("Criando ticket:", {
      numeroTicket,
      placa: placa.toUpperCase(),
      tipoVeiculo,
      dataEntrada: dataEntradaBrasil,
    })

    // Inserir novo ticket
    const { data: novoTicket, error: insercaoError } = await supabase
      .from("ticket")
      .insert({
        nr_ticket: numeroTicket,
        nr_placa: placa.toUpperCase(),
        id_tipo_veiculo: tipoVeiculo,
        dt_entrada: dataEntradaBrasil,
        ds_observacoes: observacoes || null,
      })
      .select(`
        id,
        nr_ticket,
        nr_placa,
        dt_entrada,
        ds_observacoes,
        tipo_veiculo:id_tipo_veiculo (
          id,
          nm_tipo,
          vl_preco_hora
        )
      `)
      .single()

    if (insercaoError) {
      console.error("Erro ao inserir ticket:", insercaoError)
      return NextResponse.json({ error: "Erro ao criar ticket de entrada" }, { status: 500 })
    }

    console.log("Ticket criado com sucesso:", novoTicket)

    return NextResponse.json({
      success: true,
      ticket: novoTicket,
      message: "Entrada registrada com sucesso",
    })
  } catch (error) {
    console.error("Erro na API de entrada:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
