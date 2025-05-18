"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle, Camera, Smartphone, QrCode, Check } from "lucide-react"

export function QrCodeHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Ajuda</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Como usar o leitor de QR Code</DialogTitle>
          <DialogDescription>Siga estas instruções para escanear o QR Code do ticket corretamente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Permita o acesso à câmera</h3>
              <p className="text-sm text-gray-500">
                Quando solicitado, permita que o navegador acesse a câmera do seu dispositivo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Posicione o dispositivo</h3>
              <p className="text-sm text-gray-500">
                Mantenha o dispositivo estável e a uma distância de 10-20cm do QR Code.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <QrCode className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Centralize o QR Code</h3>
              <p className="text-sm text-gray-500">
                Certifique-se de que o QR Code esteja completamente visível e centralizado na tela.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Check className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Aguarde a leitura</h3>
              <p className="text-sm text-gray-500">
                O sistema detectará automaticamente o QR Code e processará as informações.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
            <p className="text-sm text-yellow-800">
              <strong>Dica:</strong> Se estiver com dificuldades, verifique se há boa iluminação e se o QR Code não está
              danificado. Você também pode usar a opção de entrada manual.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
