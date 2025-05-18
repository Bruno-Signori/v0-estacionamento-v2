"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "./components/app-header"
import { QuickNav } from "./components/quick-nav"
import { SearchVehicleForm } from "./components/search-vehicle-form"
import { VehicleDetails } from "./components/vehicle-details"
import { PaymentReceipt } from "./components/payment-receipt"
import { Card, CardContent } from "@/components/ui/card"
import type { PricingTable } from "./configuracoes"

// Importando os dados iniciais das tabelas de cobrança
import { initialPricingTables } from "./data/pricing-tables"

export interface VehicleInfo {
  ticketNumber: string
  plate: string
  vehicleType: string
  entryTime: Date
  exitTime?: Date
  parkingTime?: number // em minutos
  amountToPay?: number
  appliedPricingTable?: PricingTable // Nova propriedade para armazenar a tabela aplicada
}

export default function RegistroSaida() {
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "found" | "not-found">("idle")
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [pricingTables, setPricingTables] = useState<PricingTable[]>([])

  // Carregar as tabelas de cobrança (em um sistema real, isso viria de uma API)
  useEffect(() => {
    // Simulando o carregamento das tabelas de cobrança
    setPricingTables(initialPricingTables)
  }, [])

  const handleSearch = (searchTerm: string) => {
    setSearchStatus("searching")

    // Simulando uma busca no banco de dados
    setTimeout(() => {
      // Verificando se o termo de busca é uma placa válida (para simulação)
      if (searchTerm.length >= 7) {
        // Simulando que encontramos o veículo
        const mockEntryTime = new Date()
        mockEntryTime.setHours(mockEntryTime.getHours() - Math.floor(Math.random() * 5) - 1) // Entre 1-5 horas atrás

        // Escolhendo aleatoriamente um tipo de veículo para simulação
        const vehicleTypes = ["carro", "moto", "camionete"]
        const randomVehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]

        setVehicleInfo({
          ticketNumber: `T${Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, "0")}`,
          plate: searchTerm.toUpperCase(),
          vehicleType: randomVehicleType,
          entryTime: mockEntryTime,
        })
        setSearchStatus("found")
      } else {
        setVehicleInfo(null)
        setSearchStatus("not-found")
      }
    }, 1000)
  }

  const handleFinishExit = (vehicleData: VehicleInfo) => {
    // Simulando o processamento do pagamento
    setTimeout(() => {
      setVehicleInfo(vehicleData)
      setPaymentComplete(true)
    }, 1500)
  }

  const handleNewExit = () => {
    setSearchStatus("idle")
    setVehicleInfo(null)
    setPaymentComplete(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader title="Registro de Saída" />

      <div className="flex-1 p-4 md:p-8 pb-16 md:pb-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Registro de Saída</h2>
            <p className="mt-2 text-gray-600">
              Localize o veículo pela placa ou número do ticket para registrar a saída
            </p>
          </header>

          {!paymentComplete ? (
            <>
              <Card className="mb-8 overflow-hidden rounded-2xl border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <SearchVehicleForm onSearch={handleSearch} searchStatus={searchStatus} />
                </CardContent>
              </Card>

              {searchStatus === "found" && vehicleInfo && (
                <VehicleDetails
                  vehicleInfo={vehicleInfo}
                  pricingTables={pricingTables}
                  onFinishExit={handleFinishExit}
                />
              )}
            </>
          ) : (
            vehicleInfo && <PaymentReceipt vehicleInfo={vehicleInfo} onNewExit={handleNewExit} />
          )}
        </div>
      </div>

      <QuickNav />
    </div>
  )
}
