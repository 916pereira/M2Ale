require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const dashboardRoutes = require("./routes/dashboard");
const chamadosRoutes = require("./routes/chamados");

const app = express();

const PORT = Number(process.env.PORT || 3001);

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chamados", chamadosRoutes);

app.get("/", (req, res) => {
  res.json({
    sistema: "Thindesk",
    mensagem: "API funcionando"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS banco");

    res.json({
      status: "ok",
      banco: rows[0].banco
    });
  } catch (error) {
    console.error("Erro na conexão com o banco:", error.message);

    res.status(503).json({
      status: "erro",
      mensagem: "Não foi possível conectar ao banco de dados"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Thindesk executando em http://localhost:${PORT}`);
});