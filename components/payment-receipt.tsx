"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Car, Printer, ArrowRight, Info } from "lucide-react"
import type { VehicleInfo } from "../registro-saida"
import { motion } from "framer-motion"

interface PaymentReceiptProps {
  vehicleInfo: VehicleInfo
  onNewExit: () => void
}

export function PaymentReceipt({ vehicleInfo, onNewExit }: PaymentReceiptProps) {
  // Formatando as datas
  const formattedEntryTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(vehicleInfo.entryTime)

  const formattedExitTime = vehicleInfo.exitTime
    ? new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(vehicleInfo.exitTime)
    : "-"

  // Formatando o tempo de permanência
  const formatParkingTime = (minutes?: number): string => {
    if (!minutes) return "-"

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours === 0) {
      return `${remainingMinutes} minutos`
    } else if (hours === 1 && remainingMinutes === 0) {
      return `1 hora`
    } else if (remainingMinutes === 0) {
      return `${hours} horas`
    } else if (hours === 1) {
      return `1 hora e ${remainingMinutes} minutos`
    } else {
      return `${hours} horas e ${remainingMinutes} minutos`
    }
  }

  // Mapeando o tipo de veículo para o nome completo
  const vehicleTypeMap: Record<string, string> = {
    carro: "Carro",
    moto: "Moto",
    camionete: "Caminhonete",
  }

  // Verificar se está dentro do período de tolerância
  const isWithinTolerance =
    vehicleInfo.appliedPricingTable &&
    vehicleInfo.parkingTime !== undefined &&
    vehicleInfo.parkingTime <= vehicleInfo.appliedPricingTable.toleranceMinutes

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden rounded-2xl border-2 border-green-500 shadow-lg">
        <div className="bg-green-500 p-4 text-center text-white">
          <h3 className="text-2xl font-bold">Pagamento Concluído</h3>
        </div>

        <CardContent className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-green-100 rounded-full p-3 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Saída Registrada com Sucesso</h4>
            <p className="text-gray-600 mt-1">Obrigado por utilizar nosso estacionamento!</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Ticket</div>
                <div className="font-bold">{vehicleInfo.ticketNumber}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Placa</div>
                <div className="font-bold">{vehicleInfo.plate}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Tipo de Veículo</div>
                <div className="flex items-center">
                  <Car className="mr-1 h-4 w-4 text-gray-600" />
                  <span>{vehicleTypeMap[vehicleInfo.vehicleType]}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Tempo de Permanência</div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-gray-600" />
                  <span>{formatParkingTime(vehicleInfo.parkingTime)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Entrada</div>
                  <div className="font-medium">{formattedEntryTime}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Saída</div>
                  <div className="font-medium">{formattedExitTime}</div>
                </div>
              </div>
            </div>

            {/* Informações da tabela aplicada */}
            {vehicleInfo.appliedPricingTable && (
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex items-start">
                  <Info className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-500">Tabela Aplicada</div>
                    <div className="font-medium">{vehicleInfo.appliedPricingTable.name}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-900">Valor Total</div>
                <div className="text-xl font-bold text-green-600">
                  {isWithinTolerance
                    ? "Grátis (Tolerância)"
                    : `R$ ${vehicleInfo.amountToPay?.toFixed(2).replace(".", ",") || "-"}`}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 rounded-xl bg-black text-white hover:bg-gray-800" onClick={() => window.print()}>
              <Printer className="mr-2 h-5 w-5" />
              Imprimir Comprovante
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={onNewExit}
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              Nova Saída
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
