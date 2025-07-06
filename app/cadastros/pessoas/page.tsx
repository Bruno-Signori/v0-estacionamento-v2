"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AppHeader } from "@/components/app-header"
import { Sidebar } from "@/components/sidebar"
import { QuickNav } from "@/components/quick-nav"
import { toast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, User, Building, Phone, Mail, MapPin, AlertCircle } from "lucide-react"

interface Pessoa {
  id: number
  nm_pessoa: string
  tp_pessoa: "PF" | "PJ"
  nr_cpf_cnpj?: string
  nr_rg_ie?: string
  nm_email?: string
  nr_telefone?: string
  nr_celular?: string
  ds_endereco?: string
  nr_cep?: string
  nm_cidade?: string
  nm_estado?: string
  ds_observacoes?: string
  dt_criacao: string
}

interface FormData {
  nm_pessoa: string
  tp_pessoa: "PF" | "PJ"
  nr_cpf_cnpj: string
  nr_rg_ie: string
  nm_email: string
  nr_telefone: string
  nr_celular: string
  ds_endereco: string
  nr_cep: string
  nm_cidade: string
  nm_estado: string
  ds_observacoes: string
}

const initialFormData: FormData = {
  nm_pessoa: "",
  tp_pessoa: "PF",
  nr_cpf_cnpj: "",
  nr_rg_ie: "",
  nm_email: "",
  nr_telefone: "",
  nr_celular: "",
  ds_endereco: "",
  nr_cep: "",
  nm_cidade: "",
  nm_estado: "",
  ds_observacoes: "",
}

export default function PessoasPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filterTipo, setFilterTipo] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const carregarPessoas = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (busca) params.append("busca", busca)
      if (filterTipo !== "all") params.append("tipo", filterTipo)

      const response = await fetch(`/api/pessoas?${params}`)

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Erro ao carregar pessoas"

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      setPessoas(data.pessoas || [])
    } catch (error) {
      console.error("Erro ao carregar pessoas:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPessoas()
  }, [busca, filterTipo])

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      // CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else {
      // CNPJ
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
  }

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value

    if (field === "nr_cpf_cnpj") {
      formattedValue = formatCpfCnpj(value)
    } else if (field === "nr_telefone" || field === "nr_celular") {
      formattedValue = formatPhone(value)
    } else if (field === "nr_cep") {
      formattedValue = formatCep(value)
    } else if (field === "nm_estado") {
      formattedValue = value.toUpperCase().slice(0, 2)
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    // Validar nome obrigatório
    if (!formData.nm_pessoa.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const url = editingPessoa ? `/api/pessoas/${editingPessoa.id}` : "/api/pessoas"
      const method = editingPessoa ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Erro ao salvar pessoa"

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()

      toast({
        title: "Sucesso",
        description: `Pessoa ${editingPessoa ? "atualizada" : "cadastrada"} com sucesso`,
      })

      setDialogOpen(false)
      setEditingPessoa(null)
      setFormData(initialFormData)
      carregarPessoas()
    } catch (error) {
      console.error("Erro ao salvar pessoa:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (pessoa: Pessoa) => {
    setEditingPessoa(pessoa)
    setFormData({
      nm_pessoa: pessoa.nm_pessoa,
      tp_pessoa: pessoa.tp_pessoa,
      nr_cpf_cnpj: pessoa.nr_cpf_cnpj || "",
      nr_rg_ie: pessoa.nr_rg_ie || "",
      nm_email: pessoa.nm_email || "",
      nr_telefone: pessoa.nr_telefone || "",
      nr_celular: pessoa.nr_celular || "",
      ds_endereco: pessoa.ds_endereco || "",
      nr_cep: pessoa.nr_cep || "",
      nm_cidade: pessoa.nm_cidade || "",
      nm_estado: pessoa.nm_estado || "",
      ds_observacoes: pessoa.ds_observacoes || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta pessoa?")) return

    try {
      const response = await fetch(`/api/pessoas/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Erro ao excluir pessoa"

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`
        }

        throw new Error(errorMessage)
      }

      toast({
        title: "Sucesso",
        description: "Pessoa excluída com sucesso",
      })
      carregarPessoas()
    } catch (error) {
      console.error("Erro ao excluir pessoa:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleNewPessoa = () => {
    setEditingPessoa(null)
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  const filteredPessoas = pessoas.filter((pessoa) => {
    const matchesSearch =
      pessoa.nm_pessoa.toLowerCase().includes(busca.toLowerCase()) ||
      (pessoa.nr_cpf_cnpj || "").toLowerCase().includes(busca.toLowerCase()) ||
      (pessoa.nm_email || "").toLowerCase().includes(busca.toLowerCase())

    const matchesTipo = filterTipo === "all" || pessoa.tp_pessoa === filterTipo

    return matchesSearch && matchesTipo
  })

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Cadastro de Pessoas" showBackButton={true} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-16 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">Pessoas</h1>
                  <p className="text-muted-foreground">Gerenciar cadastro de pessoas físicas e jurídicas</p>
                </div>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewPessoa}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Pessoa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPessoa ? "Editar Pessoa" : "Nova Pessoa"}</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs
                      value={formData.tp_pessoa}
                      onValueChange={(value) => handleInputChange("tp_pessoa", value as "PF" | "PJ")}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="PF" className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Pessoa Física</span>
                        </TabsTrigger>
                        <TabsTrigger value="PJ" className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Pessoa Jurídica</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="PF" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nm_pessoa" className="text-sm font-medium">
                              Nome Completo <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="nm_pessoa"
                              value={formData.nm_pessoa}
                              onChange={(e) => handleInputChange("nm_pessoa", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="nr_cpf_cnpj" className="text-sm font-medium">
                              CPF
                            </Label>
                            <Input
                              id="nr_cpf_cnpj"
                              value={formData.nr_cpf_cnpj}
                              onChange={(e) => handleInputChange("nr_cpf_cnpj", e.target.value)}
                              placeholder="000.000.000-00"
                              maxLength={14}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="nr_rg_ie" className="text-sm font-medium">
                              RG
                            </Label>
                            <Input
                              id="nr_rg_ie"
                              value={formData.nr_rg_ie}
                              onChange={(e) => handleInputChange("nr_rg_ie", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="PJ" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nm_pessoa" className="text-sm font-medium">
                              Razão Social <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="nm_pessoa"
                              value={formData.nm_pessoa}
                              onChange={(e) => handleInputChange("nm_pessoa", e.target.value)}
                              required
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="nr_cpf_cnpj" className="text-sm font-medium">
                              CNPJ
                            </Label>
                            <Input
                              id="nr_cpf_cnpj"
                              value={formData.nr_cpf_cnpj}
                              onChange={(e) => handleInputChange("nr_cpf_cnpj", e.target.value)}
                              placeholder="00.000.000/0000-00"
                              maxLength={18}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="nr_rg_ie" className="text-sm font-medium">
                              Inscrição Estadual
                            </Label>
                            <Input
                              id="nr_rg_ie"
                              value={formData.nr_rg_ie}
                              onChange={(e) => handleInputChange("nr_rg_ie", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Contato */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center space-x-2">
                        <Phone className="h-5 w-5" />
                        <span>Contato</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="nm_email" className="text-sm font-medium">
                            E-mail
                          </Label>
                          <Input
                            id="nm_email"
                            type="email"
                            value={formData.nm_email}
                            onChange={(e) => handleInputChange("nm_email", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nr_telefone" className="text-sm font-medium">
                            Telefone
                          </Label>
                          <Input
                            id="nr_telefone"
                            value={formData.nr_telefone}
                            onChange={(e) => handleInputChange("nr_telefone", e.target.value)}
                            placeholder="(00) 0000-0000"
                            maxLength={15}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nr_celular" className="text-sm font-medium">
                            Celular
                          </Label>
                          <Input
                            id="nr_celular"
                            value={formData.nr_celular}
                            onChange={(e) => handleInputChange("nr_celular", e.target.value)}
                            placeholder="(00) 00000-0000"
                            maxLength={16}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Endereço</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="ds_endereco" className="text-sm font-medium">
                            Endereço
                          </Label>
                          <Input
                            id="ds_endereco"
                            value={formData.ds_endereco}
                            onChange={(e) => handleInputChange("ds_endereco", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nr_cep" className="text-sm font-medium">
                            CEP
                          </Label>
                          <Input
                            id="nr_cep"
                            value={formData.nr_cep}
                            onChange={(e) => handleInputChange("nr_cep", e.target.value)}
                            placeholder="00000-000"
                            maxLength={9}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nm_cidade" className="text-sm font-medium">
                            Cidade
                          </Label>
                          <Input
                            id="nm_cidade"
                            value={formData.nm_cidade}
                            onChange={(e) => handleInputChange("nm_cidade", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nm_estado" className="text-sm font-medium">
                            Estado
                          </Label>
                          <Input
                            id="nm_estado"
                            value={formData.nm_estado}
                            onChange={(e) => handleInputChange("nm_estado", e.target.value)}
                            maxLength={2}
                            placeholder="SP"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <Label htmlFor="ds_observacoes" className="text-sm font-medium">
                        Observações
                      </Label>
                      <Textarea
                        id="ds_observacoes"
                        value={formData.ds_observacoes}
                        onChange={(e) => handleInputChange("ds_observacoes", e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Salvando..." : editingPessoa ? "Atualizar" : "Cadastrar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Buscar Pessoas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={filterTipo} onValueChange={setFilterTipo}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Tipo de pessoa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="PF">Pessoa Física</SelectItem>
                      <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Pessoas */}
            <Card>
              <CardHeader>
                <CardTitle>Pessoas Cadastradas ({filteredPessoas.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                    <Button variant="outline" size="sm" onClick={carregarPessoas}>
                      Tentar novamente
                    </Button>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-8">Carregando pessoas...</div>
                ) : filteredPessoas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {busca || filterTipo !== "all" ? "Nenhuma pessoa encontrada" : "Nenhuma pessoa cadastrada"}
                    </h3>
                    <p className="text-gray-500">
                      {busca || filterTipo !== "all"
                        ? "Tente ajustar os filtros de busca."
                        : "Clique em 'Nova Pessoa' para começar."}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Vista desktop */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>CPF/CNPJ</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPessoas.map((pessoa) => (
                            <TableRow key={pessoa.id}>
                              <TableCell className="font-medium">{pessoa.nm_pessoa}</TableCell>
                              <TableCell>
                                <Badge variant={pessoa.tp_pessoa === "PF" ? "default" : "secondary"}>
                                  {pessoa.tp_pessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono">{pessoa.nr_cpf_cnpj || "-"}</TableCell>
                              <TableCell>{pessoa.nm_email || "-"}</TableCell>
                              <TableCell>{pessoa.nr_telefone || pessoa.nr_celular || "-"}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(pessoa)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleDelete(pessoa.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Vista mobile */}
                    <div className="md:hidden space-y-4">
                      {filteredPessoas.map((pessoa) => (
                        <Card key={pessoa.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {pessoa.tp_pessoa === "PF" ? (
                                  <User className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <Building className="h-5 w-5 text-green-500" />
                                )}
                                <span className="font-medium">{pessoa.nm_pessoa}</span>
                              </div>
                              <Badge variant={pessoa.tp_pessoa === "PF" ? "default" : "secondary"}>
                                {pessoa.tp_pessoa === "PF" ? "PF" : "PJ"}
                              </Badge>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                              {pessoa.nr_cpf_cnpj && (
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono">{pessoa.nr_cpf_cnpj}</span>
                                </div>
                              )}
                              {pessoa.nm_email && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{pessoa.nm_email}</span>
                                </div>
                              )}
                              {(pessoa.nr_telefone || pessoa.nr_celular) && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{pessoa.nr_telefone || pessoa.nr_celular}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => handleEdit(pessoa)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => handleDelete(pessoa.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <QuickNav />
      </div>
    </div>
  )
}
