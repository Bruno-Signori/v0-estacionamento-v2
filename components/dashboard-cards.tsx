"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Car, TrendingUp, Clock, DollarSign, Users, MapPin, ArrowRight, AlertTriangle } from "lucide-react"

interface TicketAtivo {
  id: number
  nr_ticket: string
  nr_placa: string
  dt_entrada: string
  tipo_veiculo?: {
    nm_tipo: string
  }
}

interface DashboardData {
  ticketsAtivos?: TicketAtivo[]
  resumo?: {
    veiculosNoPateo: number
    arrecadacaoHoje: number
    ticketsPagosHoje: number
    totalVeiculosCadastrados: number
  }
}

interface DashboardCardsProps {
  data?: DashboardData
}

export function DashboardCards({ data }: DashboardCardsProps) {
  // Valores padrão caso data seja undefined
  const resumo = data?.resumo || {
    veiculosNoPateo: 0,
    arrecadacaoHoje: 0,
    ticketsPagosHoje: 0,
    totalVeiculosCadastrados: 0,
  }

  const ticketsAtivos = data?.ticketsAtivos || []

  const longaPermanencia = ticketsAtivos.filter((ticket) => {
    const diffHours = (new Date().getTime() - new Date(ticket.dt_entrada).getTime()) / (1000 * 60 * 60)
    return diffHours > 6
  }).length

  const entradasRecentes = ticketsAtivos.filter((ticket) => {
    const diffHours = (new Date().getTime() - new Date(ticket.dt_entrada).getTime()) / (1000 * 60 * 60)
    return diffHours <= 2
  }).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  const getTempoEstacionado = (dtEntrada: string) => {
    const entrada = new Date(dtEntrada)
    const agora = new Date()
    const diffMs = agora.getTime() - entrada.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`
    }
    return `${diffMinutes}min`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Veículos Ativos</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resumo.veiculosNoPateo}</div>
          <p className="text-xs text-muted-foreground">no estacionamento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Arrecadação Hoje</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(resumo.arrecadacaoHoje)}</div>
          <p className="text-xs text-muted-foreground">{resumo.ticketsPagosHoje} tickets pagos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resumo.totalVeiculosCadastrados}</div>
          <p className="text-xs text-muted-foreground">cadastrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atividade</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{entradasRecentes}</div>
          <p className="text-xs text-muted-foreground">entradas recentes</p>
        </CardContent>
      </Card>

      {/* Card do Pátio - Span 2 colunas */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-medium">Pátio</CardTitle>
          </div>
          <Link href="/patio">
            <Button variant="outline" size="sm">
              Ver Todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{resumo.veiculosNoPateo}</div>
              <p className="text-xs text-muted-foreground">Total no Pátio</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{entradasRecentes}</div>
              <p className="text-xs text-muted-foreground">Entradas Recentes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{longaPermanencia}</div>
              <p className="text-xs text-muted-foreground">Longa Permanência</p>
            </div>
          </div>

          {longaPermanencia > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                {longaPermanencia} veículo{longaPermanencia > 1 ? "s" : ""} com mais de 6 horas
              </span>
            </div>
          )}

          {/* Lista dos últimos veículos */}
          {ticketsAtivos.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Últimos veículos:</h4>
              {ticketsAtivos.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{ticket.nr_placa}</span>
                    <Badge variant="outline" className="text-xs">
                      {ticket.tipo_veiculo?.nm_tipo || "N/A"}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">{getTempoEstacionado(ticket.dt_entrada)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Ações Rápidas */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/registro-entrada">
              <Button className="w-full" variant="default">
                <Car className="h-4 w-4 mr-2" />
                Nova Entrada
              </Button>
            </Link>
            <Link href="/registro-saida">
              <Button className="w-full bg-transparent" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Registrar Saída
              </Button>
            </Link>
            <Link href="/patio">
              <Button className="w-full bg-transparent" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Ver Pátio
              </Button>
            </Link>
            <Link href="/relatorios">
              <Button className="w-full bg-transparent" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
