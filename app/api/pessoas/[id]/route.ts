import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const { data: pessoa, error } = await supabase.from("pessoa").select("*").eq("id", id).eq("fl_ativo", true).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 })
      }
      console.error("Erro ao buscar pessoa:", error)
      return NextResponse.json({ error: "Erro ao buscar pessoa", details: error.message }, { status: 500 })
    }

    return NextResponse.json(pessoa)
  } catch (error) {
    console.error("Erro na API pessoa GET:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()

    // Validar dados obrigatórios - apenas nome é obrigatório
    if (!body.nm_pessoa || body.nm_pessoa.trim() === "") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    // Validar tipo de pessoa
    if (body.tp_pessoa && body.tp_pessoa !== "PF" && body.tp_pessoa !== "PJ") {
      return NextResponse.json({ error: "Tipo deve ser PF ou PJ" }, { status: 400 })
    }

    // Verificar se CPF/CNPJ já existe em outra pessoa (se fornecido)
    if (body.nr_cpf_cnpj && body.nr_cpf_cnpj.trim() !== "") {
      const { data: existente } = await supabase
        .from("pessoa")
        .select("id")
        .eq("nr_cpf_cnpj", body.nr_cpf_cnpj.trim())
        .eq("fl_ativo", true)
        .neq("id", id)
        .maybeSingle()

      if (existente) {
        return NextResponse.json({ error: "CPF/CNPJ já cadastrado para outra pessoa" }, { status: 400 })
      }
    }

    // Preparar dados para atualização - apenas campos que existem na tabela
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
    }

    const { data: pessoa, error } = await supabase
      .from("pessoa")
      .update(pessoaData)
      .eq("id", id)
      .eq("fl_ativo", true)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 })
      }
      console.error("Erro ao atualizar pessoa:", error)
      return NextResponse.json({ error: "Erro ao atualizar pessoa", details: error.message }, { status: 500 })
    }

    return NextResponse.json(pessoa)
  } catch (error) {
    console.error("Erro na API pessoa PUT:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Dados inválidos enviados" }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Soft delete - apenas marcar como inativo
    const { data: pessoa, error } = await supabase
      .from("pessoa")
      .update({ fl_ativo: false })
      .eq("id", id)
      .eq("fl_ativo", true)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 })
      }
      console.error("Erro ao excluir pessoa:", error)
      return NextResponse.json({ error: "Erro ao excluir pessoa", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Pessoa excluída com sucesso" })
  } catch (error) {
    console.error("Erro na API pessoa DELETE:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
