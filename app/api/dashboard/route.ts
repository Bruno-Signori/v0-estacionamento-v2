import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { obterInicioDiaBrasil, obterFimDiaBrasil } from "@/lib/utils/date-utils"

export async function GET() {
  try {
    console.log("Iniciando busca de dados do dashboard...")

    // Obter datas do dia atual no horário de Brasília
    const inicioDia = obterInicioDiaBrasil()
    const fimDia = obterFimDiaBrasil()

    console.log("Período do dia:", {
      inicio: inicioDia.toISOString(),
      fim: fimDia.toISOString(),
    })

    // Buscar tickets ativos (sem saída registrada)
    const { data: ticketsAtivos, error: ticketsError } = await supabase
      .from("ticket")
      .select(`
        id,
        nr_ticket,
        nr_placa,
        dt_entrada,
        dt_saida,
        vl_pago,
        id_tipo_veiculo,
        tipo_veiculo:id_tipo_veiculo (
          nm_tipo
        )
      `)
      .is("dt_saida", null)
      .order("dt_entrada", { ascending: false })

    if (ticketsError) {
      console.error("Erro ao buscar tickets ativos:", ticketsError)
      // Não retornar erro, apenas logar e continuar
    }

    console.log("Tickets ativos encontrados:", ticketsAtivos?.length || 0)

    // Buscar receita de hoje
    const { data: receitaHoje, error: receitaError } = await supabase
      .from("ticket")
      .select("vl_pago")
      .not("vl_pago", "is", null)
      .gte("dt_entrada", inicioDia.toISOString())
      .lte("dt_entrada", fimDia.toISOString())

    if (receitaError) {
      console.error("Erro ao buscar receita de hoje:", receitaError)
    }

    console.log("Receita hoje encontrada:", receitaHoje?.length || 0, "registros")

    // Calcular totais
    const totalTicketsAtivos = ticketsAtivos?.length || 0
    const totalReceitaHoje = receitaHoje?.reduce((sum, ticket) => sum + (ticket.vl_pago || 0), 0) || 0

    // Buscar estatísticas gerais com tratamento de erro
    let totalTicketsCount = 0
    try {
      const { count: totalTickets, error: totalError } = await supabase
        .from("ticket")
        .select("id", { count: "exact", head: true })

      if (totalError) {
        console.error("Erro ao buscar total de tickets:", totalError)
      } else {
        totalTicketsCount = totalTickets || 0
      }
    } catch (error) {
      console.error("Erro na query de total de tickets:", error)
    }

    // Buscar total de veículos cadastrados com tratamento de erro
    let totalVeiculosCount = 0
    try {
      const { count: totalVeiculos, error: veiculosError } = await supabase
        .from("veiculo")
        .select("id", { count: "exact", head: true })

      if (veiculosError) {
        console.error("Erro ao buscar total de veículos:", veiculosError)
      } else {
        totalVeiculosCount = totalVeiculos || 0
      }
    } catch (error) {
      console.error("Erro na query de total de veículos:", error)
    }

    const responseData = {
      ticketsAtivos: ticketsAtivos || [],
      totalTicketsAtivos,
      totalReceitaHoje,
      totalTickets: totalTicketsCount,
      totalVeiculos: totalVeiculosCount,
      success: true,
      timestamp: new Date().toISOString(),
    }

    console.log("Dados do dashboard preparados:", {
      ticketsAtivos: responseData.ticketsAtivos.length,
      totalTicketsAtivos: responseData.totalTicketsAtivos,
      totalReceitaHoje: responseData.totalReceitaHoje,
      totalTickets: responseData.totalTickets,
      totalVeiculos: responseData.totalVeiculos,
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Erro crítico na API dashboard:", error)

    // Retornar dados padrão em caso de erro crítico
    return NextResponse.json(
      {
        error: `Erro interno do servidor: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        ticketsAtivos: [],
        totalTicketsAtivos: 0,
        totalReceitaHoje: 0,
        totalTickets: 0,
        totalVeiculos: 0,
        success: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
