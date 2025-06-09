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
      const printWindow = window.open("", "_blank", "width=300,height=600,scrollbars=no,resizable=no")

      if (!printWindow) {
        throw new Error("Não foi possível abrir a janela de impressão")
      }

      // HTML para impressão com QR Code usando uma abordagem diferente
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
              font-size: 10px;
              line-height: 1.2;
              width: 58mm;
              margin: 0;
              padding: 2mm;
              background: white;
            }
            
            .ticket {
              text-align: center;
              width: 100%;
            }
            
            .header {
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 3mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 2mm;
            }
            
            .ticket-number {
              font-size: 14px;
              font-weight: bold;
              margin: 2mm 0;
            }
            
            .info {
              margin: 1mm 0;
              text-align: left;
            }
            
            .qr-container {
              margin: 3mm 0;
              text-align: center;
            }
            
            .qr-placeholder {
              width: 60px;
              height: 60px;
              border: 1px solid #000;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              text-align: center;
            }
            
            .footer {
              margin-top: 3mm;
              border-top: 1px dashed #000;
              padding-top: 2mm;
              font-size: 8px;
            }
            
            @media print {
              body {
                width: 58mm;
                margin: 0;
                padding: 0;
              }
              
              .ticket {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              PARKGESTOR<br>
              ESTACIONAMENTO
            </div>
            
            <div class="ticket-number">
              ${ticketData.ticketNumber}
            </div>
            
            <div class="info">
              <strong>Data/Hora:</strong> ${formattedTime}<br>
              <strong>Placa:</strong> ${ticketData.plate}<br>
              <strong>Tipo:</strong> ${ticketData.vehicleType.toUpperCase()}
            </div>
            
            <div class="qr-container">
              <div id="qrcode"></div>
            </div>
            
            <div class="footer">
              Guarde este ticket<br>
              Necessário para saída<br>
              Código: ${ticketData.ticketNumber}
            </div>
          </div>
          
          <script>
            console.log('Iniciando geração do QR Code...')
            
            // Função para gerar QR Code usando API online
            function generateQRCode() {
              const qrData = encodeURIComponent('${qrCodeContent}')
              const qrSize = 60
              const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' + qrSize + 'x' + qrSize + '&data=' + qrData
              
              const img = document.createElement('img')
              img.src = qrUrl
              img.style.width = qrSize + 'px'
              img.style.height = qrSize + 'px'
              img.style.border = '1px solid #000'
              
              img.onload = function() {
                console.log('QR Code carregado com sucesso')
                document.getElementById('qrcode').appendChild(img)
                
                // Aguardar um pouco e então imprimir
                setTimeout(function() {
                  console.log('Iniciando impressão...')
                  window.print()
                  
                  // Fechar janela após impressão
                  setTimeout(function() {
                    console.log('Fechando janela...')
                    window.close()
                  }, 1000)
                }, 500)
              }
              
              img.onerror = function() {
                console.log('Erro ao carregar QR Code, imprimindo sem QR Code...')
                document.getElementById('qrcode').innerHTML = '<div class="qr-placeholder">QR Code<br>Indisponível</div>'
                
                setTimeout(function() {
                  window.print()
                  setTimeout(function() {
                    window.close()
                  }, 1000)
                }, 500)
              }
            }
            
            // Aguardar o carregamento completo da página
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', generateQRCode)
            } else {
              generateQRCode()
            }
            
            // Evento para quando a impressão for concluída
            window.addEventListener('afterprint', function() {
              console.log('Impressão concluída')
              setTimeout(function() {
                window.close()
              }, 500)
            })
            
            // Fallback: fecha a janela se não conseguir imprimir em 15 segundos
            setTimeout(function() {
              if (!window.closed) {
                console.log('Timeout - fechando janela')
                window.close()
              }
            }, 15000)
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
      }, 3000)
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
