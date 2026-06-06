import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

function obterDataHoraBrasil(): string {
  const agora = new Date()
  const horarioBrasil = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
  const ano = horarioBrasil.getFullYear()
  const mes = String(horarioBrasil.getMonth() + 1).padStart(2, "0")
  const dia = String(horarioBrasil.getDate()).padStart(2, "0")
  const hora = String(horarioBrasil.getHours()).padStart(2, "0")
  const minuto = String(horarioBrasil.getMinutes()).padStart(2, "0")
  const segundo = String(horarioBrasil.getSeconds()).padStart(2, "0")
  const milissegundo = String(horarioBrasil.getMilliseconds()).padStart(3, "0")
  return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}.${milissegundo}-03:00`
}

function obterPrefixoDia(): string {
  const agora = new Date()
  const horarioBrasil = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
  const ano = String(horarioBrasil.getFullYear()).slice(-2)
  const mes = String(horarioBrasil.getMonth() + 1).padStart(2, "0")
  const dia = String(horarioBrasil.getDate()).padStart(2, "0")
  return `${ano}${mes}${dia}`
}

async function gerarNumeroTicketDiario(): Promise<string> {
  try {
    const prefixoDia = obterPrefixoDia()
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
      const sequencialAtual = ultimoTicket.slice(-3)
      proximoSequencial = Number.parseInt(sequencialAtual, 10) + 1
    }

    if (proximoSequencial > 999) {
      throw new Error("Limite diário de tickets atingido (999)")
    }

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
    const { placa, tipoVeiculoId, marca, modelo, cor } = body

    if (!placa || !tipoVeiculoId) {
      return NextResponse.json({ error: "Placa e tipo de veículo são obrigatórios" }, { status: 400 })
    }

    const placaFormatada = placa
      .toString()
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]/g, "")

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

    // Se o veículo não existe, criar com informações adicionais
    if (!veiculoExistente) {
      const dadosVeiculo: any = {
        nr_placa: placaFormatada,
        id_tipo_veiculo: Number(tipoVeiculoId),
        fl_mensalista: false,
      }

      // Adicionar modelo (marca + modelo) se fornecido
      if (marca || modelo) {
        dadosVeiculo.nm_modelo = [marca, modelo].filter(Boolean).join(" ")
      }

      // Adicionar cor se fornecida
      if (cor) {
        dadosVeiculo.nm_cor = cor
      }

      const { data: veiculoCriado, error: criacaoError } = await supabase
        .from("veiculo")
        .insert(dadosVeiculo)
        .select()
        .single()

      if (criacaoError) {
        console.error("Erro ao criar veículo:", criacaoError)
        return NextResponse.json({ error: "Falha ao criar veículo" }, { status: 500 })
      }

      idVeiculo = veiculoCriado.id
    } else {
      idVeiculo = veiculoExistente.id

      const atualizacoes: any = {}

      if (veiculoExistente.id_tipo_veiculo !== Number(tipoVeiculoId)) {
        atualizacoes.id_tipo_veiculo = Number(tipoVeiculoId)
      }

      if ((marca || modelo) && !veiculoExistente.nm_modelo) {
        atualizacoes.nm_modelo = [marca, modelo].filter(Boolean).join(" ")
      }

      if (cor && !veiculoExistente.nm_cor) {
        atualizacoes.nm_cor = cor
      }

      if (Object.keys(atualizacoes).length > 0) {
        await supabase.from("veiculo").update(atualizacoes).eq("id", idVeiculo)
      }
    }

    const numeroTicket = await gerarNumeroTicketDiario()
    const dataEntrada = obterDataHoraBrasil()

    console.log("Ticket gerado:", numeroTicket, "Data de entrada:", dataEntrada)

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
          marca,
          modelo,
          cor,
          modo: marca || modelo ? "automatico" : "manual",
        },
      })
    } catch (error) {
      console.error("Erro ao registrar histórico:", error)
    }

    return NextResponse.json({ ticket: ticketCriado })
  } catch (error) {
    console.error("Erro na API de entrada:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
