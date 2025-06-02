"use client"
import { useState } from "react"
import type React from "react"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Car } from "lucide-react"
import type { TipoVeiculo } from "../types/supabase"

// Definindo o esquema de validação
const formSchema = z.object({
  plate: z
    .string()
    .min(7, "A placa deve ter no mínimo 7 caracteres")
    .max(8, "A placa deve ter no máximo 8 caracteres")
    .regex(/^[A-Z0-9]{7,8}$/, "Formato de placa inválido. Use letras maiúsculas e números."),
  vehicleType: z.string({
    required_error: "Selecione o tipo de veículo",
  }),
})

interface VehicleFormProps {
  onSubmit: (plate: string, vehicleType: string) => void
  isLoading: boolean
  tiposVeiculo: TipoVeiculo[]
}

export function VehicleForm({ onSubmit, isLoading, tiposVeiculo }: VehicleFormProps) {
  // Estado local para armazenar o valor da placa
  const [plateInput, setPlateInput] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: "",
      vehicleType: "",
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values.plate, values.vehicleType)
  }

  // Função para lidar com a mudança no input da placa
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Converter para maiúsculas
    const upperCaseValue = e.target.value.toUpperCase()
    // Atualizar o estado local
    setPlateInput(upperCaseValue)
    // Atualizar o valor no formulário
    form.setValue("plate", upperCaseValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  // Função para obter o nome amigável do tipo de veículo
  const getTipoVeiculoLabel = (nmTipo: string) => {
    const labels: Record<string, string> = {
      carro: "Carro",
      moto: "Moto",
      camionete: "Caminhonete",
      van: "Van",
      caminhao: "Caminhão",
    }
    return labels[nmTipo] || nmTipo.charAt(0).toUpperCase() + nmTipo.slice(1)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900">Placa do Veículo</FormLabel>
              <FormControl>
                <Input
                  placeholder="ABC1234"
                  className="rounded-xl border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                  value={plateInput}
                  onChange={handlePlateChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900">Tipo de Veículo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                    <SelectValue placeholder="Selecione o tipo de veículo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposVeiculo.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.nm_tipo}>
                      {getTipoVeiculoLabel(tipo.nm_tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full rounded-xl bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
              Processando...
            </>
          ) : (
            <>
              <Car className="mr-2 h-5 w-5" />
              Registrar Entrada
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
