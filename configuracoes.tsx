"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "./components/app-header"
import { QuickNav } from "./components/quick-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PricingTables } from "./components/pricing-tables"
import { Settings, CreditCard, Building, Users } from "lucide-react"
import { supabase } from "./lib/supabase"

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
  const [pricingTables, setPricingTables] = useState<PricingTable[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPricingTables()
  }, [])

  const loadPricingTables = async () => {
    try {
      setIsLoading(true)

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
      const tabelasCompletas: PricingTable[] = []

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
          id: tabela.id.toString(),
          name: tabela.nm_tabela,
          description: tabela.ds_descricao || "",
          vehicleType: tabela.tipo_veiculo.nm_tipo,
          isDefault: tabela.fl_padrao,
          toleranceMinutes: tabela.nr_tolerancia_minutos,
          maxValue: tabela.vl_maximo,
          periods: (periodos || []).map((periodo) => ({
            id: periodo.id.toString(),
            name: periodo.nm_periodo,
            minutes: periodo.nr_minutos,
            price: periodo.vl_preco,
          })),
        })
      }

      setPricingTables(tabelasCompletas)
    } catch (error) {
      console.error("Erro ao carregar tabelas de preço:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPricingTable = async (newTable: PricingTable) => {
    try {
      // Buscar ID do tipo de veículo
      const { data: tipoVeiculo, error: tipoError } = await supabase
        .from("tipo_veiculo")
        .select("id")
        .eq("nm_tipo", newTable.vehicleType)
        .single()

      if (tipoError || !tipoVeiculo) {
        throw new Error("Tipo de veículo não encontrado")
      }

      // Criar tabela de preço
      const { data: tabelaCriada, error: tabelaError } = await supabase
        .from("tabela_preco")
        .insert({
          nm_tabela: newTable.name,
          ds_descricao: newTable.description,
          id_tipo_veiculo: tipoVeiculo.id,
          fl_padrao: newTable.isDefault,
          nr_tolerancia_minutos: newTable.toleranceMinutes,
          vl_maximo: newTable.maxValue,
          fl_ativo: true,
        })
        .select()
        .single()

      if (tabelaError) {
        throw new Error("Falha ao criar tabela de preço")
      }

      // Criar períodos
      const periodosParaInserir = newTable.periods.map((periodo, index) => ({
        id_tabela_preco: tabelaCriada.id,
        nm_periodo: periodo.name,
        nr_minutos: periodo.minutes,
        vl_preco: periodo.price,
        nr_ordem: index + 1,
      }))

      const { error: periodosError } = await supabase.from("periodo_cobranca").insert(periodosParaInserir)

      if (periodosError) {
        // Tentar excluir a tabela criada para evitar inconsistências
        await supabase.from("tabela_preco").delete().eq("id", tabelaCriada.id)
        throw new Error("Falha ao criar períodos de cobrança")
      }

      // Recarregar tabelas
      await loadPricingTables()
    } catch (error) {
      console.error("Erro ao adicionar tabela de preço:", error)
      alert("Erro ao criar tabela de preço. Tente novamente.")
    }
  }

  const handleUpdatePricingTable = async (updatedTable: PricingTable) => {
    try {
      // Buscar ID do tipo de veículo
      const { data: tipoVeiculo, error: tipoError } = await supabase
        .from("tipo_veiculo")
        .select("id")
        .eq("nm_tipo", updatedTable.vehicleType)
        .single()

      if (tipoError || !tipoVeiculo) {
        throw new Error("Tipo de veículo não encontrado")
      }

      // Atualizar tabela de preço
      const { error: tabelaError } = await supabase
        .from("tabela_preco")
        .update({
          nm_tabela: updatedTable.name,
          ds_descricao: updatedTable.description,
          id_tipo_veiculo: tipoVeiculo.id,
          fl_padrao: updatedTable.isDefault,
          nr_tolerancia_minutos: updatedTable.toleranceMinutes,
          vl_maximo: updatedTable.maxValue,
        })
        .eq("id", Number.parseInt(updatedTable.id))

      if (tabelaError) {
        throw new Error("Falha ao atualizar tabela de preço")
      }

      // Excluir períodos existentes
      const { error: deleteError } = await supabase
        .from("periodo_cobranca")
        .delete()
        .eq("id_tabela_preco", Number.parseInt(updatedTable.id))

      if (deleteError) {
        throw new Error("Falha ao atualizar períodos de cobrança")
      }

      // Inserir novos períodos
      const periodosParaInserir = updatedTable.periods.map((periodo, index) => ({
        id_tabela_preco: Number.parseInt(updatedTable.id),
        nm_periodo: periodo.name,
        nr_minutos: periodo.minutes,
        vl_preco: periodo.price,
        nr_ordem: index + 1,
      }))

      const { error: periodosError } = await supabase.from("periodo_cobranca").insert(periodosParaInserir)

      if (periodosError) {
        throw new Error("Falha ao atualizar períodos de cobrança")
      }

      // Recarregar tabelas
      await loadPricingTables()
    } catch (error) {
      console.error("Erro ao atualizar tabela de preço:", error)
      alert("Erro ao atualizar tabela de preço. Tente novamente.")
    }
  }

  const handleDeletePricingTable = async (tableId: string) => {
    try {
      // Excluir períodos primeiro
      const { error: periodosError } = await supabase
        .from("periodo_cobranca")
        .delete()
        .eq("id_tabela_preco", Number.parseInt(tableId))

      if (periodosError) {
        throw new Error("Falha ao excluir períodos de cobrança")
      }

      // Excluir tabela
      const { error: tabelaError } = await supabase.from("tabela_preco").delete().eq("id", Number.parseInt(tableId))

      if (tabelaError) {
        throw new Error("Falha ao excluir tabela de preço")
      }

      // Recarregar tabelas
      await loadPricingTables()
    } catch (error) {
      console.error("Erro ao excluir tabela de preço:", error)
      alert("Erro ao excluir tabela de preço. Tente novamente.")
    }
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
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                </div>
              ) : (
                <PricingTables
                  pricingTables={pricingTables}
                  onAddTable={handleAddPricingTable}
                  onUpdateTable={handleUpdatePricingTable}
                  onDeleteTable={handleDeletePricingTable}
                />
              )}
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
