import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { getWhatsAppClient } from "./whatsapp-client";
import {
  getQrAuthenticatedPage,
  getQrLoadingPage,
  getQrScanPage,
} from "./views/qr-page";
import { generateQrCodeDataUrl } from "./utils/qr-generator";

export const botZapRoutes = new Hono();

const whatsappClient = getWhatsAppClient();

const sendMessageSchema = z.object({
  barcode: z.string().min(1, "Código de barras obrigatório"),
  pdfBase64: z.string().min(1, "PDF em base64 obrigatório"),
  pdfFilename: z.string().default("documento.pdf"),
});

// Rota principal
botZapRoutes.get("/", (c) => {
  return c.json({
    service: "WhatsApp Bot API",
    version: "1.0.0",
    endpoints: {
      status: "GET /status - Verifica status e envia mensagem de teste",
      qr: "GET /qr - Obtém QR Code para autenticação (HTML)",
      send: "POST /send - Envia código de barras e PDF",
    },
  });
});

botZapRoutes.get("/health", (c) => {
  return c.json({
    service: "WhatsApp Bot API",
    version: "1.0.0",
    endpoints: {
      status: "GET /status - Verifica status e envia mensagem de teste",
      qr: "GET /qr - Obtém QR Code para autenticação (HTML)",
      send: "POST /send - Envia código de barras e PDF",
    },
  });
});

// Status - envia mensagem de teste
botZapRoutes.get("/status", async (c) => {
  try {
    const status = whatsappClient.getStatus();

    if (!status.ready) {
      return c.json(
        {
          ready: false,
          hasQrCode: status.hasQrCode,
          message: status.hasQrCode
            ? "Aguardando autenticação. Acesse /qr para escanear o QR Code"
            : "Inicializando cliente WhatsApp...",
        },
        503,
      );
    }

    await whatsappClient.sendTestMessage();

    return c.json({
      ready: true,
      message: "Mensagem de teste enviada com sucesso!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro no status:", error);
    return c.json(
      {
        error: "Falha ao verificar status",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      500,
    );
  }
});

// QR Code - retorna HTML para visualização no navegador
botZapRoutes.get("/qr", async (c) => {
  const qrCode = whatsappClient.getQrCode();
  const status = whatsappClient.getStatus();

  if (!qrCode) {
    if (status.ready) {
      return c.html(getQrAuthenticatedPage());
    }
    return c.html(getQrLoadingPage());
  }

  try {
    // Gera QR Code localmente como Data URL
    const qrCodeDataUrl = await generateQrCodeDataUrl(qrCode);
    return c.html(getQrScanPage(qrCodeDataUrl));
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    return c.json(
      {
        error: "Falha ao gerar QR Code",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      500,
    );
  }
});

// Send - envia código de barras e PDF
botZapRoutes.post("/send", zValidator("json", sendMessageSchema), async (c) => {
  try {
    const status = whatsappClient.getStatus();

    if (!status.ready) {
      return c.json(
        {
          error: "Cliente WhatsApp não está pronto",
          ready: false,
          hasQrCode: status.hasQrCode,
          message: status.hasQrCode
            ? "Acesse /qr para autenticar"
            : "Cliente inicializando...",
        },
        503,
      );
    }

    const { barcode, pdfBase64, pdfFilename } = c.req.valid("json");

    await whatsappClient.sendBarcodeAndPdf(barcode, pdfBase64, pdfFilename);

    return c.json({
      success: true,
      message: "Código de barras e PDF enviados com sucesso",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao enviar mensagens:", error);
    return c.json(
      {
        error: "Falha ao enviar mensagens",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      500,
    );
  }
});
