"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface TicketData {
  ticketNumber: string
  plate: string
  vehicleType: string
  entryTime: Date
}

interface TicketDisplayProps {
  ticketData: TicketData
}

export function TicketDisplay({ ticketData }: TicketDisplayProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-semibold text-center mb-4">Ticket Gerado</h3>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-sm print:shadow-none">
        <CardContent className="p-6 print:p-0">
          <div className="text-center mb-6">
            <h4 className="text-lg font-bold">ParkGestor</h4>
            <p className="text-sm text-gray-500">Estacionamento Central</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Ticket:</span>
              <span className="font-semibold">{ticketData.ticketNumber}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Placa:</span>
              <span className="font-semibold">{ticketData.plate}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Tipo:</span>
              <span className="font-semibold">{ticketData.vehicleType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Data:</span>
              <span className="font-semibold">{formatDate(ticketData.entryTime)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Hora:</span>
              <span className="font-semibold">{formatTime(ticketData.entryTime)}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>Guarde este ticket para apresentar na saída</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center print:hidden">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer size={16} />
          Imprimir Ticket
        </Button>
      </div>
    </div>
  )
}
