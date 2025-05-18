"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { ReportFilters } from "../relatorios"

interface ReportFiltersProps {
  filters: ReportFilters
  onFilterChange: (filters: Partial<ReportFilters>) => void
}

export function ReportFilters({ filters, onFilterChange }: ReportFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(filters.startDate || undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(filters.endDate || undefined)

  const handleDateRangeChange = (value: string) => {
    onFilterChange({ dateRange: value as ReportFilters["dateRange"] })

    // Resetar datas personalizadas se não for custom
    if (value !== "custom") {
      setStartDate(undefined)
      setEndDate(undefined)
      onFilterChange({ startDate: null, endDate: null })
    }
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      onFilterChange({ startDate: date })
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      onFilterChange({ endDate: date })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Período</h3>
        <RadioGroup
          value={filters.dateRange}
          onValueChange={handleDateRangeChange}
          className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        >
          <div>
            <RadioGroupItem value="today" id="today" className="peer sr-only" />
            <Label
              htmlFor="today"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-yellow-500 [&:has([data-state=checked])]:border-yellow-500"
            >
              <span>Hoje</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="yesterday" id="yesterday" className="peer sr-only" />
            <Label
              htmlFor="yesterday"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-yellow-500 [&:has([data-state=checked])]:border-yellow-500"
            >
              <span>Ontem</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="week" id="week" className="peer sr-only" />
            <Label
              htmlFor="week"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-yellow-500 [&:has([data-state=checked])]:border-yellow-500"
            >
              <span>Últimos 7 dias</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="month" id="month" className="peer sr-only" />
            <Label
              htmlFor="month"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-yellow-500 [&:has([data-state=checked])]:border-yellow-500"
            >
              <span>Último mês</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
            <Label
              htmlFor="custom"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-yellow-500 [&:has([data-state=checked])]:border-yellow-500"
            >
              <span>Personalizado</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {filters.dateRange === "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl",
                    !endDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                  locale={ptBR}
                  disabled={(date) => (startDate ? date < startDate : false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-type">Tipo de Veículo</Label>
          <Select value={filters.vehicleType} onValueChange={(value) => onFilterChange({ vehicleType: value })}>
            <SelectTrigger id="vehicle-type" className="rounded-xl">
              <SelectValue placeholder="Selecione o tipo de veículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="carro">Carro</SelectItem>
              <SelectItem value="moto">Moto</SelectItem>
              <SelectItem value="camionete">Camionete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-method">Forma de Pagamento</Label>
          <Select value={filters.paymentMethod} onValueChange={(value) => onFilterChange({ paymentMethod: value })}>
            <SelectTrigger id="payment-method" className="rounded-xl">
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
