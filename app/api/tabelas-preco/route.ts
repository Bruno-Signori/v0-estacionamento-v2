import { type NextRequest, NextResponse } from "next/server"
import {
  getTabelasPreco,
  getTabelaPrecoById,
  createTabelaPreco,
  updateTabelaPreco,
  deleteTabelaPreco,
} from "@/lib/api/tabela-preco"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const tabelaPreco = await getTabelaPrecoById(Number(id))

      if (!tabelaPreco) {
        return NextResponse.json({ error: "Tabela de preço não encontrada" }, { status: 404 })
      }

      return NextResponse.json(tabelaPreco)
    } else {
      const tabelasPreco = await getTabelasPreco()
      return NextResponse.json(tabelasPreco)
    }
  } catch (error) {
    console.error("Erro ao buscar tabelas de preço:", error)
    return NextResponse.json({ error: "Falha ao buscar tabelas de preço" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tabela, periodos } = body

    if (!tabela || !periodos || !Array.isArray(periodos)) {
      return NextResponse.json({ error: "Dados inválidos para criar tabela de preço" }, { status: 400 })
    }

    const novaTabelaPreco = await createTabelaPreco(tabela, periodos)
    return NextResponse.json(novaTabelaPreco, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar tabela de preço:", error)
    return NextResponse.json({ error: "Falha ao criar tabela de preço" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, tabela, periodos } = body

    if (!id || !tabela) {
      return NextResponse.json({ error: "Dados inválidos para atualizar tabela de preço" }, { status: 400 })
    }

    const tabelaPrecoAtualizada = await updateTabelaPreco(Number(id), tabela, periodos)
    return NextResponse.json(tabelaPrecoAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar tabela de preço:", error)
    return NextResponse.json({ error: "Falha ao atualizar tabela de preço" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "ID da tabela de preço não fornecido" },
        { status: 400 }
      )
    }
    
    await deleteTabelaPreco(Number(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir tabela de preço:", error)
    return NextResponse.json(
      { error: "\
