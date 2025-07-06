-- Criar tabela pessoa
CREATE TABLE IF NOT EXISTS pessoa (
    id SERIAL PRIMARY KEY,
    nm_nome VARCHAR(255) NOT NULL,
    tp_pessoa VARCHAR(2) NOT NULL CHECK (tp_pessoa IN ('PF', 'PJ')), -- PF = Pessoa Física, PJ = Pessoa Jurídica
    nr_cpf_cnpj VARCHAR(18) UNIQUE,
    nr_rg_ie VARCHAR(20),
    dt_nascimento_fundacao DATE,
    nm_email VARCHAR(255),
    nr_telefone VARCHAR(20),
    nr_celular VARCHAR(20),
    
    -- Endereço
    nm_endereco VARCHAR(255),
    nr_numero VARCHAR(10),
    nm_complemento VARCHAR(100),
    nm_bairro VARCHAR(100),
    nm_cidade VARCHAR(100),
    nm_estado VARCHAR(2),
    nr_cep VARCHAR(10),
    
    -- Campos específicos para PJ
    nm_nome_fantasia VARCHAR(255),
    nm_contato VARCHAR(255),
    
    -- Controle
    fl_ativo BOOLEAN DEFAULT true,
    tx_observacoes TEXT,
    dt_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pessoa_cpf_cnpj ON pessoa(nr_cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_pessoa_nome ON pessoa(nm_nome);
CREATE INDEX IF NOT EXISTS idx_pessoa_email ON pessoa(nm_email);
CREATE INDEX IF NOT EXISTS idx_pessoa_tipo ON pessoa(tp_pessoa);
CREATE INDEX IF NOT EXISTS idx_pessoa_ativo ON pessoa(fl_ativo);

-- Trigger para atualizar dt_atualizacao
CREATE OR REPLACE FUNCTION update_pessoa_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dt_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_pessoa_timestamp
    BEFORE UPDATE ON pessoa
    FOR EACH ROW
    EXECUTE FUNCTION update_pessoa_timestamp();

-- Inserir alguns dados de exemplo
INSERT INTO pessoa (nm_nome, tp_pessoa, nr_cpf_cnpj, nm_email, nr_telefone, nm_endereco, nm_cidade, nm_estado, nr_cep) VALUES
('João Silva Santos', 'PF', '123.456.789-01', 'joao.silva@email.com', '(11) 99999-1234', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567'),
('Maria Oliveira Costa', 'PF', '987.654.321-09', 'maria.oliveira@email.com', '(11) 88888-5678', 'Av. Paulista, 456', 'São Paulo', 'SP', '01310-100'),
('Empresa ABC Ltda', 'PJ', '12.345.678/0001-90', 'contato@empresaabc.com.br', '(11) 3333-4444', 'Rua Comercial, 789', 'São Paulo', 'SP', '04567-890'),
('Transportadora XYZ S/A', 'PJ', '98.765.432/0001-10', 'admin@transportadoraxyz.com.br', '(11) 2222-3333', 'Av. Industrial, 1000', 'São Paulo', 'SP', '08765-432');

-- Comentários nas colunas
COMMENT ON TABLE pessoa IS 'Tabela para cadastro de pessoas físicas e jurídicas';
COMMENT ON COLUMN pessoa.tp_pessoa IS 'Tipo de pessoa: PF = Pessoa Física, PJ = Pessoa Jurídica';
COMMENT ON COLUMN pessoa.nr_cpf_cnpj IS 'CPF para pessoa física ou CNPJ para pessoa jurídica';
COMMENT ON COLUMN pessoa.nr_rg_ie IS 'RG para pessoa física ou Inscrição Estadual para pessoa jurídica';
COMMENT ON COLUMN pessoa.dt_nascimento_fundacao IS 'Data de nascimento para PF ou data de fundação para PJ';
COMMENT ON COLUMN pessoa.nm_nome_fantasia IS 'Nome fantasia (apenas para pessoa jurídica)';
COMMENT ON COLUMN pessoa.nm_contato IS 'Nome da pessoa de contato (apenas para pessoa jurídica)';
