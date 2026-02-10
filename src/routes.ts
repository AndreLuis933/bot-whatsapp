import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { getWhatsAppClient } from "./whatsapp-client";

export const botZapRoutes = new Hono();

const whatsappClient = getWhatsAppClient();

const dasNotificationSchema = z.object({
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
      dasNotification:
        "POST /das-notification - Envia código de barras e PDF da DAS",
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
            ? "Aguardando autenticação. Escaneie o QR Code no terminal"
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

botZapRoutes.post(
  "/das-notification",
  zValidator("json", dasNotificationSchema),
  async (c) => {
    try {
      const status = whatsappClient.getStatus();

      if (!status.ready) {
        return c.json(
          {
            error: "Cliente WhatsApp não está pronto",
            ready: false,
            hasQrCode: status.hasQrCode,
            message: status.hasQrCode
              ? "Escaneie o QR Code no terminal para autenticar"
              : "Cliente inicializando...",
          },
          503,
        );
      }

      const { barcode, pdfBase64, pdfFilename } = c.req.valid("json");

      await whatsappClient.sendDasNotification(barcode, pdfBase64, pdfFilename);

      return c.json({
        success: true,
        message: "DAS enviada com sucesso para todos os números",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao enviar DAS:", error);
      return c.json(
        {
          error: "Falha ao enviar DAS",
          details:
            error instanceof Error ? error.message : "Erro desconhecido",
        },
        500,
      );
    }
  },
);
