"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { TicketData } from "../registro-entrada"
import QRCode from "react-qr-code"
import { motion } from "framer-motion"
import { Clock, Car, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TicketDisplayProps {
  ticketData: TicketData
}

export function TicketDisplay({ ticketData }: TicketDisplayProps) {
  const [mounted, setMounted] = useState(false)

  // Formatando a data e hora
  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(ticketData.entryTime)

  // Mapeando o tipo de veículo para o nome completo
  const vehicleTypeMap: Record<string, string> = {
    carro: "Carro",
    moto: "Moto",
    camionete: "Caminhonete",
    van: "Van",
    caminhao: "Caminhão",
  }

  // Gerando o conteúdo do QR Code com dados estruturados
  const qrCodeContent = JSON.stringify({
    ticket: ticketData.ticketNumber,
    plate: ticketData.plate,
    type: ticketData.vehicleType,
    entryTime: ticketData.entryTime.toISOString(),
    version: "2.0",
    system: "parkgestor",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden rounded-2xl border-2 border-yellow-500 shadow-lg">
        <div className="bg-yellow-500 p-4 text-center text-black">
          <h2 className="text-2xl font-bold">Ticket Gerado com Sucesso</h2>
        </div>

        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
              <h3 className="text-3xl font-bold text-gray-900">{ticketData.ticketNumber}</h3>
              <div className="mt-2 flex items-center justify-center text-gray-600">
                <Clock className="mr-2 h-4 w-4" />
                <span>Entrada registrada às {formattedTime}</span>
              </div>
            </div>

            <div className="my-6 p-4 bg-white rounded-xl border border-gray-200">
              <QRCode
                value={qrCodeContent}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>

            <div className="mb-6 w-full rounded-xl bg-gray-50 p-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="font-medium text-gray-600">Placa:</span>
                <span className="font-bold text-gray-900">{ticketData.plate}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium text-gray-600">Tipo:</span>
                <div className="flex items-center">
                  <Car className="mr-2 h-4 w-4 text-gray-600" />
                  <span className="font-bold text-gray-900">
                    {vehicleTypeMap[ticketData.vehicleType] || ticketData.vehicleType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 rounded-xl bg-black text-white hover:bg-gray-800"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-5 w-5" />
                Imprimir Ticket
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => window.location.reload()}
              >
                Novo Registro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
