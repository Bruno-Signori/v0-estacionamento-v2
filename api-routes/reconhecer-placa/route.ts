import { NextResponse } from "next/server"

// Padrões de placas brasileiras
const PADROES_PLACA = {
  MERCOSUL: /[A-Z]{3}[0-9][A-Z][0-9]{2}/,
  ANTIGA: /[A-Z]{3}[0-9]{4}/,
}

function validarPlaca(placa: string): boolean {
  const placaLimpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, "")
  return PADROES_PLACA.MERCOSUL.test(placaLimpa) || PADROES_PLACA.ANTIGA.test(placaLimpa)
}

function formatarPlaca(placa: string): string {
  const placaLimpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, "")

  if (placaLimpa.length === 7) {
    // Formato Mercosul: ABC1D23
    if (PADROES_PLACA.MERCOSUL.test(placaLimpa)) {
      return placaLimpa
    }
    // Formato antigo: ABC1234
    if (PADROES_PLACA.ANTIGA.test(placaLimpa)) {
      return `${placaLimpa.slice(0, 3)}-${placaLimpa.slice(3)}`
    }
  }

  return placaLimpa
}

// Simular OCR de placa
// Em produção, integrar com serviço real como PlateRecognizer, OpenALPR, ou Google Vision
async function processarOCR(imagemBase64: string): Promise<{ placa: string | null; confianca: number }> {
  // Simulação de processamento OCR
  // Em produção, enviar para API externa de reconhecimento de placas

  // Para demonstração, vamos gerar uma placa aleatória válida
  // Em produção, isso seria substituído por chamada à API de OCR real

  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numeros = "0123456789"

  // Simular tempo de processamento
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 70% de chance de "detectar" uma placa (simulação)
  if (Math.random() < 0.7) {
    // Gerar placa no formato Mercosul
    const placa = [
      letras[Math.floor(Math.random() * letras.length)],
      letras[Math.floor(Math.random() * letras.length)],
      letras[Math.floor(Math.random() * letras.length)],
      numeros[Math.floor(Math.random() * numeros.length)],
      letras[Math.floor(Math.random() * letras.length)],
      numeros[Math.floor(Math.random() * numeros.length)],
      numeros[Math.floor(Math.random() * numeros.length)],
    ].join("")

    return {
      placa,
      confianca: 0.85 + Math.random() * 0.14, // 85-99%
    }
  }

  return { placa: null, confianca: 0 }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imagem } = body

    if (!imagem) {
      return NextResponse.json({ error: "Imagem não fornecida" }, { status: 400 })
    }

    // Processar OCR na imagem
    const resultado = await processarOCR(imagem)

    if (!resultado.placa) {
      return NextResponse.json({
        placa: null,
        confianca: 0,
        mensagem: "Nenhuma placa detectada",
      })
    }

    // Validar formato da placa
    if (!validarPlaca(resultado.placa)) {
      return NextResponse.json({
        placa: null,
        confianca: 0,
        mensagem: "Placa detectada com formato inválido",
      })
    }

    return NextResponse.json({
      placa: formatarPlaca(resultado.placa),
      confianca: resultado.confianca,
      formato: PADROES_PLACA.MERCOSUL.test(resultado.placa) ? "MERCOSUL" : "ANTIGA",
    })
  } catch (error) {
    console.error("Erro ao processar placa:", error)
    return NextResponse.json({ error: "Erro ao processar imagem" }, { status: 500 })
  }
}
