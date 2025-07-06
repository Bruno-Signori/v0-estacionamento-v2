"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardCards } from "@/components/dashboard-cards"
import { DashboardHeader } from "@/components/dashboard-header"
import { AppHeader } from "@/components/app-header"
import { QuickNav } from "@/components/quick-nav"
import { supabase } from "@/lib/supabase"
import {
  formatarDataBrasileira,
  formatarHora,
  formatarTempoMinutos,
  obterInicioDiaBrasil,
  obterFimDiaBrasil,
} from "@/lib/utils/date-utils"
import type { TicketCompleto } from "@/types/supabase"

interface DashboardData {
  totalEntradas: number
  totalSaidas: number
  veiculosAtivos: number
  faturamentoDiario: number
  ocupacaoAtual: {
    total: number
    ocupadas: number
    disponiveis: number
    percentual: number
  }
  tempoMedio: {
    permanencia: number
    ticketMedio: number
  }
  atividadesRecentes: TicketCompleto[]
  ticketsAtivos: TicketCompleto[]
  ticketsMes: number
  arrecadacaoHoje: number
}

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Obter início e fim do dia no horário de Brasília
      const inicioDia = obterInicioDiaBrasil()
      const fimDia = obterFimDiaBrasil()

      // Início do mês
      const inicioMes = new Date(inicioDia.getFullYear(), inicioDia.getMonth(), 1)

      // Total de entradas do dia
      const { count: totalEntradas } = await supabase
        .from("ticket")
        .select("id", { count: "exact", head: true })
        .gte("dt_entrada", inicioDia.toISOString())
        .lte("dt_entrada", fimDia.toISOString())

      // Total de saídas do dia
      const { count: totalSaidas } = await supabase
        .from("ticket")
        .select("id", { count: "exact", head: true })
        .gte("dt_saida", inicioDia.toISOString())
        .lte("dt_saida", fimDia.toISOString())

      // Veículos ativos (sem saída registrada)
      const { count: veiculosAtivos } = await supabase
        .from("ticket")
        .select("id", { count: "exact", head: true })
        .is("dt_saida", null)

      // Tickets ativos com detalhes
      const { data: ticketsAtivos } = await supabase
        .from("ticket")
        .select(`
          *,
          tipo_veiculo (*)
        `)
        .is("dt_saida", null)
        .order("dt_entrada", { ascending: false })

      // Total de tickets do mês
      const { count: ticketsMes } = await supabase
        .from("ticket")
        .select("id", { count: "exact", head: true })
        .gte("dt_entrada", inicioMes.toISOString())

      // Faturamento do dia
      const { data: faturamentoData } = await supabase
        .from("ticket")
        .select("vl_pago")
        .gte("dt_saida", inicioDia.toISOString())
        .lte("dt_saida", fimDia.toISOString())
        .not("vl_pago", "is", null)

      const faturamentoDiario = faturamentoData?.reduce((total, ticket) => total + (ticket.vl_pago || 0), 0) || 0

      // Tempo médio de permanência
      const { data: tempoData } = await supabase
        .from("ticket")
        .select("nr_tempo_permanencia")
        .gte("dt_saida", inicioDia.toISOString())
        .lte("dt_saida", fimDia.toISOString())
        .not("nr_tempo_permanencia", "is", null)

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

      // Buscar total de vagas da configuração
      const { data: configVagas } = await supabase
        .from("configuracao")
        .select("vl_valor")
        .eq("nm_chave", "total_vagas")
        .single()

      const totalVagas = configVagas ? Number.parseInt(configVagas.vl_valor || "100") : 100

      // Ocupação atual
      const ocupacaoAtual = {
        total: totalVagas,
        ocupadas: veiculosAtivos || 0,
        disponiveis: totalVagas - (veiculosAtivos || 0),
        percentual: Math.floor(((veiculosAtivos || 0) / totalVagas) * 100),
      }

      // Atividades recentes
      const { data: atividadesRecentes } = await supabase
        .from("ticket")
        .select(`
          *,
          tipo_veiculo (*)
        `)
        .not("dt_saida", "is", null)
        .order("dt_saida", { ascending: false })
        .limit(5)

      setDashboardData({
        totalEntradas: totalEntradas || 0,
        totalSaidas: totalSaidas || 0,
        veiculosAtivos: veiculosAtivos || 0,
        faturamentoDiario,
        ocupacaoAtual,
        tempoMedio: {
          permanencia: tempoPermanenciaMedia,
          ticketMedio,
        },
        atividadesRecentes: atividadesRecentes || [],
        ticketsAtivos: ticketsAtivos || [],
        ticketsMes: ticketsMes || 0,
        arrecadacaoHoje: faturamentoDiario,
      })
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    return formatarDataBrasileira(dateString)
  }

  const formatTime = (dateString: string) => {
    return formatarHora(dateString)
  }

  const getStatusBadge = (ticket: any) => {
    if (ticket.dt_saida) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Finalizado</span>
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Em andamento</span>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Dashboard" showBackButton={false} />
          <DashboardHeader setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-16 md:pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="h-12 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Preparar dados para o DashboardCards
  const dashboardCardsData = dashboardData
    ? {
        veiculosAtivos: dashboardData.veiculosAtivos,
        totalArrecadado: dashboardData.faturamentoDiario,
        ticketsMes: dashboardData.ticketsMes,
        ocupacaoAtual: dashboardData.ocupacaoAtual.percentual,
        ticketsAtivos: dashboardData.ticketsAtivos,
        arrecadacaoHoje: dashboardData.arrecadacaoHoje,
      }
    : undefined

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Dashboard" showBackButton={false} />
        <DashboardHeader setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-16 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao ParkGestor</h1>
              <p className="mt-2 text-gray-600">
                Gerencie seus estacionamentos de forma eficiente e prática 
              </p>
            </div>

            {/* Dashboard Cards */}
            <DashboardCards data={dashboardCardsData} />

            {/* Resumo do Dia */}
            {dashboardData && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resumo do Dia</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de entradas:</span>
                      <span className="font-medium">{dashboardData.totalEntradas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de saídas:</span>
                      <span className="font-medium">{dashboardData.totalSaidas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Veículos ativos:</span>
                      <span className="font-medium">{dashboardData.veiculosAtivos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Faturamento:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(dashboardData.faturamentoDiario)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ocupação Atual</h3>
                  <div className="mt-4 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-yellow-500 h-4 rounded-full"
                        style={{ width: `${dashboardData.ocupacaoAtual.percentual}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 text-lg font-medium">{dashboardData.ocupacaoAtual.percentual}%</span>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>
                      {dashboardData.ocupacaoAtual.ocupadas} de {dashboardData.ocupacaoAtual.total} vagas ocupadas
                    </p>
                    <p className="mt-1">Atualizado agora - Horário de Brasília</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tempo Médio</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Permanência:</span>
                      <span className="font-medium">{formatarTempoMinutos(dashboardData.tempoMedio.permanencia)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket médio:</span>
                      <span className="font-medium">{formatCurrency(dashboardData.tempoMedio.ticketMedio)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividades Recentes</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ticket</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Placa</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Entrada</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Saída</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tempo</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Valor</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dashboardData?.atividadesRecentes.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{ticket.nr_ticket}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-mono">{ticket.nr_placa}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatTime(ticket.dt_entrada)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {ticket.dt_saida ? formatTime(ticket.dt_saida) : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {ticket.nr_tempo_permanencia ? formatarTempoMinutos(ticket.nr_tempo_permanencia) : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {ticket.vl_pago ? formatCurrency(ticket.vl_pago) : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm">{getStatusBadge(ticket)}</td>
                        </tr>
                      ))}
                      {(!dashboardData?.atividadesRecentes || dashboardData.atividadesRecentes.length === 0) && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            Nenhuma atividade recente encontrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>

        <QuickNav />
      </div>
    </div>
  )
}
