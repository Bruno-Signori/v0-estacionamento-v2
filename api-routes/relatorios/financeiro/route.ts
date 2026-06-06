import { NextResponse } from "next/server"
import { getRelatorioFinanceiro } from "@/lib/api/relatorios"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const tipoVeiculoId = searchParams.get('tipoVeiculoId')
    const tipoPagamento = searchParams.get('tipoPagamento')
    
    if (!dataInicio || !dataFim) {
      return NextResponse.json({ error: 'Datas de início e fim são obrigatórias' }, { status: 400 })
    }
    
    const relatorio = await getRelatorioFinanceiro(
      dataInicio,
      dataFim,
      tipoVeiculoId ? Number.parseInt(tipoVeiculoId) : undefined,
      tipoPagamento || undefined
    )
    
    return NextResponse.json(relatorio)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar relatório financeiro', details: String(error) }, { status: 500 })
  }}
