// Tipos que correspondem às tabelas do banco de dados

export interface TipoVeiculo {
  id: number
  nm_tipo: string
  ds_descricao: string | null
  dt_criacao: string
  dt_atualizacao: string
}

export interface TabelaPreco {
  id: number
  nm_tabela: string
  ds_descricao: string | null
  id_tipo_veiculo: number
  fl_padrao: boolean
  nr_tolerancia_minutos: number
  vl_maximo: number
  fl_ativo: boolean
  dt_criacao: string
  dt_atualizacao: string
}

export interface PeriodoCobranca {
  id: number
  id_tabela_preco: number
  nm_periodo: string
  nr_minutos: number
  vl_preco: number
  nr_ordem: number
  dt_criacao: string
}

export interface Veiculo {
  id: number
  nr_placa: string
  id_tipo_veiculo: number
  nm_modelo: string | null
  nm_cor: string | null
  ds_observacoes: string | null
  fl_mensalista: boolean
  dt_criacao: string
  dt_atualizacao: string
}

export interface Pessoa {
  id: number
  nm_pessoa: string
  nr_cpf_cnpj: string | null
  ds_email: string | null
  nr_telefone: string | null
  ds_endereco: string | null
  nr_endereco: string | null
  nr_cep: string | null
  nm_bairro: string | null
  nm_cidade: string | null
  nm_estado: string | null
  dt_nascimento: string | null
  tp_pessoa: "FISICA" | "JURIDICA"
  ds_observacoes: string | null
  fl_ativo: boolean
  dt_criacao: string
  dt_atualizacao: string
}

export interface Ticket {
  id: number
  nr_ticket: string
  id_veiculo: number | null
  nr_placa: string
  id_tipo_veiculo: number
  dt_entrada: string
  dt_saida: string | null
  nr_tempo_permanencia: number | null
  id_tabela_preco: number | null
  vl_pago: number | null
  tp_pagamento: string | null
  fl_pago: boolean
  ds_observacoes: string | null
  dt_criacao: string
  dt_atualizacao: string
}

export interface Usuario {
  id: number
  nm_usuario: string
  ds_email: string
  ds_senha_hash: string | null
  tp_perfil: string
  fl_ativo: boolean
  dt_ultimo_acesso: string | null
  dt_criacao: string
  dt_atualizacao: string
}

export interface Configuracao {
  id: number
  nm_chave: string
  vl_valor: string | null
  ds_descricao: string | null
  tp_valor: string
  dt_criacao: string
  dt_atualizacao: string
}

export interface Mensalista {
  id: number
  nm_pessoa: string
  nr_cpf_cnpj: string | null
  ds_email: string | null
  nr_telefone: string | null
  ds_endereco: string | null
  nr_endereco: string | null
  nr_cep: string | null
  nm_bairro: string | null
  nm_cidade: string | null
  dt_vencimento: string | null
  vl_mensalidade: number | null
  fl_ativo: boolean
  dt_criacao: string
  dt_atualizacao: string
}

export interface MensalistaVeiculo {
  id: number
  id_mensalista: number
  id_veiculo: number
  dt_criacao: string
}

export interface HistoricoOperacao {
  id: number
  tp_operacao: string
  id_ticket: number | null
  id_usuario: number | null
  ds_detalhes: any | null
  dt_operacao: string
}

// Tipos estendidos para uso na aplicação
export interface TabelaPrecoComTipoVeiculo extends TabelaPreco {
  tipo_veiculo: TipoVeiculo
}

export interface TabelaPrecoCompleta extends TabelaPreco {
  tipo_veiculo: TipoVeiculo
  periodos: PeriodoCobranca[]
}

export interface TicketCompleto extends Ticket {
  veiculo?: Veiculo
  tipo_veiculo: TipoVeiculo
  tabela_preco?: TabelaPreco
}

export interface PessoaCompleta extends Pessoa {
  veiculos?: Veiculo[]
}
