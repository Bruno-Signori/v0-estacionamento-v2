import { type NextRequest, NextResponse } from "next/server"
import { registrarEntrada } from "@/lib/api/ticket"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { placa, idTipoVeiculo } = body

    // Validar dados de entrada
    if (!placa || !idTipoVeiculo) {
      return NextResponse.json({ error: "Placa e tipo de veículo são obrigatórios" }, { status: 400 })
    }

    // Validar formato da placa
    const placaLimpa = placa.toString().toUpperCase().trim()
    if (placaLimpa.length < 7) {
      return NextResponse.json({ error: "Formato de placa inválido" }, { status: 400 })
    }

    // Registrar entrada
    const ticket = await registrarEntrada(placaLimpa, Number(idTipoVeiculo))

    if (!ticket) {
      return NextResponse.json({ error: "Falha ao criar ticket" }, { status: 500 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error("Erro na API de entrada:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
