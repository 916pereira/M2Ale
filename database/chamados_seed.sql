INSERT INTO thindesk_db.chamados
(titulo, descricao, pedido_id, tipo_id, status_id, solicitante_id, tecnico_id, prioridade, criado_em, resolvido_em)
VALUES
('Pedido não apareceu na cozinha', 'Pedido registrado mas não enviado para impressão.', 1, 1, 4, 4, 2, 'ALTA', '2026-10-20 18:40:00', '2026-10-20 19:10:00'),
('Pagamento recusado indevidamente', 'Pagamento aprovado pelo banco mas recusado no sistema.', 2, 2, 4, 5, 3, 'ALTA', '2026-10-22 19:20:00', '2026-10-22 20:00:00'),
('Impressora sem conexão', 'Impressora da cozinha desconectada.', 3, 3, 4, 4, 2, 'MEDIA', '2026-10-25 20:10:00', '2026-10-25 20:45:00'),
('Pedido duplicado no sistema', 'Mesmo pedido registrado duas vezes.', 4, 4, 4, 5, 3, 'MEDIA', '2026-10-28 18:50:00', '2026-10-28 19:15:00'),
('Sistema ficou indisponível', 'Aplicação não respondeu durante o atendimento.', 5, 5, 4, 4, 2, 'CRITICA', '2026-11-01 19:30:00', '2026-11-01 20:20:00'),
('Valor do pedido incorreto', 'Total exibido diferente dos itens cadastrados.', 6, 6, 4, 5, 3, 'MEDIA', '2026-11-03 20:15:00', '2026-11-03 21:00:00'),
('Pedido não sincronizado', 'Pedido não atualizado no painel da cozinha.', 7, 1, 4, 4, 2, 'ALTA', '2026-11-05 18:10:00', '2026-11-05 18:50:00'),
('Erro no pagamento por cartão', 'Sistema não confirmou transação.', 8, 2, 4, 5, 3, 'ALTA', '2026-11-07 21:05:00', '2026-11-07 21:40:00'),
('Impressão com caracteres incorretos', 'Comanda impressa com texto ilegível.', 9, 3, 4, 4, 2, 'BAIXA', '2026-11-10 19:35:00', '2026-11-10 20:05:00'),
('Pedido duplicado após atualização', 'Atualização da página duplicou pedido.', 10, 4, 4, 5, 3, 'MEDIA', '2026-11-12 20:20:00', '2026-11-12 21:00:00'),
('Falha ao cadastrar pedido', 'Sistema apresenta erro ao salvar pedido.', NULL, 1, 1, 4, NULL, 'ALTA', '2026-11-12 21:10:00', NULL),
('Pagamento não identificado', 'Pagamento realizado não aparece no sistema.', NULL, 2, 2, 5, 3, 'ALTA', '2026-11-11 18:30:00', NULL),
('Impressora com papel travado', 'Comandas não estão sendo impressas.', NULL, 3, 3, 4, 2, 'MEDIA', '2026-11-10 20:30:00', NULL),
('Pedido duplicado no caixa', 'Sistema registrou pedido em duplicidade.', NULL, 4, 1, 5, NULL, 'MEDIA', '2026-11-09 19:00:00', NULL),
('Servidor fora do ar', 'Sistema de pedidos indisponível.', NULL, 5, 2, 4, 2, 'CRITICA', '2026-11-08 20:00:00', NULL),
('Erro ao atualizar status', 'Pedido permanece como recebido.', NULL, 6, 3, 5, 3, 'BAIXA', '2026-11-07 18:20:00', NULL),
('Lentidão no registro de pedidos', 'Cadastro demora mais que o esperado.', NULL, 1, 2, 4, 2, 'MEDIA', '2026-11-06 19:10:00', NULL),
('Falha intermitente no pagamento', 'Alguns pagamentos apresentam erro.', NULL, 2, 1, 5, NULL, 'ALTA', '2026-11-05 20:15:00', NULL),
('Impressora parou de responder', 'Equipamento não recebe novas comandas.', NULL, 3, 5, 4, 3, 'MEDIA', '2026-11-04 18:40:00', NULL),
('Erro na atualização de pedido', 'Alterações não aparecem no painel.', NULL, 6, 2, 5, 2, 'MEDIA', '2026-11-03 19:30:00', NULL);