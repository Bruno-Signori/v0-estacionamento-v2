"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "./components/app-header"
import { QuickNav } from "./components/quick-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCodeReader } from "./components/qr-code-reader"
import { SearchVehicleForm } from "./components/search-vehicle-form"
import { VehicleDetails } from "./components/vehicle-details"
import { PaymentReceipt } from "./components/payment-receipt"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [qrCodeError, setQrCodeError] = useState<string | null>(null)

  // Carregar as tabelas de cobrança (em um sistema real, isso viria de uma API)
  useEffect(() => {
    // Simulando o carregamento das tabelas de cobrança
    setPricingTables(initialPricingTables)
  }, [])

  // Efeito para processar dados do QR Code quando disponíveis
  useEffect(() => {
    if (qrCodeData) {
      processQrCodeData(qrCodeData)
      setQrCodeData(null) // Limpar após processar
    }
  }, [qrCodeData])

  // Função para processar os dados do QR Code
  const processQrCodeData = (data: string) => {
    setQrCodeError(null)

    try {
      // Tentar fazer o parse do QR Code como JSON
      try {
        const jsonData = JSON.parse(data)
        if (jsonData.ticket) {
          // Se for um JSON válido com campo ticket, usar o ticket
          handleSearch(jsonData.ticket)
          return
        } else if (jsonData.plate) {
          // Se tiver placa, usar a placa
          handleSearch(jsonData.plate)
          return
        }
      } catch (e) {
        // Se não for JSON, continuar e tratar como texto simples
      }

      // Se não for JSON ou não tiver campos esperados, usar o texto diretamente
      // Verificar se parece uma placa (pelo menos 7 caracteres) ou um número de ticket
      if (data.length >= 7 || !isNaN(Number(data))) {
        handleSearch(data)
      } else {
        setQrCodeError("QR Code inválido. O conteúdo não parece ser um ticket ou placa válida.")
      }
    } catch (error) {
      console.error("Erro ao processar QR Code:", error)
      setQrCodeError("Erro ao processar o QR Code. Formato inválido.")
    }
  }

  // Função para lidar com a leitura do QR Code
  const handleQRCodeScan = (data: string) => {
    if (data) {
      setQrCodeData(data)
    }
  }

  const handleSearch = (searchTerm: string) => {
    setSearchStatus("searching")

    // Simulando uma busca no banco de dados
    setTimeout(() => {
      // Verificando se o termo de busca é uma placa válida ou um número de ticket
      if (searchTerm.length >= 7 || !isNaN(Number(searchTerm))) {
        // Simulando que encontramos o veículo
        const mockEntryTime = new Date()
        mockEntryTime.setHours(mockEntryTime.getHours() - Math.floor(Math.random() * 5) - 1) // Entre 1-5 horas atrás

        // Escolhendo aleatoriamente um tipo de veículo para simulação
        const vehicleTypes = ["carro", "moto", "camionete"]
        const randomVehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]

        // Gerar uma placa aleatória se o termo de busca parece ser um número de ticket
        const plate = !isNaN(Number(searchTerm))
          ? `ABC${Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0")}`
          : searchTerm.toUpperCase()

        // Gerar um número de ticket aleatório se o termo de busca parece ser uma placa
        const ticketNumber = !isNaN(Number(searchTerm))
          ? searchTerm
          : Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0")

        setVehicleInfo({
          ticketNumber,
          plate,
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
    setQrCodeError(null)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader title="Registro de Saída" />

      <div className="flex-1 p-4 md:p-8 pb-16 md:pb-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Registro de Saída</h2>
            <p className="mt-2 text-gray-600">
              Localize o veículo pela placa, número do ticket ou escaneie o QR Code para registrar a saída
            </p>
          </header>

          {!paymentComplete ? (
            <>
              {!vehicleInfo && (
                <Card className="mb-8 overflow-hidden rounded-2xl border-gray-200 shadow-sm">
                  <CardContent className="p-0">
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid grid-cols-2 w-full rounded-none">
                        <TabsTrigger value="manual">Busca Manual</TabsTrigger>
                        <TabsTrigger value="qrcode">Leitura via QR Code</TabsTrigger>
                      </TabsList>
                      <TabsContent value="manual" className="p-6">
                        <SearchVehicleForm onSearch={handleSearch} searchStatus={searchStatus} />
                      </TabsContent>
                      <TabsContent value="qrcode" className="p-6">
                        {qrCodeError && (
                          <Alert variant="destructive" className="mb-4 bg-red-50 text-red-800 border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{qrCodeError}</AlertDescription>
                          </Alert>
                        )}
                        <QrCodeReader onScan={handleQRCodeScan} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

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
