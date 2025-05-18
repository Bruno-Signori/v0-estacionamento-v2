"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Clock, Car, BikeIcon as Motorcycle, Truck, Timer, DollarSign } from "lucide-react"
import { PricingTableForm } from "./pricing-table-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { PricingTable } from "../configuracoes"

interface PricingTablesProps {
  pricingTables: PricingTable[]
  onAddTable: (table: PricingTable) => void
  onUpdateTable: (table: PricingTable) => void
  onDeleteTable: (tableId: string) => void
}

export function PricingTables({ pricingTables, onAddTable, onUpdateTable, onDeleteTable }: PricingTablesProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<PricingTable | null>(null)

  const handleAddClick = () => {
    setSelectedTable(null)
    setIsAddDialogOpen(true)
  }

  const handleEditClick = (table: PricingTable) => {
    setSelectedTable(table)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (table: PricingTable) => {
    setSelectedTable(table)
    setIsDeleteDialogOpen(true)
  }

  const handleAddSubmit = (newTable: PricingTable) => {
    onAddTable(newTable)
    setIsAddDialogOpen(false)
  }

  const handleEditSubmit = (updatedTable: PricingTable) => {
    onUpdateTable(updatedTable)
    setIsEditDialogOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (selectedTable) {
      onDeleteTable(selectedTable.id)
      setIsDeleteDialogOpen(false)
    }
  }

  // Função para obter o ícone do tipo de veículo
  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case "carro":
        return <Car className="h-5 w-5" />
      case "moto":
        return <Motorcycle className="h-5 w-5" />
      case "camionete":
        return <Truck className="h-5 w-5" />
      default:
        return <Car className="h-5 w-5" />
    }
  }

  // Função para formatar o preço
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`
  }

  // Função para formatar o tempo em minutos
  const formatMinutes = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`
    } else if (minutes === 60) {
      return "1 hora"
    } else if (minutes % 60 === 0) {
      return `${minutes / 60} horas`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}min`
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Tabelas de Cobrança</h3>
          <p className="text-gray-600">Gerencie as tabelas de preços para diferentes tipos de veículos</p>
        </div>
        <Button onClick={handleAddClick} className="rounded-xl bg-yellow-500 text-black hover:bg-yellow-600">
          <PlusCircle className="mr-2 h-5 w-5" />
          Nova Tabela
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingTables.map((table) => (
          <Card key={table.id} className="rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-lg mr-3 ${
                      table.vehicleType === "carro"
                        ? "bg-blue-100 text-blue-600"
                        : table.vehicleType === "moto"
                          ? "bg-green-100 text-green-600"
                          : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {getVehicleIcon(table.vehicleType)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{table.name}</CardTitle>
                    <CardDescription>{table.description}</CardDescription>
                  </div>
                </div>
                {table.isDefault && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Padrão
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Informações de tolerância e valor máximo */}
              <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <Timer className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Tolerância</div>
                    <div className="text-sm font-medium">
                      {table.toleranceMinutes > 0 ? `${table.toleranceMinutes} minutos` : "Sem tolerância"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Valor Máximo</div>
                    <div className="text-sm font-medium">{formatPrice(table.maxValue)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {table.periods.map((period) => (
                  <div
                    key={period.id}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">{period.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-3">{formatMinutes(period.minutes)}</span>
                      <span className="font-bold">{formatPrice(period.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg"
                  onClick={() => handleEditClick(table)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteClick(table)}
                  disabled={table.isDefault}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para adicionar nova tabela */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Nova Tabela de Cobrança</DialogTitle>
            <DialogDescription>Crie uma nova tabela de preços para um tipo específico de veículo.</DialogDescription>
          </DialogHeader>
          <PricingTableForm onSubmit={handleAddSubmit} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar tabela existente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Editar Tabela de Cobrança</DialogTitle>
            <DialogDescription>Modifique os detalhes e períodos desta tabela de preços.</DialogDescription>
          </DialogHeader>
          {selectedTable && (
            <PricingTableForm
              initialData={selectedTable}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para excluir */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tabela "{selectedTable?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
