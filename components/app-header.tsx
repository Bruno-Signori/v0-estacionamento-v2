"use client"

import Link from "next/link"
import { Home, ChevronLeft, Car, LogIn, LogOut, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

interface AppHeaderProps {
  title: string
  showBackButton?: boolean
}

export function AppHeader({ title, showBackButton = true }: AppHeaderProps) {
  const pathname = usePathname()
  const isDashboard = pathname === "/" || pathname === "/dashboard"
  const isEntryPage = pathname === "/registro-entrada"
  const isExitPage = pathname === "/registro-saida"
  const isAutoEntryPage = pathname === "/entrada-automatica"

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e título da página */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="bg-yellow-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2">
                <Car className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold hidden sm:block">ParkGestor</span>
            </Link>

            {!isDashboard && (
              <>
                <span className="mx-2 text-gray-300">/</span>
                <h1 className="text-lg font-medium text-gray-900">{title}</h1>
              </>
            )}
          </div>

          {/* Ações e navegação */}
          <div className="flex items-center space-x-2">
            {!isAutoEntryPage && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center rounded-xl border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                asChild
              >
                <Link href="/entrada-automatica">
                  <Camera className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Auto</span>
                </Link>
              </Button>
            )}

            {/* Botões de atalho para Registrar Entrada e Saída */}
            {!isEntryPage && !isAutoEntryPage && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                asChild
              >
                <Link href="/registro-entrada">
                  <LogIn className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Entrada</span>
                </Link>
              </Button>
            )}

            {!isExitPage && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center rounded-xl border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                asChild
              >
                <Link href="/registro-saida">
                  <LogOut className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Saída</span>
                </Link>
              </Button>
            )}

            {/* Botões existentes */}
            {showBackButton && !isDashboard && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent"
                asChild
              >
                <Link href="/">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </Link>
              </Button>
            )}

            {!isDashboard && (
              <Button
                variant="default"
                size="sm"
                className="flex items-center rounded-xl bg-black text-white hover:bg-gray-800"
                asChild
              >
                <Link href="/">
                  <Home className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
