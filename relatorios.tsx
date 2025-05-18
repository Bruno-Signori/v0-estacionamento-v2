"\"use client"

import { useState } from "react"
import { AppHeader } from "./components/app-header"
import { QuickNav } from "./components/quick-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportFilters as ReportFiltersComponent } from "./components/report-filters"
import { FinancialReports } from "./components/financial-reports"
import { OccupancyReports } from "./components/occupancy-reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer, RefreshCw } from "lucide-react"

// Tipos para os filtros de relatório
export interface ReportFiltersType {
  dateRange: "today" | "yesterday" | "week" | "month" | "custom"
  startDate: Date | null
  endDate: Date | null
  vehicleType: string
  paymentMethod: string
}

// Dados simulados para os relatórios
export const mockFinancialData = {
  totalRevenue: 12580.5,
  averageTicket: 18.75,
  totalTransactions: 671,
  revenueByDay: [
    { date: "01/05", revenue: 1250.5 },
    { date: "02/05", revenue: 1380.0 },
    { date: "03/05", revenue: 1150.75 },
    { date: "04/05", revenue: 1420.25 },
    { date: "05/05", revenue: 1680.5 },
    { date: "06/05", revenue: 2100.0 },
    { date: "07/05", revenue: 1890.75 },
    { date: "08/05", revenue: 1708.25 },
  ],
  revenueByVehicleType: [
    { type: "Carro", revenue: 8750.5, percentage: 69.6 },
    { type: "Moto", revenue: 2350.0, percentage: 18.7 },
    { type: "Camionete", revenue: 1480.0, percentage: 11.7 },
  ],
  revenueByPaymentMethod: [
    { method: "Dinheiro", revenue: 5250.5, percentage: 41.7 },
    { method: "Cartão", revenue: 7330.0, percentage: 58.3 },
  ],
  recentTransactions: [
    {
      id: "T123",
      plate: "ABC1234",
      vehicleType: "Carro",
      entryTime: "10/05/2023 09:45",
      exitTime: "10/05/2023 11:30",
      duration: "1h 45min",
      amount: 15.0,
      paymentMethod: "Dinheiro",
    },
    {
      id: "T124",
      plate: "DEF5678",
      vehicleType: "Moto",
      entryTime: "10/05/2023 10:15",
      exitTime: "10/05/2023 12:45",
      duration: "2h 30min",
      amount: 10.0,
      paymentMethod: "Cartão",
    },
    {
      id: "T125",
      plate: "GHI9012",
      vehicleType: "Camionete",
      entryTime: "10/05/2023 11:30",
      exitTime: "10/05/2023 14:15",
      duration: "2h 45min",
      amount: 25.0,
      paymentMethod: "Dinheiro",
    },
    {
      id: "T126",
      plate: "JKL3456",
      vehicleType: "Carro",
      entryTime: "10/05/2023 12:00",
      exitTime: "10/05/2023 13:30",
      duration: "1h 30min",
      amount: 12.0,
      paymentMethod: "Cartão",
    },
    {
      id: "T127",
      plate: "MNO7890",
      vehicleType: "Moto",
      entryTime: "10/05/2023 13:45",
      exitTime: "10/05/2023 15:00",
      duration: "1h 15min",
      amount: 7.5,
      paymentMethod: "Cartão",
    },
  ],
}

export const mockOccupancyData = {
  currentOccupancy: {
    total: 120,
    occupied: 78,
    available: 42,
    percentage: 65,
  },
  occupancyByHour: [
    { hour: "08:00", occupancy: 25 },
    { hour: "09:00", occupancy: 42 },
    { hour: "10:00", occupancy: 58 },
    { hour: "11:00", occupancy: 67 },
    { hour: "12:00", occupancy: 75 },
    { hour: "13:00", occupancy: 80 },
    { hour: "14:00", occupancy: 85 },
    { hour: "15:00", occupancy: 82 },
    { hour: "16:00", occupancy: 78 },
    { hour: "17:00", occupancy: 65 },
    { hour: "18:00", occupancy: 45 },
    { hour: "19:00", occupancy: 30 },
  ],
  averageStayDuration: {
    overall: 125, // em minutos
    byVehicleType: [
      { type: "Carro", duration: 135 }, // em minutos
      { type: "Moto", duration: 95 }, // em minutos
      { type: "Camionete", duration: 160 }, // em minutos
    ],
  },
  peakHours: [
    { day: "Segunda", hour: "12:00 - 14:00" },
    { day: "Terça", hour: "12:00 - 14:00" },
    { day: "Quarta", hour: "12:00 - 14:00" },
    { day: "Quinta", hour: "12:00 - 14:00" },
    { day: "Sexta", hour: "15:00 - 17:00" },
    { day: "Sábado", hour: "10:00 - 12:00" },
    { day: "Domingo", hour: "11:00 - 13:00" },
  ],
  occupancyByVehicleType: [
    { type: "Carro", count: 52, percentage: 66.7 },
    { type: "Moto", count: 18, percentage: 23.1 },
    { type: "Camionete", count: 8, percentage: 10.2 },
  ],
}

export default function Relatorios() {
  // Estado para os filtros de relatório
  const [filters, setFilters] = useState<ReportFiltersType>({
    dateRange: "week",
    startDate: null,
    endDate: null,
    vehicleType: "all",
    paymentMethod: "all",
  })

  // Estado para controlar o carregamento dos relatórios
  const [isLoading, setIsLoading] = useState(false)

  // Função para atualizar os filtros
  const handleFilterChange = (newFilters: Partial<ReportFiltersType>) => {
    setFilters({ ...filters, ...newFilters })
  }

  // Função para gerar relatórios (simulação)
  const handleGenerateReport = () => {
    setIsLoading(true)
    // Simulando um tempo de carregamento
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader title="Relatórios" />

      <div className="flex-1 p-4 md:p-8 pb-16 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
            <p className="mt-2 text-gray-600">
              Visualize e exporte relatórios financeiros e de ocupação do seu estacionamento
            </p>
          </header>

          <Card className="mb-8 rounded-xl overflow-hidden border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <CardTitle className="text-lg font-medium">Filtros do Relatório</CardTitle>
              <CardDescription>Selecione o período e os filtros para gerar os relatórios</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ReportFiltersComponent filters={filters} onFilterChange={handleFilterChange} />

              <div className="flex justify-end mt-6 space-x-3">
                <Button
                  variant="outline"
                  className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() =>
                    setFilters({
                      dateRange: "week",
                      startDate: null,
                      endDate: null,
                      vehicleType: "all",
                      paymentMethod: "all",
                    })
                  }
                >
                  Limpar Filtros
                </Button>
                <Button
                  className="rounded-xl bg-yellow-500 text-black hover:bg-yellow-600"
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    "Gerar Relatório"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="financial" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 w-full max-w-md mx-auto">
              <TabsTrigger value="financial" className="rounded-l-lg">
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="occupancy" className="rounded-r-lg">
                Ocupação
              </TabsTrigger>
            </TabsList>

            <div className="flex justify-end mb-4 space-x-3">
              <Button variant="outline" className="rounded-xl" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline" className="rounded-xl" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>

            <TabsContent value="financial">
              <FinancialReports data={mockFinancialData} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="occupancy">
              <OccupancyReports data={mockOccupancyData} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <QuickNav />
    </div>
  )
}

export { ReportFiltersComponent as ReportFilters }
