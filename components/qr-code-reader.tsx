"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { StopCircle, Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Html5Qrcode } from "html5-qrcode"
import { QrCodeHelp } from "./qr-code-help"

interface QrCodeReaderProps {
  onScan: (data: string) => void
}

export function QrCodeReader({ onScan }: QrCodeReaderProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [simulatedInput, setSimulatedInput] = useState("")
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [scanning, setScanning] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerId = "qr-reader"

  // Função para listar câmeras disponíveis
  const listCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length) {
        setCameras(devices)
        setSelectedCamera(devices[0].id)
        return true
      } else {
        setError("Nenhuma câmera encontrada no dispositivo")
        return false
      }
    } catch (err) {
      console.error("Erro ao listar câmeras:", err)
      setError("Não foi possível acessar as câmeras do dispositivo")
      return false
    }
  }

  // Inicializar o scanner quando o componente montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Verificar se o navegador suporta a API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Seu navegador não suporta acesso à câmera. Tente usar um navegador mais recente.")
        return
      }

      // Inicializar o scanner
      scannerRef.current = new Html5Qrcode(scannerContainerId)

      // Listar câmeras disponíveis e iniciar o scanner automaticamente
      const initCamera = async () => {
        const camerasAvailable = await listCameras()
        if (camerasAvailable) {
          // Pequeno atraso para garantir que o DOM esteja pronto
          setTimeout(() => {
            startScanner()
          }, 500)
        }
      }

      initCamera()

      // Limpar quando o componente desmontar
      return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((err) => console.error("Erro ao parar o scanner:", err))
        }
      }
    }
  }, [])

  // Função para iniciar o scanner
  const startScanner = async () => {
    if (!scannerRef.current || !selectedCamera) {
      setError("Scanner não inicializado ou câmera não selecionada")
      return
    }

    setError(null)
    setScanning(true)
    setCameraActive(true)

    try {
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // QR Code detectado com sucesso
          handleQrCodeDetected(decodedText)
        },
        (errorMessage) => {
          // Ignoramos erros durante o scanning para não interromper o processo
          console.log(errorMessage)
        },
      )

      setPermissionGranted(true)
    } catch (err) {
      console.error("Erro ao iniciar o scanner:", err)
      setError("Não foi possível iniciar a câmera. Verifique se você concedeu permissão de acesso.")
      setScanning(false)
      setCameraActive(false)
    }
  }

  // Função para parar o scanner
  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        setScanning(false)
        setCameraActive(false)
      } catch (err) {
        console.error("Erro ao parar o scanner:", err)
      }
    }
  }

  // Função para lidar com QR Code detectado
  const handleQrCodeDetected = (decodedText: string) => {
    // Parar o scanner após detectar um QR Code
    stopScanner()

    // Processar o texto decodificado
    onScan(decodedText)
  }

  // Função para simular a leitura de um QR code
  const simulateScan = () => {
    if (simulatedInput) {
      onScan(simulatedInput)
      setSimulatedInput("")
    } else {
      setError("Digite um código para simular a leitura")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {cameraActive ? (
          <Button onClick={stopScanner} className="rounded-xl bg-red-500 hover:bg-red-600 text-white">
            <StopCircle className="mr-2 h-5 w-5" />
            Desativar Câmera
          </Button>
        ) : (
          <Button onClick={startScanner} className="rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black">
            Tentar Novamente
          </Button>
        )}

        <QrCodeHelp />
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        id={scannerContainerId}
        className={`relative overflow-hidden rounded-xl border-2 border-gray-200 aspect-video ${
          !cameraActive ? "hidden" : ""
        }`}
      >
        {/* O scanner HTML5 irá renderizar o vídeo aqui */}
        {cameraActive && !permissionGranted && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center text-white text-center p-4">
            <div>
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-yellow-400" />
              <p>Aguardando permissão para acessar a câmera...</p>
            </div>
          </div>
        )}
      </div>

      {!cameraActive && (
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center aspect-video">
            <div className="text-center p-6">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">Câmera desativada ou não disponível</p>
              <p className="text-sm text-gray-500 mt-2">Clique em "Tentar Novamente" para ativar a câmera</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-medium mb-2">Entrada Manual</h4>
            <div className="flex gap-2">
              <Input
                value={simulatedInput}
                onChange={(e) => setSimulatedInput(e.target.value)}
                placeholder="Digite o código do ticket"
                className="rounded-lg"
              />
              <Button onClick={simulateScan} variant="outline" className="rounded-lg">
                <Upload className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use esta opção para inserir manualmente um código sem usar a câmera
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm">
        <p>
          <strong>Dica:</strong> Posicione o QR Code do ticket no centro da câmera para uma leitura mais rápida.
          Certifique-se de que o código esteja bem iluminado e sem reflexos.
        </p>
      </div>
    </div>
  )
}
