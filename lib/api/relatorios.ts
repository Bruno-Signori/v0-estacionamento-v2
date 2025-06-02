import { supabase } from "../supabase"
import type { RelatorioFinanceiro, RelatorioOcupacao, TicketCompleto } from "@/types/supabase"

// Função auxiliar para formatar data
function formatarData(data: Date): string {
  return `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1).toString().padStart(2, "0")}`
}

// Função auxiliar para formatar hora
function formatarHora(hora: number): string {
  return `${hora.toString().padStart(2, "0")}:00`
}

// Gerar relatório financeiro
export async function gerarRelatorioFinanceiro(
  dataInicio: Date,
  dataFim: Date,
  tipoVeiculo?: string,
  formaPagamento?: string,
): Promise<RelatorioFinanceiro> {
  try {
    // Converter datas para ISO string
    const dataInicioISO = dataInicio.toISOString()
    const dataFimISO = dataFim.toISOString()

    // Construir query base
    let query = supabase
      .from("ticket")
      .select(`
        *,
        tipo_veiculo (*)
      `)
      .gte("dt_saida", dataInicioISO)
      .lte("dt_saida", dataFimISO)
      .not("vl_pago", "is", null)

    // Filtrar por tipo de veículo se especificado
    if (tipoVeiculo && tipoVeiculo !== "all") {
      query = query.eq("tipo_veiculo.nm_tipo", tipoVeiculo)
    }

    // Filtrar por forma de pagamento se especificada
    if (formaPagamento && formaPagamento !== "all") {
      query = query.eq("tp_pagamento", formaPagamento)
    }

    // Executar query
    const { data: tickets, error } = await query

    if (error) {
      console.error("Erro ao buscar dados para relatório financeiro:", error)
      throw new Error("Falha ao gerar relatório financeiro")
    }

    // Calcular totais
    const totalReceita = tickets?.reduce((total, ticket) => total + (ticket.vl_pago || 0), 0) || 0
    const totalTransacoes = tickets?.length || 0
    const ticketMedio = totalTransacoes > 0 ? totalReceita / totalTransacoes : 0

    // Agrupar receita por dia
    const receitaPorDia: { [key: string]: number } = {}
    const diasPeriodo: string[] = []

    // Gerar lista de dias no período
    const diaAtual = new Date(dataInicio)
    while (diaAtual <= dataFim) {
      const dataFormatada = formatarData(diaAtual)
      diasPeriodo.push(dataFormatada)
      receitaPorDia[dataFormatada] = 0

      // Avançar para o próximo dia
      diaAtual.setDate(diaAtual.getDate() + 1)
    }

    // Preencher receita por dia
    tickets?.forEach((ticket) => {
      const dataSaida = new Date(ticket.dt_saida!)
      const dataFormatada = formatarData(dataSaida)

      if (receitaPorDia[dataFormatada] !== undefined) {
        receitaPorDia[dataFormatada] += ticket.vl_pago || 0
      }
    })

    // Converter para o formato esperado
    const receitaPorDiaArray = diasPeriodo.map((data) => ({
      data,
      valor: receitaPorDia[data],
    }))

    // Agrupar por tipo de veículo
    const receitaPorTipo: { [key: string]: number } = {}
    tickets?.forEach((ticket) => {
      const tipoVeiculo = ticket.tipo_veiculo.nm_tipo
      if (!receitaPorTipo[tipoVeiculo]) {
        receitaPorTipo[tipoVeiculo] = 0
      }
      receitaPorTipo[tipoVeiculo] += ticket.vl_pago || 0
    })

    // Converter para o formato esperado e calcular percentuais
    const receitaPorTipoArray = Object.entries(receitaPorTipo).map(([tipo, valor]) => ({
      tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1), // Capitalizar primeira letra
      valor,
      percentual: totalReceita > 0 ? (valor / totalReceita) * 100 : 0,
    }))

    // Agrupar por forma de pagamento
    const receitaPorFormaPagamento: { [key: string]: number } = {}
    tickets?.forEach((ticket) => {
      const formaPagamento = ticket.tp_pagamento || "Não informado"
      if (!receitaPorFormaPagamento[formaPagamento]) {
        receitaPorFormaPagamento[formaPagamento] = 0
      }
      receitaPorFormaPagamento[formaPagamento] += ticket.vl_pago || 0
    })

    // Converter para o formato esperado e calcular percentuais
    const receitaPorFormaPagamentoArray = Object.entries(receitaPorFormaPagamento).map(([forma, valor]) => ({
      forma: forma.charAt(0).toUpperCase() + forma.slice(1), // Capitalizar primeira letra
      valor,
      percentual: totalReceita > 0 ? (valor / totalReceita) * 100 : 0,
    }))

    // Transações recentes (últimas 5)
    const transacoesRecentes =
      (tickets
        ?.sort((a, b) => new Date(b.dt_saida!).getTime() - new Date(a.dt_saida!).getTime())
        .slice(0, 5) as TicketCompleto[]) || []

    return {
      totalReceita,
      ticketMedio,
      totalTransacoes,
      receitaPorDia: receitaPorDiaArray,
      receitaPorTipoVeiculo: receitaPorTipoArray,
      receitaPorFormaPagamento: receitaPorFormaPagamentoArray,
      transacoesRecentes,
    }
  } catch (error) {
    console.error("Erro ao gerar relatório financeiro:", error)
    throw error
  }
}

// Gerar relatório de ocupação
export async function gerarRelatorioOcupacao(
  dataInicio: Date,
  dataFim: Date,
  tipoVeiculo?: string,
): Promise<RelatorioOcupacao> {
  try {
    // Converter datas para ISO string
    const dataInicioISO = dataInicio.toISOString()
    const dataFimISO = dataFim.toISOString()

    // Buscar tickets ativos (sem saída)
    let queryAtivos = supabase
      .from("ticket")
      .select(`
        *,
        tipo_veiculo (*)
      `)
      .is("dt_saida", null)

    // Filtrar por tipo de veículo se especificado
    if (tipoVeiculo && tipoVeiculo !== "all") {
      queryAtivos = queryAtivos.eq("tipo_veiculo.nm_tipo", tipoVeiculo)
    }

    const { data: ticketsAtivos, error: ativosError } = await queryAtivos

    if (ativosError) {
      console.error("Erro ao buscar tickets ativos:", ativosError)
      throw new Error("Falha ao gerar relatório de ocupação")
    }

    // Buscar tickets no período (com saída)
    let queryPeriodo = supabase
      .from("ticket")
      .select(`
        *,
        tipo_veiculo (*)
      `)
      .gte("dt_entrada", dataInicioISO)
      .lte("dt_saida", dataFimISO)
      .not("dt_saida", "is", null)

    // Filtrar por tipo de veículo se especificado
    if (tipoVeiculo && tipoVeiculo !== "all") {
      queryPeriodo = queryPeriodo.eq("tipo_veiculo.nm_tipo", tipoVeiculo)
    }

    const { data: ticketsPeriodo, error: periodoError } = await queryPeriodo

    if (periodoError) {
      console.error("Erro ao buscar tickets do período:", periodoError)
      throw new Error("Falha ao gerar relatório de ocupação")
    }

    // Total de vagas (simulado - em um sistema real, isso viria de uma tabela de configuração)
    const totalVagas = 120

    // Ocupação atual
    const ocupacaoAtual = {
      total: totalVagas,
      ocupadas: ticketsAtivos?.length || 0,
      disponiveis: totalVagas - (ticketsAtivos?.length || 0),
      percentual: Math.floor(((ticketsAtivos?.length || 0) / totalVagas) * 100),
    }

    // Ocupação por hora (simulada para o exemplo)
    const ocupacaoPorHora = []
    for (let hora = 8; hora <= 19; hora++) {
      // Simular ocupação com base na hora do dia
      let ocupacao = 0

      if (hora >= 8 && hora <= 10) {
        // Manhã: ocupação crescente
        ocupacao = Math.floor((hora - 7) * 15)
      } else if (hora >= 11 && hora <= 14) {
        // Meio-dia: pico de ocupação
        ocupacao = Math.floor(75 + Math.random() * 10)
      } else if (hora >= 15 && hora <= 17) {
        // Tarde: ocupação alta
        ocupacao = Math.floor(70 + Math.random() * 15)
      } else {
        // Noite: ocupação decrescente
        ocupacao = Math.floor((20 - hora) * 10)
      }

      ocupacaoPorHora.push({
        hora: formatarHora(hora),
        ocupacao: Math.max(0, Math.min(100, ocupacao)),
      })
    }

    // Tempo médio de permanência
    let tempoMedioPermanencia = 0
    if (ticketsPeriodo && ticketsPeriodo.length > 0) {
      const somaTempos = ticketsPeriodo.reduce((total, ticket) => total + (ticket.nr_tempo_permanencia || 0), 0)
      tempoMedioPermanencia = Math.floor(somaTempos / ticketsPeriodo.length)
    }

    // Tempo médio por tipo de veículo
    const temposPorTipo: { [key: string]: { soma: number; count: number } } = {}
    ticketsPeriodo?.forEach((ticket) => {
      const tipoVeiculo = ticket.tipo_veiculo.nm_tipo
      if (!temposPorTipo[tipoVeiculo]) {
        temposPorTipo[tipoVeiculo] = { soma: 0, count: 0 }
      }
      temposPorTipo[tipoVeiculo].soma += ticket.nr_tempo_permanencia || 0
      temposPorTipo[tipoVeiculo].count += 1
    })

    const tempoMedioPorTipo = Object.entries(temposPorTipo).map(([tipo, { soma, count }]) => ({
      tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1), // Capitalizar primeira letra
      duracao: count > 0 ? Math.floor(soma / count) : 0,
    }))

    // Horas de pico (simuladas para o exemplo)
    const horasPico = [
      { dia: "Segunda", hora: "12:00 - 14:00" },
      { dia: "Terça", hora: "12:00 - 14:00" },
      { dia: "Quarta", hora: "12:00 - 14:00" },
      { dia: "Quinta", hora: "12:00 - 14:00" },
      { dia: "Sexta", hora: "15:00 - 17:00" },
      { dia: "Sábado", hora: "10:00 - 12:00" },
      { dia: "Domingo", hora: "11:00 - 13:00" },
    ]

    // Ocupação por tipo de veículo
    const ocupacaoPorTipo: { [key: string]: number } = {}
    ticketsAtivos?.forEach((ticket) => {
      const tipoVeiculo = ticket.tipo_veiculo.nm_tipo
      if (!ocupacaoPorTipo[tipoVeiculo]) {
        ocupacaoPorTipo[tipoVeiculo] = 0
      }
      ocupacaoPorTipo[tipoVeiculo] += 1
    })

    const ocupacaoPorTipoArray = Object.entries(ocupacaoPorTipo).map(([tipo, quantidade]) => ({
      tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1), // Capitalizar primeira letra
      quantidade,
      percentual: ticketsAtivos && ticketsAtivos.length > 0 ? (quantidade / ticketsAtivos.length) * 100 : 0,
    }))

    return {
      ocupacaoAtual,
      ocupacaoPorHora,
      tempoMedioPermanencia: {
        geral: tempoMedioPermanencia,
        porTipoVeiculo: tempoMedioPorTipo,
      },
      horasPico,
      ocupacaoPorTipoVeiculo: ocupacaoPorTipoArray,
    }
  } catch (error) {
    console.error("Erro ao gerar relatório de ocupação:", error)
    throw error
  }
}
