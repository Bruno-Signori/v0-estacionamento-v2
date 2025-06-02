export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      configuracao: {
        Row: {
          id: number
          nm_chave: string
          vl_valor: string | null
          ds_descricao: string | null
          tp_valor: string | null
          dt_criacao: string
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          nm_chave: string
          vl_valor?: string | null
          ds_descricao?: string | null
          tp_valor?: string | null
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          nm_chave?: string
          vl_valor?: string | null
          ds_descricao?: string | null
          tp_valor?: string | null
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
      historico_operacao: {
        Row: {
          id: number
          tp_operacao: string
          id_ticket: number | null
          id_usuario: number | null
          ds_detalhes: Json | null
          dt_criacao: string
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          tp_operacao: string
          id_ticket?: number | null
          id_usuario?: number | null
          ds_detalhes?: Json | null
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          tp_operacao?: string
          id_ticket?: number | null
          id_usuario?: number | null
          ds_detalhes?: Json | null
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
      mensalista: {
        Row: {
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
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          nm_pessoa: string
          nr_cpf_cnpj?: string | null
          ds_email?: string | null
          nr_telefone?: string | null
          ds_endereco?: string | null
          nr_endereco?: string | null
          nr_cep?: string | null
          nm_bairro?: string | null
          nm_cidade?: string | null
          dt_vencimento?: string | null
          vl_mensalidade?: number | null
          fl_ativo?: boolean
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          nm_pessoa?: string
          nr_cpf_cnpj?: string | null
          ds_email?: string | null
          nr_telefone?: string | null
          ds_endereco?: string | null
          nr_endereco?: string | null
          nr_cep?: string | null
          nm_bairro?: string | null
          nm_cidade?: string | null
          dt_vencimento?: string | null
          vl_mensalidade?: number | null
          fl_ativo?: boolean
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
      mensalista_veiculo: {
        Row: {
          id: number
          id_mensalista: number
          id_veiculo: number
          dt_criacao: string
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          id_mensalista: number
          id_veiculo: number
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          id_mensalista?: number
          id_veiculo?: number
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
      periodo_cobranca: {
        Row: {
          id: number
          id_tabela_preco: number
          nm_periodo: string
          nr_minutos: number
          vl_preco: number
          nr_ordem: number
          dt_criacao: string
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          id_tabela_preco: number
          nm_periodo: string
          nr_minutos: number
          vl_preco: number
          nr_ordem: number
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          id_tabela_preco?: number
          nm_periodo?: string
          nr_minutos?: number
          vl_preco?: number
          nr_ordem?: number
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
      tabela_preco: {
        Row: {
          id: number
          nm_tabela: string
          ds_descricao: string | null
          id_tipo_veiculo: number
          fl_padrao: boolean
          nr_tolerancia_minutos: number
          vl_maximo: number
          fl_ativo: boolean
          dt_criacao: string
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          nm_tabela: string
          ds_descricao?: string | null
          id_tipo_veiculo: number
          fl_padrao?: boolean
          nr_tolerancia_minutos?: number
          vl_maximo?: number
          fl_ativo?: boolean
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          nm_tabela?: string
          ds_descricao?: string | null
          id_tipo_veiculo?: number
          fl_padrao?: boolean
          nr_tolerancia_minutos?: number
          vl_maximo?: number
          fl_ativo?: boolean
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
      ticket: {
        Row: {
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
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          nr_ticket: string
          id_veiculo?: number | null
          nr_placa: string
          id_tipo_veiculo: number
          dt_entrada: string
          dt_saida?: string | null
          nr_tempo_permanencia?: number | null
          id_tabela_preco?: number | null
          vl_pago?: number | null
          tp_pagamento?: string | null
          fl_pago?: boolean
          ds_observacoes?: string | null
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          nr_ticket?: string
          id_veiculo?: number | null
          nr_placa?: string
          id_tipo_veiculo?: number
          dt_entrada?: string
          dt_saida?: string | null
          nr_tempo_permanencia?: number | null
          id_tabela_preco?: number | null
          vl_pago?: number | null
          tp_pagamento?: string | null
          fl_pago?: boolean
          ds_observacoes?: string | null
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
      tipo_veiculo: {
        Row: {
          id: number
          nm_tipo: string
          ds_descricao: string | null
          dt_criacao: string
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          nm_tipo: string
          ds_descricao?: string | null
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          nm_tipo?: string
          ds_descricao?: string | null
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
      usuario: {
        Row: {
          id: number
          nm_usuario: string
          ds_email: string | null
          tp_perfil: string
          fl_ativo: boolean
          dt_criacao: string
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          nm_usuario: string
          ds_email?: string | null
          tp_perfil: string
          fl_ativo?: boolean
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          nm_usuario?: string
          ds_email?: string | null
          tp_perfil?: string
          fl_ativo?: boolean
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
      veiculo: {
        Row: {
          id: number
          nr_placa: string
          id_tipo_veiculo: number
          nm_modelo: string | null
          nm_cor: string | null
          ds_observacoes: string | null
          fl_mensalista: boolean
          dt_criacao: string
          dt_atualizacao: string | null
        }
        Insert: {
          id?: number
          nr_placa: string
          id_tipo_veiculo: number
          nm_modelo?: string | null
          nm_cor?: string | null
          ds_observacoes?: string | null
          fl_mensalista?: boolean
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
        Update: {
          id?: number
          nr_placa?: string
          id_tipo_veiculo?: number
          nm_modelo?: string | null
          nm_cor?: string | null
          ds_observacoes?: string | null
          fl_mensalista?: boolean
          dt_criacao?: string
          dt_atualizacao?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos para uso no aplicativo
export type Configuracao = Database["public"]["Tables"]["configuracao"]["Row"]
export type TipoVeiculo = Database["public"]["Tables"]["tipo_veiculo"]["Row"]
export type Veiculo = Database["public"]["Tables"]["veiculo"]["Row"]
export type TabelaPreco = Database["public"]["Tables"]["tabela_preco"]["Row"]
export type PeriodoCobranca = Database["public"]["Tables"]["periodo_cobranca"]["Row"]
export type Ticket = Database["public"]["Tables"]["ticket"]["Row"]
export type Usuario = Database["public"]["Tables"]["usuario"]["Row"]
export type Mensalista = Database["public"]["Tables"]["mensalista"]["Row"]
export type MensalistaVeiculo = Database["public"]["Tables"]["mensalista_veiculo"]["Row"]
export type HistoricoOperacao = Database["public"]["Tables"]["historico_operacao"]["Row"]

// Tipos compostos
export interface TabelaPrecoCompleta extends TabelaPreco {
  periodos: PeriodoCobranca[]
  tipo_veiculo?: TipoVeiculo
}

export interface TicketCompleto extends Ticket {
  veiculo?: Veiculo
  tipo_veiculo?: TipoVeiculo
  tabela_preco?: TabelaPrecoCompleta
}

export interface VeiculoCompleto extends Veiculo {
  tipo_veiculo?: TipoVeiculo
  mensalista?: Mensalista
}

export interface MensalistaCompleto extends Mensalista {
  veiculos?: VeiculoCompleto[]
}
