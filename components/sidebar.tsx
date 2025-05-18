"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutDashboard, Users, Car, Settings, ChevronDown, X, LogIn, LogOut, FileText, Search } from "lucide-react"

interface SidebarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false)
  const [isOperationsSubmenuOpen, setIsOperationsSubmenuOpen] = useState(false)

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-black text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
            <Link href="/" className="flex items-center">
              <div className="bg-yellow-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2">
                <Car className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold">ParkGestor</span>
            </Link>
            <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Sidebar content */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              <li>
                <Link href="/" className="flex items-center rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-800">
                  <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400" />
                  <span>Dashboard</span>
                </Link>
              </li>

              <li>
                <button
                  onClick={() => setIsOperationsSubmenuOpen(!isOperationsSubmenuOpen)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-800"
                >
                  <div className="flex items-center">
                    <Car className="mr-3 h-5 w-5 text-gray-400" />
                    <span>Operações</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOperationsSubmenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOperationsSubmenuOpen && (
                  <ul className="mt-1 space-y-1 pl-11">
                    <li>
                      <Link
                        href="/registro-entrada"
                        className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <div className="flex items-center">
                          <LogIn className="mr-2 h-4 w-4" />
                          <span>Registrar Entrada</span>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/registro-saida"
                        className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <div className="flex items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Registrar Saída</span>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/consulta"
                        className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <div className="flex items-center">
                          <Search className="mr-2 h-4 w-4" />
                          <span>Consultar Vagas</span>
                        </div>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <Link
                  href="/relatorios"
                  className="flex items-center rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-800"
                >
                  <FileText className="mr-3 h-5 w-5 text-gray-400" />
                  <span>Relatórios</span>
                </Link>
              </li>

              <li>
                <button
                  onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-800"
                >
                  <div className="flex items-center">
                    <Users className="mr-3 h-5 w-5 text-gray-400" />
                    <span>Cadastros</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isSubmenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isSubmenuOpen && (
                  <ul className="mt-1 space-y-1 pl-11">
                    <li>
                      <Link
                        href="/cadastros/pessoas"
                        className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        Pessoas
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/cadastros/estacionamentos"
                        className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        Estacionamentos
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/cadastros/veiculos"
                        className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        Veículos
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <Link
                  href="/configuracoes"
                  className="flex items-center rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-800"
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-400" />
                  <span>Configurações</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium">JD</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">João da Silva</p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
