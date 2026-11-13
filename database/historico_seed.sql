INSERT INTO thindesk_db.historico_chamados
(chamado_id, usuario_id, status_anterior_id, status_novo_id, consideracao_tecnica, criado_em)
SELECT
    c.id,
    COALESCE(c.tecnico_id, c.solicitante_id),
    NULL,
    c.status_id,
    CASE
        WHEN s.nome = 'RESOLVIDO'
            THEN 'Problema analisado e solucionado. Funcionamento validado.'
        WHEN s.nome = 'EM_ANDAMENTO'
            THEN 'Atendimento iniciado. Equipe técnica investigando a ocorrência.'
        WHEN s.nome = 'AGUARDANDO'
            THEN 'Aguardando informações adicionais para prosseguir.'
        WHEN s.nome = 'CANCELADO'
            THEN 'Chamado cancelado após verificação da ocorrência.'
        ELSE
            'Chamado registrado e aguardando atendimento técnico.'
    END,
    CASE
        WHEN s.nome = 'RESOLVIDO'
            THEN c.resolvido_em
        ELSE c.criado_em
    END
FROM thindesk_db.chamados c
INNER JOIN thindesk_db.status_chamado s
    ON s.id = c.status_id
WHERE NOT EXISTS (
    SELECT 1
    FROM thindesk_db.historico_chamados h
    WHERE h.chamado_id = c.id
);