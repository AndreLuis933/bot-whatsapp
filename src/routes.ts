import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { getWhatsAppClient } from "./whatsapp-client";

export const botZapRoutes = new Hono();

const whatsappClient = getWhatsAppClient();

const sendMessageSchema = z.object({
  barcode: z.string().min(1, "Código de barras obrigatório"),
  pdfBase64: z.string().min(1, "PDF em base64 obrigatório"),
  pdfFilename: z.string().default("documento.pdf"),
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
