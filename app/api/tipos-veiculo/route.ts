import { type NextRequest, NextResponse } from "next/server"
import { getTiposVeiculo, createTipoVeiculo, updateTipoVeiculo, deleteTipoVeiculo } from "@/lib/api/tipo-veiculo"

export async function GET() {
  try {
    const tiposVeiculo = await getTiposVeiculo()
    return NextResponse.json(tiposVeiculo)
  } catch (error) {
    console.error("Erro ao buscar tipos de veículo:", error)
    return NextResponse.json({ error: "Falha ao buscar tipos de veículo" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const novoTipoVeiculo = await createTipoVeiculo(body)
    return NextResponse.json(novoTipoVeiculo, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar tipo de veículo:", error)
    return NextResponse.json({ error: "Falha ao criar tipo de veículo" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "ID do tipo de veículo não fornecido" }, { status: 400 })
    }

    const tipoVeiculoAtualizado = await updateTipoVeiculo(id, data)
    return NextResponse.json(tipoVeiculoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar tipo de veículo:", error)
    return NextResponse.json({ error: "Falha ao atualizar tipo de veículo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID do tipo de veículo não fornecido" }, { status: 400 })
    }

    await deleteTipoVeiculo(Number(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir tipo de veículo:", error)
    return NextResponse.json({ error: "Falha ao excluir tipo de veículo" }, { status: 500 })
  }
}
