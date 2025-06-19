"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, Clock, Search, RefreshCw, MapPin } from "lucide-react"
import { buscarTicketsAtivos } from "@/lib/api/ticket"
import type { TicketCompleto } from "@/types/supabase"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function PatioPage() {
  const [tickets, setTickets] = useState<TicketCompleto[]>([])
  const [filteredTickets, setFilteredTickets] = useState<TicketCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const carregarTicketsAtivos = async () => {
    try {
      setError(null)
      const ticketsAtivos = await buscarTicketsAtivos()
      setTickets(ticketsAtivos)
      setFilteredTickets(ticketsAtivos)
    } catch (err) {
      console.error("Erro ao carregar tickets ativos:", err)
      setError("Erro ao carregar veículos do pátio")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarTicketsAtivos()
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredTickets(tickets)
      return
    }

    const filtered = tickets.filter(
      (ticket) =>
        ticket.nr_placa.toLowerCase().includes(term.toLowerCase()) ||
        ticket.nr_ticket.includes(term) ||
        ticket.tipo_veiculo?.nm_tipo.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredTickets(filtered)
  }

  const formatTempoPermanencia = (dtEntrada: string) => {
    try {
      return formatDistanceToNow(new Date(dtEntrada), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return "Tempo indisponível"
    }
  }

  const getTipoVeiculoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "carro":
        return "bg-blue-100 text-blue-800"
      case "moto":
        return "bg-green-100 text-green-800"
      case "caminhão":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    carregarTicketsAtivos()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-500 p-2 rounded-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pátio</h1>
            <p className="text-gray-600">Veículos atualmente estacionados</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Car className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{filteredTickets.length}</p>
                  <p className="text-sm text-gray-600">Veículos no pátio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      filteredTickets.filter((t) => {
                        const entrada = new Date(t.dt_entrada)
                        const agora = new Date()
                        const horas = (agora.getTime() - entrada.getTime()) / (1000 * 60 * 60)
                        return horas < 2
                      }).length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Recentes (&lt; 2h)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      filteredTickets.filter((t) => {
                        const entrada = new Date(t.dt_entrada)
                        const agora = new Date()
                        const horas = (agora.getTime() - entrada.getTime()) / (1000 * 60 * 60)
                        return horas >= 4
                      }).length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Longa permanência (&gt; 4h)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por placa, ticket ou tipo de veículo..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && filteredTickets.length === 0 && !error && (
        <Card>
          <CardContent className="p-12 text-center">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "Nenhum veículo encontrado" : "Pátio vazio"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Tente ajustar os termos de busca" : "Não há veículos estacionados no momento"}
            </p>
            {searchTerm && (
              <Button onClick={() => handleSearch("")} variant="outline">
                Limpar busca
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vehicles List */}
      {filteredTickets.length > 0 && (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Car className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{ticket.nr_placa}</h3>
                        <Badge className={getTipoVeiculoColor(ticket.tipo_veiculo?.nm_tipo || "")}>
                          {ticket.tipo_veiculo?.nm_tipo}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Ticket: {ticket.nr_ticket}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTempoPermanencia(ticket.dt_entrada)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Entrada</p>
                      <p className="font-medium">{new Date(ticket.dt_entrada).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full ml-4" title="Ativo" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
