"use client"
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
  searchTerm: z.string().min(3, "Digite pelo menos 3 caracteres").max(10, "Digite no máximo 10 caracteres"),
})

interface SearchVehicleFormProps {
  onSearch: (searchTerm: string) => void
  searchStatus: "idle" | "searching" | "found" | "not-found"
}

export function SearchVehicleForm({ onSearch, searchStatus }: SearchVehicleFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchTerm: "",
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSearch(values.searchTerm)
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
                  {...field}
                  placeholder="ABC1234 ou T01"
                  className="rounded-xl border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                  onChange={(e) => {
                    // Converter para maiúsculas automaticamente
                    field.onChange(e.target.value.toUpperCase())
                  }}
                  disabled={isSearching}
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
