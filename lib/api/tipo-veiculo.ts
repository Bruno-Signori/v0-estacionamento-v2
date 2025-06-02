import { supabase } from "../supabase"
import type { TipoVeiculo } from "@/types/supabase"

export async function getTiposVeiculo(): Promise<TipoVeiculo[]> {
  const { data, error } = await supabase.from("tipo_veiculo").select("*").order("nm_tipo")

  if (error) {
    console.error("Erro ao buscar tipos de veículo:", error)
    throw new Error("Falha ao buscar tipos de veículo")
  }

  return data || []
}

export async function getTipoVeiculoById(id: number): Promise<TipoVeiculo | null> {
  const { data, error } = await supabase.from("tipo_veiculo").select("*").eq("id", id).single()

  if (error) {
    console.error(`Erro ao buscar tipo de veículo com ID ${id}:`, error)
    return null
  }

  return data
}

export async function createTipoVeiculo(
  tipoVeiculo: Omit<TipoVeiculo, "id" | "dt_criacao" | "dt_atualizacao">,
): Promise<TipoVeiculo | null> {
  const { data, error } = await supabase.from("tipo_veiculo").insert(tipoVeiculo).select().single()

  if (error) {
    console.error("Erro ao criar tipo de veículo:", error)
    throw new Error("Falha ao criar tipo de veículo")
  }

  return data
}

export async function updateTipoVeiculo(id: number, tipoVeiculo: Partial<TipoVeiculo>): Promise<TipoVeiculo | null> {
  const { data, error } = await supabase.from("tipo_veiculo").update(tipoVeiculo).eq("id", id).select().single()

  if (error) {
    console.error(`Erro ao atualizar tipo de veículo com ID ${id}:`, error)
    throw new Error("Falha ao atualizar tipo de veículo")
  }

  return data
}

export async function deleteTipoVeiculo(id: number): Promise<boolean> {
  const { error } = await supabase.from("tipo_veiculo").delete().eq("id", id)

  if (error) {
    console.error(`Erro ao excluir tipo de veículo com ID ${id}:`, error)
    throw new Error("Falha ao excluir tipo de veículo")
  }

  return true
}
