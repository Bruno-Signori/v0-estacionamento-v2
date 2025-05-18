"use client"

import { useState } from "react"
import { AppHeader } from "./components/app-header"
import { QuickNav } from "./components/quick-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PricingTables } from "./components/pricing-tables"
import { Settings, CreditCard, Building, Users } from "lucide-react"
import { initialPricingTables } from "./data/pricing-tables"

export interface PricingPeriod {
  id: string
  name: string
  minutes: number
  price: number
}

export interface PricingTable {
  id: string
  name: string
  description: string
  vehicleType: string
  isDefault: boolean
  toleranceMinutes: number
  maxValue: number
  periods: PricingPeriod[]
}

export default function Configuracoes() {
  const [pricingTables, setPricingTables] = useState<PricingTable[]>(initialPricingTables)

  const handleAddPricingTable = (newTable: PricingTable) => {
    setPricingTables([...pricingTables, newTable])
  }

  const handleUpdatePricingTable = (updatedTable: PricingTable) => {
    setPricingTables(pricingTables.map((table) => (table.id === updatedTable.id ? updatedTable : table)))
  }

  const handleDeletePricingTable = (tableId: string) => {
    setPricingTables(pricingTables.filter((table) => table.id !== tableId))
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader title="Configurações" />

      <div className="flex-1 p-4 md:p-8 pb-16 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
            <p className="mt-2 text-gray-600">Gerencie as configurações do seu estacionamento</p>
          </header>

          <Tabs defaultValue="pricing" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="pricing" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Tabelas de Cobrança</span>
              </TabsTrigger>
              <TabsTrigger value="parking" className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                <span>Estacionamentos</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Sistema</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="space-y-4">
              <PricingTables
                pricingTables={pricingTables}
                onAddTable={handleAddPricingTable}
                onUpdateTable={handleUpdatePricingTable}
                onDeleteTable={handleDeletePricingTable}
              />
            </TabsContent>

            <TabsContent value="parking">
              <div className="rounded-xl border border-gray-200 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-500">Configurações de Estacionamentos</h3>
                <p className="mt-2 text-gray-400">Esta funcionalidade será implementada em breve.</p>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="rounded-xl border border-gray-200 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-500">Configurações de Usuários</h3>
                <p className="mt-2 text-gray-400">Esta funcionalidade será implementada em breve.</p>
              </div>
            </TabsContent>

            <TabsContent value="system">
              <div className="rounded-xl border border-gray-200 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-500">Configurações do Sistema</h3>
                <p className="mt-2 text-gray-400">Esta funcionalidade será implementada em breve.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <QuickNav />
    </div>
  )
}
