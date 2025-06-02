import { supabase } from "../supabase"

// Registrar operação no histórico
export async function registrarHistorico(
  tipoOperacao: string,
  idTicket: number | null = null,
  idUsuario: number | null = null,
  detalhes: any = {},
): Promise<void> {
  try {
    await supabase.from("historico_operacao").insert({
      tp_operacao: tipoOperacao,
      id_ticket: idTicket,
      id_usuario: idUsuario,
      ds_detalhes: detalhes,
    })
  } catch (error) {
    console.error("Erro ao registrar histórico:", error)
    // Não lançar erro para não interromper o fluxo principal
  }
}

// Buscar histórico de operações
export async function buscarHistoricoOperacoes(limite = 20): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("historico_operacao")
      .select(`
        *,
        ticket (*),
        usuario (*)
      `)
      .order("dt_criacao", { ascending: false })
      .limit(limite)

    if (error) {
      console.error("Erro ao buscar histórico de operações:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar histórico de operações:", error)
    return []
  }
}

// Buscar histórico por tipo de operação
export async function buscarHistoricoPorTipo(tipoOperacao: string, limite = 20): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("historico_operacao")
      .select(`
        *,
        ticket (*),
        usuario (*)
      `)
      .eq("tp_operacao", tipoOperacao)
      .order("dt_criacao", { ascending: false })
      .limit(limite)

    if (error) {
      console.error(`Erro ao buscar histórico de operações do tipo ${tipoOperacao}:`, error)
      return []
    }

    return data || []
  } catch (error) {
    console.error(`Erro ao buscar histórico de operações do tipo ${tipoOperacao}:`, error)
    return []
  }
}
