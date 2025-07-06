"use client"

import { useState, useEffect } from "react"
import { VehicleForm } from "@/components/vehicle-form"
import { TicketDisplay } from "@/components/ticket-display"
import { Card, CardContent } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import { QuickNav } from "@/components/quick-nav"
import { getClientSupabase } from "@/lib/supabase"
import { formatarDataBrasileira } from "@/lib/utils/date-utils"

export interface TicketData {
  ticketNumber: string
  plate: string
  vehicleType: string
  entryTime: Date
}

export interface TipoVeiculo {
  id: number
  nm_tipo: string
  ds_descricao: string | null
}

export default function RegistroEntrada() {
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tiposVeiculo, setTiposVeiculo] = useState<TipoVeiculo[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTiposVeiculo()
  }, [])

  const loadTiposVeiculo = async () => {
    try {
      const supabase = getClientSupabase()
      const { data, error } = await supabase.from("tipo_veiculo").select("*").order("nm_tipo")

      if (error) {
        console.error("Erro ao carregar tipos de veículo:", error)
        setError("Erro ao carregar tipos de veículo")
        return
      }

      setTiposVeiculo(data || [])
    } catch (error) {
      console.error("Erro ao carregar tipos de veículo:", error)
      setError("Erro ao carregar tipos de veículo")
    }
  }

  const handleSubmit = async (plate: string, vehicleType: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Encontrar o ID do tipo de veículo
      const tipoVeiculoObj = tiposVeiculo.find((tipo) => tipo.nm_tipo === vehicleType)

      if (!tipoVeiculoObj) {
        throw new Error("Tipo de veículo não encontrado")
      }

      const response = await fetch("/api/entrada", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placa: plate,
          tipoVeiculoId: tipoVeiculoObj.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409 && data.ticketExistente) {
          const dataEntrada = new Date(data.ticketExistente.dt_entrada)
          throw new Error(
            `Já existe um ticket ativo para esta placa.\nTicket: ${data.ticketExistente.nr_ticket}\nEntrada: ${formatarDataBrasileira(dataEntrada)}`,
          )
        }
        throw new Error(data.error || "Erro ao registrar entrada")
      }

      setTicketData({
        ticketNumber: data.ticket.nr_ticket,
        plate: data.ticket.nr_placa,
        vehicleType,
        entryTime: new Date(data.ticket.dt_entrada),
      })
    } catch (error: any) {
      console.error("Erro ao registrar entrada:", error)
      setError(error.message || "Erro ao registrar entrada")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader title="Registro de Entrada" />

      <div className="flex-1 p-4 md:p-8 pb-16 md:pb-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Registro de Entrada</h2>
            <p className="mt-2 text-gray-600">Preencha os dados do veículo para registrar a entrada</p>
          </header>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 whitespace-pre-line">
              {error}
            </div>
          )}

          <Card className="mb-8 overflow-hidden rounded-2xl border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <VehicleForm onSubmit={handleSubmit} isLoading={isLoading} tiposVeiculo={tiposVeiculo} />

              <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <p>
                  A cobrança será realizada com base na tabela de preços configurada para o tipo de veículo selecionado.
                </p>
                <p className="mt-2">
                  <strong>Horário:</strong> Todas as operações são registradas no horário de Brasília (GMT-3).
                </p>
              </div>
            </CardContent>
          </Card>

          {ticketData && <TicketDisplay ticketData={ticketData} />}
        </div>
      </div>

      <QuickNav />
    </div>
  )
}
