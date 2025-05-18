import Link from "next/link"
import type React from "react"
import { LogIn, LogOut, Search, FileText } from "lucide-react"

export function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <ActionCard
        title="Registrar Entrada"
        description="Cadastre a entrada de um novo veículo"
        icon={<LogIn className="h-6 w-6" />}
        color="bg-blue-500"
      />

      <ActionCard
        title="Registrar Saída"
        description="Finalize o período de um veículo"
        icon={<LogOut className="h-6 w-6" />}
        color="bg-green-500"
      />

      <ActionCard
        title="Consultar Vagas"
        description="Verifique a disponibilidade atual"
        icon={<Search className="h-6 w-6" />}
        color="bg-yellow-500"
      />

      <ActionCard
        title="Emitir Relatório"
        description="Gere relatórios de ocupação e faturamento"
        icon={<FileText className="h-6 w-6" />}
        color="bg-purple-500"
      />
    </div>
  )
}

interface ActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

function ActionCard({ title, description, icon, color }: ActionCardProps) {
  // Determinar a URL com base no título
  const getUrl = () => {
    switch (title) {
      case "Registrar Entrada":
        return "/registro-entrada"
      case "Registrar Saída":
        return "/registro-saida"
      case "Consultar Vagas":
        return "/consulta"
      case "Emitir Relatório":
        return "/relatorios"
      default:
        return "/"
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-4`}>{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <Link href={getUrl()} className="text-sm font-medium text-yellow-600 hover:text-yellow-700">
          Acessar →
        </Link>
      </div>
    </div>
  )
}
