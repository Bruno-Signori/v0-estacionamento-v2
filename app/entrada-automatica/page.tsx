"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { QuickNav } from "@/components/quick-nav"
import { Camera, CameraOff, Car, Check, X, RefreshCw, Volume2, VolumeX } from "lucide-react"
import { TicketDisplay } from "@/components/ticket-display"

interface VeiculoDetectado {
  placa: string
  marca?: string
  modelo?: string
  cor?: string
  tipoVeiculo?: string
  tipoVeiculoId?: number
  confianca: number
}

interface TicketData {
  ticketNumber: string
  plate: string
  vehicleType: string
  entryTime: Date
}

export default function EntradaAutomaticaPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [veiculoDetectado, setVeiculoDetectado] = useState<VeiculoDetectado | null>(null)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [somAtivo, setSomAtivo] = useState(true)
  const [ultimaPlacaDetectada, setUltimaPlacaDetectada] = useState<string | null>(null)
  const [tiposVeiculo, setTiposVeiculo] = useState<any[]>([])
  const [cameraDisponivel, setCameraDisponivel] = useState(true)
  const [registrando, setRegistrando] = useState(false)

  // Carregar tipos de veículo
  useEffect(() => {
    fetch("/api/tipos-veiculo")
      .then((res) => res.json())
      .then((data) => setTiposVeiculo(data))
      .catch((err) => console.error("Erro ao carregar tipos:", err))
  }, [])

  // Tocar som de sucesso
  const tocarSom = useCallback(
    (tipo: "sucesso" | "erro") => {
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
        } else {
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        }

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } catch (e) {
        console.error("Erro ao tocar som:", e)
      }
    },
    [somAtivo],
  )

  // Iniciar câmera
  const iniciarCamera = async () => {
    try {
      setErro(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraAtiva(true)
      iniciarDeteccao()
    } catch (error: any) {
      console.error("Erro ao acessar câmera:", error)
      setCameraDisponivel(false)
      setErro("Não foi possível acessar a câmera. Verifique as permissões do navegador.")
    }
  }

  // Parar câmera
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
  }

  // Capturar frame e enviar para OCR
  const capturarEProcessar = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || processando || mostrarConfirmacao) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL("image/jpeg", 0.8)

    setProcessando(true)

    try {
      const response = await fetch("/api/reconhecer-placa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem: imageData }),
      })

      const data = await response.json()

      if (data.placa && data.placa !== ultimaPlacaDetectada) {
        setUltimaPlacaDetectada(data.placa)

        // Buscar informações do veículo
        const infoResponse = await fetch(`/api/consultar-veiculo?placa=${data.placa}`)
        const infoData = await infoResponse.json()

        const veiculoInfo: VeiculoDetectado = {
          placa: data.placa,
          marca: infoData.marca || "Não identificada",
          modelo: infoData.modelo || "Não identificado",
          cor: infoData.cor || "Não identificada",
          tipoVeiculo: infoData.tipoVeiculo || "Carro",
          tipoVeiculoId: infoData.tipoVeiculoId || tiposVeiculo[0]?.id,
          confianca: data.confianca || 0.85,
        }

        setVeiculoDetectado(veiculoInfo)
        setMostrarConfirmacao(true)
        tocarSom("sucesso")
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error)
    } finally {
      setProcessando(false)
    }
  }, [processando, mostrarConfirmacao, ultimaPlacaDetectada, tiposVeiculo, tocarSom])

  // Iniciar detecção contínua
  const iniciarDeteccao = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      capturarEProcessar()
    }, 1500)
  }, [capturarEProcessar])

  // Confirmar entrada
  const confirmarEntrada = async () => {
    if (!veiculoDetectado) return

    setRegistrando(true)
    setErro(null)

    try {
      const response = await fetch("/api/entrada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placa: veiculoDetectado.placa,
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

      setTicketData({
        ticketNumber: data.ticket.nr_ticket,
        plate: data.ticket.nr_placa,
        vehicleType: veiculoDetectado.tipoVeiculo || "Carro",
        entryTime: new Date(data.ticket.dt_entrada),
      })

      tocarSom("sucesso")
      setMostrarConfirmacao(false)
      setVeiculoDetectado(null)

      // Após 5 segundos, limpar ticket e continuar escaneando
      setTimeout(() => {
        setTicketData(null)
        setUltimaPlacaDetectada(null)
      }, 5000)
    } catch (error: any) {
      setErro(error.message)
      tocarSom("erro")
    } finally {
      setRegistrando(false)
    }
  }

  // Cancelar detecção
  const cancelarDeteccao = () => {
    setMostrarConfirmacao(false)
    setVeiculoDetectado(null)
    setUltimaPlacaDetectada(null)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      pararCamera()
    }
  }, [])

  // Reiniciar detecção quando câmera ativar
  useEffect(() => {
    if (cameraAtiva && !mostrarConfirmacao && !ticketData) {
      iniciarDeteccao()
    }
  }, [cameraAtiva, mostrarConfirmacao, ticketData, iniciarDeteccao])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader title="Entrada Automática" />

      <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Entrada Automática</h2>
            <p className="mt-1 text-gray-600">Posicione a placa do veículo na frente da câmera</p>
          </header>

          {erro && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
              <X className="h-5 w-5" />
              {erro}
            </div>
          )}

          {/* Área da Câmera */}
          <Card className="mb-6 overflow-hidden rounded-2xl border-gray-200 shadow-lg">
            <CardContent className="p-0 relative">
              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${!cameraAtiva ? "hidden" : ""}`}
                  playsInline
                  muted
                />

                <canvas ref={canvasRef} className="hidden" />

                {!cameraAtiva && (
                  <div className="text-center text-gray-400">
                    <CameraOff className="h-16 w-16 mx-auto mb-4" />
                    <p>Câmera desativada</p>
                  </div>
                )}

                {/* Overlay de área de detecção */}
                {cameraAtiva && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-24 border-4 border-dashed border-yellow-400 rounded-lg">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded">
                        POSICIONE A PLACA AQUI
                      </div>
                    </div>
                  </div>
                )}

                {/* Indicador de processamento */}
                {processando && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analisando...
                  </div>
                )}
              </div>

              {/* Controles da câmera */}
              <div className="p-4 bg-gray-100 flex items-center justify-between">
                <Button
                  onClick={cameraAtiva ? pararCamera : iniciarCamera}
                  variant={cameraAtiva ? "destructive" : "default"}
                  className="gap-2"
                  disabled={!cameraDisponivel}
                >
                  {cameraAtiva ? (
                    <>
                      <CameraOff className="h-4 w-4" />
                      Parar Câmera
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Iniciar Câmera
                    </>
                  )}
                </Button>

                <Button variant="outline" size="icon" onClick={() => setSomAtivo(!somAtivo)}>
                  {somAtivo ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
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
                    <p className="text-gray-600 mt-1">Confirme os dados para registrar entrada</p>
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
                            className="h-full bg-green-500 rounded-full"
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
                      disabled={registrando}
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      onClick={confirmarEntrada}
                      disabled={registrando}
                    >
                      {registrando ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Confirmar Entrada
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ticket Gerado */}
          {ticketData && (
            <div className="animate-in slide-in-from-bottom duration-300">
              <TicketDisplay ticketData={ticketData} />
            </div>
          )}

          {/* Instruções */}
          {!ticketData && !mostrarConfirmacao && (
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Como funciona:</h3>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <span>Clique em "Iniciar Câmera" e permita o acesso</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <span>Posicione a placa do veículo na área indicada</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <span>O sistema detectará automaticamente a placa</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <span>Confirme os dados no pop-up para registrar a entrada</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <QuickNav />
    </div>
  )
}
