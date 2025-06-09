"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VeiculosList } from "@/components/veiculos-list"
import { VeiculoForm } from "@/components/veiculo-form"
import { Loader2, Plus, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Veiculo, TipoVeiculo } from "@/types/supabase"

export function VeiculosManager() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [tiposVeiculo, setTiposVeiculo] = useState<TipoVeiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const [connectionSuccess, setConnectionSuccess] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState("lista")
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null)

  // Função para limpar mensagens após um tempo
  const clearMessages = () => {
    setTimeout(() => {
      setError(null)
      setSuccessMessage(null)
    }, 5000)
  }

  // Função para exibir mensagem de sucesso
  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setError(null)
    clearMessages()
  }

  // Função para exibir mensagem de erro
  const showError = (message: string) => {
    setError(message)
    setSuccessMessage(null)
    clearMessages()
  }

  // Função para fazer parse seguro de JSON
  const safeJsonParse = async (response: Response) => {
    const text = await response.text()
    console.log("Resposta recebida:", text)

    try {
      return JSON.parse(text)
    } catch (error) {
      console.error("Erro ao fazer parse do JSON:", error)
      throw new Error(`Resposta inválida do servidor: ${text.substring(0, 100)}...`)
    }
  }

  // Testar conexão com Supabase
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("=== INICIANDO TESTE DE CONEXÃO ===")

        const response = await fetch("/api/test-connection", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        console.log("Status da resposta:", response.status)
        console.log("Headers da resposta:", Object.fromEntries(response.headers.entries()))

        const data = await safeJsonParse(response)

        if (response.ok && data.success) {
          setConnectionStatus("Conexão com banco de dados OK")
          setConnectionSuccess(true)
          console.log("✅ Conexão com Supabase OK:", data)
        } else {
          setConnectionStatus(`Erro de conexão: ${data.error}`)
          setConnectionSuccess(false)
          console.error("❌ Erro na conexão:", data)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        setConnectionStatus(`Falha ao testar conexão: ${errorMessage}`)
        setConnectionSuccess(false)
        console.error("❌ Erro ao testar conexão:", error)
      }
    }

    testConnection()
  }, [])

  // Carregar veículos e tipos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("=== CARREGANDO DADOS ===")

        // Buscar tipos de veículo primeiro
        console.log("Buscando tipos de veículo...")
        const tiposResponse = await fetch("/api/tipos-veiculo")
        console.log("Status tipos:", tiposResponse.status)

        if (!tiposResponse.ok) {
          const errorData = await safeJsonParse(tiposResponse)
          throw new Error(`Falha ao carregar tipos de veículo: ${errorData.error || tiposResponse.status}`)
        }

        const tiposData = await safeJsonParse(tiposResponse)
        console.log("✅ Tipos de veículo carregados:", tiposData)
        setTiposVeiculo(Array.isArray(tiposData) ? tiposData : [])

        // Buscar veículos
        console.log("Buscando veículos...")
        const veiculosResponse = await fetch("/api/veiculos")
        console.log("Status veículos:", veiculosResponse.status)

        if (!veiculosResponse.ok) {
          const errorData = await safeJsonParse(veiculosResponse)
          throw new Error(`Falha ao carregar veículos: ${errorData.error || veiculosResponse.status}`)
        }

        const veiculosData = await safeJsonParse(veiculosResponse)
        console.log("✅ Veículos carregados:", veiculosData)
        setVeiculos(Array.isArray(veiculosData) ? veiculosData : [])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao carregar dados"
        console.error("❌ Erro ao carregar dados:", error)
        showError(`Erro ao carregar dados: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    // Só carregar dados se a conexão estiver OK
    if (connectionSuccess === true) {
      fetchData()
    } else if (connectionSuccess === false) {
      setLoading(false)
      showError("Falha na conexão com o banco de dados")
    }
  }, [connectionSuccess])

  // Função para adicionar veículo
  const handleAddVeiculo = async (veiculo: Omit<Veiculo, "id" | "dt_criacao" | "dt_atualizacao">) => {
    try {
      const response = await fetch("/api/veiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(veiculo),
      })

      if (!response.ok) {
        const errorData = await safeJsonParse(response)
        throw new Error(errorData.error || "Falha ao adicionar veículo")
      }

      const novoVeiculo = await safeJsonParse(response)
      setVeiculos([novoVeiculo, ...veiculos])
      setActiveTab("lista")

      showSuccess(`✅ Veículo ${veiculo.nr_placa} cadastrado com sucesso!`)
      console.log("✅ Veículo cadastrado com sucesso!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar veículo"
      console.error("❌ Erro ao adicionar veículo:", error)

      if (errorMessage.includes("duplicate key")) {
        showError(`❌ Erro: A placa ${veiculo.nr_placa} já está cadastrada no sistema.`)
      } else {
        showError(`❌ Erro ao cadastrar veículo: ${errorMessage}`)
      }
    }
  }

  // Função para atualizar veículo
  const handleUpdateVeiculo = async (id: number, veiculo: Partial<Veiculo>) => {
    try {
      const response = await fetch(`/api/veiculos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(veiculo),
      })

      if (!response.ok) {
        const errorData = await safeJsonParse(response)
        throw new Error(errorData.error || "Falha ao atualizar veículo")
      }

      const veiculoAtualizado = await safeJsonParse(response)
      setVeiculos(veiculos.map((v) => (v.id === id ? veiculoAtualizado : v)))
      setActiveTab("lista")
      setSelectedVeiculo(null)

      showSuccess(`✅ Veículo ${veiculoAtualizado.nr_placa} atualizado com sucesso!`)
      console.log("✅ Veículo atualizado com sucesso!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar veículo"
      console.error("❌ Erro ao atualizar veículo:", error)
      showError(`❌ Erro ao atualizar veículo: ${errorMessage}`)
    }
  }

  // Função para excluir veículo
  const handleDeleteVeiculo = async (id: number) => {
    const veiculo = veiculos.find((v) => v.id === id)
    const placa = veiculo?.nr_placa || `ID ${id}`

    try {
      const response = await fetch(`/api/veiculos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await safeJsonParse(response)

        // Mensagens específicas para diferentes tipos de erro
        if (response.status === 409) {
          if (errorData.error.includes("tickets associados")) {
            showError(
              `⚠️ Não é possível excluir o veículo ${placa}.\n\nMotivo: Este veículo possui histórico de entradas/saídas no estacionamento.\n\nPara excluir este veículo, primeiro você precisa remover ou transferir todos os tickets associados a ele.`,
            )
          } else if (errorData.error.includes("mensalista")) {
            showError(
              `⚠️ Não é possível excluir o veículo ${placa}.\n\nMotivo: Este veículo está vinculado a um mensalista.\n\nPara excluir este veículo, primeiro remova a associação com o mensalista.`,
            )
          } else {
            showError(`⚠️ Não é possível excluir o veículo ${placa}.\n\nMotivo: ${errorData.error}`)
          }
        } else {
          throw new Error(errorData.error || "Falha ao excluir veículo")
        }
        return
      }

      setVeiculos(veiculos.filter((v) => v.id !== id))
      showSuccess(`✅ Veículo ${placa} excluído com sucesso!`)
      console.log("✅ Veículo excluído com sucesso!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir veículo"
      console.error("❌ Erro ao excluir veículo:", error)
      showError(`❌ Erro ao excluir veículo ${placa}: ${errorMessage}`)
    }
  }

  // Função para editar veículo
  const handleEditVeiculo = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo)
    setActiveTab("editar")
  }

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setSelectedVeiculo(null)
    setActiveTab("lista")
  }

  if (loading || connectionSuccess === null) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            <span className="mt-2">{connectionSuccess === null ? "Testando conexão..." : "Carregando dados..."}</span>
            {connectionStatus && (
              <div className="mt-2 flex items-center text-sm">
                {connectionSuccess === true && <CheckCircle className="h-4 w-4 text-green-500 mr-1" />}
                {connectionSuccess === false && <AlertCircle className="h-4 w-4 text-red-500 mr-1" />}
                <span className={connectionSuccess === true ? "text-green-600" : "text-red-600"}>
                  {connectionStatus}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connectionSuccess === false) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col">
              <span>Falha na conexão com o banco de dados</span>
              {connectionStatus && <span className="mt-2 text-sm">{connectionStatus}</span>}
              <div className="mt-4 space-x-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open("/api/test-connection", "_blank")}>
                  Testar API
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Cadastro de Veículos</h2>
          {activeTab === "lista" && (
            <Button onClick={() => setActiveTab("adicionar")} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Plus className="mr-2 h-4 w-4" /> Novo Veículo
            </Button>
          )}
        </div>

        {/* Mensagens de Feedback */}
        {successMessage && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 whitespace-pre-line">{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="lista">Lista de Veículos ({veiculos.length})</TabsTrigger>
            <TabsTrigger value="adicionar" disabled={activeTab === "editar"}>
              Adicionar Veículo
            </TabsTrigger>
            {activeTab === "editar" && <TabsTrigger value="editar">Editar Veículo</TabsTrigger>}
          </TabsList>

          <TabsContent value="lista">
            <VeiculosList
              veiculos={veiculos}
              tiposVeiculo={tiposVeiculo}
              onEdit={handleEditVeiculo}
              onDelete={handleDeleteVeiculo}
            />
          </TabsContent>

          <TabsContent value="adicionar">
            <VeiculoForm
              tiposVeiculo={tiposVeiculo}
              onSubmit={handleAddVeiculo}
              onCancel={() => setActiveTab("lista")}
            />
          </TabsContent>

          <TabsContent value="editar">
            {selectedVeiculo && (
              <VeiculoForm
                tiposVeiculo={tiposVeiculo}
                veiculo={selectedVeiculo}
                onSubmit={(data) => handleUpdateVeiculo(selectedVeiculo.id, data)}
                onCancel={handleCancelEdit}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
