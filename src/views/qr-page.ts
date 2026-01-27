export function getQrLoadingPage(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp - Aguardando QR Code</title>
        <style>
          ${getCommonStyles()}
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #25D366;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <script>
          setTimeout(() => location.reload(), 3000);
        </script>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h1>Aguardando QR Code...</h1>
          <p>O QR Code será exibido em alguns instantes.</p>
          <p><small>Recarregando automaticamente...</small></p>
        </div>
      </body>
    </html>
  `;
}

export function getQrAuthenticatedPage(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp - Autenticado</title>
        <style>
          ${getCommonStyles()}
          .success {
            font-size: 64px;
            color: #25D366;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h1>Já Autenticado!</h1>
          <p>O WhatsApp já está conectado e pronto para uso.</p>
        </div>
      </body>
    </html>
  `;
}

export function getQrScanPage(qrCodeDataUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp - Autenticação</title>
        <style>
          ${getCommonStyles()}
          .qr-container {
            margin: 30px 0;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 10px;
          }
          .qr-container img {
            max-width: 100%;
            height: auto;
            image-rendering: pixelated;
          }
          .instructions {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
            text-align: left;
          }
          .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 5px 0;
          }
          .refresh-btn {
            margin-top: 20px;
            padding: 10px 20px;
            background: #25D366;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
          .refresh-btn:hover {
            background: #128C7E;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Autenticação WhatsApp</h1>
          <p style="color: #666;">Escaneie o QR Code abaixo</p>
          
          <div class="qr-container">
            <img src="${qrCodeDataUrl}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            <strong>Como conectar:</strong>
            <ol>
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em <strong>Mais opções</strong> ou <strong>Configurações</strong></li>
              <li>Toque em <strong>Aparelhos conectados</strong></li>
              <li>Toque em <strong>Conectar aparelho</strong></li>
              <li>Aponte seu celular para esta tela para escanear o QR Code</li>
            </ol>
          </div>
          
          <button class="refresh-btn" onclick="location.reload()">
            🔄 Recarregar QR Code
          </button>
        </div>
      </body>
    </html>
  `;
}

function getCommonStyles(): string {
  return `
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 400px;
    }
    h1 {
      color: #128C7E;
      margin: 0 0 10px 0;
    }
    p {
      color: #666;
      margin: 10px 0;
    }
  `;
}
