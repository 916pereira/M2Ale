const express = require("express");
const pool = require("../config/database");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { status, prioridade, tipoId, dataInicio, dataFim } = req.query;
    const [rows] = await pool.query(`
      SELECT
        c.id,
        c.titulo,
        c.descricao,
        c.prioridade,
        c.criado_em AS criadoEm,
        c.atualizado_em AS atualizadoEm,
        c.resolvido_em AS resolvidoEm,
        c.pedido_id AS pedidoId,
        p.numero_pedido AS numeroPedido,
        t.id AS tipoId,
        t.nome AS tipo,
        s.id AS statusId,
        s.nome AS status,
        u.nome AS solicitante,
        tec.nome AS tecnico
      FROM chamados c
      LEFT JOIN pedidos p ON p.id = c.pedido_id
      INNER JOIN tipos_chamado t ON t.id = c.tipo_id
      INNER JOIN status_chamado s ON s.id = c.status_id
      INNER JOIN usuarios u ON u.id = c.solicitante_id
      LEFT JOIN usuarios tec ON tec.id = c.tecnico_id
      WHERE (? IS NULL OR s.nome = ?)
      AND (? IS NULL OR c.prioridade = ?)
      AND (? IS NULL OR c.tipo_id = ?)
      AND (? IS NULL OR c.criado_em >= ?)
      AND (? IS NULL OR c.criado_em < DATE_ADD(?, INTERVAL 1 DAY))
      ORDER BY c.criado_em DESC, c.id DESC
`, [
  status || null,
  status || null,
  prioridade || null,
  prioridade || null,
  tipoId || null,
  tipoId || null,
  dataInicio || null,
  dataInicio || null,
  dataFim || null,
  dataFim || null
]);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar chamados:", error.message);

    res.status(500).json({
      mensagem: "Erro ao listar chamados"
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do chamado inválido"
      });
    }

    const [rows] = await pool.query(`
      SELECT
        c.id,
        c.titulo,
        c.descricao,
        c.prioridade,
        c.criado_em AS criadoEm,
        c.atualizado_em AS atualizadoEm,
        c.resolvido_em AS resolvidoEm,
        p.numero_pedido AS numeroPedido,
        t.nome AS tipo,
        s.nome AS status,
        u.nome AS solicitante,
        tec.nome AS tecnico
      FROM chamados c
      LEFT JOIN pedidos p ON p.id = c.pedido_id
      INNER JOIN tipos_chamado t ON t.id = c.tipo_id
      INNER JOIN status_chamado s ON s.id = c.status_id
      INNER JOIN usuarios u ON u.id = c.solicitante_id
      LEFT JOIN usuarios tec ON tec.id = c.tecnico_id
      WHERE c.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        mensagem: "Chamado não encontrado"
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao consultar chamado:", error.message);

    res.status(500).json({
      mensagem: "Erro ao consultar chamado"
    });
  }
});

router.patch("/:id/status", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      mensagem: "ID do chamado inválido"
    });
  }
      const { status, usuarioId, consideracaoTecnica } = req.body || {};
      const idUsuario = Number(usuarioId);

  if (
    usuarioId === null ||
    usuarioId === undefined ||
    usuarioId === "" ||
    !Number.isSafeInteger(idUsuario) ||
    idUsuario <= 0
  ) {
    return res.status(400).json({
      mensagem: "ID do usuário inválido"
    });
  }

  const statusPermitidos = [
    "ABERTO",
    "EM_ANDAMENTO",
    "AGUARDANDO",
    "RESOLVIDO",
    "CANCELADO"
  ];

  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({
      mensagem: "Status inválido",
      statusPermitidos
    });
  }
      let conexao;

  try {
    conexao = await pool.getConnection();
    await conexao.beginTransaction();

    const [chamados] = await conexao.query(
      "SELECT id, status_id FROM chamados WHERE id = ? FOR UPDATE",
      [id]
    );

    if (chamados.length === 0) {
      await conexao.rollback();

      return res.status(404).json({
        mensagem: "Chamado não encontrado"
      });
    }
        const [statusEncontrados] = await conexao.query(
      "SELECT id FROM status_chamado WHERE nome = ?",
      [status]
    );

    if (statusEncontrados.length === 0) {
      await conexao.rollback();

      return res.status(400).json({
        mensagem: "Status não encontrado no banco de dados"
      });
    }

    const [usuarios] = await conexao.query(
      "SELECT id FROM usuarios WHERE id = ?",
      [idUsuario]
    );

    if (usuarios.length === 0) {
      await conexao.rollback();

      return res.status(404).json({
        mensagem: "Usuário não encontrado"
      });
    }
    const novoStatusId = statusEncontrados[0].id;
        if (chamados[0].status_id === novoStatusId) {
      await conexao.rollback();

      return res.status(409).json({
        mensagem: "O chamado já possui esse status"
      });
    }
        await conexao.query(`
      UPDATE chamados
      SET
        status_id = ?,
        resolvido_em = CASE
          WHEN ? = 'RESOLVIDO' THEN COALESCE(resolvido_em, NOW())
          ELSE NULL
        END,
        atualizado_em = NOW()
      WHERE id = ?
    `, [novoStatusId, status, id]);
        await conexao.query(`
      INSERT INTO historico_chamados (
        chamado_id,
        usuario_id,
        status_anterior_id,
        status_novo_id,
        consideracao_tecnica
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      id,
      idUsuario,
      chamados[0].status_id,
      novoStatusId,
      consideracaoTecnica || null
    ]);
        await conexao.commit();

    return res.status(200).json({
      mensagem: "Status do chamado atualizado com sucesso",
      chamadoId: id,
      statusAnteriorId: chamados[0].status_id,
      novoStatusId,
      status,
      usuarioId: idUsuario
    });
    } catch (error) {
    if (conexao) {
      await conexao.rollback();
    }

    console.error("Erro ao atualizar chamado:", error.message);

    return res.status(500).json({
      mensagem: "Erro ao atualizar chamado"
    });
  } finally {
    if (conexao) {
      conexao.release();
    }
  }
});

router.get("/:id/historico", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      mensagem: "ID do chamado inválido"
    });
  }
    try {
    const [chamados] = await pool.query(
      "SELECT id FROM chamados WHERE id = ?",
      [id]
    );

    if (chamados.length === 0) {
      return res.status(404).json({
        mensagem: "Chamado não encontrado"
      });
    }
    const [historico] = await pool.query(`
      SELECT
        h.id,
        h.chamado_id AS chamadoId,
        h.usuario_id AS usuarioId,
        u.nome AS usuario,
        anterior.nome AS statusAnterior,
        novo.nome AS statusNovo,
        h.consideracao_tecnica AS consideracaoTecnica,
        h.criado_em AS criadoEm
      FROM historico_chamados h
      INNER JOIN usuarios u ON u.id = h.usuario_id
      LEFT JOIN status_chamado anterior
        ON anterior.id = h.status_anterior_id
      LEFT JOIN status_chamado novo
        ON novo.id = h.status_novo_id
      WHERE h.chamado_id = ?
      ORDER BY h.criado_em ASC, h.id ASC
    `, [id]);

    res.json(historico);
  } catch (error) {
    console.error("Erro ao consultar histórico:", error.message);

    res.status(500).json({
      mensagem: "Erro ao consultar histórico do chamado"
    });
  }
});

router.post("/", async (req, res) => {
  const {
    titulo,
    descricao,
    prioridade,
    tipoId,
    solicitanteId,
    pedidoId
  } = req.body || {};
    if (typeof titulo !== "string" || titulo.trim().length < 5) {
    return res.status(400).json({
      mensagem: "O título deve conter pelo menos 5 caracteres"
    });
  }

  if (typeof descricao !== "string" || descricao.trim().length < 10) {
    return res.status(400).json({
      mensagem: "A descrição deve conter pelo menos 10 caracteres"
    });
  }
    const prioridadesPermitidas = [
    "BAIXA",
    "MEDIA",
    "ALTA",
    "CRITICA"
  ];

  if (!prioridadesPermitidas.includes(prioridade)) {
    return res.status(400).json({
      mensagem: "Prioridade inválida",
      prioridadesPermitidas
    });
  }
    const idTipo = Number(tipoId);
  const idSolicitante = Number(solicitanteId);

  if (
    tipoId === null ||
    tipoId === undefined ||
    tipoId === "" ||
    !Number.isSafeInteger(idTipo) ||
    idTipo <= 0
  ) {
    return res.status(400).json({
      mensagem: "ID do tipo de chamado inválido"
    });
  }

  if (
    solicitanteId === null ||
    solicitanteId === undefined ||
    solicitanteId === "" ||
    !Number.isSafeInteger(idSolicitante) ||
    idSolicitante <= 0
  ) {
    return res.status(400).json({
      mensagem: "ID do solicitante inválido"
    });
  }
    const idPedido = pedidoId === null ||
    pedidoId === undefined ||
    pedidoId === ""
      ? null
      : Number(pedidoId);

  if (
    idPedido !== null &&
    (!Number.isSafeInteger(idPedido) || idPedido <= 0)
  ) {
    return res.status(400).json({
      mensagem: "ID do pedido inválido"
    });
  }
    let conexao;

  try {
    conexao = await pool.getConnection();
    await conexao.beginTransaction();
    const [tipos] = await conexao.query(
      "SELECT id FROM tipos_chamado WHERE id = ?",
      [idTipo]
    );

    if (tipos.length === 0) {
      await conexao.rollback();

      return res.status(404).json({
        mensagem: "Tipo de chamado não encontrado"
      });
    }
        const [solicitantes] = await conexao.query(
      "SELECT id FROM usuarios WHERE id = ?",
      [idSolicitante]
    );

    if (solicitantes.length === 0) {
      await conexao.rollback();

      return res.status(404).json({
        mensagem: "Solicitante não encontrado"
      });
    }
        if (idPedido !== null) {
      const [pedidos] = await conexao.query(
        "SELECT id FROM pedidos WHERE id = ?",
        [idPedido]
      );

      if (pedidos.length === 0) {
        await conexao.rollback();

        return res.status(404).json({
          mensagem: "Pedido não encontrado"
        });
      }
    }
        const [statusIniciais] = await conexao.query(
      "SELECT id FROM status_chamado WHERE nome = ?",
      ["ABERTO"]
    );

    if (statusIniciais.length === 0) {
      await conexao.rollback();

      return res.status(500).json({
        mensagem: "Status inicial não configurado no banco de dados"
      });
    }

    const statusInicialId = statusIniciais[0].id;
    const [resultado] = await conexao.query(
      `INSERT INTO chamados
        (titulo, descricao, pedido_id, tipo_id, status_id, solicitante_id, prioridade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo.trim(),
        descricao.trim(),
        idPedido,
        idTipo,
        statusInicialId,
        idSolicitante,
        prioridade
      ]
    );

    const chamadoId = resultado.insertId;
        await conexao.query(
      `INSERT INTO historico_chamados
        (chamado_id, usuario_id, status_anterior_id, status_novo_id, consideracao_tecnica)
       VALUES (?, ?, ?, ?, ?)`,
      [
        chamadoId,
        idSolicitante,
        null,
        statusInicialId,
        "Chamado aberto pelo solicitante"
      ]
    );
        await conexao.commit();

    return res.status(201).json({
      mensagem: "Chamado cadastrado com sucesso",
      chamado: {
        id: chamadoId,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        prioridade,
        tipoId: idTipo,
        solicitanteId: idSolicitante,
        pedidoId: idPedido,
        status: "ABERTO"
      }
    });
    } catch (error) {
    if (conexao) {
      try {
        await conexao.rollback();
      } catch (rollbackError) {
        console.error("Erro ao desfazer transação:", rollbackError.message);
      }
    }

    console.error("Erro ao cadastrar chamado:", error.message);

    return res.status(500).json({
      mensagem: "Erro ao cadastrar chamado"
    });
  } finally {
    if (conexao) {
      conexao.release();
    }
  }
});

module.exports = router;