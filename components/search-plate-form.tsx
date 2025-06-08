"use client"
import { useState } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, AlertCircle } from "lucide-react"

interface SearchPlateFormProps {
  onSearch: (plate: string) => void
  searchStatus: "idle" | "searching" | "found" | "not-found"
}

export function SearchPlateForm({ onSearch, searchStatus }: SearchPlateFormProps) {
  const [placaInput, setPlacaInput] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!placaInput) {
      setError("Digite a placa completa")
      return
    }

    if (placaInput.length < 7) {
      setError("Digite a placa completa")
      return
    }

    if (placaInput.length > 8) {
      setError("Placa muito longa")
      return
    }

    if (!/^[A-Z]{3}\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/.test(placaInput)) {
      setError("Formato de placa inválido")
      return
    }

    onSearch(placaInput)
  }

  // Função para lidar com a mudança no input de placa
  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Converter para maiúsculas e remover caracteres especiais
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8)
    setPlacaInput(value)
    setError("")
  }

  const isSearching = searchStatus === "searching"
  const isNotFound = searchStatus === "not-found"

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Busca por Placa do Veículo</h3>
        <p className="text-sm text-gray-600">Digite a placa completa do veículo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Placa do Veículo</label>
          <Input
            placeholder="ABC1234"
            className="rounded-xl border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 text-center font-mono text-lg"
            disabled={isSearching}
            value={placaInput}
            onChange={handlePlacaChange}
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        {isNotFound && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Veículo não encontrado. Verifique a placa ou se o veículo ainda está no estacionamento.
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full rounded-xl bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
          disabled={isSearching || !placaInput}
        >
          {isSearching ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Buscar por Placa
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
