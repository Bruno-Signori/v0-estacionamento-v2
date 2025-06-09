"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Save, X } from "lucide-react"
import type { Veiculo, TipoVeiculo } from "@/types/supabase"

interface VeiculoFormProps {
  veiculo?: Veiculo
  tiposVeiculo: TipoVeiculo[]
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function VeiculoForm({ veiculo, tiposVeiculo, onSubmit, onCancel }: VeiculoFormProps) {
  const [formData, setFormData] = useState({
    nr_placa: "",
    id_tipo_veiculo: "",
    nm_modelo: "",
    nm_cor: "",
    ds_observacoes: "",
    fl_mensalista: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (veiculo) {
      setFormData({
        nr_placa: veiculo.nr_placa || "",
        id_tipo_veiculo: veiculo.id_tipo_veiculo?.toString() || "",
        nm_modelo: veiculo.nm_modelo || "",
        nm_cor: veiculo.nm_cor || "",
        ds_observacoes: veiculo.ds_observacoes || "",
        fl_mensalista: veiculo.fl_mensalista || false,
      })
    }
  }, [veiculo])

  // Atualizar campo do formulário
  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })

    // Limpar erro do campo quando ele for alterado
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  // Validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nr_placa) {
      newErrors.nr_placa = "A placa é obrigatória"
    } else if (!/^[A-Z0-9]{7,8}$/.test(formData.nr_placa)) {
      newErrors.nr_placa = "Formato de placa inválido"
    }

    if (!formData.id_tipo_veiculo) {
      newErrors.id_tipo_veiculo = "O tipo de veículo é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Converter id_tipo_veiculo para número
      const dataToSubmit = {
        ...formData,
        id_tipo_veiculo: Number.parseInt(formData.id_tipo_veiculo),
      }

      onSubmit(dataToSubmit)
    }
  }

  // Formatar placa para maiúsculas
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8)

    handleChange("nr_placa", value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nr_placa">
            Placa <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nr_placa"
            value={formData.nr_placa}
            onChange={handlePlateChange}
            placeholder="ABC1234"
            className={errors.nr_placa ? "border-red-500" : ""}
            disabled={!!veiculo} // Desabilitar edição da placa se for atualização
          />
          {errors.nr_placa && <p className="text-sm text-red-500">{errors.nr_placa}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="id_tipo_veiculo">
            Tipo de Veículo <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.id_tipo_veiculo} onValueChange={(value) => handleChange("id_tipo_veiculo", value)}>
            <SelectTrigger id="id_tipo_veiculo" className={errors.id_tipo_veiculo ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione o tipo de veículo" />
            </SelectTrigger>
            <SelectContent>
              {tiposVeiculo.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id.toString()}>
                  {tipo.nm_tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.id_tipo_veiculo && <p className="text-sm text-red-500">{errors.id_tipo_veiculo}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nm_modelo">Modelo</Label>
          <Input
            id="nm_modelo"
            value={formData.nm_modelo}
            onChange={(e) => handleChange("nm_modelo", e.target.value)}
            placeholder="Ex: Honda Civic"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nm_cor">Cor</Label>
          <Input
            id="nm_cor"
            value={formData.nm_cor}
            onChange={(e) => handleChange("nm_cor", e.target.value)}
            placeholder="Ex: Prata"
          />
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <Label htmlFor="ds_observacoes">Observações</Label>
          <Textarea
            id="ds_observacoes"
            value={formData.ds_observacoes}
            onChange={(e) => handleChange("ds_observacoes", e.target.value)}
            placeholder="Observações sobre o veículo..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="fl_mensalista"
            checked={formData.fl_mensalista}
            onCheckedChange={(checked) => handleChange("fl_mensalista", checked)}
          />
          <Label htmlFor="fl_mensalista">Veículo de mensalista</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" /> Cancelar
        </Button>
        <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black">
          <Save className="mr-2 h-4 w-4" /> {veiculo ? "Atualizar" : "Cadastrar"} Veículo
        </Button>
      </div>
    </form>
  )
}
