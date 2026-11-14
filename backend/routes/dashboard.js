const express = require("express");
const pool = require("../config/database");

const router = express.Router();

router.get("/indicadores", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS totalChamados,
        COALESCE(SUM(s.nome = 'ABERTO'), 0) AS abertos,
        COALESCE(SUM(s.nome = 'EM_ANDAMENTO'), 0) AS emAndamento,
        COALESCE(SUM(s.nome = 'AGUARDANDO'), 0) AS aguardando,
        COALESCE(SUM(s.nome = 'RESOLVIDO'), 0) AS resolvidos,
        COALESCE(SUM(s.nome = 'CANCELADO'), 0) AS cancelados
      FROM chamados c
      INNER JOIN status_chamado s ON c.status_id = s.id
    `);

    res.json({
  totalChamados: Number(rows[0].totalChamados),
  abertos: Number(rows[0].abertos),
  emAndamento: Number(rows[0].emAndamento),
  aguardando: Number(rows[0].aguardando),
  resolvidos: Number(rows[0].resolvidos),
  cancelados: Number(rows[0].cancelados)
});
  } catch (error) {
    console.error("Erro ao buscar indicadores:", error.message);

    res.status(500).json({
      mensagem: "Erro ao buscar indicadores do dashboard"
    });
  }
});

router.get("/por-periodo", async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const [rows] = await pool.query(`
  SELECT
    DATE_FORMAT(criado_em, '%Y-%m-%d') AS data,
    COUNT(*) AS quantidade
  FROM chamados
  WHERE (? IS NULL OR criado_em >= ?)
    AND (? IS NULL OR criado_em < DATE_ADD(?, INTERVAL 1 DAY))
  GROUP BY DATE_FORMAT(criado_em, '%Y-%m-%d')
  ORDER BY data ASC
`, [
  dataInicio || null,
  dataInicio || null,
  dataFim || null,
  dataFim || null
]);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar chamados por período:", error.message);

    res.status(500).json({
      mensagem: "Erro ao buscar chamados por período"
    });
  }
});


router.get("/resolvidos-por-periodo", async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (
      (dataInicio && !/^\d{4}-\d{2}-\d{2}$/.test(dataInicio)) ||
      (dataFim && !/^\d{4}-\d{2}-\d{2}$/.test(dataFim)) ||
      (dataInicio && dataFim && dataInicio > dataFim)
    ) {
      return res.status(400).json({
        mensagem: "Período informado é inválido"
      });
    }

    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(c.resolvido_em, '%Y-%m-%d') AS data,
        COUNT(*) AS quantidade
      FROM chamados c
      INNER JOIN status_chamado s ON c.status_id = s.id
      WHERE s.nome = 'RESOLVIDO'
        AND c.resolvido_em IS NOT NULL
        AND (? IS NULL OR c.resolvido_em >= ?)
        AND (? IS NULL OR c.resolvido_em < DATE_ADD(?, INTERVAL 1 DAY))
      GROUP BY DATE_FORMAT(c.resolvido_em, '%Y-%m-%d')
      ORDER BY data ASC
    `, [
      dataInicio || null,
      dataInicio || null,
      dataFim || null,
      dataFim || null
    ]);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar chamados resolvidos:", error.message);

    res.status(500).json({
      mensagem: "Erro ao buscar chamados resolvidos por período"
    });
  }
});

router.get("/ranking-tipos", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id,
        t.nome AS tipo,
        COUNT(c.id) AS quantidade
      FROM tipos_chamado t
      LEFT JOIN chamados c ON c.tipo_id = t.id
      GROUP BY t.id, t.nome
      ORDER BY quantidade DESC, t.nome ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar ranking de tipos:", error.message);

    res.status(500).json({
      mensagem: "Erro ao buscar ranking de tipos de chamados"
    });
  }
});

module.exports = router;