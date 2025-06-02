"use client"

import { useState, useEffect } from "react"
import { VehicleForm } from "./components/vehicle-form"
import { TicketDisplay } from "./components/ticket-display"
import { Card, CardContent } from "@/components/ui/card"
import { AppHeader } from "./components/app-header"
import { QuickNav } from "./components/quick-nav"
import { supabase } from "./lib/supabase"
import type { TipoVeiculo } from "./types/supabase"

export interface TicketData {
  ticketNumber: string
  plate: string
  vehicleType: string
  entryTime: Date
}

export default function RegistroEntrada() {
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tiposVeiculo, setTiposVeiculo] = useState<TipoVeiculo[]>([])

  useEffect(() => {
    loadTiposVeiculo()
  }, [])

  const loadTiposVeiculo = async () => {
    try {
      const { data, error } = await supabase.from("tipo_veiculo").select("*").order("nm_tipo")

      if (error) {
        console.error("Erro ao carregar tipos de veículo:", error)
        return
      }

      setTiposVeiculo(data || [])
    } catch (error) {
      console.error("Erro ao carregar tipos de veículo:", error)
    }
  }

  const gerarNumeroTicket = async (): Promise<string> => {
    try {
      // Buscar o último ticket para gerar um número sequencial
      const { data, error } = await supabase
        .from("ticket")
        .select("nr_ticket")
        .order("id", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Erro ao buscar último ticket:", error)
      }

      let proximoNumero = 1

      if (data && data.length > 0) {
        const ultimoTicket = data[0].nr_ticket
        // Extrair o número do ticket (assumindo formato T000001)
        const match = ultimoTicket.match(/\d+/)
        if (match) {
          proximoNumero = Number.parseInt(match[0], 10) + 1
        }
      }

      // Formatar com zeros à esquerda
      return `T${proximoNumero.toString().padStart(6, "0")}`
    } catch (error) {
      console.error("Erro ao gerar número de ticket:", error)
      return `T${Date.now().toString().slice(-6)}`
    }
  }

  const handleSubmit = async (plate: string, vehicleType: string) => {
    setIsLoading(true)

    try {
      // Encontrar o ID do tipo de veículo
      const tipoVeiculoObj = tiposVeiculo.find((tipo) => tipo.nm_tipo === vehicleType)
      if (!tipoVeiculoObj) {
        throw new Error("Tipo de veículo não encontrado")
      }

      // Verificar se o veículo já existe
      const { data: veiculoExistente, error: veiculoError } = await supabase
        .from("veiculo")
        .select("*")
        .eq("nr_placa", plate)
        .maybeSingle()

      let idVeiculo: number | null = null

      // Se o veículo não existe, criar
      if (!veiculoExistente && !veiculoError) {
        const { data: veiculoCriado, error: criacaoError } = await supabase
          .from("veiculo")
          .insert({
            nr_placa: plate,
            id_tipo_veiculo: tipoVeiculoObj.id,
            fl_mensalista: false,
          })
          .select()
          .single()

        if (criacaoError) {
          throw new Error("Falha ao criar veículo")
        }

        idVeiculo = veiculoCriado.id
      } else if (veiculoExistente) {
        idVeiculo = veiculoExistente.id

        // Atualizar tipo de veículo se for diferente
        if (veiculoExistente.id_tipo_veiculo !== tipoVeiculoObj.id) {
          await supabase.from("veiculo").update({ id_tipo_veiculo: tipoVeiculoObj.id }).eq("id", idVeiculo)
        }
      }

      // Gerar número de ticket
      const numeroTicket = await gerarNumeroTicket()

      // Criar ticket de entrada
      const { data: ticketCriado, error: ticketError } = await supabase
        .from("ticket")
        .insert({
          nr_ticket: numeroTicket,
          id_veiculo: idVeiculo,
          nr_placa: plate,
          id_tipo_veiculo: tipoVeiculoObj.id,
          dt_entrada: new Date().toISOString(),
          fl_pago: false,
        })
        .select()
        .single()

      if (ticketError) {
        throw new Error("Falha ao criar ticket")
      }

      // Registrar no histórico
      await supabase.from("historico_operacao").insert({
        tp_operacao: "entrada",
        id_ticket: ticketCriado.id,
        ds_detalhes: {
          placa: plate,
          tipo_veiculo: vehicleType,
          ticket: numeroTicket,
        },
      })

      setTicketData({
        ticketNumber: numeroTicket,
        plate,
        vehicleType,
        entryTime: new Date(),
      })
    } catch (error) {
      console.error("Erro ao registrar entrada:", error)
      alert("Erro ao registrar entrada. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader title="Registro de Entrada" />

      <div className="flex-1 p-4 md:p-8 pb-16 md:pb-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Registro de Entrada</h2>
            <p className="mt-2 text-gray-600">Preencha os dados do veículo para registrar a entrada</p>
          </header>

          <Card className="mb-8 overflow-hidden rounded-2xl border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <VehicleForm onSubmit={handleSubmit} isLoading={isLoading} tiposVeiculo={tiposVeiculo} />

              <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <p>
                  A cobrança será realizada com base na tabela de preços configurada para o tipo de veículo selecionado.
                </p>
              </div>
            </CardContent>
          </Card>

          {ticketData && <TicketDisplay ticketData={ticketData} />}
        </div>
      </div>

      <QuickNav />
    </div>
  )
}
