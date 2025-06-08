"use client"
import { useState } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, AlertCircle } from "lucide-react"
import { obterPrefixoDia } from "../lib/utils/ticket-utils"

interface SearchSequenceFormProps {
  onSearch: (ticketNumber: string) => void
  searchStatus: "idle" | "searching" | "found" | "not-found"
}

export function SearchSequenceForm({ onSearch, searchStatus }: SearchSequenceFormProps) {
  const [sequencialInput, setSequencialInput] = useState("")
  const [error, setError] = useState("")
  const prefixoDia = obterPrefixoDia()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!sequencialInput) {
      setError("Digite o número sequencial")
      return
    }

    if (sequencialInput.length > 3) {
      setError("Máximo 3 dígitos")
      return
    }

    if (!/^\d+$/.test(sequencialInput)) {
      setError("Apenas números são permitidos")
      return
    }

    // Formatar o número completo do ticket
    const sequencialFormatado = sequencialInput.padStart(3, "0")
    const ticketCompleto = `${prefixoDia}${sequencialFormatado}`
    onSearch(ticketCompleto)
  }

  // Função para lidar com a mudança no input de sequencial
  const handleSequencialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir apenas números e limitar a 3 dígitos
    const value = e.target.value.replace(/\D/g, "").slice(0, 3)
    setSequencialInput(value)
    setError("")
  }

  const isSearching = searchStatus === "searching"
  const isNotFound = searchStatus === "not-found"

  // Gerar preview do ticket completo
  const ticketPreview = sequencialInput ? `${prefixoDia}${sequencialInput.padStart(3, "0")}` : `${prefixoDia}___`

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Busca por Número do Ticket</h3>
        <p className="text-sm text-gray-600">Digite apenas os 3 últimos dígitos do ticket</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">Prefixo do Dia (Automático)</label>
            <Input
              value={prefixoDia}
              disabled
              className="rounded-xl border-gray-300 bg-gray-50 text-center font-mono text-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">Sequencial (3 dígitos)</label>
            <Input
              placeholder="001"
              className="rounded-xl border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 text-center font-mono text-lg"
              disabled={isSearching}
              value={sequencialInput}
              onChange={handleSequencialChange}
              maxLength={3}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        {/* Preview do ticket completo */}
        <div className="text-center">
          <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-600">Ticket completo: </span>
            <span className="font-mono text-lg font-bold text-gray-900">{ticketPreview}</span>
          </div>
        </div>

        {isNotFound && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Ticket não encontrado. Verifique o número sequencial.</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full rounded-xl bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-500"
          disabled={isSearching || !sequencialInput}
        >
          {isSearching ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Buscar Ticket
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
