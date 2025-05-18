"use client"

import { useState } from "react"
import { Sidebar } from "./components/sidebar"
import { DashboardCards } from "./components/dashboard-cards"
import { DashboardHeader } from "./components/dashboard-header"
import { AppHeader } from "./components/app-header"
import { QuickNav } from "./components/quick-nav"

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Dashboard" showBackButton={false} />
        <DashboardHeader setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-16 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao ParkGestor</h1>
              <p className="mt-2 text-gray-600">Gerencie seus estacionamentos de forma eficiente e prática</p>
            </div>

            {/* Dashboard Cards */}
            <DashboardCards />

            {/* Recent Activity Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividades Recentes</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Placa</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Entrada</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Saída</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Valor</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">ABC-1234</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Hoje, 09:45</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Hoje, 11:30</td>
                        <td className="px-6 py-4 text-sm text-gray-900">R$ 15,00</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Finalizado
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">DEF-5678</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Hoje, 10:15</td>
                        <td className="px-6 py-4 text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 text-sm text-gray-900">-</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Em andamento
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">GHI-9012</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Hoje, 08:30</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Hoje, 12:45</td>
                        <td className="px-6 py-4 text-sm text-gray-900">R$ 25,00</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Finalizado
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Resumo do Dia</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de entradas:</span>
                    <span className="font-medium">42</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de saídas:</span>
                    <span className="font-medium">38</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Veículos ativos:</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faturamento:</span>
                    <span className="font-medium text-green-600">R$ 1.250,00</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ocupação Atual</h3>
                <div className="mt-4 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-yellow-500 h-4 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                  <span className="ml-4 text-lg font-medium">65%</span>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>78 de 120 vagas ocupadas</p>
                  <p className="mt-1">Atualizado há 5 minutos</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tempo Médio</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Permanência:</span>
                    <span className="font-medium">2h 15min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pico de ocupação:</span>
                    <span className="font-medium">14:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket médio:</span>
                    <span className="font-medium">R$ 18,50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <QuickNav />
      </div>
    </div>
  )
}
