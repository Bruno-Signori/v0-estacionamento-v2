"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
import { QuickNav } from "@/components/quick-nav"
import { Search, Car, Clock, DollarSign, RefreshCw, AlertCircle } from "lucide-react"
import { formatarDataBrasileira, formatarTempoMinutos, calcularDiferencaMinutos } from "@/lib/utils/date-utils"

interface TicketAtivo {
  id: number
  nr_ticket: string
  nr_placa: string
  dt_entrada: string
  dt_saida: string | null
  vl_pago: number | null
  id_tipo_veiculo: number | null
  tipo_veiculo: {
    nm_tipo: string
  } | null
}

interface DashboardData {
  ticketsAtivos: TicketAtivo[]
  totalTicketsAtivos: number
  totalReceitaHoje: number
  totalTickets: number
  totalVeiculos: number
  success: boolean
  timestamp?: string
  error?: string
}

export default function PatioPage() {
  const [data, setData] = useState<DashboardData>({
    ticketsAtivos: [],
    totalTicketsAtivos: 0,
    totalReceitaHoje: 0,
    totalTickets: 0,
    totalVeiculos: 0,
    success: false,
  })
  const [filteredTickets, setFilteredTickets] = useState<TicketAtivo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Carregando dados do pátio...")

      const response = await fetch("/api/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erro na resposta:", errorText)
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("Dados recebidos:", result)

      if (result.success) {
        setData(result)
        setFilteredTickets(result.ticketsAtivos || [])
        console.log("Dados carregados com sucesso:", result.ticketsAtivos?.length, "tickets ativos")
      } else {
        throw new Error(result.error || "Erro ao carregar dados")
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados do pátio:", error)
      setError(error.message || "Erro ao carregar dados")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadData, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTickets(data.ticketsAtivos)
      return
    }

    const filtered = data.ticketsAtivos.filter(
      (ticket) =>
        ticket.nr_placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.nr_ticket.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.tipo_veiculo?.nm_tipo.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setFilteredTickets(filtered)
  }, [searchTerm, data.ticketsAtivos])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getTempoPermancencia = (dtEntrada: string) => {
    try {
      const minutos = calcularDiferencaMinutos(dtEntrada)
      return formatarTempoMinutos(minutos)
    } catch {
      return "N/A"
    }
  }

  const getStatusBadge = (ticket: TicketAtivo) => {
    if (ticket.dt_saida) {
      return <Badge variant="secondary">Finalizado</Badge>
    }
    return <Badge variant="default">Ativo</Badge>
  }

  if (error && data.ticketsAtivos.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AppHeader title="Pátio" />
        <div className="flex-1 p-4 md:p-8 pb-16 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <div className="text-red-500 text-lg mb-4">Erro ao carregar dados do pátio</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
        <QuickNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader title="Pátio" />

      <div className="flex-1 p-4 md:p-8 pb-16 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pátio</h2>
                <p className="text-gray-600">Veículos atualmente no estacionamento</p>
                {data.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    Última atualização: {formatarDataBrasileira(data.timestamp)}
                  </p>
                )}
              </div>
              <Button onClick={loadData} disabled={isLoading} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </header>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Veículos Ativos</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalTicketsAtivos}</div>
                <p className="text-xs text-muted-foreground">No estacionamento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Arrecadação Hoje</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.totalReceitaHoje)}</div>
                <p className="text-xs text-muted-foreground">Receita do dia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalTickets}</div>
                <p className="text-xs text-muted-foreground">Histórico completo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Veículos Cadastrados</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalVeiculos}</div>
                <p className="text-xs text-muted-foreground">No sistema</p>
              </CardContent>
            </Card>
          </div>

          {/* Busca */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por placa, ticket ou tipo de veículo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Veículos */}
          <Card>
            <CardHeader>
              <CardTitle>Veículos no Pátio ({filteredTickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && data.ticketsAtivos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando veículos...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? "Nenhum veículo encontrado" : "Nenhum veículo no pátio"}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">
                      Os veículos aparecerão aqui quando houver entradas registradas
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-lg font-semibold">{ticket.nr_placa}</span>
                          {getStatusBadge(ticket)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Ticket: {ticket.nr_ticket}</p>
                          <p>Tipo: {ticket.tipo_veiculo?.nm_tipo || "N/A"}</p>
                          <p>Entrada: {formatarDataBrasileira(ticket.dt_entrada)}</p>
                          <p>Permanência: {getTempoPermancencia(ticket.dt_entrada)}</p>
                          {ticket.vl_pago && <p>Valor Pago: {formatCurrency(ticket.vl_pago)}</p>}
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-4">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {error && data.ticketsAtivos.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                <p className="text-yellow-800 text-sm">
                  <strong>Aviso:</strong> {error}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <QuickNav />
    </div>
  )
}
