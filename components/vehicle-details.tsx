"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Car, CreditCard, Banknote, Info, AlertCircle } from "lucide-react"
import type { VehicleInfo } from "../registro-saida"
import type { PricingTable } from "../configuracoes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface VehicleDetailsProps {
  vehicleInfo: VehicleInfo
  pricingTables: PricingTable[]
  onFinishExit: (vehicleInfo: VehicleInfo) => void
}

// Função para calcular o tempo de permanência em minutos
const calculateParkingTime = (entryTime: Date): number => {
  const now = new Date()
  const diffMs = now.getTime() - entryTime.getTime()
  return Math.ceil(diffMs / (1000 * 60)) // Convertendo para minutos e arredondando para cima
}

// Função para formatar o tempo de permanência
const formatParkingTime = (minutes: number): string => {
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

// Função para encontrar a tabela de cobrança padrão
const findDefaultPricingTable = (vehicleType: string, pricingTables: PricingTable[]): PricingTable | null => {
  // Primeiro, procurar pela tabela padrão para o tipo de veículo
  const defaultTable = pricingTables.find((table) => table.vehicleType === vehicleType && table.isDefault)

  if (defaultTable) {
    return defaultTable
  }

  // Se não encontrar uma tabela padrão, usar a primeira tabela para o tipo de veículo
  const anyTable = pricingTables.find((table) => table.vehicleType === vehicleType)

  return anyTable || null
}

// Função para calcular o valor a ser pago com base na tabela de cobrança
const calculateAmountToPay = (parkingTimeMinutes: number, pricingTable: PricingTable): number => {
  // Verificar se está dentro do período de tolerância
  if (parkingTimeMinutes <= pricingTable.toleranceMinutes) {
    return 0
  }

  let totalAmount = 0
  let remainingMinutes = parkingTimeMinutes

  // Ordenar os períodos por duração (do menor para o maior)
  // Isso garante que aplicamos primeiro os períodos mais curtos
  const sortedPeriods = [...pricingTable.periods].sort((a, b) => a.minutes - b.minutes)

  // Aplicar o primeiro período (geralmente a primeira hora)
  if (sortedPeriods.length > 0) {
    const firstPeriod = sortedPeriods[0]
    totalAmount += firstPeriod.price
    remainingMinutes -= firstPeriod.minutes
  }

  // Se ainda houver tempo restante e mais períodos, aplicar os períodos adicionais
  if (remainingMinutes > 0 && sortedPeriods.length > 1) {
    // Usar o último período para horas adicionais (geralmente "Hora Adicional")
    const additionalPeriod = sortedPeriods[sortedPeriods.length - 1]

    // Calcular quantas vezes o período adicional se aplica
    const additionalPeriodCount = Math.ceil(remainingMinutes / additionalPeriod.minutes)
    totalAmount += additionalPeriod.price * additionalPeriodCount
  }

  // Aplicar o valor máximo se configurado e se o total calculado for maior
  if (pricingTable.maxValue > 0 && totalAmount > pricingTable.maxValue) {
    return pricingTable.maxValue
  }

  return totalAmount
}

export function VehicleDetails({ vehicleInfo, pricingTables, onFinishExit }: VehicleDetailsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"dinheiro" | "cartao">("dinheiro") // Dinheiro como padrão
  const [selectedTableId, setSelectedTableId] = useState<string>("")

  // Encontrar a tabela de cobrança padrão para pré-seleção
  const defaultPricingTable = useMemo(
    () => findDefaultPricingTable(vehicleInfo.vehicleType, pricingTables),
    [vehicleInfo.vehicleType, pricingTables],
  )

  // Definir a tabela padrão como selecionada inicialmente
  useEffect(() => {
    if (defaultPricingTable && !selectedTableId) {
      setSelectedTableId(defaultPricingTable.id)
    }
  }, [defaultPricingTable, selectedTableId])

  // Obter a tabela selecionada
  const selectedPricingTable = useMemo(
    () => pricingTables.find((table) => table.id === selectedTableId) || null,
    [pricingTables, selectedTableId],
  )

  // Calculando o tempo de permanência
  const parkingTimeMinutes = calculateParkingTime(vehicleInfo.entryTime)
  const formattedParkingTime = formatParkingTime(parkingTimeMinutes)

  // Calculando o valor a ser pago
  const amountToPay = selectedPricingTable ? calculateAmountToPay(parkingTimeMinutes, selectedPricingTable) : 0

  // Formatando a data e hora de entrada
  const formattedEntryTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(vehicleInfo.entryTime)

  // Mapeando o tipo de veículo para o nome completo
  const vehicleTypeMap: Record<string, string> = {
    carro: "Carro",
    moto: "Moto",
    camionete: "Caminhonete",
  }

  const handleFinishExit = () => {
    if (amountToPay > 0 && !selectedPaymentMethod) return

    setIsProcessing(true)

    // Preparando os dados atualizados do veículo
    const updatedVehicleInfo: VehicleInfo = {
      ...vehicleInfo,
      exitTime: new Date(),
      parkingTime: parkingTimeMinutes,
      amountToPay: amountToPay,
      appliedPricingTable: selectedPricingTable || undefined,
    }

    // Chamando a função de finalização
    onFinishExit(updatedVehicleInfo)
  }

  // Verificar se está dentro do período de tolerância
  const isWithinTolerance = selectedPricingTable && parkingTimeMinutes <= selectedPricingTable.toleranceMinutes

  // Verificar se atingiu o valor máximo
  const hasReachedMaxValue =
    selectedPricingTable && selectedPricingTable.maxValue > 0 && amountToPay === selectedPricingTable.maxValue

  // Filtrar tabelas relevantes (todas as tabelas, não apenas as do tipo do veículo)
  const availableTables = pricingTables

  return (
    <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-sm">
      <div className="bg-green-500 p-4 text-center text-white">
        <h3 className="text-xl font-bold">Veículo Encontrado</h3>
      </div>

      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Informações do veículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Ticket</div>
              <div className="text-xl font-bold">{vehicleInfo.ticketNumber}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-500">Placa</div>
              <div className="text-xl font-bold">{vehicleInfo.plate}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-500">Tipo de Veículo</div>
              <div className="flex items-center">
                <Car className="mr-2 h-5 w-5 text-gray-600" />
                <span className="font-medium">{vehicleTypeMap[vehicleInfo.vehicleType]}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-500">Entrada</div>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-gray-600" />
                <span className="font-medium">{formattedEntryTime}</span>
              </div>
            </div>
          </div>

          {/* Seletor de tabela de cobrança */}
          <div className="space-y-3">
            <Label htmlFor="pricing-table" className="text-gray-700">
              Tabela de Cobrança
            </Label>
            <Select value={selectedTableId} onValueChange={setSelectedTableId}>
              <SelectTrigger id="pricing-table" className="w-full rounded-xl">
                <SelectValue placeholder="Selecione uma tabela de cobrança" />
              </SelectTrigger>
              <SelectContent>
                {availableTables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    <div className="flex items-center">
                      <span>{table.name}</span>
                      {table.isDefault && table.vehicleType === vehicleInfo.vehicleType && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                          Padrão
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Informações da tabela de cobrança */}
          {selectedPricingTable && (
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Detalhes da Tabela</h4>
                  <p className="text-sm text-blue-600 mt-1">{selectedPricingTable.description}</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPricingTable.toleranceMinutes > 0 && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Tolerância: {selectedPricingTable.toleranceMinutes} min
                      </span>
                    )}

                    {selectedPricingTable.maxValue > 0 && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Máximo: R$ {selectedPricingTable.maxValue.toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tempo de permanência e valor */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Tempo de Permanência</div>
                <div className="text-lg font-bold mt-1">{formattedParkingTime}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Valor a Pagar</div>
                <div className="flex items-center">
                  <div className="text-lg font-bold text-green-600 mt-1">
                    {isWithinTolerance ? "Grátis (Tolerância)" : `R$ ${amountToPay.toFixed(2).replace(".", ",")}`}
                  </div>

                  {hasReachedMaxValue && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-2 cursor-help">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Valor máximo da tabela aplicado.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Métodos de pagamento */}
          {amountToPay > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-3">Forma de Pagamento</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={selectedPaymentMethod === "dinheiro" ? "default" : "outline"}
                  className={`rounded-xl flex items-center justify-center h-16 ${
                    selectedPaymentMethod === "dinheiro"
                      ? "bg-yellow-500 text-black hover:bg-yellow-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPaymentMethod("dinheiro")}
                >
                  <Banknote className="mr-2 h-5 w-5" />
                  <span>Dinheiro</span>
                </Button>

                <Button
                  type="button"
                  variant={selectedPaymentMethod === "cartao" ? "default" : "outline"}
                  className={`rounded-xl flex items-center justify-center h-16 ${
                    selectedPaymentMethod === "cartao"
                      ? "bg-yellow-500 text-black hover:bg-yellow-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPaymentMethod("cartao")}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  <span>Cartão</span>
                </Button>
              </div>
            </div>
          )}

          {/* Botão de finalização */}
          <Button
            className="w-full rounded-xl bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 h-12 text-lg"
            disabled={(amountToPay > 0 && !selectedPaymentMethod) || isProcessing || !selectedPricingTable}
            onClick={handleFinishExit}
          >
            {isProcessing ? (
              <>
                <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-b-transparent"></span>
                Processando...
              </>
            ) : (
              "Finalizar Saída"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
