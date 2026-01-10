import { supabase } from "../supabase"
import type { TicketCompleto } from "@/types/supabase"
import { getTipoVeiculoById } from "./tipo-veiculo"
import { getTabelaPrecoById } from "./tabela-preco"
import { registrarHistorico } from "./historico"

// Função para gerar número de ticket único
export async function gerarNumeroTicket(): Promise<string> {
  try {
    // Buscar o último ticket para gerar um número sequencial
    const { data, error } = await supabase.from("ticket").select("nr_ticket").order("id", { ascending: false }).limit(1)

    if (error) {
      console.error("Erro ao buscar último ticket:", error)
    }

    let proximoNumero = 1

    if (data && data.length > 0) {
      const ultimoTicket = data[0].nr_ticket
      // Tentar extrair o número do ticket
      const match = ultimoTicket.match(/\d+/)
      if (match) {
        proximoNumero = Number.parseInt(match[0], 10) + 1
      }
    }

    // Formatar com zeros à esquerda
    return proximoNumero.toString().padStart(6, "0")
  } catch (error) {
    console.error("Erro ao gerar número de ticket:", error)
    return Date.now().toString() // Fallback usando timestamp
  }
}

// Registrar entrada de veículo
export async function registrarEntrada(placa: string, idTipoVeiculo: number): Promise<TicketCompleto | null> {
  try {
    console.log("Iniciando registro de entrada:", { placa, idTipoVeiculo })

    // Verificar se já existe um ticket ativo para esta placa
    const { data: ticketAtivo, error: ticketAtivoError } = await supabase
      .from("ticket")
      .select("*")
      .eq("nr_placa", placa)
      .is("dt_saida", null)
      .maybeSingle()

    if (ticketAtivoError) {
      console.error("Erro ao verificar ticket ativo:", ticketAtivoError)
    }

    if (ticketAtivo) {
      throw new Error("Veículo já possui entrada ativa")
    }

    // Verificar se o veículo já existe
    const { data: veiculoExistente, error: veiculoError } = await supabase
      .from("veiculo")
      .select("*")
      .eq("nr_placa", placa)
      .maybeSingle()

    if (veiculoError) {
      console.error("Erro ao buscar veículo:", veiculoError)
    }

    let idVeiculo: number | null = null

    // Se o veículo não existe, criar
    if (!veiculoExistente) {
      console.log("Criando novo veículo...")

      const novoVeiculo = {
        nr_placa: placa,
        id_tipo_veiculo: idTipoVeiculo,
        nm_modelo: null,
        nm_cor: null,
        ds_observacoes: null,
        fl_mensalista: false,
      }

      const { data: veiculoCriado, error: criacaoError } = await supabase
        .from("veiculo")
        .insert(novoVeiculo)
        .select()
        .single()

      if (criacaoError) {
        console.error("Erro ao criar veículo:", criacaoError)
        throw new Error(`Falha ao criar veículo: ${criacaoError.message}`)
      }

      idVeiculo = veiculoCriado.id
      console.log("Veículo criado com ID:", idVeiculo)
    } else {
      idVeiculo = veiculoExistente.id
      console.log("Veículo existente encontrado com ID:", idVeiculo)

      // Atualizar tipo de veículo se for diferente
      if (veiculoExistente.id_tipo_veiculo !== idTipoVeiculo) {
        await supabase.from("veiculo").update({ id_tipo_veiculo: idTipoVeiculo }).eq("id", idVeiculo)
      }
    }

    // Gerar número de ticket
    const numeroTicket = await gerarNumeroTicket()
    console.log("Número de ticket gerado:", numeroTicket)

    // Criar ticket de entrada
    const novoTicket = {
      nr_ticket: numeroTicket,
      id_veiculo: idVeiculo,
      nr_placa: placa,
      id_tipo_veiculo: idTipoVeiculo,
      dt_entrada: new Date().toISOString(),
      dt_saida: null,
      nr_tempo_permanencia: null,
      id_tabela_preco: null,
      vl_pago: null,
      tp_pagamento: null,
      fl_pago: false,
      ds_observacoes: null,
    }

    console.log("Criando ticket:", novoTicket)

    const { data: ticketCriado, error: ticketError } = await supabase
      .from("ticket")
      .insert(novoTicket)
      .select()
      .single()

    if (ticketError) {
      console.error("Erro ao criar ticket:", ticketError)
      throw new Error(`Falha ao criar ticket: ${ticketError.message}`)
    }

    console.log("Ticket criado:", ticketCriado)

    // Registrar no histórico
    try {
      await registrarHistorico("entrada", ticketCriado.id, null, {
        placa,
        tipo_veiculo: idTipoVeiculo,
        ticket: numeroTicket,
      })
    } catch (historicoError) {
      console.error("Erro ao registrar histórico:", historicoError)
      // Não falhar por causa do histórico
    }

    // Buscar informações completas
    const tipoVeiculo = await getTipoVeiculoById(idTipoVeiculo)

    if (!tipoVeiculo) {
      throw new Error("Tipo de veículo não encontrado")
    }

    return {
      ...ticketCriado,
      tipo_veiculo: tipoVeiculo,
    }
  } catch (error) {
    console.error("Erro ao registrar entrada:", error)
    throw error
  }
}

// Buscar ticket por número ou placa
export async function buscarTicket(termo: string): Promise<TicketCompleto | null> {
  try {
    // Verificar se o termo é um número de ticket ou uma placa
    const isNumeroTicket = /^\d+$/.test(termo)

    let query = supabase.from("ticket").select(`
        *,
        tipo_veiculo (*)
      `)

    if (isNumeroTicket) {
      query = query.eq("nr_ticket", termo)
    } else {
      query = query.eq("nr_placa", termo.toUpperCase()).is("dt_saida", null) // Apenas tickets sem saída registrada
    }

    const { data, error } = await query.order("dt_entrada", { ascending: false }).limit(1).maybeSingle()

    if (error) {
      console.error("Erro ao buscar ticket:", error)
      return null
    }

    if (!data) {
      return null
    }

    // Buscar veículo se existir
    let veiculo = null
    if (data.id_veiculo) {
      const { data: veiculoData, error: veiculoError } = await supabase
        .from("veiculo")
        .select("*")
        .eq("id", data.id_veiculo)
        .single()

      if (!veiculoError) {
        veiculo = veiculoData
      }
    }

    // Buscar tabela de preço se existir
    let tabelaPreco = null
    if (data.id_tabela_preco) {
      tabelaPreco = await getTabelaPrecoById(data.id_tabela_preco)
    }

    return {
      ...data,
      veiculo,
      tabela_preco: tabelaPreco,
    }
  } catch (error) {
    console.error("Erro ao buscar ticket:", error)
    return null
  }
}

// Alias para buscarTicket
export const getTicketByPlacaOrNumero = buscarTicket

// Registrar saída de veículo
export async function registrarSaida(
  idTicket: number,
  idTabelaPreco: number,
  valorPago: number,
  tipoPagamento: string,
): Promise<TicketCompleto | null> {
  try {
    // Buscar ticket atual
    const { data: ticketAtual, error: ticketError } = await supabase
      .from("ticket")
      .select("*")
      .eq("id", idTicket)
      .single()

    if (ticketError || !ticketAtual) {
      console.error("Erro ao buscar ticket:", ticketError)
      throw new Error("Ticket não encontrado")
    }

    // Calcular tempo de permanência
    const dtEntrada = new Date(ticketAtual.dt_entrada)
    const dtSaida = new Date()
    const tempoPermanencia = Math.floor((dtSaida.getTime() - dtEntrada.getTime()) / (1000 * 60)) // em minutos

    // Atualizar ticket com informações de saída
    const { data: ticketAtualizado, error: atualizacaoError } = await supabase
      .from("ticket")
      .update({
        dt_saida: dtSaida.toISOString(),
        nr_tempo_permanencia: tempoPermanencia,
        id_tabela_preco: idTabelaPreco,
        vl_pago: valorPago,
        tp_pagamento: tipoPagamento,
        fl_pago: true,
      })
      .eq("id", idTicket)
      .select()
      .single()

    if (atualizacaoError) {
      console.error("Erro ao atualizar ticket:", atualizacaoError)
      throw new Error("Falha ao registrar saída")
    }

    // Registrar no histórico
    try {
      await registrarHistorico("saida", idTicket, null, {
        placa: ticketAtualizado.nr_placa,
        tempo_permanencia: tempoPermanencia,
        valor_pago: valorPago,
        tipo_pagamento: tipoPagamento,
      })
    } catch (historicoError) {
      console.error("Erro ao registrar histórico:", historicoError)
      // Não falhar por causa do histórico
    }

    // Buscar informações completas
    const tipoVeiculo = await getTipoVeiculoById(ticketAtualizado.id_tipo_veiculo)
    const tabelaPreco = await getTabelaPrecoById(idTabelaPreco)

    return {
      ...ticketAtualizado,
      tipo_veiculo: tipoVeiculo!,
      tabela_preco: tabelaPreco,
    }
  } catch (error) {
    console.error("Erro ao registrar saída:", error)
    throw error
  }
}

// Buscar tickets ativos (sem saída registrada)
export async function buscarTicketsAtivos(): Promise<TicketCompleto[]> {
  try {
    const { data, error } = await supabase
      .from("ticket")
      .select(`
        *,
        tipo_veiculo (*)
      `)
      .is("dt_saida", null)
      .order("dt_entrada", { ascending: false })

    if (error) {
      console.error("Erro ao buscar tickets ativos:", error)
      throw new Error("Falha ao buscar tickets ativos")
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar tickets ativos:", error)
    throw error
  }
}

// Alias para buscarTicketsAtivos
export const getTicketsAtivos = buscarTicketsAtivos

// Buscar tickets recentes (com saída registrada)
export async function buscarTicketsRecentes(limite = 10): Promise<TicketCompleto[]> {
  try {
    const { data, error } = await supabase
      .from("ticket")
      .select(`
        *,
        tipo_veiculo (*)
      `)
      .not("dt_saida", "is", null)
      .order("dt_saida", { ascending: false })
      .limit(limite)

    if (error) {
      console.error("Erro ao buscar tickets recentes:", error)
      throw new Error("Falha ao buscar tickets recentes")
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar tickets recentes:", error)
    throw error
  }
}

// Calcular valor a pagar com base no tempo de permanência e tabela de preço
export function calcularValorPagar(
  tempoPermanencia: number, // em minutos
  tabelaPreco: any, // TabelaPrecoCompleta
): number {
  try {
    // Verificar tolerância
    if (tempoPermanencia <= tabelaPreco.nr_tolerancia_minutos) {
      return 0
    }

    let valorTotal = 0
    let tempoRestante = tempoPermanencia
    const periodos = [...tabelaPreco.periodos].sort((a, b) => a.nr_ordem - b.nr_ordem)

    // Aplicar primeiro período
    if (periodos.length > 0) {
      const primeiroPeriodo = periodos[0]
      valorTotal += primeiroPeriodo.vl_preco
      tempoRestante -= primeiroPeriodo.nr_minutos
    }

    // Aplicar períodos adicionais
    if (periodos.length > 1 && tempoRestante > 0) {
      const periodosAdicionais = periodos.slice(1)

      for (const periodo of periodosAdicionais) {
        // Calcular quantas vezes o período adicional se aplica
        const vezesAplicado = Math.ceil(tempoRestante / periodo.nr_minutos)

        if (vezesAplicado > 0) {
          valorTotal += vezesAplicado * periodo.vl_preco
          tempoRestante -= vezesAplicado * periodo.nr_minutos
        }
      }
    }

    // Aplicar valor máximo se configurado
    if (tabelaPreco.vl_maximo > 0 && valorTotal > tabelaPreco.vl_maximo) {
      valorTotal = tabelaPreco.vl_maximo
    }

    return valorTotal
  } catch (error) {
    console.error("Erro ao calcular valor a pagar:", error)
    return 0
  }
}
