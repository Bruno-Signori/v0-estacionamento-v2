"use client"

import { useState } from "react"

interface TicketData {
  ticketNumber: string
  plate: string
  vehicleType: string
  entryTime: Date
  marca?: string
  modelo?: string
  cor?: string
}

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false)

  const printTicketAuto = async (ticketData: TicketData): Promise<void> => {
    setIsPrinting(true)

    return new Promise((resolve) => {
      try {
        const formattedTime = new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(ticketData.entryTime)

        const qrCodeContent = JSON.stringify({
          ticket: ticketData.ticketNumber,
          plate: ticketData.plate,
          type: ticketData.vehicleType,
          entryTime: ticketData.entryTime.toISOString(),
          version: "2.0",
          system: "parkgestor",
        })

        const printWindow = window.open("", "_blank", "width=400,height=600")

        if (!printWindow) {
          console.error("Não foi possível abrir a janela de impressão")
          setIsPrinting(false)
          resolve()
          return
        }

        const printHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Ticket - ${ticketData.ticketNumber}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                padding: 5px;
                background: white;
                color: black;
              }
              
              .ticket {
                text-align: center;
                width: 100%;
                max-width: 280px;
                margin: 0 auto;
                border: 2px dashed #000;
                padding: 10px;
              }
              
              .header {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 8px;
                border-bottom: 1px dashed #000;
                padding-bottom: 8px;
              }
              
              .ticket-number {
                font-size: 20px;
                font-weight: bold;
                margin: 8px 0;
                background: #f0f0f0;
                padding: 8px;
                border: 2px solid #000;
                letter-spacing: 2px;
              }
              
              .info {
                margin: 8px 0;
                text-align: left;
                font-size: 11px;
              }
              
              .info-row {
                display: flex;
                justify-content: space-between;
                margin: 4px 0;
                padding: 3px 0;
                border-bottom: 1px dotted #ccc;
              }
              
              .qr-container {
                margin: 10px 0;
                text-align: center;
                padding: 8px;
                background: #fafafa;
              }
              
              .footer {
                margin-top: 10px;
                border-top: 1px dashed #000;
                padding-top: 8px;
                font-size: 9px;
                text-align: center;
              }
              
              .important {
                background: #fffacd;
                padding: 5px;
                margin-top: 5px;
                border: 1px solid #000;
              }
              
              @media print {
                body { padding: 0; }
                .ticket {
                  border: 2px dashed #000;
                  max-width: 58mm;
                  font-size: 9px;
                }
                .header { font-size: 11px; }
                .ticket-number { font-size: 14px; }
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
                <div class="info-row">
                  <strong>Data/Hora:</strong>
                  <span>${formattedTime}</span>
                </div>
                <div class="info-row">
                  <strong>Placa:</strong>
                  <span style="font-weight:bold;font-size:13px">${ticketData.plate}</span>
                </div>
                <div class="info-row">
                  <strong>Tipo:</strong>
                  <span>${ticketData.vehicleType.toUpperCase()}</span>
                </div>
                ${ticketData.marca ? `<div class="info-row"><strong>Marca:</strong><span>${ticketData.marca}</span></div>` : ""}
                ${ticketData.modelo ? `<div class="info-row"><strong>Modelo:</strong><span>${ticketData.modelo}</span></div>` : ""}
                ${ticketData.cor ? `<div class="info-row"><strong>Cor:</strong><span>${ticketData.cor}</span></div>` : ""}
              </div>
              
              <div class="qr-container">
                <div id="qrcode"></div>
                <div style="margin-top: 5px; font-size: 8px;">
                  Escaneie para saida rapida
                </div>
              </div>
              
              <div class="footer">
                <div class="important">
                  <strong>GUARDE ESTE TICKET</strong><br>
                  Necessario para saida do veiculo
                </div>
                <div style="margin-top:5px">
                  Codigo: <strong>${ticketData.ticketNumber}</strong>
                </div>
              </div>
            </div>
            
            <script>
              const qrData = encodeURIComponent('${qrCodeContent}');
              const qrSize = 70;
              const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' + qrSize + 'x' + qrSize + '&data=' + qrData + '&margin=0';
              
              const img = document.createElement('img');
              img.src = qrUrl;
              img.style.width = qrSize + 'px';
              img.style.height = qrSize + 'px';
              
              img.onload = function() {
                document.getElementById('qrcode').appendChild(img);
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 300);
              };
              
              img.onerror = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 100);
              };
            </script>
          </body>
          </html>
        `

        printWindow.document.write(printHTML)
        printWindow.document.close()

        const checkClosed = setInterval(() => {
          if (printWindow.closed) {
            clearInterval(checkClosed)
            setIsPrinting(false)
            resolve()
          }
        }, 200)

        setTimeout(() => {
          clearInterval(checkClosed)
          setIsPrinting(false)
          resolve()
        }, 10000)
      } catch (error) {
        console.error("Erro ao imprimir:", error)
        setIsPrinting(false)
        resolve()
      }
    })
  }

  const printTicket = async (ticketData: TicketData) => {
    setIsPrinting(true)

    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      const formattedTime = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(ticketData.entryTime)

      const qrCodeContent = JSON.stringify({
        ticket: ticketData.ticketNumber,
        plate: ticketData.plate,
        type: ticketData.vehicleType,
        entryTime: ticketData.entryTime.toISOString(),
        version: "2.0",
        system: "parkgestor",
      })

      if (isMobile) {
        const printWindow = window.open("", "_blank")

        if (!printWindow) {
          throw new Error("Não foi possível abrir a janela de impressão")
        }

        const printHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket - ${ticketData.ticketNumber}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Courier New', monospace; padding: 10px; background: #f5f5f5; }
              .container { max-width: 400px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
              .ticket { text-align: center; padding: 20px; border: 2px dashed #000; margin: 15px; }
              .header { font-weight: bold; font-size: 16px; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
              .ticket-number { font-size: 22px; font-weight: bold; margin: 10px 0; background: #fffacd; padding: 10px; border: 2px solid #000; }
              .info { margin: 10px 0; text-align: left; }
              .info-row { display: flex; justify-content: space-between; margin: 5px 0; padding: 5px 0; border-bottom: 1px dotted #ccc; }
              .qr-container { margin: 15px 0; text-align: center; padding: 10px; background: #f9f9f9; }
              .footer { margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; font-size: 11px; }
              .controls { padding: 15px; text-align: center; background: #f0f0f0; }
              .btn { background: #007bff; color: white; border: none; padding: 12px 20px; margin: 5px; cursor: pointer; border-radius: 6px; font-size: 14px; }
              @media print { .controls { display: none !important; } }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="controls">
                <button class="btn" onclick="window.print()">Imprimir</button>
                <button class="btn" style="background:#28a745" onclick="shareTicket()">Compartilhar</button>
              </div>
              <div class="ticket">
                <div class="header">PARKGESTOR<br>ESTACIONAMENTO</div>
                <div class="ticket-number">${ticketData.ticketNumber}</div>
                <div class="info">
                  <div class="info-row"><strong>Data/Hora:</strong><span>${formattedTime}</span></div>
                  <div class="info-row"><strong>Placa:</strong><span>${ticketData.plate}</span></div>
                  <div class="info-row"><strong>Tipo:</strong><span>${ticketData.vehicleType.toUpperCase()}</span></div>
                </div>
                <div class="qr-container"><div id="qrcode"></div></div>
                <div class="footer"><strong>GUARDE ESTE TICKET</strong><br>Necessario para saida</div>
              </div>
            </div>
            <script>
              const qrData = encodeURIComponent('${qrCodeContent}');
              const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=' + qrData;
              const img = document.createElement('img');
              img.src = qrUrl;
              img.style.width = '80px';
              document.getElementById('qrcode').appendChild(img);
              
              function shareTicket() {
                if (navigator.share) {
                  navigator.share({
                    title: 'Ticket ${ticketData.ticketNumber}',
                    text: 'Ticket: ${ticketData.ticketNumber} | Placa: ${ticketData.plate} | Entrada: ${formattedTime}'
                  });
                } else {
                  alert('Ticket: ${ticketData.ticketNumber}\\nPlaca: ${ticketData.plate}');
                }
              }
            </script>
          </body>
          </html>
        `

        printWindow.document.write(printHTML)
        printWindow.document.close()
      } else {
        const printWindow = window.open("", "_blank", "width=400,height=600")

        if (!printWindow) {
          throw new Error("Não foi possível abrir a janela de impressão")
        }

        const printHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Ticket - ${ticketData.ticketNumber}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Courier New', monospace; padding: 10px; }
              .controls { margin-bottom: 15px; text-align: center; }
              .btn { background: #007bff; color: white; border: none; padding: 10px 20px; margin: 5px; cursor: pointer; border-radius: 4px; }
              .ticket { text-align: center; max-width: 280px; margin: 0 auto; border: 2px dashed #000; padding: 15px; }
              .header { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
              .ticket-number { font-size: 18px; font-weight: bold; margin: 10px 0; background: #f0f0f0; padding: 8px; border: 1px solid #000; }
              .info { margin: 8px 0; text-align: left; font-size: 11px; }
              .info-row { display: flex; justify-content: space-between; margin: 5px 0; border-bottom: 1px dotted #ccc; padding: 3px 0; }
              .qr-container { margin: 10px 0; text-align: center; }
              .footer { margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; font-size: 10px; }
              @media print { .controls { display: none !important; } }
            </style>
          </head>
          <body>
            <div class="controls">
              <button class="btn" onclick="window.print()">Imprimir</button>
              <button class="btn" style="background:#6c757d" onclick="window.close()">Fechar</button>
            </div>
            <div class="ticket">
              <div class="header">PARKGESTOR<br>ESTACIONAMENTO</div>
              <div class="ticket-number">${ticketData.ticketNumber}</div>
              <div class="info">
                <div class="info-row"><strong>Data/Hora:</strong><span>${formattedTime}</span></div>
                <div class="info-row"><strong>Placa:</strong><span>${ticketData.plate}</span></div>
                <div class="info-row"><strong>Tipo:</strong><span>${ticketData.vehicleType.toUpperCase()}</span></div>
              </div>
              <div class="qr-container"><div id="qrcode"></div></div>
              <div class="footer"><strong>GUARDE ESTE TICKET</strong><br>Necessario para saida</div>
            </div>
            <script>
              const qrData = encodeURIComponent('${qrCodeContent}');
              const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=' + qrData;
              const img = document.createElement('img');
              img.src = qrUrl;
              img.style.width = '70px';
              document.getElementById('qrcode').appendChild(img);
            </script>
          </body>
          </html>
        `

        printWindow.document.write(printHTML)
        printWindow.document.close()
      }
    } finally {
      setIsPrinting(false)
    }
  }

  return { printTicket, printTicketAuto, isPrinting }
}
