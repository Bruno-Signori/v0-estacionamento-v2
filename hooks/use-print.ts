"use client"

import { useState } from "react"
import type { TicketData } from "../registro-entrada"

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false)

  const printTicket = async (ticketData: TicketData) => {
    setIsPrinting(true)

    try {
      // Detectar se é mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

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

      // Para mobile, usar uma abordagem diferente
      if (isMobile) {
        // Criar uma nova aba em vez de popup
        const printWindow = window.open("", "_blank")

        if (!printWindow) {
          throw new Error("Não foi possível abrir a janela de impressão")
        }

        // HTML otimizado para mobile
        const printHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
            <title>Ticket - ${ticketData.ticketNumber}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
              }
              
              body {
                font-family: 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.4;
                padding: 10px;
                background: #f5f5f5;
                color: black;
                min-height: 100vh;
              }
              
              .container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              
              .header-bar {
                background: #007bff;
                color: white;
                padding: 15px;
                text-align: center;
                font-weight: bold;
                font-size: 16px;
              }
              
              .ticket {
                text-align: center;
                padding: 20px;
                border: 2px dashed #000;
                margin: 15px;
                background: white;
              }
              
              .header {
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 15px;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              
              .ticket-number {
                font-size: 24px;
                font-weight: bold;
                margin: 15px 0;
                background: #fffacd;
                padding: 10px;
                border: 2px solid #000;
                border-radius: 4px;
              }
              
              .info {
                margin: 15px 0;
                text-align: left;
                font-size: 14px;
              }
              
              .info-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 5px 0;
                border-bottom: 1px dotted #ccc;
              }
              
              .qr-container {
                margin: 20px 0;
                text-align: center;
                padding: 15px;
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 4px;
              }
              
              .qr-placeholder {
                width: 100px;
                height: 100px;
                border: 2px solid #000;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                text-align: center;
                background: white;
                border-radius: 4px;
              }
              
              .footer {
                margin-top: 20px;
                border-top: 1px dashed #000;
                padding-top: 15px;
                font-size: 12px;
                text-align: center;
                background: #fff8dc;
                padding: 15px;
                border-radius: 4px;
              }
              
              .controls {
                padding: 20px;
                text-align: center;
                background: #f8f9fa;
                border-top: 1px solid #dee2e6;
              }
              
              .btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 15px 25px;
                margin: 8px;
                cursor: pointer;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
                min-width: 120px;
                touch-action: manipulation;
                -webkit-appearance: none;
              }
              
              .btn:active {
                background: #0056b3;
                transform: scale(0.98);
              }
              
              .btn-secondary {
                background: #6c757d;
              }
              
              .btn-secondary:active {
                background: #545b62;
              }
              
              .btn-success {
                background: #28a745;
              }
              
              .btn-success:active {
                background: #1e7e34;
              }
              
              .mobile-notice {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 15px;
                margin: 15px;
                border-radius: 4px;
                font-size: 14px;
                text-align: center;
              }
              
              @media print {
                .controls, .mobile-notice, .header-bar {
                  display: none !important;
                }
                
                body {
                  background: white;
                  padding: 0;
                }
                
                .container {
                  box-shadow: none;
                  max-width: none;
                }
                
                .ticket {
                  border: 2px dashed #000;
                  margin: 0;
                  font-size: 12px;
                }
                
                .header {
                  font-size: 14px;
                }
                
                .ticket-number {
                  font-size: 18px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header-bar">
                🎫 TICKET DE ESTACIONAMENTO
              </div>
              
              <div class="mobile-notice">
                📱 <strong>Instruções:</strong><br>
                • Use "Imprimir" para imprimir o ticket<br>
                • Use "Compartilhar" para salvar ou enviar<br>
                • Mantenha esta aba aberta se necessário
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
                  <div style="margin-top: 8px; font-size: 11px;">
                    📱 Escaneie para saída rápida
                  </div>
                </div>
                
                <div class="footer">
                  ⚠️ <strong>IMPORTANTE</strong> ⚠️<br>
                  Guarde este ticket ou tire uma foto<br>
                  Necessário para saída do veículo<br>
                  <br>
                  🔢 <strong>Código: ${ticketData.ticketNumber}</strong><br>
                  🕐 Entrada: ${formattedTime}
                </div>
              </div>
              
              <div class="controls">
                <button class="btn" onclick="window.print()">🖨️ Imprimir</button>
                <button class="btn btn-success" onclick="shareTicket()">📤 Compartilhar</button>
                <button class="btn btn-secondary" onclick="goBack()">🔙 Voltar</button>
              </div>
            </div>
            
            <script>
              console.log('Iniciando geração do QR Code...')
              
              // Função para gerar QR Code
              function generateQRCode() {
                const qrData = encodeURIComponent('${qrCodeContent}')
                const qrSize = 100
                const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' + qrSize + 'x' + qrSize + '&data=' + qrData + '&margin=1'
                
                const img = document.createElement('img')
                img.src = qrUrl
                img.style.width = qrSize + 'px'
                img.style.height = qrSize + 'px'
                img.style.border = '1px solid #000'
                img.style.borderRadius = '4px'
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
              
              // Função para compartilhar (mobile)
              function shareTicket() {
                if (navigator.share) {
                  navigator.share({
                    title: 'Ticket de Estacionamento - ${ticketData.ticketNumber}',
                    text: 'Ticket: ${ticketData.ticketNumber}\\nPlaca: ${ticketData.plate}\\nEntrada: ${formattedTime}',
                    url: window.location.href
                  }).catch(console.error)
                } else {
                  // Fallback: copiar para clipboard
                  const text = 'Ticket: ${ticketData.ticketNumber}\\nPlaca: ${ticketData.plate}\\nEntrada: ${formattedTime}'
                  navigator.clipboard.writeText(text).then(() => {
                    alert('📋 Informações copiadas para a área de transferência!')
                  }).catch(() => {
                    alert('ℹ️ Ticket: ${ticketData.ticketNumber}\\nPlaca: ${ticketData.plate}')
                  })
                }
              }
              
              // Função para voltar
              function goBack() {
                if (window.history.length > 1) {
                  window.history.back()
                } else {
                  window.close()
                }
              }
              
              // Prevenir fechamento acidental
              window.addEventListener('beforeunload', function(e) {
                e.preventDefault()
                e.returnValue = 'Tem certeza que deseja sair? O ticket será perdido.'
                return 'Tem certeza que deseja sair? O ticket será perdido.'
              })
              
              // Aguardar carregamento
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

        printWindow.document.write(printHTML)
        printWindow.document.close()
      } else {
        // Para desktop, usar popup tradicional
        const printWindow = window.open("", "_blank", "width=400,height=700,scrollbars=yes,resizable=yes")

        if (!printWindow) {
          throw new Error("Não foi possível abrir a janela de impressão")
        }

        // HTML para desktop (código anterior)
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
                  document.getElementById('qrcode').appendChild(img)
                }
                
                img.onerror = function() {
                  document.getElementById('qrcode').innerHTML = '<div class="qr-placeholder">QR Code<br>Indisponível<br>📱</div>'
                }
              }
              
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', generateQRCode)
              } else {
                generateQRCode()
              }
              
              window.focus()
            </script>
          </body>
          </html>
        `

        printWindow.document.write(printHTML)
        printWindow.document.close()
      }

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
