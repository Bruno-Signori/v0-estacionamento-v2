import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

function obterDataHoraBrasil(): string {
  // Criar data atual e converter para horário de Brasília (UTC-3)
  const agora = new Date()

  // Converter para horário de Brasília usando toLocaleString
  const horarioBrasil = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

  // Formatar para ISO string com timezone brasileiro
  const ano = horarioBrasil.getFullYear()
  const mes = String(horarioBrasil.getMonth() + 1).padStart(2, "0")
  const dia = String(horarioBrasil.getDate()).padStart(2, "0")
  const hora = String(horarioBrasil.getHours()).padStart(2, "0")
  const minuto = String(horarioBrasil.getMinutes()).padStart(2, "0")
  const segundo = String(horarioBrasil.getSeconds()).padStart(2, "0")
  const milissegundo = String(horarioBrasil.getMilliseconds()).padStart(3, "0")

  // Retornar no formato ISO com timezone brasileiro
  return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}.${milissegundo}-03:00`
}

function obterPrefixoDia(): string {
  // Obter data atual no horário de Brasília
  const agora = new Date()
  const horarioBrasil = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

  const ano = String(horarioBrasil.getFullYear()).slice(-2) // Últimos 2 dígitos do ano
  const mes = String(horarioBrasil.getMonth() + 1).padStart(2, "0")
  const dia = String(horarioBrasil.getDate()).padStart(2, "0")

  return `${ano}${mes}${dia}`
}

async function gerarNumeroTicketDiario(): Promise<string> {
  try {
    const prefixoDia = obterPrefixoDia()

    // Buscar o último ticket do dia atual
    const { data: ultimosTickets, error } = await supabase
      .from("ticket")
      .select("nr_ticket")
      .like("nr_ticket", `${prefixoDia}%`)
      .order("nr_ticket", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Erro ao buscar último ticket do dia:", error)
    }

    let proximoSequencial = 1

    if (ultimosTickets && ultimosTickets.length > 0) {
      const ultimoTicket = ultimosTickets[0].nr_ticket
      // Extrair os últimos 3 dígitos (sequencial)
      const sequencialAtual = ultimoTicket.slice(-3)
      proximoSequencial = Number.parseInt(sequencialAtual, 10) + 1
    }

    // Garantir que não ultrapasse 999
    if (proximoSequencial > 999) {
      throw new Error("Limite diário de tickets atingido (999)")
    }

    // Formatar com zeros à esquerda (3 dígitos)
    const sequencialFormatado = proximoSequencial.toString().padStart(3, "0")

    return `${prefixoDia}${sequencialFormatado}`
  } catch (error) {
    console.error("Erro ao gerar número de ticket:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { placa, tipoVeiculoId } = body

    if (!placa || !tipoVeiculoId) {
      return NextResponse.json({ error: "Placa e tipo de veículo são obrigatórios" }, { status: 400 })
    }

    const placaFormatada = placa.toString().toUpperCase().trim()

    // Verificar se já existe um ticket ativo para esta placa
    const { data: ticketAtivo } = await supabase
      .from("ticket")
      .select("*")
      .eq("nr_placa", placaFormatada)
      .is("dt_saida", null)
      .maybeSingle()

    if (ticketAtivo) {
      return NextResponse.json({ error: "Veículo já possui entrada ativa" }, { status: 400 })
    }

    // Verificar se o veículo já existe
    const { data: veiculoExistente } = await supabase
      .from("veiculo")
      .select("*")
      .eq("nr_placa", placaFormatada)
      .maybeSingle()

    let idVeiculo: number | null = null

    // Se o veículo não existe, criar
    if (!veiculoExistente) {
      const { data: veiculoCriado, error: criacaoError } = await supabase
        .from("veiculo")
        .insert({
          nr_placa: placaFormatada,
          id_tipo_veiculo: Number(tipoVeiculoId),
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
      if (veiculoExistente.id_tipo_veiculo !== Number(tipoVeiculoId)) {
        await supabase
          .from("veiculo")
          .update({ id_tipo_veiculo: Number(tipoVeiculoId) })
          .eq("id", idVeiculo)
      }
    }

    // Gerar número de ticket no novo formato
    const numeroTicket = await gerarNumeroTicketDiario()

    // Obter data/hora do Brasil
    const dataEntrada = obterDataHoraBrasil()

    console.log("Ticket gerado:", numeroTicket, "Data de entrada:", dataEntrada)

    // Criar ticket de entrada
    const { data: ticketCriado, error: ticketError } = await supabase
      .from("ticket")
      .insert({
        nr_ticket: numeroTicket,
        id_veiculo: idVeiculo,
        nr_placa: placaFormatada,
        id_tipo_veiculo: Number(tipoVeiculoId),
        dt_entrada: dataEntrada,
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
          placa: placaFormatada,
          tipo_veiculo: Number(tipoVeiculoId),
          ticket: numeroTicket,
          data_entrada: dataEntrada,
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
