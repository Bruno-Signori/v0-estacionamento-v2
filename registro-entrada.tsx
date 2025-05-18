"use client"

import { useState } from "react"
import { VehicleForm } from "./components/vehicle-form"
import { TicketDisplay } from "./components/ticket-display"
import { Card, CardContent } from "@/components/ui/card"
import { AppHeader } from "./components/app-header"
import { QuickNav } from "./components/quick-nav"

export interface TicketData {
  ticketNumber: string
  plate: string
  vehicleType: string
  entryTime: Date
}

export default function RegistroEntrada() {
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (plate: string, vehicleType: string) => {
    setIsLoading(true)

    // Simulando um tempo de processamento
    setTimeout(() => {
      // Gerar um número de ticket sequencial (em produção, isso viria do backend)
      const ticketNumber = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")

      setTicketData({
        ticketNumber,
        plate,
        vehicleType,
        entryTime: new Date(),
      })

      setIsLoading(false)
    }, 1000)
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

          <Card className="mb-8 overflow-hidden rounded-2xl border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <VehicleForm onSubmit={handleSubmit} isLoading={isLoading} />

              <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <p>
                  A cobrança será realizada com base na tabela de preços configurada para o tipo de veículo selecionado.
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
