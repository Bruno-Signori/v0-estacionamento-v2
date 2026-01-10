"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { QuickNav } from "@/components/quick-nav"
import { Camera, CameraOff, Car, Check, X, RefreshCw, Volume2, VolumeX, Loader2, ScanLine, Printer } from "lucide-react"
import { createWorker, type Worker } from "tesseract.js"
import { usePrint } from "@/hooks/use-print"

interface VeiculoDetectado {
  placa: string
  marca?: string
  modelo?: string
  cor?: string
  tipoVeiculo?: string
  tipoVeiculoId?: number
  confianca: number
}

const PADROES_PLACA = {
  MERCOSUL: /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/,
  ANTIGA: /^[A-Z]{3}[0-9]{4}$/,
}

function extrairPlacas(texto: string): string[] {
  const textoLimpo = texto.toUpperCase().replace(/[^A-Z0-9\s]/g, "")
  const palavras = textoLimpo.split(/\s+/)
  const placas: string[] = []

  for (const palavra of palavras) {
    const limpa = palavra.replace(/\s/g, "")
    if (limpa.length === 7) {
      if (PADROES_PLACA.MERCOSUL.test(limpa) || PADROES_PLACA.ANTIGA.test(limpa)) {
        placas.push(limpa)
      }
    }
  }

  const textoSemEspaco = textoLimpo.replace(/\s/g, "")
  for (let i = 0; i <= textoSemEspaco.length - 7; i++) {
    const possivel = textoSemEspaco.substring(i, i + 7)
    if (PADROES_PLACA.MERCOSUL.test(possivel) || PADROES_PLACA.ANTIGA.test(possivel)) {
      if (!placas.includes(possivel)) {
        placas.push(possivel)
      }
    }
  }

  return placas
}

function formatarPlaca(placa: string): string {
  if (PADROES_PLACA.ANTIGA.test(placa)) {
    return `${placa.slice(0, 3)}-${placa.slice(3)}`
  }
  return placa
}

export default function EntradaAutomaticaPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const processCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const workerRef = useRef<Worker | null>(null)

  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [veiculoDetectado, setVeiculoDetectado] = useState<VeiculoDetectado | null>(null)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [somAtivo, setSomAtivo] = useState(true)
  const [ultimaPlacaDetectada, setUltimaPlacaDetectada] = useState<string | null>(null)
  const [tiposVeiculo, setTiposVeiculo] = useState<any[]>([])
  const [cameraDisponivel, setCameraDisponivel] = useState(true)
  const [registrando, setRegistrando] = useState(false)
  const [ocrPronto, setOcrPronto] = useState(false)
  const [carregandoOcr, setCarregandoOcr] = useState(false)
  const [statusOcr, setStatusOcr] = useState("")
  const [ultimoTextoDetectado, setUltimoTextoDetectado] = useState("")
  const [tentativas, setTentativas] = useState(0)
  const [etapaAtual, setEtapaAtual] = useState<"aguardando" | "registrando" | "imprimindo" | "concluido">("aguardando")
  const [mensagemStatus, setMensagemStatus] = useState("")

  const { printTicketAuto, isPrinting } = usePrint()

  useEffect(() => {
    const initWorker = async () => {
      setCarregandoOcr(true)
      setStatusOcr("Carregando OCR...")

      try {
        const worker = await createWorker("por", 1, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setStatusOcr(`Processando: ${Math.round(m.progress * 100)}%`)
            }
          },
        })

        await worker.setParameters({
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          tessedit_pageseg_mode: "7",
        })

        workerRef.current = worker
        setOcrPronto(true)
        setStatusOcr("OCR pronto!")
      } catch (error) {
        console.error("Erro ao inicializar OCR:", error)
        setStatusOcr("Erro ao carregar OCR")
        setErro("Não foi possível inicializar o reconhecimento de texto")
      } finally {
        setCarregandoOcr(false)
      }
    }

    initWorker()

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  useEffect(() => {
    fetch("/api/tipos-veiculo")
      .then((res) => res.json())
      .then((data) => setTiposVeiculo(data))
      .catch((err) => console.error("Erro ao carregar tipos:", err))
  }, [])

  const tocarSom = useCallback(
    (tipo: "sucesso" | "erro" | "impressao") => {
      if (!somAtivo) return

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        if (tipo === "sucesso") {
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1)
        } else if (tipo === "impressao") {
          // Som diferente para impressão
          oscillator.frequency.setValueAtTime(660, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.15)
          oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.3)
        } else {
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        }

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.4)
      } catch (e) {
        console.error("Erro ao tocar som:", e)
      }
    },
    [somAtivo],
  )

  const iniciarCamera = async () => {
    try {
      setErro(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraAtiva(true)
      setTentativas(0)
      setEtapaAtual("aguardando")
    } catch (error: any) {
      console.error("Erro ao acessar câmera:", error)
      setCameraDisponivel(false)
      setErro("Não foi possível acessar a câmera. Verifique as permissões do navegador.")
    }
  }

  const pararCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setCameraAtiva(false)
    setVeiculoDetectado(null)
    setMostrarConfirmacao(false)
    setUltimoTextoDetectado("")
    setEtapaAtual("aguardando")
  }

  const preprocessarImagem = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      const contraste = (gray - 128) * 1.5 + 128
      const threshold = 127
      const valor = contraste > threshold ? 255 : 0

      data[i] = valor
      data[i + 1] = valor
      data[i + 2] = valor
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const capturarEProcessar = useCallback(async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !processCanvasRef.current ||
      processando ||
      mostrarConfirmacao ||
      !workerRef.current ||
      !ocrPronto ||
      etapaAtual !== "aguardando"
    )
      return

    const video = videoRef.current
    const canvas = canvasRef.current
    const processCanvas = processCanvasRef.current
    const ctx = canvas.getContext("2d")
    const processCtx = processCanvas.getContext("2d")

    if (!ctx || !processCtx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const plateRegion = {
      x: video.videoWidth * 0.15,
      y: video.videoHeight * 0.35,
      width: video.videoWidth * 0.7,
      height: video.videoHeight * 0.3,
    }

    processCanvas.width = plateRegion.width
    processCanvas.height = plateRegion.height

    processCtx.drawImage(
      canvas,
      plateRegion.x,
      plateRegion.y,
      plateRegion.width,
      plateRegion.height,
      0,
      0,
      plateRegion.width,
      plateRegion.height,
    )

    preprocessarImagem(processCtx, processCanvas.width, processCanvas.height)

    setProcessando(true)
    setTentativas((prev) => prev + 1)

    try {
      const { data } = await workerRef.current.recognize(processCanvas)

      const textoDetectado = data.text.trim()
      setUltimoTextoDetectado(textoDetectado)

      const placasEncontradas = extrairPlacas(textoDetectado)

      if (placasEncontradas.length > 0) {
        const placaDetectada = placasEncontradas[0]

        if (placaDetectada !== ultimaPlacaDetectada) {
          setUltimaPlacaDetectada(placaDetectada)

          const infoResponse = await fetch(`/api/consultar-veiculo?placa=${placaDetectada}`)
          const infoData = await infoResponse.json()

          const veiculoInfo: VeiculoDetectado = {
            placa: formatarPlaca(placaDetectada),
            marca: infoData.marca || "Não identificada",
            modelo: infoData.modelo || "Não identificado",
            cor: infoData.cor || "Não identificada",
            tipoVeiculo: infoData.tipoVeiculo || "Carro",
            tipoVeiculoId: infoData.tipoVeiculoId || tiposVeiculo[0]?.id,
            confianca: data.confidence / 100,
          }

          setVeiculoDetectado(veiculoInfo)
          setMostrarConfirmacao(true)
          tocarSom("sucesso")
        }
      }
    } catch (error) {
      console.error("Erro ao processar OCR:", error)
    } finally {
      setProcessando(false)
    }
  }, [processando, mostrarConfirmacao, ultimaPlacaDetectada, tiposVeiculo, tocarSom, ocrPronto, etapaAtual])

  useEffect(() => {
    if (cameraAtiva && ocrPronto && !mostrarConfirmacao && etapaAtual === "aguardando") {
      intervalRef.current = setInterval(() => {
        capturarEProcessar()
      }, 2000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [cameraAtiva, ocrPronto, mostrarConfirmacao, etapaAtual, capturarEProcessar])

  const confirmarEntrada = async () => {
    if (!veiculoDetectado) return

    setRegistrando(true)
    setErro(null)
    setEtapaAtual("registrando")
    setMensagemStatus("Registrando entrada...")

    try {
      const response = await fetch("/api/entrada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placa: veiculoDetectado.placa.replace("-", ""),
          tipoVeiculoId: veiculoDetectado.tipoVeiculoId,
          marca: veiculoDetectado.marca,
          modelo: veiculoDetectado.modelo,
          cor: veiculoDetectado.cor,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao registrar entrada")
      }

      // Entrada registrada com sucesso
      setEtapaAtual("imprimindo")
      setMensagemStatus("Imprimindo ticket...")
      tocarSom("impressao")

      // Preparar dados do ticket
      const ticketData = {
        ticketNumber: data.ticket.nr_ticket,
        plate: data.ticket.nr_placa,
        vehicleType: veiculoDetectado.tipoVeiculo || "Carro",
        entryTime: new Date(data.ticket.dt_entrada),
        marca: veiculoDetectado.marca,
        modelo: veiculoDetectado.modelo,
        cor: veiculoDetectado.cor,
      }

      // Fechar modal de confirmação imediatamente
      setMostrarConfirmacao(false)

      // Imprimir automaticamente
      await printTicketAuto(ticketData)

      // Após impressão, mostrar sucesso brevemente e voltar para câmera
      setEtapaAtual("concluido")
      setMensagemStatus(`Entrada ${ticketData.ticketNumber} registrada!`)
      tocarSom("sucesso")

      // Após 2 segundos, resetar para próximo veículo
      setTimeout(() => {
        setVeiculoDetectado(null)
        setUltimaPlacaDetectada(null)
        setTentativas(0)
        setEtapaAtual("aguardando")
        setMensagemStatus("")
      }, 2000)
    } catch (error: any) {
      setErro(error.message)
      tocarSom("erro")
      setEtapaAtual("aguardando")
      setMensagemStatus("")
    } finally {
      setRegistrando(false)
    }
  }

  const cancelarDeteccao = () => {
    setMostrarConfirmacao(false)
    setVeiculoDetectado(null)
    setUltimaPlacaDetectada(null)
    setEtapaAtual("aguardando")
  }

  useEffect(() => {
    return () => {
      pararCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader title="Entrada Automática" />

      <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Entrada Automática</h2>
            <p className="mt-1 text-gray-600">Posicione a placa do veículo na área indicada</p>
          </header>

          {carregandoOcr && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div>
                <p className="font-medium">Inicializando sistema de reconhecimento...</p>
                <p className="text-sm">{statusOcr}</p>
              </div>
            </div>
          )}

          {erro && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
              <X className="h-5 w-5" />
              {erro}
            </div>
          )}

          {etapaAtual !== "aguardando" && mensagemStatus && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
                etapaAtual === "registrando"
                  ? "bg-blue-50 border border-blue-200 text-blue-700"
                  : etapaAtual === "imprimindo"
                    ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
                    : "bg-green-50 border border-green-200 text-green-700"
              }`}
            >
              {etapaAtual === "registrando" && <Loader2 className="h-5 w-5 animate-spin" />}
              {etapaAtual === "imprimindo" && <Printer className="h-5 w-5 animate-pulse" />}
              {etapaAtual === "concluido" && <Check className="h-5 w-5" />}
              <span className="font-medium">{mensagemStatus}</span>
            </div>
          )}

          <Card className="mb-6 overflow-hidden rounded-2xl border-gray-200 shadow-lg">
            <CardContent className="p-0 relative">
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${!cameraAtiva ? "hidden" : ""}`}
                  playsInline
                  muted
                />

                <canvas ref={canvasRef} className="hidden" />
                <canvas ref={processCanvasRef} className="hidden" />

                {!cameraAtiva && (
                  <div className="text-center text-gray-400">
                    <CameraOff className="h-16 w-16 mx-auto mb-4" />
                    <p>Câmera desativada</p>
                    {!ocrPronto && !carregandoOcr && (
                      <p className="text-sm mt-2 text-yellow-500">OCR não está pronto</p>
                    )}
                  </div>
                )}

                {cameraAtiva && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black/40" />

                    <div
                      className="absolute top-[35%] left-[15%] w-[70%] h-[30%] bg-transparent border-4 border-yellow-400 rounded-lg"
                      style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded whitespace-nowrap">
                        POSICIONE A PLACA AQUI
                      </div>

                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />

                      {processando && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div
                            className="w-full h-1 bg-green-400 animate-pulse"
                            style={{ animation: "scanline 1.5s ease-in-out infinite" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    {ocrPronto && cameraAtiva && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        OCR Ativo
                      </div>
                    )}
                    {cameraAtiva && (
                      <div className="bg-gray-800/80 text-white px-3 py-1 rounded-full text-xs">
                        Tentativas: {tentativas}
                      </div>
                    )}
                  </div>

                  {processando && (
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <ScanLine className="h-4 w-4 animate-pulse" />
                      Analisando...
                    </div>
                  )}
                </div>

                {ultimoTextoDetectado && cameraAtiva && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 text-white px-3 py-2 rounded-lg text-xs font-mono max-h-16 overflow-auto">
                      <span className="text-gray-400">Detectado: </span>
                      {ultimoTextoDetectado || "Aguardando..."}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-100 flex items-center justify-between">
                <Button
                  onClick={cameraAtiva ? pararCamera : iniciarCamera}
                  variant={cameraAtiva ? "destructive" : "default"}
                  className="gap-2"
                  disabled={!cameraDisponivel || carregandoOcr || etapaAtual !== "aguardando"}
                >
                  {cameraAtiva ? (
                    <>
                      <CameraOff className="h-4 w-4" />
                      Parar Câmera
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      {carregandoOcr ? "Carregando OCR..." : "Iniciar Câmera"}
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  {ocrPronto && <span className="text-xs text-green-600 font-medium">OCR Pronto</span>}
                  <Button variant="outline" size="icon" onClick={() => setSomAtivo(!somAtivo)}>
                    {somAtivo ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modal de Confirmação */}
          {mostrarConfirmacao && veiculoDetectado && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Veículo Detectado!</h3>
                    <p className="text-gray-600 mt-1">Confirme para registrar e imprimir</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Placa:</span>
                      <span className="text-2xl font-bold text-gray-900 font-mono">{veiculoDetectado.placa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marca:</span>
                      <span className="font-medium">{veiculoDetectado.marca}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modelo:</span>
                      <span className="font-medium">{veiculoDetectado.modelo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cor:</span>
                      <span className="font-medium">{veiculoDetectado.cor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">{veiculoDetectado.tipoVeiculo}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600">Confiança:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              veiculoDetectado.confianca > 0.7
                                ? "bg-green-500"
                                : veiculoDetectado.confianca > 0.5
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${veiculoDetectado.confianca * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round(veiculoDetectado.confianca * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 bg-transparent"
                      onClick={cancelarDeteccao}
                      disabled={registrando || isPrinting}
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      onClick={confirmarEntrada}
                      disabled={registrando || isPrinting}
                    >
                      {registrando ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : isPrinting ? (
                        <>
                          <Printer className="h-4 w-4 animate-pulse" />
                          Imprimindo...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Confirmar e Imprimir
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-gray-500 mt-3">
                    O ticket será impresso automaticamente após confirmar
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Instruções */}
          {etapaAtual === "aguardando" && !mostrarConfirmacao && (
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Como funciona:</h3>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <span>Aguarde o OCR carregar (indicador verde "OCR Pronto")</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <span>Clique em "Iniciar Câmera" e permita o acesso</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <span>Posicione a placa dentro da área amarela</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <span>O sistema detectará automaticamente a placa</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      5
                    </span>
                    <span>
                      <strong>Confirme e o ticket será impresso automaticamente!</strong>
                    </span>
                  </li>
                </ol>

                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <strong>Fluxo simplificado:</strong> Ao confirmar a entrada, o ticket é gerado e enviado diretamente
                  para impressão. Após imprimir, o sistema volta automaticamente para escanear o próximo veículo.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <QuickNav />
    </div>
  )
}
