import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Base de dados simulada de marcas/modelos por placa
// Em produção, integrar com API real como API Placa, Consulta Veículo, etc.
const MARCAS_MODELOS = [
  { marca: "Volkswagen", modelo: "Gol", cor: "Prata" },
  { marca: "Fiat", modelo: "Uno", cor: "Branco" },
  { marca: "Chevrolet", modelo: "Onix", cor: "Preto" },
  { marca: "Ford", modelo: "Ka", cor: "Vermelho" },
  { marca: "Honda", modelo: "Civic", cor: "Cinza" },
  { marca: "Toyota", modelo: "Corolla", cor: "Prata" },
  { marca: "Hyundai", modelo: "HB20", cor: "Branco" },
  { marca: "Renault", modelo: "Sandero", cor: "Preto" },
  { marca: "Jeep", modelo: "Renegade", cor: "Verde" },
  { marca: "Nissan", modelo: "Kicks", cor: "Azul" },
  { marca: "Volkswagen", modelo: "Polo", cor: "Prata" },
  { marca: "Fiat", modelo: "Argo", cor: "Vermelho" },
  { marca: "Chevrolet", modelo: "Tracker", cor: "Branco" },
  { marca: "Honda", modelo: "HR-V", cor: "Cinza" },
  { marca: "Toyota", modelo: "Hilux", cor: "Prata" },
]

async function consultarPlacaExterna(placa: string) {
  // Em produção, fazer consulta real à API de placas
  // Por enquanto, simular com dados aleatórios

  const randomIndex = Math.floor(Math.random() * MARCAS_MODELOS.length)
  const veiculo = MARCAS_MODELOS[randomIndex]

  return {
    ...veiculo,
    placa,
    ano: 2018 + Math.floor(Math.random() * 7), // 2018-2024
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const placa = searchParams.get("placa")

    if (!placa) {
      return NextResponse.json({ error: "Placa não fornecida" }, { status: 400 })
    }

    const placaFormatada = placa.toUpperCase().replace(/[^A-Z0-9]/g, "")

    // Primeiro, verificar se o veículo já existe no banco
    const { data: veiculoExistente } = await supabase
      .from("veiculo")
      .select(`
        *,
        tipo_veiculo:id_tipo_veiculo (
          id,
          nm_tipo
        )
      `)
      .eq("nr_placa", placaFormatada)
      .maybeSingle()

    if (veiculoExistente) {
      // Veículo já cadastrado, retornar dados existentes
      return NextResponse.json({
        placa: veiculoExistente.nr_placa,
        marca: veiculoExistente.nm_modelo?.split(" ")[0] || "Não informada",
        modelo: veiculoExistente.nm_modelo || "Não informado",
        cor: veiculoExistente.nm_cor || "Não informada",
        tipoVeiculo: veiculoExistente.tipo_veiculo?.nm_tipo || "Carro",
        tipoVeiculoId: veiculoExistente.id_tipo_veiculo,
        cadastrado: true,
        mensalista: veiculoExistente.fl_mensalista,
      })
    }

    // Veículo não cadastrado, consultar API externa
    const dadosExternos = await consultarPlacaExterna(placaFormatada)

    // Buscar tipo de veículo padrão (Carro)
    const { data: tiposPadrao } = await supabase
      .from("tipo_veiculo")
      .select("id, nm_tipo")
      .ilike("nm_tipo", "%carro%")
      .limit(1)

    const tipoVeiculoId = tiposPadrao?.[0]?.id || 1
    const tipoVeiculo = tiposPadrao?.[0]?.nm_tipo || "Carro"

    return NextResponse.json({
      placa: placaFormatada,
      marca: dadosExternos.marca,
      modelo: dadosExternos.modelo,
      cor: dadosExternos.cor,
      ano: dadosExternos.ano,
      tipoVeiculo,
      tipoVeiculoId,
      cadastrado: false,
      mensalista: false,
    })
  } catch (error) {
    console.error("Erro ao consultar veículo:", error)
    return NextResponse.json({ error: "Erro ao consultar veículo" }, { status: 500 })
  }
}
