-- =====================================================
-- WAVE LISTING — Schema Inicial
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- =====================================================
-- ORGANIZAÇÕES / SELLERS
-- =====================================================

CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  plan            TEXT NOT NULL DEFAULT 'free', -- free | starter | pro | enterprise
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- MEMBROS (usuários vinculados a organizações)
-- =====================================================

CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'copywriter', -- admin | copywriter | designer | reviewer | analyst
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- =====================================================
-- CATEGORIAS AMAZON
-- =====================================================

CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  parent_id       UUID REFERENCES categories(id),
  max_title_chars INTEGER NOT NULL DEFAULT 200,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PRODUTOS / ASINs
-- =====================================================

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asin            TEXT,
  sku             TEXT NOT NULL,
  ean             TEXT,
  nome_comercial  TEXT NOT NULL,
  category_id     UUID REFERENCES categories(id),
  estado          TEXT NOT NULL DEFAULT 'rascunho',
    -- rascunho | em_processamento | revisao | aprovado | publicado | arquivado | erro
  score_qualidade INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, sku)
);

-- =====================================================
-- VERSÕES DE CONTEÚDO (histórico imutável)
-- =====================================================

CREATE TABLE content_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  versao          INTEGER NOT NULL DEFAULT 1,
  titulo          TEXT,
  bullets         JSONB,       -- array de 5 strings
  descricao       TEXT,
  keywords_back   TEXT,
  aplus_draft     JSONB,       -- estrutura de módulos A+
  gerado_por      TEXT NOT NULL DEFAULT 'ia', -- ia | seller | ia_aprovado
  score_conteudo  INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- IMAGENS DE PRODUTO
-- =====================================================

CREATE TABLE product_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  slot            INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 7),
  tipo            TEXT NOT NULL,
    -- hero | lifestyle | infografico | escala | embalagem | comparativo | detalhe
  storage_path    TEXT NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'pendente',
    -- pendente | processando | aprovada | rejeitada
  score_imagem    INTEGER,
  problemas       JSONB,
  resolucao_w     INTEGER,
  resolucao_h     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- JOBS DE PROCESSAMENTO
-- =====================================================

CREATE TABLE processing_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tipo_job        TEXT NOT NULL,
    -- analise_visual | geracao_conteudo | remocao_fundo | geracao_lifestyle | score_qualidade
  estado          TEXT NOT NULL DEFAULT 'pendente',
    -- pendente | processando | concluido | erro
  provider        TEXT,        -- claude | remove_bg | replicate | claid
  input_payload   JSONB,
  output_payload  JSONB,
  tokens_usados   INTEGER,
  custo_usd       DECIMAL(10,6),
  iniciado_em     TIMESTAMPTZ,
  concluido_em    TIMESTAMPTZ,
  erro_mensagem   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ALERTAS
-- =====================================================

CREATE TABLE product_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL,
    -- qualidade | conformidade | expirado | politica_amazon
  severidade      TEXT NOT NULL,
    -- critico | alto | medio | baixo
  mensagem        TEXT NOT NULL,
  resolvido       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- WORKFLOW — TASKS (Kanban)
-- =====================================================

CREATE TABLE workflow_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  titulo          TEXT NOT NULL,
  descricao       TEXT,
  stage           TEXT NOT NULL DEFAULT 'backlog',
    -- backlog | em_criacao | revisao | aprovacao | publicado
  assignee_id     UUID REFERENCES auth.users(id),
  prazo           TIMESTAMPTZ,
  prioridade      TEXT NOT NULL DEFAULT 'media', -- baixa | media | alta | critica
  sla_horas       INTEGER,
  compliance_ok   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CONCORRENTES
-- =====================================================

CREATE TABLE competitors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  asin_concorrente TEXT NOT NULL,
  nome            TEXT,
  monitorar       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE competitor_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id   UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  titulo          TEXT,
  preco           DECIMAL(10,2),
  score_reviews   DECIMAL(3,2),
  num_reviews     INTEGER,
  bsr             INTEGER,
  dados_raw       JSONB,
  captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- EXPERIMENTOS A/B
-- =====================================================

CREATE TABLE experiments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL, -- titulo | imagem | bullet
  variante_a      TEXT NOT NULL,
  variante_b      TEXT NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'ativo', -- ativo | pausado | concluido
  vencedor        TEXT,         -- a | b | null
  amazon_exp_id   TEXT,         -- ID no Amazon Experiments
  iniciado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  concluido_em    TIMESTAMPTZ
);

-- =====================================================
-- CALENDÁRIO SAZONAL
-- =====================================================

CREATE TABLE seasonal_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  -- NULL = evento global (padrão BR)
  nome            TEXT NOT NULL,
  data_inicio     DATE NOT NULL,
  data_fim        DATE NOT NULL,
  tipo            TEXT NOT NULL DEFAULT 'comercial',
    -- comercial | feriado | lancamento | proprio
  descricao       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- NOTIFICAÇÕES
-- =====================================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL,
  titulo          TEXT NOT NULL,
  mensagem        TEXT NOT NULL,
  lida            BOOLEAN NOT NULL DEFAULT FALSE,
  link            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES DE PERFORMANCE
-- =====================================================

CREATE INDEX idx_products_organization ON products(organization_id);
CREATE INDEX idx_products_estado ON products(estado);
CREATE INDEX idx_products_score ON products(score_qualidade);
CREATE INDEX idx_content_versions_product ON content_versions(product_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_processing_jobs_product ON processing_jobs(product_id);
CREATE INDEX idx_processing_jobs_estado ON processing_jobs(estado);
CREATE INDEX idx_product_alerts_product ON product_alerts(product_id);
CREATE INDEX idx_product_alerts_resolvido ON product_alerts(resolvido);
CREATE INDEX idx_workflow_tasks_organization ON workflow_tasks(organization_id);
CREATE INDEX idx_workflow_tasks_stage ON workflow_tasks(stage);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_lida ON notifications(lida);
