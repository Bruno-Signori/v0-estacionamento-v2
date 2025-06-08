import { supabase } from "../supabase"

export async function gerarNumeroTicketUnico(): Promise<string> {
  let tentativas = 0
  const maxTentativas = 10

  while (tentativas < maxTentativas) {
    try {
      // Buscar o maior número de ticket existente
      const { data: tickets, error } = await supabase
        .from("ticket")
        .select("nr_ticket")
        .order("nr_ticket", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Erro ao buscar tickets:", error)
      }

      let proximoNumero = 1

      if (tickets && tickets.length > 0) {
        // Extrair apenas números do ticket
        const ultimoNumero = tickets[0].nr_ticket.replace(/\D/g, "")
        if (ultimoNumero) {
          proximoNumero = Number.parseInt(ultimoNumero, 10) + 1
        }
      }

      // Adicionar tentativas para evitar conflitos
      proximoNumero += tentativas

      // Formatar número do ticket
      const numeroTicket = proximoNumero.toString().padStart(6, "0")

      // Verificar se já existe
      const { data: existente } = await supabase
        .from("ticket")
        .select("nr_ticket")
        .eq("nr_ticket", numeroTicket)
        .maybeSingle()

      if (!existente) {
        return numeroTicket
      }

      tentativas++
    } catch (error) {
      console.error("Erro na tentativa", tentativas, ":", error)
      tentativas++
    }
  }

  // Fallback: usar timestamp + random
  const timestamp = Date.now().toString().slice(-4)
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0")
  return `${timestamp}${random}`
}

export async function verificarTicketUnico(numeroTicket: string): Promise<boolean> {
  try {
    const { data } = await supabase.from("ticket").select("nr_ticket").eq("nr_ticket", numeroTicket).maybeSingle()

    return !data // Retorna true se não existe (é único)
  } catch (error) {
    console.error("Erro ao verificar ticket único:", error)
    return false
  }
}
