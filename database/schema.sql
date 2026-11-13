
CREATE TABLE thindesk_db.usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('ADMIN', 'TECNICO', 'FUNCIONARIO') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE thindesk_db.pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(30) NOT NULL UNIQUE,
    cliente_nome VARCHAR(120) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status_pedido ENUM(
        'RECEBIDO',
        'PREPARANDO',
        'PRONTO',
        'ENTREGUE',
        'CANCELADO'
    ) NOT NULL DEFAULT 'RECEBIDO',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_pedidos_valor CHECK (valor_total >= 0)
);

CREATE TABLE thindesk_db.tipos_chamado (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE thindesk_db.status_chamado (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    finalizador BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE thindesk_db.chamados (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    pedido_id BIGINT NULL,
    tipo_id BIGINT NOT NULL,
    status_id BIGINT NOT NULL,
    solicitante_id BIGINT NOT NULL,
    tecnico_id BIGINT NULL,
    prioridade ENUM(
        'BAIXA',
        'MEDIA',
        'ALTA',
        'CRITICA'
    ) NOT NULL DEFAULT 'MEDIA',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolvido_em DATETIME NULL,
    CONSTRAINT fk_chamados_pedido FOREIGN KEY (pedido_id)
        REFERENCES thindesk_db.pedidos(id),
    CONSTRAINT fk_chamados_tipo FOREIGN KEY (tipo_id)
        REFERENCES thindesk_db.tipos_chamado(id),
    CONSTRAINT fk_chamados_status FOREIGN KEY (status_id)
        REFERENCES thindesk_db.status_chamado(id),
    CONSTRAINT fk_chamados_solicitante FOREIGN KEY (solicitante_id)
        REFERENCES thindesk_db.usuarios(id),
    CONSTRAINT fk_chamados_tecnico FOREIGN KEY (tecnico_id)
        REFERENCES thindesk_db.usuarios(id),
    INDEX idx_chamados_criado_em (criado_em),
    INDEX idx_chamados_resolvido_em (resolvido_em)
);

CREATE TABLE thindesk_db.historico_chamados (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chamado_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    status_anterior_id BIGINT NULL,
    status_novo_id BIGINT NULL,
    consideracao_tecnica TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historico_chamado FOREIGN KEY (chamado_id)
        REFERENCES thindesk_db.chamados(id),
    CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id)
        REFERENCES thindesk_db.usuarios(id),
    CONSTRAINT fk_historico_status_anterior FOREIGN KEY (status_anterior_id)
        REFERENCES thindesk_db.status_chamado(id),
    CONSTRAINT fk_historico_status_novo FOREIGN KEY (status_novo_id)
        REFERENCES thindesk_db.status_chamado(id),
    INDEX idx_historico_criado_em (criado_em)
);
