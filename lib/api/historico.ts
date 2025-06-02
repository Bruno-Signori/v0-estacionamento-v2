import { supabase } from "../supabase"
import type { HistoricoOperacao } from "@/types/supabase"

export async function registrarHistorico(
  tipoOperacao: string,
  idTicket: number | null = null,
  idUsuario: number | null = null,
  detalhes: any = null,
): Promise<HistoricoOperacao | null> {
  try {
    const novoHistorico: Omit<HistoricoOperacao, "id" | "dt_operacao"> = {
      tp_operacao: tipoOperacao,
      id_ticket: idTicket,
      id_usuario: idUsuario,
      ds_detalhes: detalhes,
    }

    const { data, error } = await supabase.from("historico_operacao").insert(novoHistorico).select().single()

    if (error) {
      console.error("Erro ao registrar histórico:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao registrar histórico:", error)
    return null
  }
}

export async function buscarHistorico(
  tipoOperacao?: string,
  dataInicio?: Date,
  dataFim?: Date,
  limite = 100,
): Promise<HistoricoOperacao[]> {
  try {
    let query = supabase.from("historico_operacao").select("*").order("dt_operacao", { ascending: false }).limit(limite)

    if (tipoOperacao) {
      query = query.eq("tp_operacao", tipoOperacao)
    }

    if (dataInicio) {
      query = query.gte("dt_operacao", dataInicio.toISOString())
    }

    if (dataFim) {
      query = query.lte("dt_operacao", dataFim.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error("Erro ao buscar histórico:", error)
      throw new Error("Falha ao buscar histórico")
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar histórico:", error)
    throw error
  }
}
