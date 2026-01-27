import QRCode from "qrcode";

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    // Gera QR Code como Data URL (base64)
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 2,
    });
    return dataUrl;
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    throw new Error("Falha ao gerar QR Code");
  }
}
