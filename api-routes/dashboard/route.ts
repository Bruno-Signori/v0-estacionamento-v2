import { NextResponse } from "next/server"
import { getTicketsAtivos } from "@/lib/api/ticket"
import { getRelatorioFinanceiro } from "@/lib/api/relatorios"

export async function GET() {
  try {
    // Obter tickets ativos
    const ticketsAtivos = await getTicketsAtivos(5)

    // Obter dados financeiros do dia atual
    const hoje = new Date()
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59).toISOString()

    const dadosFinanceiros = await getRelatorioFinanceiro(inicioHoje, fimHoje)

    return NextResponse.json({
      ticketsAtivos,
      dadosFinanceiros,
    })
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error)
    return NextResponse.json({ error: "Erro ao buscar dados do dashboard" }, { status: 500 })
  }
}
