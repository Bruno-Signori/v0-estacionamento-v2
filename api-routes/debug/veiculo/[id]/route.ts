import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== DEBUG VEÍCULO ===")
    console.log("URL:", request.url)
    console.log("Params:", params)
    console.log("ID:", params.id)

    return NextResponse.json({
      success: true,
      message: "API funcionando",
      params,
      url: request.url,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro no debug:", error)
    return NextResponse.json(
      {
        error: "Erro no debug",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
