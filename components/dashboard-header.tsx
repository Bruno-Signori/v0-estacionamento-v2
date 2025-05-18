"use client"

import { Menu, Bell, MapPin } from "lucide-react"

interface DashboardHeaderProps {
  setIsMobileMenuOpen: (open: boolean) => void
}

export function DashboardHeader({ setIsMobileMenuOpen }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6">
      <button className="lg:hidden mr-4" onClick={() => setIsMobileMenuOpen(true)}>
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1"></div>

      <div className="flex items-center space-x-4">
        <button className="relative p-1 rounded-full hover:bg-gray-100">
          <Bell className="h-6 w-6 text-gray-500" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-yellow-500"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 mr-2 hidden sm:block">Estacionamento Central</span>
          <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-black" />
          </div>
        </div>
      </div>
    </header>
  )
}
