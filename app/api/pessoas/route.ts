import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const busca = searchParams.get("busca") || ""
    const tipo = searchParams.get("tipo") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    let query = supabase
      .from("pessoa")
      .select("*", { count: "exact" })
      .eq("fl_ativo", true)
      .order("nm_pessoa", { ascending: true })

    // Aplicar filtros
    if (busca) {
      query = query.or(`nm_pessoa.ilike.%${busca}%,nr_cpf_cnpj.ilike.%${busca}%,nm_email.ilike.%${busca}%`)
    }

    if (tipo && tipo !== "all") {
      query = query.eq("tp_pessoa", tipo)
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: pessoas, error, count } = await query

    if (error) {
      console.error("Erro ao buscar pessoas:", error)
      return NextResponse.json({ error: "Erro ao buscar pessoas", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      pessoas: pessoas || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Erro na API pessoas GET:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados obrigatórios - apenas nome é obrigatório
    if (!body.nm_pessoa || body.nm_pessoa.trim() === "") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    // Validar tipo de pessoa
    if (body.tp_pessoa && body.tp_pessoa !== "PF" && body.tp_pessoa !== "PJ") {
      return NextResponse.json({ error: "Tipo deve ser PF ou PJ" }, { status: 400 })
    }

    // Verificar se CPF/CNPJ já existe (se fornecido)
    if (body.nr_cpf_cnpj && body.nr_cpf_cnpj.trim() !== "") {
      const { data: existente } = await supabase
        .from("pessoa")
        .select("id")
        .eq("nr_cpf_cnpj", body.nr_cpf_cnpj.trim())
        .eq("fl_ativo", true)
        .maybeSingle()

      if (existente) {
        return NextResponse.json({ error: "CPF/CNPJ já cadastrado" }, { status: 400 })
      }
    }

    // Preparar dados para inserção - apenas campos que existem na tabela
    const pessoaData = {
      nm_pessoa: body.nm_pessoa.trim(),
      tp_pessoa: body.tp_pessoa || "PF",
      nr_cpf_cnpj: body.nr_cpf_cnpj && body.nr_cpf_cnpj.trim() !== "" ? body.nr_cpf_cnpj.trim() : null,
      nr_rg_ie: body.nr_rg_ie && body.nr_rg_ie.trim() !== "" ? body.nr_rg_ie.trim() : null,
      nm_email: body.nm_email && body.nm_email.trim() !== "" ? body.nm_email.trim() : null,
      nr_telefone: body.nr_telefone && body.nr_telefone.trim() !== "" ? body.nr_telefone.trim() : null,
      nr_celular: body.nr_celular && body.nr_celular.trim() !== "" ? body.nr_celular.trim() : null,
      ds_endereco: body.ds_endereco && body.ds_endereco.trim() !== "" ? body.ds_endereco.trim() : null,
      nr_cep: body.nr_cep && body.nr_cep.trim() !== "" ? body.nr_cep.trim() : null,
      nm_cidade: body.nm_cidade && body.nm_cidade.trim() !== "" ? body.nm_cidade.trim() : null,
      nm_estado: body.nm_estado && body.nm_estado.trim() !== "" ? body.nm_estado.trim().toUpperCase() : null,
      ds_observacoes: body.ds_observacoes && body.ds_observacoes.trim() !== "" ? body.ds_observacoes.trim() : null,
      fl_ativo: true,
    }

    const { data: pessoa, error } = await supabase.from("pessoa").insert([pessoaData]).select().single()

    if (error) {
      console.error("Erro ao criar pessoa:", error)
      return NextResponse.json({ error: "Erro ao criar pessoa", details: error.message }, { status: 500 })
    }

    return NextResponse.json(pessoa, { status: 201 })
  } catch (error) {
    console.error("Erro na API pessoas POST:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Dados inválidos enviados" }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
