"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { DollarSign, CreditCard, TrendingUp, ShoppingCart } from "lucide-react"

interface FinancialReportsProps {
  data: any
  isLoading: boolean
}

// Cores para os gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function FinancialReports({ data, isLoading }: FinancialReportsProps) {
  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`
  }

  if (isLoading) {
    return <FinancialReportsSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao período anterior</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.averageTicket)}</div>
            <p className="text-xs text-muted-foreground">+5.2% em relação ao período anterior</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">+12.5% em relação ao período anterior</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos com Cartão</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.revenueByPaymentMethod[1].percentage}%</div>
            <p className="text-xs text-muted-foreground">+8.3% em relação ao período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Faturamento por Dia</CardTitle>
            <CardDescription>Evolução do faturamento diário no período</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip formatter={(value) => [`R$ ${value}`, "Faturamento"]} />
                <Bar dataKey="revenue" fill="#FFBB28" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Distribuição de Faturamento</CardTitle>
            <CardDescription>Faturamento por tipo de veículo e forma de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="vehicle-type">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="vehicle-type">Por Tipo de Veículo</TabsTrigger>
                <TabsTrigger value="payment-method">Por Forma de Pagamento</TabsTrigger>
              </TabsList>
              <TabsContent value="vehicle-type" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.revenueByVehicleType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      nameKey="type"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {data.revenueByVehicleType.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`R$ ${value}`, "Faturamento"]} />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="payment-method" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.revenueByPaymentMethod}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      nameKey="method"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {data.revenueByPaymentMethod.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`R$ ${value}`, "Faturamento"]} />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de transações recentes */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas transações registradas no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ticket</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Placa</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Entrada</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Saída</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Duração</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Valor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentTransactions.map((transaction: any) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.plate}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.vehicleType}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{transaction.entryTime}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{transaction.exitTime}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.duration}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FinancialReportsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Cards de resumo skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[150px]" />
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Gráficos skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <Skeleton className="h-6 w-[180px] mb-2" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent className="h-80">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[280px]" />
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Tabela skeleton */}
      <Card className="rounded-xl">
        <CardHeader>
          <Skeleton className="h-6 w-[180px] mb-2" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
