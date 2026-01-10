"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { TicketData } from "../registro-entrada"
import QRCode from "react-qr-code"
import { motion } from "framer-motion"
import { Clock, Car, Printer, Check, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePrint } from "@/hooks/use-print"

interface TicketDisplayProps {
  ticketData: TicketData
  autoPrint?: boolean
  onPrintComplete?: () => void
}

export function TicketDisplay({ ticketData, autoPrint = true, onPrintComplete }: TicketDisplayProps) {
  const [mounted, setMounted] = useState(false)
  const [printStatus, setPrintStatus] = useState<"pending" | "printing" | "done">("pending")
  const { printTicket, isPrinting } = usePrint()
  const hasAutoPrinted = useRef(false)

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

  const handlePrint = async () => {
    setPrintStatus("printing")
    await printTicket(ticketData)
    setPrintStatus("done")
    onPrintComplete?.()
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && autoPrint && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true
      // Pequeno delay para garantir que o componente renderizou completamente
      const timer = setTimeout(() => {
        handlePrint()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [mounted, autoPrint])

  if (!mounted) return null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden rounded-2xl border-2 border-yellow-500 shadow-lg">
        <div
          className={`p-4 text-center ${
            printStatus === "done" ? "bg-green-500" : printStatus === "printing" ? "bg-blue-500" : "bg-yellow-500"
          } text-white`}
        >
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            {printStatus === "printing" && (
              <>
                <Printer className="h-6 w-6 animate-pulse" />
                Imprimindo Ticket...
              </>
            )}
            {printStatus === "done" && (
              <>
                <Check className="h-6 w-6" />
                Ticket Impresso!
              </>
            )}
            {printStatus === "pending" && "Ticket Gerado com Sucesso"}
          </h2>
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
              {printStatus === "done" ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                    onClick={handlePrint}
                    disabled={isPrinting}
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reimprimir
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-green-600 text-white hover:bg-green-700"
                    onClick={() => window.location.reload()}
                  >
                    <Car className="mr-2 h-5 w-5" />
                    Novo Veículo
                  </Button>
                </>
              ) : (
                <Button
                  className="flex-1 rounded-xl bg-black text-white hover:bg-gray-800"
                  onClick={handlePrint}
                  disabled={isPrinting || printStatus === "printing"}
                >
                  <Printer className="mr-2 h-5 w-5" />
                  {isPrinting || printStatus === "printing" ? "Imprimindo..." : "Imprimir Ticket"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
