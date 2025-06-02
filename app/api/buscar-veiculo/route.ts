import { NextResponse } from "next/server"
import { getTicketByPlacaOrNumero } from "@/lib/api/ticket"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const termo = searchParams.get("termo")

    if (!termo) {
      return NextResponse.json({ error: "Termo de busca não fornecido" }, { status: 400 })
    }

    const ticket = await getTicketByPlacaOrNumero(termo)

    if (!ticket) {
      return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Erro ao buscar veículo:", error)
    return NextResponse.json({ error: "Erro ao buscar veículo" }, { status: 500 })
  }
}
