-- =====================================================
-- WAVE LISTING — Dados Iniciais
-- =====================================================

-- =====================================================
-- CATEGORIAS AMAZON BR (principais)
-- =====================================================

INSERT INTO categories (name, slug, max_title_chars) VALUES
  ('Eletrodomésticos', 'eletrodomesticos', 200),
  ('Eletrônicos', 'eletronicos', 200),
  ('Casa e Cozinha', 'casa-e-cozinha', 200),
  ('Ferramentas e Materiais de Construção', 'ferramentas', 200),
  ('Beleza e Cuidados Pessoais', 'beleza', 200),
  ('Bebê', 'bebe', 200),
  ('Brinquedos e Jogos', 'brinquedos', 200),
  ('Saúde e Cuidados Pessoais', 'saude', 200),
  ('Esporte e Lazer', 'esporte', 200),
  ('Moda', 'moda', 80),
  ('Pet Shop', 'pet-shop', 200),
  ('Informática', 'informatica', 200),
  ('Automotivo', 'automotivo', 200),
  ('Livros', 'livros', 200),
  ('Papelaria e Escritório', 'papelaria', 200);

-- =====================================================
-- EVENTOS SAZONAIS BRASIL (globais — organization_id NULL)
-- =====================================================

INSERT INTO seasonal_events (nome, data_inicio, data_fim, tipo, descricao) VALUES
  ('Natal', '2026-12-01', '2026-12-25', 'comercial', 'Principal data do varejo brasileiro'),
  ('Black Friday', '2026-11-27', '2026-11-27', 'comercial', 'Maior evento de descontos do ano'),
  ('Cyber Monday', '2026-11-30', '2026-11-30', 'comercial', 'Continuação da Black Friday'),
  ('Dia das Mães', '2026-05-10', '2026-05-10', 'comercial', 'Segunda maior data do varejo'),
  ('Dia dos Pais', '2026-08-09', '2026-08-09', 'comercial', 'Importante para eletrônicos e ferramentas'),
  ('Dia dos Namorados', '2026-06-12', '2026-06-12', 'comercial', 'Forte em beleza, joias e perfumes'),
  ('Dia das Crianças', '2026-10-12', '2026-10-12', 'comercial', 'Forte em brinquedos e jogos'),
  ('Prime Day', '2026-07-10', '2026-07-11', 'comercial', 'Evento exclusivo Amazon Prime'),
  ('Dia do Consumidor', '2026-03-15', '2026-03-15', 'comercial', 'Crescendo como data de promoções'),
  ('Carnaval', '2026-02-16', '2026-02-17', 'feriado', 'Impacta logística e entregas'),
  ('Semana do Brasil', '2026-09-07', '2026-09-07', 'comercial', 'Evento Amazon inspirado no Dia da Independência'),
  ('Amazon Fashion Week', '2026-04-01', '2026-04-07', 'comercial', 'Foco em moda e acessórios');
