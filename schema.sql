-- ============================================================================
-- MontaJá - Esquema de Banco de Dados Relacional (SQL DDL & Seeds)
-- Compatível com SQLite, PostgreSQL e MySQL
-- ============================================================================

-- 1. TABELA DE MONTADORES
CREATE TABLE IF NOT EXISTS montadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    verificado BOOLEAN DEFAULT 1,
    avaliacao REAL DEFAULT 5.0,
    total_avaliacoes INTEGER DEFAULT 1,
    trabalhos_concluidos INTEGER DEFAULT 1,
    tempo_resposta VARCHAR(50) DEFAULT 'Responde em ~15 min',
    dias_garantia INTEGER DEFAULT 30,
    foto TEXT,
    whatsapp VARCHAR(20) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    bairros_atendimento TEXT NOT NULL,
    anos_experiencia INTEGER DEFAULT 1,
    bio TEXT,
    fotos_portfolio TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE ESPECIALIDADES (VÍNCULO N:1 OU N:N)
CREATE TABLE IF NOT EXISTS montador_especialidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    montador_id INTEGER NOT NULL,
    especialidade VARCHAR(50) NOT NULL,
    FOREIGN KEY (montador_id) REFERENCES montadores(id) ON DELETE CASCADE
);

-- 3. INDEXES PARA PERFORMANCE NAS BUSCAS POR CIDADE E BAIRRO
CREATE INDEX IF NOT EXISTS idx_montadores_cidade ON montadores(cidade);
CREATE INDEX IF NOT EXISTS idx_especialidades_nome ON montador_especialidades(especialidade);

-- ============================================================================
-- DADOS INICIAIS DE TESTE (SEEDS)
-- ============================================================================

INSERT INTO montadores (id, nome, verificado, avaliacao, total_avaliacoes, trabalhos_concluidos, tempo_resposta, dias_garantia, foto, whatsapp, cidade, bairros_atendimento, anos_experiencia, bio, fotos_portfolio) 
VALUES 
(1, 'Carlos Eduardo Silva', 1, 4.9, 156, 156, 'Responde em ~15 min', 30, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80', '11987654321', 'São Paulo', 'Moema, Pinheiros, Vila Mariana e Centro', 7, 'Especialista em montagem de guarda-roupas grandes e cozinhas planejadas. Atendimento rápido e limpo com ferramentas profissionais.', '["https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=300&q=80","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=300&q=80","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80"]'),
(2, 'Marcelo Oliveira', 1, 4.8, 98, 98, 'Responde em ~30 min', 15, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80', '11976543210', 'São Paulo', 'Tatuapé, Anália Franco, Mooca e Região Leste', 5, 'Pontualidade e cuidado com seu imóvel. Montagem de escritórios corporativos, home office e reparos em gavetas e portas.', '["https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=80","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80"]'),
(3, 'Roberto "Beto" Santos', 1, 5.0, 210, 210, 'Responde em ~15 min', 90, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', '21998765432', 'Rio de Janeiro', 'Barra da Tijuca, Recreio, Copacabana e Botafogo', 10, 'Mais de 10 anos no ramo de montagens finas. Instalação perfeita de armários sob medida, nichos e suportes de TV na parede.', '["https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=300&q=80","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=300&q=80","https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=300&q=80"]'),
(4, 'Lucas Ferreira', 1, 4.7, 84, 84, 'Responde em ~1 hora', 30, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', '11965432109', 'São Paulo', 'Santo Amaro, Morumbi, Campo Belo e Grajaú', 4, 'Montador rápido para móveis convencionais (Ikea, MadeiraMadeira, Tok&Stok). Orçamento justo e sem enrolação.', '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80"]'),
(5, 'Juliana & André (Dupla)', 1, 4.9, 142, 142, 'Responde em ~15 min', 60, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', '31988776655', 'Belo Horizonte', 'Savassi, Lourdes, Buritis e Anchieta', 6, 'Trabalho em dupla para montagens complexas e grandes volumes. Entregamos seu ambiente pronto na metade do tempo!', '["https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=300&q=80","https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=300&q=80"]'),
(6, 'Fernando Souza', 1, 4.8, 115, 115, 'Responde em ~30 min', 30, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', '41999887766', 'Curitiba', 'Batel, Água Verde, Bigorrilho e Centro', 8, 'Especialista em desmontagem e remontagem para mudanças, além de regulagem de dobradiças e corrediças de gavetas.', '["https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=80","https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80"]');

-- INSERIR ESPECIALIDADES DOS MONTADORES
INSERT INTO montador_especialidades (montador_id, especialidade) VALUES
(1, 'Guarda-Roupas'), (1, 'Cozinhas Planejadas'), (1, 'Painéis de TV'),
(2, 'Móveis de Escritório'), (2, 'Guarda-Roupas'), (2, 'Reparos Gerais'),
(3, 'Cozinhas Planejadas'), (3, 'Painéis de TV'), (3, 'Reparos Gerais'),
(4, 'Guarda-Roupas'), (4, 'Móveis de Escritório'),
(5, 'Cozinhas Planejadas'), (5, 'Guarda-Roupas'), (5, 'Painéis de TV'),
(6, 'Reparos Gerais'), (6, 'Móveis de Escritório');
