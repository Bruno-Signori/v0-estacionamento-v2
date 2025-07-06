/**
 * Obtém a data e hora atual no fuso horário de Brasília
 */
export function obterDataHoraBrasil(): Date {
  const agora = new Date()

  // Converter para horário de Brasília usando Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(agora)
  const partsObj = parts.reduce(
    (acc, part) => {
      acc[part.type] = part.value
      return acc
    },
    {} as Record<string, string>,
  )

  // Criar nova data com os valores do horário de Brasília
  const dataBrasil = new Date(
    Number.parseInt(partsObj.year),
    Number.parseInt(partsObj.month) - 1, // mês é 0-indexed
    Number.parseInt(partsObj.day),
    Number.parseInt(partsObj.hour),
    Number.parseInt(partsObj.minute),
    Number.parseInt(partsObj.second),
  )

  return dataBrasil
}

/**
 * Formata uma data para string ISO com timezone brasileiro
 */
export function formatarDataParaISO(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")
  const hora = String(data.getHours()).padStart(2, "0")
  const minuto = String(data.getMinutes()).padStart(2, "0")
  const segundo = String(data.getSeconds()).padStart(2, "0")
  const milissegundo = String(data.getMilliseconds()).padStart(3, "0")

  return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}.${milissegundo}-03:00`
}

/**
 * Obtém a data e hora atual formatada para o banco de dados
 */
export function obterDataHoraAtualBrasil(): string {
  const dataBrasil = obterDataHoraBrasil()
  return formatarDataParaISO(dataBrasil)
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
export function formatarDataBrasileira(data: string | Date): string {
  const dataObj = typeof data === "string" ? new Date(data) : data

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(dataObj)
}

/**
 * Formata uma data para exibição curta (apenas data)
 */
export function formatarDataCurta(data: string | Date): string {
  const dataObj = typeof data === "string" ? new Date(data) : data

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dataObj)
}

/**
 * Formata apenas a hora no formato brasileiro
 */
export function formatarHora(data: string | Date): string {
  const dataObj = typeof data === "string" ? new Date(data) : data

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dataObj)
}

/**
 * Calcula a diferença de tempo entre duas datas em minutos
 */
export function calcularDiferencaMinutos(dataInicio: string | Date, dataFim?: string | Date): number {
  const inicio = typeof dataInicio === "string" ? new Date(dataInicio) : dataInicio
  const fim = dataFim ? (typeof dataFim === "string" ? new Date(dataFim) : dataFim) : obterDataHoraBrasil()

  const diffMs = fim.getTime() - inicio.getTime()
  return Math.ceil(diffMs / (1000 * 60))
}

/**
 * Formata tempo em minutos para exibição (ex: 90 min -> 1h 30min)
 */
export function formatarTempoMinutos(minutos: number): string {
  if (minutos < 60) {
    return `${minutos}min`
  }

  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60

  if (minutosRestantes === 0) {
    return `${horas}h`
  }

  return `${horas}h ${minutosRestantes}min`
}

/**
 * Obtém o início do dia atual no horário de Brasília
 */
export function obterInicioDiaBrasil(): Date {
  const agora = obterDataHoraBrasil()
  agora.setHours(0, 0, 0, 0)
  return agora
}

/**
 * Obtém o fim do dia atual no horário de Brasília
 */
export function obterFimDiaBrasil(): Date {
  const agora = obterDataHoraBrasil()
  agora.setHours(23, 59, 59, 999)
  return agora
}

/**
 * Converte uma data UTC para o horário de Brasília
 */
export function converterParaBrasil(dataUTC: string | Date): Date {
  const data = typeof dataUTC === "string" ? new Date(dataUTC) : dataUTC

  // Criar uma nova data ajustada para o fuso horário de Brasília
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(data)
  const partsObj = parts.reduce(
    (acc, part) => {
      acc[part.type] = part.value
      return acc
    },
    {} as Record<string, string>,
  )

  return new Date(
    Number.parseInt(partsObj.year),
    Number.parseInt(partsObj.month) - 1,
    Number.parseInt(partsObj.day),
    Number.parseInt(partsObj.hour),
    Number.parseInt(partsObj.minute),
    Number.parseInt(partsObj.second),
  )
}
