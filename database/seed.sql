
INSERT INTO thindesk_db.usuarios
(nome, email, senha_hash, perfil)
VALUES
('Administrador Thindesk', 'admin@thindesk.local', 'SEM_LOGIN_CONFIGURADO', 'ADMIN'),
('Carlos Oliveira', 'carlos@thindesk.local', 'SEM_LOGIN_CONFIGURADO', 'TECNICO'),
('Mariana Santos', 'mariana@thindesk.local', 'SEM_LOGIN_CONFIGURADO', 'TECNICO'),
('Ana Ferreira', 'ana@thindesk.local', 'SEM_LOGIN_CONFIGURADO', 'FUNCIONARIO'),
('Pedro Lima', 'pedro@thindesk.local', 'SEM_LOGIN_CONFIGURADO', 'FUNCIONARIO');

INSERT INTO thindesk_db.tipos_chamado
(nome, descricao)
VALUES
('Falha no registro de pedido', 'Pedido não registrado corretamente'),
('Erro de pagamento', 'Falha no processamento de pagamentos'),
('Impressora da cozinha', 'Problemas de impressão dos pedidos'),
('Pedido duplicado', 'Pedidos registrados mais de uma vez'),
('Sistema indisponível', 'Sistema de pedidos fora do ar'),
('Erro de atualização', 'Informações do pedido não atualizadas');

INSERT INTO thindesk_db.status_chamado
(nome, descricao, finalizador)
VALUES
('ABERTO', 'Chamado aguardando atendimento', FALSE),
('EM_ANDAMENTO', 'Chamado em atendimento técnico', FALSE),
('AGUARDANDO', 'Chamado aguardando informações ou terceiros', FALSE),
('RESOLVIDO', 'Problema solucionado', TRUE),
('CANCELADO', 'Chamado cancelado', TRUE);

INSERT INTO thindesk_db.pedidos
(numero_pedido, cliente_nome, valor_total, status_pedido, criado_em)
VALUES
('PED-1001', 'João Silva', 89.90, 'ENTREGUE', '2026-10-20 18:30:00'),
('PED-1002', 'Maria Souza', 54.50, 'ENTREGUE', '2026-10-22 19:15:00'),
('PED-1003', 'Lucas Almeida', 112.00, 'ENTREGUE', '2026-10-25 20:00:00'),
('PED-1004', 'Fernanda Costa', 76.90, 'CANCELADO', '2026-10-28 18:45:00'),
('PED-1005', 'Rafael Mendes', 43.00, 'ENTREGUE', '2026-11-01 19:20:00'),
('PED-1006', 'Beatriz Rocha', 95.50, 'ENTREGUE', '2026-11-03 20:10:00'),
('PED-1007', 'Gabriel Martins', 68.00, 'ENTREGUE', '2026-11-05 18:00:00'),
('PED-1008', 'Juliana Ribeiro', 127.90, 'ENTREGUE', '2026-11-07 21:00:00'),
('PED-1009', 'Thiago Pereira', 59.90, 'PREPARANDO', '2026-11-10 19:30:00'),
('PED-1010', 'Camila Nunes', 84.00, 'RECEBIDO', '2026-11-12 20:15:00');
