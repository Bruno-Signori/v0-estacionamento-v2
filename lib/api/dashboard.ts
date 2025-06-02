import { supabase } from "../supabase"
import type { DashboardData } from "@/types/supabase"
import { buscarTicketsRecentes } from "./ticket"

export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Obter data de hoje (início e fim do dia)
    const hoje = new Date()
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0).toISOString()
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59).toISOString()

    // Total de entradas do dia
    const { count: totalEntradas, error: entradasError } = await supabase
      .from("ticket")
      .select("id", { count: "exact", head: true })
      .gte("dt_entrada", inicioHoje)
      .lte("dt_entrada", fimHoje)

    if (entradasError) {
      console.error("Erro ao buscar total de entradas:", entradasError)
    }

    // Total de saídas do dia
    const { count: totalSaidas, error: saidasError } = await supabase
      .from("ticket")
      .select("id", { count: "exact", head: true })
      .gte("dt_saida", inicioHoje)
      .lte("dt_saida", fimHoje)

    if (saidasError) {
      console.error("Erro ao buscar total de saídas:", saidasError)
    }

    // Veículos ativos (sem saída registrada)
    const { count: veiculosAtivos, error: ativosError } = await supabase
      .from("ticket")
      .select("id", { count: "exact", head: true })
      .is("dt_saida", null)

    if (ativosError) {
      console.error("Erro ao buscar veículos ativos:", ativosError)
    }

    // Faturamento do dia
    const { data: faturamentoData, error: faturamentoError } = await supabase
      .from("ticket")
      .select("vl_pago")
      .gte("dt_saida", inicioHoje)
      .lte("dt_saida", fimHoje)
      .not("vl_pago", "is", null)

    if (faturamentoError) {
      console.error("Erro ao buscar faturamento:", faturamentoError)
    }

    const faturamentoDiario = faturamentoData?.reduce((total, ticket) => total + (ticket.vl_pago || 0), 0) || 0

    // Tempo médio de permanência
    const { data: tempoData, error: tempoError } = await supabase
      .from("ticket")
      .select("nr_tempo_permanencia")
      .gte("dt_saida", inicioHoje)
      .lte("dt_saida", fimHoje)
      .not("nr_tempo_permanencia", "is", null)

    if (tempoError) {
      console.error("Erro ao buscar tempo médio:", tempoError)
    }

    let tempoPermanenciaMedia = 0
    if (tempoData && tempoData.length > 0) {
      const somaTempos = tempoData.reduce((total, ticket) => total + (ticket.nr_tempo_permanencia || 0), 0)
      tempoPermanenciaMedia = Math.floor(somaTempos / tempoData.length)
    }

    // Ticket médio
    let ticketMedio = 0
    if (faturamentoData && faturamentoData.length > 0) {
      ticketMedio = faturamentoDiario / faturamentoData.length
    }

    // Ocupação atual (simulada - em um sistema real, isso viria de uma tabela de configuração)
    const totalVagas = 120 // Valor fixo para exemplo
    const ocupacaoAtual = {
      total: totalVagas,
      ocupadas: veiculosAtivos || 0,
      disponiveis: totalVagas - (veiculosAtivos || 0),
      percentual: Math.floor(((veiculosAtivos || 0) / totalVagas) * 100),
    }

    // Atividades recentes
    const atividadesRecentes = await buscarTicketsRecentes(5)

    return {
      totalEntradas: totalEntradas || 0,
      totalSaidas: totalSaidas || 0,
      veiculosAtivos: veiculosAtivos || 0,
      faturamentoDiario,
      ocupacaoAtual,
      tempoMedio: {
        permanencia: tempoPermanenciaMedia,
        ticketMedio,
      },
      atividadesRecentes,
    }
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error)

    // Retornar dados vazios em caso de erro
    return {
      totalEntradas: 0,
      totalSaidas: 0,
      veiculosAtivos: 0,
      faturamentoDiario: 0,
      ocupacaoAtual: {
        total: 120,
        ocupadas: 0,
        disponiveis: 120,
        percentual: 0,
      },
      tempoMedio: {
        permanencia: 0,
        ticketMedio: 0,
      },
      atividadesRecentes: [],
    }
  }
}
