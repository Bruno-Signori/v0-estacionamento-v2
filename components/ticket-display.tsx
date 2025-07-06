"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Share2, CheckCircle } from "lucide-react"
import { formatarDataBrasileira, formatarHora } from "@/lib/utils/date-utils"
import type { TicketData } from "@/app/registro-entrada/page"

interface TicketDisplayProps {
  ticketData: TicketData
}

export function TicketDisplay({ ticketData }: TicketDisplayProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      // Criar conteúdo para impressão
      const printContent = `
        ================================
        ESTACIONAMENTO PARKGESTOR
        ================================
        
        TICKET: ${ticketData.ticketNumber}
        PLACA: ${ticketData.plate}
        TIPO: ${ticketData.vehicleType}
        
        ENTRADA: ${formatarDataBrasileira(ticketData.entryTime)}
        HORÁRIO: ${formatarHora(ticketData.entryTime)}
        
        ================================
        GUARDE ESTE COMPROVANTE
        ================================
      `

      // Abrir janela de impressão
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ticket ${ticketData.ticketNumber}</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 12px; 
                  margin: 20px;
                  white-space: pre-line;
                }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>${printContent}</body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    } catch (error) {
      console.error("Erro ao imprimir:", error)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `Ticket ${ticketData.ticketNumber}`,
      text: `Placa: ${ticketData.plate}\nEntrada: ${formatarDataBrasileira(ticketData.entryTime)}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      const text = `${shareData.title}\n${shareData.text}`
      await navigator.clipboard.writeText(text)
      alert("Dados copiados para a área de transferência!")
    }
  }

  const handleDownload = () => {
    const content = `TICKET: ${ticketData.ticketNumber}
PLACA: ${ticketData.plate}
TIPO: ${ticketData.vehicleType}
ENTRADA: ${formatarDataBrasileira(ticketData.entryTime)}
HORÁRIO: ${formatarHora(ticketData.entryTime)}

ESTACIONAMENTO PARKGESTOR
Guarde este comprovante`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ticket-${ticketData.ticketNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-green-200 shadow-sm bg-green-50">
      <div className="bg-green-500 p-4 text-center text-white">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="h-6 w-6" />
          <h3 className="text-xl font-bold">Entrada Registrada</h3>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-green-600 mb-2">#{ticketData.ticketNumber}</div>
          <Badge variant="outline" className="text-sm">
            Ticket de Entrada
          </Badge>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <span className="text-gray-600">Placa:</span>
            <span className="font-mono font-bold text-lg">{ticketData.plate}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <span className="text-gray-600">Tipo de Veículo:</span>
            <span className="font-medium">{ticketData.vehicleType}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <span className="text-gray-600">Data e Hora:</span>
            <div className="text-right">
              <div className="font-medium">{formatarDataBrasileira(ticketData.entryTime)}</div>
              <div className="text-sm text-gray-500">Horário de Brasília</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={handlePrint} disabled={isPrinting} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? "Imprimindo..." : "Imprimir"}
          </Button>

          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button onClick={handleShare} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Guarde este comprovante para registrar a saída do veículo.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Todos os horários são registrados no fuso horário de Brasília (GMT-3).
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
