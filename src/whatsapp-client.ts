import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

class WhatsAppClient {
  private client: Client | null = null;
  private isReady = false;
  private qrCodeData: string | null = null;
  private phoneNumber: string;

  constructor() {
    const phoneNumbers =
      process.env.PHONE_NUMBERS?.split(",")
        .map((num) => num.trim())
        .filter((num) => num.length > 0) || [];

    if (!phoneNumbers[0]) {
      throw new Error("PHONE_NUMBERS não configurado no .env");
    }

    this.phoneNumber = phoneNumbers[0];
    this.initialize();
  }

  private initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: "/app/.wwebjs_auth" }),
      puppeteer: {
        headless: true,
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
        args: [
          // Flags essenciais de segurança
          "--no-sandbox",
          "--disable-setuid-sandbox",

          // Otimizações de memória/CPU
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-software-rasterizer",

          // Desabilitar funcionalidades não necessárias
          "--disable-extensions",
          "--disable-background-networking",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-breakpad",
          "--disable-component-extensions-with-background-pages",
          "--disable-ipc-flooding-protection",
          "--disable-renderer-backgrounding",

          // Performance
          "--enable-features=NetworkService,NetworkServiceInProcess",
          "--hide-scrollbars",
          "--mute-audio",

          // Limitar uso de recursos
          "--no-first-run",
          "--no-default-browser-check",

          // ❌ REMOVER ESTAS:
          // "--no-zygote",
          // "--single-process",
          // "--disable-accelerated-2d-canvas",
          // "--disable-accelerated-jpeg-decoding",
          // "--disable-accelerated-mjpeg-decode",
          // "--disable-accelerated-video-decode",
          // "--blink-settings=imagesEnabled=false",
        ],
      },
    });

    this.client.on("qr", (qr) => {
      this.qrCodeData = qr;
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      console.log("WhatsApp Client is ready!");
      this.isReady = true;
      this.qrCodeData = null;
    });

    this.client.on("authenticated", () => {
      console.log("WhatsApp Client authenticated!");
      this.isReady = true;
    });

    this.client.on("auth_failure", (msg) => {
      console.error("Falha na autenticação:", msg);
      this.isReady = false;
    });

    this.client.on("disconnected", (reason) => {
      console.log("Cliente desconectado:", reason);
      this.isReady = false;
    });

    this.client.initialize();
  }

  public getStatus(): { ready: boolean; hasQrCode: boolean } {
    return {
      ready: this.isReady,
      hasQrCode: !!this.qrCodeData,
    };
  }

  public getQrCode(): string | null {
    return this.qrCodeData;
  }

  public async sendTestMessage(): Promise<void> {
    if (!this.isReady || !this.client) {
      throw new Error("Cliente WhatsApp não está pronto");
    }

    const formattedNumber = this.formatPhoneNumber(this.phoneNumber);
    const testMessage = "✅ Teste de conexão - WhatsApp API funcionando!";

    await this.client.sendMessage(formattedNumber, testMessage);
    console.log(`Mensagem de teste enviada para ${formattedNumber}`);
  }

  public async sendBarcodeAndPdf(
    barcode: string,
    pdfBase64: string,
    pdfFilename: string = "documento.pdf",
  ): Promise<void> {
    if (!this.isReady || !this.client) {
      throw new Error("Cliente WhatsApp não está pronto");
    }

    const formattedNumber = this.formatPhoneNumber(this.phoneNumber);

    await this.client.sendMessage(formattedNumber, barcode);
    console.log(`Código de barras enviado para ${formattedNumber}`);

    const media = new MessageMedia("application/pdf", pdfBase64, pdfFilename);
    await this.client.sendMessage(formattedNumber, media);
    console.log(`PDF enviado para ${formattedNumber}`);
  }

  private formatPhoneNumber(number: string): string {
    if (number.includes("@c.us")) {
      return number;
    }
    return `${number.replace(/\D/g, "")}@c.us`;
  }
}

let whatsappClientInstance: WhatsAppClient | null = null;

export function getWhatsAppClient(): WhatsAppClient {
  if (!whatsappClientInstance) {
    whatsappClientInstance = new WhatsAppClient();
  }
  return whatsappClientInstance;
}
