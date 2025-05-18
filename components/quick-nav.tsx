"use client"

import Link from "next/link"
import { Home, LogIn, LogOut, Search, FileText } from "lucide-react"
import { usePathname } from "next/navigation"

export function QuickNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 md:hidden">
      <div className="flex justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center ${pathname === "/" ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link
          href="/registro-entrada"
          className={`flex flex-col items-center ${pathname === "/registro-entrada" ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"}`}
        >
          <LogIn className="h-6 w-6" />
          <span className="text-xs mt-1">Entrada</span>
        </Link>
        <Link
          href="/registro-saida"
          className={`flex flex-col items-center ${pathname === "/registro-saida" ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"}`}
        >
          <LogOut className="h-6 w-6" />
          <span className="text-xs mt-1">Saída</span>
        </Link>
        <Link
          href="/consulta"
          className={`flex flex-col items-center ${pathname === "/consulta" ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"}`}
        >
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Consulta</span>
        </Link>
        <Link
          href="/relatorios"
          className={`flex flex-col items-center ${pathname === "/relatorios" ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500"}`}
        >
          <FileText className="h-6 w-6" />
          <span className="text-xs mt-1">Relatórios</span>
        </Link>
      </div>
    </div>
  )
}
