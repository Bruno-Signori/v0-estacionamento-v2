-- Inserir dados de teste para demonstrar o funcionamento do pátio

-- Inserir tipos de veículo se não existirem
INSERT INTO tipo_veiculo (nm_tipo, ds_descricao, vl_preco_hora, fl_ativo) 
VALUES 
  ('Carro', 'Veículo de passeio', 5.00, true),
  ('Moto', 'Motocicleta', 3.00, true),
  ('Caminhão', 'Veículo de carga', 10.00, true)
ON CONFLICT (nm_tipo) DO NOTHING;

-- Inserir alguns veículos de teste
INSERT INTO veiculo (nr_placa, nm_modelo, nm_cor, id_tipo_veiculo, fl_ativo)
SELECT 
  'ABC1234', 'Civic', 'Branco', tv.id, true
FROM tipo_veiculo tv WHERE tv.nm_tipo = 'Carro'
ON CONFLICT (nr_placa) DO NOTHING;

INSERT INTO veiculo (nr_placa, nm_modelo, nm_cor, id_tipo_veiculo, fl_ativo)
SELECT 
  'XYZ5678', 'CB600', 'Vermelha', tv.id, true
FROM tipo_veiculo tv WHERE tv.nm_tipo = 'Moto'
ON CONFLICT (nr_placa) DO NOTHING;

INSERT INTO veiculo (nr_placa, nm_modelo, nm_cor, id_tipo_veiculo, fl_ativo)
SELECT 
  'DEF9012', 'Corolla', 'Prata', tv.id, true
FROM tipo_veiculo tv WHERE tv.nm_tipo = 'Carro'
ON CONFLICT (nr_placa) DO NOTHING;

-- Inserir alguns tickets ativos (sem saída) para teste
INSERT INTO ticket (
  nr_ticket, 
  nr_placa, 
  dt_entrada, 
  id_tipo_veiculo, 
  fl_pago, 
  vl_pago, 
  dt_saida
)
SELECT 
  'T' || LPAD(nextval('ticket_sequence')::text, 6, '0'),
  'ABC1234',
  NOW() - INTERVAL '2 hours',
  tv.id,
  false,
  NULL,
  NULL
FROM tipo_veiculo tv WHERE tv.nm_tipo = 'Carro'
ON CONFLICT DO NOTHING;

INSERT INTO ticket (
  nr_ticket, 
  nr_placa, 
  dt_entrada, 
  id_tipo_veiculo, 
  fl_pago, 
  vl_pago, 
  dt_saida
)
SELECT 
  'T' || LPAD(nextval('ticket_sequence')::text, 6, '0'),
  'XYZ5678',
  NOW() - INTERVAL '30 minutes',
  tv.id,
  false,
  NULL,
  NULL
FROM tipo_veiculo tv WHERE tv.nm_tipo = 'Moto'
ON CONFLICT DO NOTHING;

INSERT INTO ticket (
  nr_ticket, 
  nr_placa, 
  dt_entrada, 
  id_tipo_veiculo, 
  fl_pago, 
  vl_pago, 
  dt_saida
)
SELECT 
  'T' || LPAD(nextval('ticket_sequence')::text, 6, '0'),
  'DEF9012',
  NOW() - INTERVAL '4 hours',
  tv.id,
  false,
  NULL,
  NULL
FROM tipo_veiculo tv WHERE tv.nm_tipo = 'Carro'
ON CONFLICT DO NOTHING;

-- Criar sequence se não existir
CREATE SEQUENCE IF NOT EXISTS ticket_sequence START 1;
