import { NextResponse } from "next/server"
import { seedInitialData } from "@/lib/utils/seed-data"

export async function GET() {
  try {
    const result = await seedInitialData()

    if (result) {
      return NextResponse.json({ success: true, message: "Dados iniciais inseridos com sucesso" })
    } else {
      return NextResponse.json({ success: false, message: "Falha ao inserir dados iniciais" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao executar seed:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao executar seed", error: String(error) },
      { status: 500 },
    )
  }
}
