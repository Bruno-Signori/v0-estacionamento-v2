import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { placa, tipoVeiculoId } = body

    if (!placa || !tipoVeiculoId) {
      return NextResponse.json({ error: "Placa e tipo de veículo são obrigatórios" }, { status: 400 })
    }

    // Verificar se já existe um ticket ativo para esta placa
    const { data: ticketAtivo } = await supabase
      .from("ticket")
      .select("*")
      .eq("nr_placa", placa.toUpperCase())
      .is("dt_saida", null)
      .maybeSingle()

    if (ticketAtivo) {
      return NextResponse.json({ error: "Veículo já possui entrada ativa" }, { status: 400 })
    }

    // Verificar se o veículo já existe
    const { data: veiculoExistente } = await supabase
      .from("veiculo")
      .select("*")
      .eq("nr_placa", placa.toUpperCase())
      .maybeSingle()

    let idVeiculo: number | null = null

    // Se o veículo não existe, criar
    if (!veiculoExistente) {
      const { data: veiculoCriado, error: criacaoError } = await supabase
        .from("veiculo")
        .insert({
          nr_placa: placa.toUpperCase(),
          id_tipo_veiculo: tipoVeiculoId,
          fl_mensalista: false,
        })
        .select()
        .single()

      if (criacaoError) {
        console.error("Erro ao criar veículo:", criacaoError)
        return NextResponse.json({ error: "Falha ao criar veículo" }, { status: 500 })
      }

      idVeiculo = veiculoCriado.id
    } else {
      idVeiculo = veiculoExistente.id

      // Atualizar tipo de veículo se for diferente
      if (veiculoExistente.id_tipo_veiculo !== tipoVeiculoId) {
        await supabase.from("veiculo").update({ id_tipo_veiculo: tipoVeiculoId }).eq("id", idVeiculo)
      }
    }

    // Buscar o último ticket para gerar um número sequencial
    const { data: ultimoTicket } = await supabase
      .from("ticket")
      .select("nr_ticket")
      .order("id", { ascending: false })
      .limit(1)

    let proximoNumero = 1
    if (ultimoTicket && ultimoTicket.length > 0) {
      const match = ultimoTicket[0].nr_ticket.match(/\d+/)
      if (match) {
        proximoNumero = Number.parseInt(match[0], 10) + 1
      }
    }

    // Formatar com zeros à esquerda
    const numeroTicket = `T${proximoNumero.toString().padStart(6, "0")}`

    // Criar ticket de entrada
    const { data: ticketCriado, error: ticketError } = await supabase
      .from("ticket")
      .insert({
        nr_ticket: numeroTicket,
        id_veiculo: idVeiculo,
        nr_placa: placa.toUpperCase(),
        id_tipo_veiculo: tipoVeiculoId,
        dt_entrada: new Date().toISOString(),
        fl_pago: false,
      })
      .select()
      .single()

    if (ticketError) {
      console.error("Erro ao criar ticket:", ticketError)
      return NextResponse.json({ error: "Falha ao criar ticket" }, { status: 500 })
    }

    // Registrar no histórico
    try {
      await supabase.from("historico_operacao").insert({
        tp_operacao: "entrada",
        id_ticket: ticketCriado.id,
        ds_detalhes: {
          placa: placa.toUpperCase(),
          tipo_veiculo: tipoVeiculoId,
          ticket: numeroTicket,
        },
      })
    } catch (error) {
      console.error("Erro ao registrar histórico:", error)
      // Não falhar por causa do histórico
    }

    return NextResponse.json({ ticket: ticketCriado })
  } catch (error) {
    console.error("Erro na API de entrada:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
