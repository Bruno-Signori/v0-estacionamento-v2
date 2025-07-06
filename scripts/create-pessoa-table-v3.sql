-- Remover tabela se existir (cuidado em produção!)
DROP TABLE IF EXISTS pessoa CASCADE;

-- Criar tabela pessoa com estrutura simplificada
CREATE TABLE pessoa (
    id SERIAL PRIMARY KEY,
    nm_pessoa VARCHAR(255) NOT NULL,
    tp_pessoa VARCHAR(2) NOT NULL DEFAULT 'PF' CHECK (tp_pessoa IN ('PF', 'PJ')),
    nr_cpf_cnpj VARCHAR(18),
    nr_rg_ie VARCHAR(50),
    nm_email VARCHAR(255),
    nr_telefone VARCHAR(20),
    nr_celular VARCHAR(20),
    ds_endereco TEXT,
    nr_cep VARCHAR(10),
    nm_cidade VARCHAR(100),
    nm_estado VARCHAR(2),
    fl_ativo BOOLEAN DEFAULT true,
    ds_observacoes TEXT,
    dt_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pessoa_cpf_cnpj ON pessoa(nr_cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_pessoa_nome ON pessoa(nm_pessoa);
CREATE INDEX IF NOT EXISTS idx_pessoa_email ON pessoa(nm_email);
CREATE INDEX IF NOT EXISTS idx_pessoa_tipo ON pessoa(tp_pessoa);
CREATE INDEX IF NOT EXISTS idx_pessoa_ativo ON pessoa(fl_ativo);

-- Inserir alguns dados de exemplo
INSERT INTO pessoa (nm_pessoa, tp_pessoa, nr_cpf_cnpj, nm_email, nr_telefone, ds_endereco, nr_cep, nm_cidade, nm_estado) VALUES
('João Silva Santos', 'PF', '123.456.789-01', 'joao.silva@email.com', '(11) 99999-1234', 'Rua das Flores, 123', '01234-567', 'São Paulo', 'SP'),
('Maria Oliveira Costa', 'PF', '987.654.321-09', 'maria.oliveira@email.com', '(11) 88888-5678', 'Av. Paulista, 456', '01310-100', 'São Paulo', 'SP'),
('Empresa ABC Ltda', 'PJ', '12.345.678/0001-90', 'contato@empresaabc.com', '(11) 3333-4444', 'Rua Comercial, 789', '04567-890', 'São Paulo', 'SP'),
('Tech Solutions S.A.', 'PJ', '98.765.432/0001-10', 'admin@techsolutions.com', '(11) 2222-3333', 'Av. Faria Lima, 1000', '01452-000', 'São Paulo', 'SP'),
('Carlos Mendes', 'PF', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('Ana Paula', 'PF', NULL, 'ana@email.com', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Função para atualizar dt_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_pessoa_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dt_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar timestamp
DROP TRIGGER IF EXISTS trigger_update_pessoa_timestamp ON pessoa;
CREATE TRIGGER trigger_update_pessoa_timestamp
    BEFORE UPDATE ON pessoa
    FOR EACH ROW
    EXECUTE FUNCTION update_pessoa_timestamp();
