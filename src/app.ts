import { cors } from "hono/cors";
import { Hono } from "hono";
import { botZapRoutes } from "./routes";

const app = new Hono();

app.use("*", cors());

app.route("/", botZapRoutes);

app.onError((err, c) => {
  console.error("Erro não tratado:", err);
  return c.json({ error: "Erro interno do servidor" }, 500);
});

export default app;
