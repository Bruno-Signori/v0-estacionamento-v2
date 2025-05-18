"use client"
import { useState } from "react"
import type React from "react"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search, AlertCircle } from "lucide-react"

// Definindo o esquema de validação
const formSchema = z.object({
  searchTerm: z.string().min(2, "Digite pelo menos 2 caracteres").max(10, "Digite no máximo 10 caracteres"),
})

interface SearchVehicleFormProps {
  onSearch: (searchTerm: string) => void
  searchStatus: "idle" | "searching" | "found" | "not-found"
}

export function SearchVehicleForm({ onSearch, searchStatus }: SearchVehicleFormProps) {
  // Estado local para armazenar o termo de busca
  const [searchInput, setSearchInput] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchTerm: "",
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSearch(values.searchTerm)
  }

  // Função para lidar com a mudança no input de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Converter para maiúsculas
    const upperCaseValue = e.target.value.toUpperCase()
    // Atualizar o estado local
    setSearchInput(upperCaseValue)
    // Atualizar o valor no formulário
    form.setValue("searchTerm", upperCaseValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const isSearching = searchStatus === "searching"
  const isNotFound = searchStatus === "not-found"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="searchTerm"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900">Placa do Veículo ou Número do Ticket</FormLabel>
              <FormControl>
                <Input
                  placeholder="ABC1234 ou 1234"
                  className="rounded-xl border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                  disabled={isSearching}
                  value={searchInput}
                  onChange={handleSearchChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isNotFound && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Veículo não encontrado. Verifique a placa ou número do ticket.</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full rounded-xl bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-500"
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Buscar Veículo
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
