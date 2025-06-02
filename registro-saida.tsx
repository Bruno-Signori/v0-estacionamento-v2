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
import { supabase } from "./lib/supabase"

export interface VehicleInfo {
  id: number
  ticketNumber: string
  plate: string
  vehicleType: string
  entryTime: Date
  exitTime?: Date
  parkingTime?: number // em minutos
  amountToPay?: number
  appliedPricingTable?: {
    id: number
    nm_tabela: string
    ds_descricao: string | null
    id_tipo_veiculo: number
    fl_padrao: boolean
    nr_tolerancia_minutos: number
    vl_maximo: number
    fl_ativo: boolean
    tipo_veiculo: {
      id: number
      nm_tipo: string
      ds_descricao: string | null
    }
    periodos: {
      id: number
      nm_periodo: string
      nr_minutos: number
      vl_preco: number
      nr_ordem: number
    }[]
  }
}

export default function RegistroSaida() {
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "found" | "not-found">("idle")
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [pricingTables, setPricingTables] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [qrCodeError, setQrCodeError] = useState<string | null>(null)

  // Carregar as tabelas de cobrança
  useEffect(() => {
    loadPricingTables()
  }, [])

  // Efeito para processar dados do QR Code quando disponíveis
  useEffect(() => {
    if (qrCodeData) {
      processQrCodeData(qrCodeData)
      setQrCodeData(null)
    }
  }, [qrCodeData])

  const loadPricingTables = async () => {
    try {
      const { data: tabelas, error: tabelasError } = await supabase
        .from("tabela_preco")
        .select(`
          *,
          tipo_veiculo (*)
        `)
        .eq("fl_ativo", true)
        .order("nm_tabela")

      if (tabelasError) {
        console.error("Erro ao buscar tabelas de preço:", tabelasError)
        return
      }

      // Buscar períodos para cada tabela
      const tabelasCompletas: any[] = []

      for (const tabela of tabelas) {
        const { data: periodos, error: periodosError } = await supabase
          .from("periodo_cobranca")
          .select("*")
          .eq("id_tabela_preco", tabela.id)
          .order("nr_ordem")

        if (periodosError) {
          console.error(`Erro ao buscar períodos para tabela ${tabela.id}:`, periodosError)
          continue
        }

        tabelasCompletas.push({
          ...tabela,
          periodos: periodos || [],
        })
      }

      setPricingTables(tabelasCompletas)
    } catch (error) {
      console.error("Erro ao carregar tabelas de preço:", error)
    }
  }

  // Função para processar os dados do QR Code
  const processQrCodeData = (data: string) => {
    setQrCodeError(null)

    try {
      // Tentar fazer o parse do QR Code como JSON
      try {
        const jsonData = JSON.parse(data)
        if (jsonData.ticket) {
          handleSearch(jsonData.ticket)
          return
        } else if (jsonData.plate) {
          handleSearch(jsonData.plate)
          return
        }
      } catch (e) {
        // Se não for JSON, continuar e tratar como texto simples
      }

      // Se não for JSON ou não tiver campos esperados, usar o texto diretamente
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

  const handleSearch = async (searchTerm: string) => {
    setSearchStatus("searching")

    try {
      // Verificar se o termo de busca é um número de ticket ou uma placa
      const isNumeroTicket = /^T?\d+$/.test(searchTerm)

      let query = supabase.from("ticket").select(`
          *,
          tipo_veiculo (*)
        `)

      if (isNumeroTicket) {
        // Remover 'T' se existir e buscar por número de ticket
        const numeroLimpo = searchTerm.replace(/^T/, "")
        query = query.or(`nr_ticket.eq.${searchTerm},nr_ticket.eq.T${numeroLimpo}`)
      } else {
        // Buscar por placa e apenas tickets sem saída registrada
        query = query.eq("nr_placa", searchTerm.toUpperCase()).is("dt_saida", null)
      }

      const { data, error } = await query.order("dt_entrada", { ascending: false }).limit(1).maybeSingle()

      if (error) {
        console.error("Erro ao buscar ticket:", error)
        setSearchStatus("not-found")
        return
      }

      if (!data) {
        setSearchStatus("not-found")
        setVehicleInfo(null)
        return
      }

      // Verificar se o ticket já tem saída registrada
      if (data.dt_saida) {
        setQrCodeError("Este ticket já teve a saída registrada.")
        setSearchStatus("not-found")
        return
      }

      setVehicleInfo({
        id: data.id,
        ticketNumber: data.nr_ticket,
        plate: data.nr_placa,
        vehicleType: data.tipo_veiculo.nm_tipo,
        entryTime: new Date(data.dt_entrada),
      })
      setSearchStatus("found")
    } catch (error) {
      console.error("Erro ao buscar veículo:", error)
      setSearchStatus("not-found")
    }
  }

  const handleFinishExit = async (vehicleData: VehicleInfo) => {
    try {
      if (!vehicleData.appliedPricingTable || vehicleData.amountToPay === undefined) {
        throw new Error("Dados de cobrança não encontrados")
      }

      // Calcular tempo de permanência
      const dtEntrada = vehicleData.entryTime
      const dtSaida = new Date()
      const tempoPermanencia = Math.floor((dtSaida.getTime() - dtEntrada.getTime()) / (1000 * 60))

      // Atualizar ticket com informações de saída
      const { error: atualizacaoError } = await supabase
        .from("ticket")
        .update({
          dt_saida: dtSaida.toISOString(),
          nr_tempo_permanencia: tempoPermanencia,
          id_tabela_preco: vehicleData.appliedPricingTable.id,
          vl_pago: vehicleData.amountToPay,
          tp_pagamento: vehicleData.amountToPay > 0 ? "dinheiro" : null, // Será implementado seleção de pagamento
          fl_pago: true,
        })
        .eq("id", vehicleData.id)

      if (atualizacaoError) {
        throw new Error("Falha ao registrar saída")
      }

      // Registrar no histórico
      await supabase.from("historico_operacao").insert({
        tp_operacao: "saida",
        id_ticket: vehicleData.id,
        ds_detalhes: {
          placa: vehicleData.plate,
          tempo_permanencia: tempoPermanencia,
          valor_pago: vehicleData.amountToPay,
          tipo_pagamento: vehicleData.amountToPay > 0 ? "dinheiro" : null,
        },
      })

      // Atualizar dados do veículo com informações de saída
      setVehicleInfo({
        ...vehicleData,
        exitTime: dtSaida,
        parkingTime: tempoPermanencia,
      })
      setPaymentComplete(true)
    } catch (error) {
      console.error("Erro ao finalizar saída:", error)
      alert("Erro ao finalizar saída. Tente novamente.")
    }
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
