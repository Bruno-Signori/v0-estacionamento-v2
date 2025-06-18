"use client"

import { useState } from "react"
import type { TicketData } from "../registro-entrada"

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false)

  const printTicket = async (ticketData: TicketData) => {
    setIsPrinting(true)

    try {
      // Formatando a data e hora
      const formattedTime = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(ticketData.entryTime)

      // Gerando o conteúdo do QR Code
      const qrCodeContent = JSON.stringify({
        ticket: ticketData.ticketNumber,
        plate: ticketData.plate,
        type: ticketData.vehicleType,
        entryTime: ticketData.entryTime.toISOString(),
        version: "2.0",
        system: "parkgestor",
      })

      // Criar uma nova janela para impressão
      const printWindow = window.open("", "_blank", "width=400,height=700,scrollbars=yes,resizable=yes")

      if (!printWindow) {
        throw new Error("Não foi possível abrir a janela de impressão")
      }

      // HTML para impressão com QR Code
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Ticket - ${ticketData.ticketNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              padding: 10px;
              background: white;
              color: black;
            }
            
            .ticket {
              text-align: center;
              width: 100%;
              max-width: 300px;
              margin: 0 auto;
              border: 2px dashed #000;
              padding: 15px;
            }
            
            .header {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            
            .ticket-number {
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
              background: #f0f0f0;
              padding: 5px;
              border: 1px solid #000;
            }
            
            .info {
              margin: 8px 0;
              text-align: left;
              font-size: 11px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              padding: 2px 0;
              border-bottom: 1px dotted #ccc;
            }
            
            .qr-container {
              margin: 15px 0;
              text-align: center;
              padding: 10px;
              background: #f9f9f9;
              border: 1px solid #ddd;
            }
            
            .qr-placeholder {
              width: 80px;
              height: 80px;
              border: 2px solid #000;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              text-align: center;
              background: white;
            }
            
            .footer {
              margin-top: 15px;
              border-top: 1px dashed #000;
              padding-top: 10px;
              font-size: 10px;
              text-align: center;
            }
            
            .controls {
              margin: 20px 0;
              text-align: center;
              padding: 10px;
              background: #f0f0f0;
              border: 1px solid #ccc;
            }
            
            .btn {
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              margin: 5px;
              cursor: pointer;
              border-radius: 4px;
              font-size: 12px;
            }
            
            .btn:hover {
              background: #0056b3;
            }
            
            .btn-secondary {
              background: #6c757d;
            }
            
            .btn-secondary:hover {
              background: #545b62;
            }
            
            @media print {
              .controls {
                display: none !important;
              }
              
              body {
                padding: 0;
              }
              
              .ticket {
                border: 2px dashed #000;
                max-width: 58mm;
                font-size: 10px;
              }
              
              .header {
                font-size: 12px;
              }
              
              .ticket-number {
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="controls">
            <button class="btn" onclick="window.print()">🖨️ Imprimir Ticket</button>
            <button class="btn btn-secondary" onclick="window.close()">❌ Fechar</button>
          </div>
          
          <div class="ticket">
            <div class="header">
              🅿️ PARKGESTOR<br>
              ESTACIONAMENTO
            </div>
            
            <div class="ticket-number">
              📋 ${ticketData.ticketNumber}
            </div>
            
            <div class="info">
              <div class="info-row">
                <strong>📅 Data/Hora:</strong>
                <span>${formattedTime}</span>
              </div>
              <div class="info-row">
                <strong>🚗 Placa:</strong>
                <span>${ticketData.plate}</span>
              </div>
              <div class="info-row">
                <strong>🚙 Tipo:</strong>
                <span>${ticketData.vehicleType.toUpperCase()}</span>
              </div>
            </div>
            
            <div class="qr-container">
              <div id="qrcode"></div>
              <div style="margin-top: 5px; font-size: 9px;">
                📱 Escaneie para saída
              </div>
            </div>
            
            <div class="footer">
              ⚠️ <strong>IMPORTANTE</strong> ⚠️<br>
              Guarde este ticket<br>
              Necessário para saída<br>
              <br>
              🔢 Código: <strong>${ticketData.ticketNumber}</strong><br>
              🕐 Entrada: ${formattedTime}
            </div>
          </div>
          
          <script>
            console.log('Iniciando geração do QR Code...')
            
            // Função para gerar QR Code usando API online
            function generateQRCode() {
              const qrData = encodeURIComponent('${qrCodeContent}')
              const qrSize = 80
              const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' + qrSize + 'x' + qrSize + '&data=' + qrData + '&margin=1'
              
              const img = document.createElement('img')
              img.src = qrUrl
              img.style.width = qrSize + 'px'
              img.style.height = qrSize + 'px'
              img.style.border = '1px solid #000'
              img.alt = 'QR Code do Ticket'
              
              img.onload = function() {
                console.log('QR Code carregado com sucesso')
                document.getElementById('qrcode').appendChild(img)
              }
              
              img.onerror = function() {
                console.log('Erro ao carregar QR Code')
                document.getElementById('qrcode').innerHTML = '<div class="qr-placeholder">QR Code<br>Indisponível<br>📱</div>'
              }
            }
            
            // Aguardar o carregamento completo da página
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', generateQRCode)
            } else {
              generateQRCode()
            }
            
            // Focar na janela
            window.focus()
          </script>
        </body>
        </html>
      `

      // Escrever o HTML na janela
      printWindow.document.write(printHTML)
      printWindow.document.close()

      // Aguardar um pouco para garantir que a janela foi criada
      setTimeout(() => {
        setIsPrinting(false)
      }, 1000)
    } catch (error) {
      console.error("Erro ao imprimir:", error)
      alert("Erro ao imprimir o ticket. Tente novamente.")
      setIsPrinting(false)
    }
  }

  return {
    printTicket,
    isPrinting,
  }
}
