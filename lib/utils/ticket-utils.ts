export function obterPrefixoDia(data?: Date): string {
  const dataReferencia = data || new Date()
  const horarioBrasil = new Date(dataReferencia.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

  const ano = String(horarioBrasil.getFullYear()).slice(-2) // Últimos 2 dígitos do ano
  const mes = String(horarioBrasil.getMonth() + 1).padStart(2, "0")
  const dia = String(horarioBrasil.getDate()).padStart(2, "0")

  return `${ano}${mes}${dia}`
}

export function formatarTicketCompleto(prefixoDia: string, sequencial: string): string {
  // Garantir que o sequencial tenha 3 dígitos
  const sequencialFormatado = sequencial.padStart(3, "0")
  return `${prefixoDia}${sequencialFormatado}`
}

export function extrairSequencialTicket(numeroTicket: string): string {
  // Extrair os últimos 3 dígitos
  return numeroTicket.slice(-3)
}

export function validarFormatoTicket(numeroTicket: string): boolean {
  // Validar se o ticket tem 9 dígitos (YYMMDD + 3 dígitos sequenciais)
  const regex = /^\d{9}$/
  return regex.test(numeroTicket)
}

export function obterDataDoTicket(numeroTicket: string): Date | null {
  if (!validarFormatoTicket(numeroTicket)) {
    return null
  }

  try {
    const prefixo = numeroTicket.slice(0, 6) // YYMMDD
    const ano = 2000 + Number.parseInt(prefixo.slice(0, 2), 10) // YY -> YYYY
    const mes = Number.parseInt(prefixo.slice(2, 4), 10) - 1 // MM (0-based)
    const dia = Number.parseInt(prefixo.slice(4, 6), 10) // DD

    return new Date(ano, mes, dia)
  } catch (error) {
    console.error("Erro ao extrair data do ticket:", error)
    return null
  }
}
