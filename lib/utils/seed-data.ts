import { supabase } from "../supabase"

export async function seedTiposVeiculo() {
  const { data: existingData, error: checkError } = await supabase.from("tipo_veiculo").select("id").limit(1)

  if (checkError) {
    console.error("Erro ao verificar tipos de veículo existentes:", checkError)
    return false
  }

  // Se já existirem dados, não fazer o seed
  if (existingData && existingData.length > 0) {
    console.log("Tipos de veículo já existem, pulando seed")
    return true
  }

  const tiposVeiculo = [
    { nm_tipo: "carro", ds_descricao: "Automóvel de passeio" },
    { nm_tipo: "moto", ds_descricao: "Motocicleta" },
    { nm_tipo: "camionete", ds_descricao: "Caminhonete ou SUV" },
    { nm_tipo: "van", ds_descricao: "Van ou minivan" },
    { nm_tipo: "caminhao", ds_descricao: "Caminhão pequeno ou médio" },
  ]

  const { error: insertError } = await supabase.from("tipo_veiculo").insert(tiposVeiculo)

  if (insertError) {
    console.error("Erro ao inserir tipos de veículo:", insertError)
    return false
  }

  return true
}

export async function seedTabelasPreco() {
  // Verificar se já existem tabelas de preço
  const { data: existingData, error: checkError } = await supabase.from("tabela_preco").select("id").limit(1)

  if (checkError) {
    console.error("Erro ao verificar tabelas de preço existentes:", checkError)
    return false
  }

  // Se já existirem dados, não fazer o seed
  if (existingData && existingData.length > 0) {
    console.log("Tabelas de preço já existem, pulando seed")
    return true
  }

  // Buscar IDs dos tipos de veículo
  const { data: tiposVeiculo, error: tiposError } = await supabase.from("tipo_veiculo").select("id, nm_tipo")

  if (tiposError || !tiposVeiculo) {
    console.error("Erro ao buscar tipos de veículo:", tiposError)
    return false
  }

  // Mapear tipos de veículo por nome
  const tiposMap: Record<string, number> = {}
  tiposVeiculo.forEach((tipo) => {
    tiposMap[tipo.nm_tipo] = tipo.id
  })

  // Criar tabelas de preço
  const tabelasPreco = [
    {
      nm_tabela: "Carro - Padrão",
      ds_descricao: "Tabela padrão para carros",
      id_tipo_veiculo: tiposMap["carro"],
      fl_padrao: true,
      nr_tolerancia_minutos: 10,
      vl_maximo: 50,
      fl_ativo: true,
    },
    {
      nm_tabela: "Moto - Padrão",
      ds_descricao: "Tabela padrão para motos",
      id_tipo_veiculo: tiposMap["moto"],
      fl_padrao: true,
      nr_tolerancia_minutos: 15,
      vl_maximo: 30,
      fl_ativo: true,
    },
    {
      nm_tabela: "Caminhonete - Padrão",
      ds_descricao: "Tabela padrão para caminhonetes",
      id_tipo_veiculo: tiposMap["camionete"],
      fl_padrao: true,
      nr_tolerancia_minutos: 5,
      vl_maximo: 70,
      fl_ativo: true,
    },
    {
      nm_tabela: "Diária Executiva",
      ds_descricao: "Tabela especial para diárias",
      id_tipo_veiculo: tiposMap["carro"],
      fl_padrao: false,
      nr_tolerancia_minutos: 0,
      vl_maximo: 80,
      fl_ativo: true,
    },
  ]

  // Inserir tabelas de preço
  for (const tabela of tabelasPreco) {
    const { data: tabelaData, error: tabelaError } = await supabase
      .from("tabela_preco")
      .insert(tabela)
      .select()
      .single()

    if (tabelaError || !tabelaData) {
      console.error("Erro ao inserir tabela de preço:", tabelaError)
      continue
    }

    // Criar períodos para cada tabela
    let periodos = []

    if (tabela.nm_tabela.includes("Diária")) {
      periodos = [
        { id_tabela_preco: tabelaData.id, nm_periodo: "Até 12 horas", nr_minutos: 720, vl_preco: 50, nr_ordem: 1 },
        { id_tabela_preco: tabelaData.id, nm_periodo: "Diária Completa", nr_minutos: 1440, vl_preco: 80, nr_ordem: 2 },
      ]
    } else if (tabela.nm_tabela.includes("Carro")) {
      periodos = [
        { id_tabela_preco: tabelaData.id, nm_periodo: "Primeira Hora", nr_minutos: 60, vl_preco: 10, nr_ordem: 1 },
        { id_tabela_preco: tabelaData.id, nm_periodo: "Hora Adicional", nr_minutos: 60, vl_preco: 7, nr_ordem: 2 },
      ]
    } else if (tabela.nm_tabela.includes("Moto")) {
      periodos = [
        { id_tabela_preco: tabelaData.id, nm_periodo: "Primeira Hora", nr_minutos: 60, vl_preco: 5, nr_ordem: 1 },
        { id_tabela_preco: tabelaData.id, nm_periodo: "Hora Adicional", nr_minutos: 60, vl_preco: 3, nr_ordem: 2 },
      ]
    } else if (tabela.nm_tabela.includes("Caminhonete")) {
      periodos = [
        { id_tabela_preco: tabelaData.id, nm_periodo: "Primeira Hora", nr_minutos: 60, vl_preco: 15, nr_ordem: 1 },
        { id_tabela_preco: tabelaData.id, nm_periodo: "Hora Adicional", nr_minutos: 60, vl_preco: 10, nr_ordem: 2 },
      ]
    }

    if (periodos.length > 0) {
      const { error: periodosError } = await supabase.from("periodo_cobranca").insert(periodos)

      if (periodosError) {
        console.error("Erro ao inserir períodos de cobrança:", periodosError)
      }
    }
  }

  return true
}

export async function seedInitialData() {
  console.log("Iniciando seed de dados iniciais...")

  // Seed de tipos de veículo
  const tiposResult = await seedTiposVeiculo()
  console.log("Seed de tipos de veículo:", tiposResult ? "Sucesso" : "Falha")

  // Seed de tabelas de preço
  const tabelasResult = await seedTabelasPreco()
  console.log("Seed de tabelas de preço:", tabelasResult ? "Sucesso" : "Falha")

  return tiposResult && tabelasResult
}
