"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TipoVeiculo {
  id: number
  nm_tipo: string
}

interface VehicleFormProps {
  onSubmit: (plate: string, vehicleType: string) => void
  isLoading: boolean
  tiposVeiculo?: TipoVeiculo[]
}

export function VehicleForm({ onSubmit, isLoading, tiposVeiculo = [] }: VehicleFormProps) {
  const [plate, setPlate] = useState("")
  const [vehicleType, setVehicleType] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (plate && vehicleType) {
      onSubmit(plate.toUpperCase(), vehicleType)
    }
  }

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Converter para maiúsculas e limitar a 7 caracteres
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 7)
    setPlate(value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="plate">Placa do Veículo</Label>
        <Input
          id="plate"
          placeholder="ABC1234"
          value={plate}
          onChange={handlePlateChange}
          className="uppercase"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleType">Tipo de Veículo</Label>
        <Select value={vehicleType} onValueChange={setVehicleType} disabled={isLoading} required>
          <SelectTrigger id="vehicleType">
            <SelectValue placeholder="Selecione o tipo de veículo" />
          </SelectTrigger>
          <SelectContent>
            {tiposVeiculo.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.nm_tipo}>
                {tipo.nm_tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || !plate || !vehicleType}>
        {isLoading ? "Registrando..." : "Registrar Entrada"}
      </Button>
    </form>
  )
}
