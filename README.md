# Bot Zap

WhatsApp notification service that receives HTTP requests from other services and forwards messages (barcode + PDF) to configured phone numbers via WhatsApp.

Built with Bun, Hono, and whatsapp-web.js. Runs in Docker with headless Chromium.

## Endpoints

| Method | Path              | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | /health           | Service info                         |
| GET    | /status           | Connection check + test message      |
| POST   | /das-notification | Send DAS barcode + PDF to all numbers |

## Setup

Configure phone numbers in `.env`:

```env
PHONE_NUMBERS=55XXXXXXXXXXX@c.us,55XXXXXXXXXXX@c.us
```

Run with Docker Compose:

```bash
docker compose up -d
```

On first run, scan the QR code printed in the container logs to authenticate WhatsApp.
