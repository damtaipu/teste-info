import { buildApp } from "./app";

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
const app = buildApp();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});