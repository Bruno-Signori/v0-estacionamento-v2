import { supabase } from "../supabase"
import type { TabelaPreco, PeriodoCobranca, TabelaPrecoCompleta } from "@/types/supabase"

export async function getTabelasPreco(): Promise<TabelaPrecoCompleta[]> {
  const { data: tabelas, error: tabelasError } = await supabase
    .from("tabela_preco")
    .select(`
      *,
      tipo_veiculo (*)
    `)
    .order("nm_tabela")

  if (tabelasError) {
    console.error("Erro ao buscar tabelas de preço:", tabelasError)
    throw new Error("Falha ao buscar tabelas de preço")
  }

  // Buscar períodos para cada tabela
  const tabelasCompletas: TabelaPrecoCompleta[] = []

  for (const tabela of tabelas) {
    const { data: periodos, error: periodosError } = await supabase
      .from("periodo_cobranca")
      .select("*")
      .eq("id_tabela_preco", tabela.id)
      .order("nr_ordem")

    if (periodosError) {
      console.error(`Erro ao buscar períodos para tabela ${tabela.id}:`, periodosError)
      continue
    }

    tabelasCompletas.push({
      ...tabela,
      periodos: periodos || [],
    })
  }

  return tabelasCompletas
}

export async function getTabelaPrecoById(id: number): Promise<TabelaPrecoCompleta | null> {
  const { data: tabela, error: tabelaError } = await supabase
    .from("tabela_preco")
    .select(`
      *,
      tipo_veiculo (*)
    `)
    .eq("id", id)
    .single()

  if (tabelaError) {
    console.error(`Erro ao buscar tabela de preço com ID ${id}:`, tabelaError)
    return null
  }

  // Buscar períodos para a tabela
  const { data: periodos, error: periodosError } = await supabase
    .from("periodo_cobranca")
    .select("*")
    .eq("id_tabela_preco", id)
    .order("nr_ordem")

  if (periodosError) {
    console.error(`Erro ao buscar períodos para tabela ${id}:`, periodosError)
    return null
  }

  return {
    ...tabela,
    periodos: periodos || [],
  }
}

export async function getTabelaPrecoByTipoVeiculo(
  idTipoVeiculo: number,
  padrao = true,
): Promise<TabelaPrecoCompleta | null> {
  const query = supabase
    .from("tabela_preco")
    .select(`
      *,
      tipo_veiculo (*)
    `)
    .eq("id_tipo_veiculo", idTipoVeiculo)
    .eq("fl_ativo", true)

  if (padrao) {
    query.eq("fl_padrao", true)
  }

  const { data: tabela, error: tabelaError } = await query.single()

  if (tabelaError) {
    console.error(`Erro ao buscar tabela de preço para tipo de veículo ${idTipoVeiculo}:`, tabelaError)
    return null
  }

  // Buscar períodos para a tabela
  const { data: periodos, error: periodosError } = await supabase
    .from("periodo_cobranca")
    .select("*")
    .eq("id_tabela_preco", tabela.id)
    .order("nr_ordem")

  if (periodosError) {
    console.error(`Erro ao buscar períodos para tabela ${tabela.id}:`, periodosError)
    return null
  }

  return {
    ...tabela,
    periodos: periodos || [],
  }
}

export async function createTabelaPreco(
  tabela: Omit<TabelaPreco, "id" | "dt_criacao" | "dt_atualizacao">,
  periodos: Omit<PeriodoCobranca, "id" | "id_tabela_preco" | "dt_criacao">[],
): Promise<TabelaPrecoCompleta | null> {
  // Iniciar transação
  const { data: tabelaData, error: tabelaError } = await supabase.from("tabela_preco").insert(tabela).select().single()

  if (tabelaError) {
    console.error("Erro ao criar tabela de preço:", tabelaError)
    throw new Error("Falha ao criar tabela de preço")
  }

  // Inserir períodos
  const periodosComTabelaId = periodos.map((periodo) => ({
    ...periodo,
    id_tabela_preco: tabelaData.id,
  }))

  const { data: periodosData, error: periodosError } = await supabase
    .from("periodo_cobranca")
    .insert(periodosComTabelaId)
    .select()

  if (periodosError) {
    console.error("Erro ao criar períodos de cobrança:", periodosError)

    // Tentar excluir a tabela criada para evitar inconsistências
    await supabase.from("tabela_preco").delete().eq("id", tabelaData.id)

    throw new Error("Falha ao criar períodos de cobrança")
  }

  // Buscar tipo de veículo
  const { data: tipoVeiculo, error: tipoError } = await supabase
    .from("tipo_veiculo")
    .select("*")
    .eq("id", tabelaData.id_tipo_veiculo)
    .single()

  if (tipoError) {
    console.error("Erro ao buscar tipo de veículo:", tipoError)
  }

  return {
    ...tabelaData,
    tipo_veiculo: tipoVeiculo,
    periodos: periodosData || [],
  }
}

export async function updateTabelaPreco(
  id: number,
  tabela: Partial<TabelaPreco>,
  periodos?: Omit<PeriodoCobranca, "dt_criacao">[],
): Promise<TabelaPrecoCompleta | null> {
  // Atualizar tabela
  const { data: tabelaData, error: tabelaError } = await supabase
    .from("tabela_preco")
    .update(tabela)
    .eq("id", id)
    .select()
    .single()

  if (tabelaError) {
    console.error(`Erro ao atualizar tabela de preço com ID ${id}:`, tabelaError)
    throw new Error("Falha ao atualizar tabela de preço")
  }

  // Se periodos foram fornecidos, atualizar
  if (periodos) {
    // Excluir períodos existentes
    const { error: deleteError } = await supabase.from("periodo_cobranca").delete().eq("id_tabela_preco", id)

    if (deleteError) {
      console.error(`Erro ao excluir períodos da tabela ${id}:`, deleteError)
      throw new Error("Falha ao atualizar períodos de cobrança")
    }

    // Inserir novos períodos
    const periodosComTabelaId = periodos.map((periodo) => ({
      ...periodo,
      id_tabela_preco: id,
    }))

    const { data: periodosData, error: periodosError } = await supabase
      .from("periodo_cobranca")
      .insert(periodosComTabelaId)
      .select()

    if (periodosError) {
      console.error("Erro ao criar novos períodos de cobrança:", periodosError)
      throw new Error("Falha ao atualizar períodos de cobrança")
    }
  }

  // Buscar tabela completa atualizada
  return getTabelaPrecoById(id)
}

export async function deleteTabelaPreco(id: number): Promise<boolean> {
  // Excluir períodos primeiro (devido à restrição de chave estrangeira)
  const { error: periodosError } = await supabase.from("periodo_cobranca").delete().eq("id_tabela_preco", id)

  if (periodosError) {
    console.error(`Erro ao excluir períodos da tabela ${id}:`, periodosError)
    throw new Error("Falha ao excluir períodos de cobrança")
  }

  // Excluir tabela
  const { error: tabelaError } = await supabase.from("tabela_preco").delete().eq("id", id)

  if (tabelaError) {
    console.error(`Erro ao excluir tabela de preço com ID ${id}:`, tabelaError)
    throw new Error("Falha ao excluir tabela de preço")
  }

  return true
}
