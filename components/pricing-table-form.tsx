"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Trash2, Clock, DollarSign, Timer, AlertCircle } from "lucide-react"
import type { PricingTable } from "../configuracoes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Esquema de validação para o formulário
const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  vehicleType: z.string({
    required_error: "Selecione o tipo de veículo",
  }),
  isDefault: z.boolean().default(false),
  toleranceMinutes: z.coerce.number().min(0, "A tolerância não pode ser negativa").default(0),
  maxValue: z.coerce.number().min(0, "O valor máximo não pode ser negativo").default(0),
  periods: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "O nome do período é obrigatório"),
        minutes: z.coerce.number().min(1, "O tempo deve ser maior que zero"),
        price: z.coerce.number().min(0, "O preço não pode ser negativo"),
      }),
    )
    .min(1, "Adicione pelo menos um período"),
})

interface PricingTableFormProps {
  initialData?: PricingTable
  onSubmit: (data: PricingTable) => void
  onCancel: () => void
}

export function PricingTableForm({ initialData, onSubmit, onCancel }: PricingTableFormProps) {
  // Inicializar o formulário com dados existentes ou valores padrão
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      vehicleType: "",
      isDefault: false,
      toleranceMinutes: 0,
      maxValue: 0,
      periods: [{ name: "Primeira Hora", minutes: 60, price: 0 }],
    },
  })

  // Configurar o array de campos para os períodos
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "periods",
  })

  // Função para adicionar um novo período
  const addPeriod = () => {
    append({ name: "", minutes: 30, price: 0 })
  }

  // Função para formatar o valor como moeda
  const formatCurrency = (value: number | string): string => {
    // Garantir que o valor seja um número
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value

    // Verificar se é um número válido
    if (isNaN(numValue)) return "0,00"

    return numValue.toFixed(2).replace(".", ",")
  }

  // Função para lidar com o envio do formulário
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Gerar IDs para novos períodos se necessário
    const periodsWithIds = values.periods.map((period) => ({
      ...period,
      id: period.id || `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }))

    // Criar o objeto final da tabela de preços
    const finalTable: PricingTable = {
      id: initialData?.id || `table-${Date.now()}`,
      name: values.name,
      description: values.description || "",
      vehicleType: values.vehicleType,
      isDefault: values.isDefault,
      toleranceMinutes: values.toleranceMinutes,
      maxValue: values.maxValue,
      periods: periodsWithIds,
    }

    onSubmit(finalTable)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Tabela</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Tarifa Padrão Carros" className="rounded-lg" {...field} />
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
                <FormLabel>Tipo de Veículo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Selecione o tipo de veículo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="camionete">Caminhonete</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva a finalidade desta tabela de preços"
                  className="rounded-lg resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Novos campos para tolerância e valor máximo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="toleranceMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <span>Tolerância (minutos)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-help">
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Período inicial durante o qual não será cobrado valor. Use 0 para desativar a tolerância.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Timer className="h-5 w-5 text-gray-400 mr-2" />
                    <Input type="number" min="0" className="rounded-lg" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  {Number(field.value) > 0
                    ? `Os primeiros ${field.value} minutos não serão cobrados.`
                    : "Sem período de tolerância."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <span>Valor Máximo (R$)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 cursor-help">
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Valor máximo que será cobrado, independentemente do tempo de permanência. Use 0 para não
                          definir um limite.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <Input type="number" min="0" step="0.01" className="rounded-lg" {...field} />
                  </div>
                </FormControl>
                <FormDescription>
                  {Number(field.value) > 0
                    ? `O valor cobrado não ultrapassará R$ ${formatCurrency(field.value)}.`
                    : "Sem limite de valor máximo."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Definir como tabela padrão</FormLabel>
                <FormDescription>
                  Esta tabela será usada automaticamente para o tipo de veículo selecionado.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium">Períodos e Valores</h4>
            <Button type="button" variant="outline" size="sm" onClick={addPeriod} className="rounded-lg">
              <PlusCircle className="h-4 w-4 mr-1" />
              Adicionar Período
            </Button>
          </div>

          {fields.length === 0 && (
            <div className="text-center py-4 border border-dashed rounded-lg">
              <p className="text-gray-500">Nenhum período configurado. Adicione pelo menos um período.</p>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                <FormField
                  control={form.control}
                  name={`periods.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="flex items-center">
                        <span>Nome do Período</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Primeira Hora" className="rounded-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`periods.${index}.minutes`}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-32">
                      <FormLabel className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Minutos</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="1" className="rounded-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`periods.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="w-full md:w-32">
                      <FormLabel className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        <span>Valor (R$)</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" className="rounded-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-end mb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
            Cancelar
          </Button>
          <Button type="submit" className="rounded-lg bg-yellow-500 text-black hover:bg-yellow-600">
            {initialData ? "Atualizar Tabela" : "Criar Tabela"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
