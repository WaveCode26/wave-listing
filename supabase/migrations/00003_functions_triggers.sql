-- =====================================================
-- WAVE LISTING — Funções e Triggers
-- =====================================================

-- =====================================================
-- updated_at automático
-- =====================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workflow_tasks_updated_at
  BEFORE UPDATE ON workflow_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- Auto-versionar content_versions
-- =====================================================

CREATE OR REPLACE FUNCTION set_content_version()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.versao = COALESCE(
    (SELECT MAX(versao) FROM content_versions WHERE product_id = NEW.product_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_version
  BEFORE INSERT ON content_versions
  FOR EACH ROW EXECUTE FUNCTION set_content_version();

-- =====================================================
-- Calcular score de qualidade do produto
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_product_score(p_product_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score INTEGER := 0;
  v_content content_versions%ROWTYPE;
  v_image_count INTEGER;
  v_has_lifestyle BOOLEAN;
  v_has_infografico BOOLEAN;
  v_has_escala BOOLEAN;
  v_has_aplus BOOLEAN;
BEGIN
  -- Buscar última versão de conteúdo
  SELECT * INTO v_content
  FROM content_versions
  WHERE product_id = p_product_id
  ORDER BY versao DESC
  LIMIT 1;

  -- Buscar dados de imagens
  SELECT
    COUNT(*),
    BOOL_OR(tipo = 'lifestyle'),
    BOOL_OR(tipo = 'infografico'),
    BOOL_OR(tipo = 'escala')
  INTO v_image_count, v_has_lifestyle, v_has_infografico, v_has_escala
  FROM product_images
  WHERE product_id = p_product_id AND estado = 'aprovada';

  v_has_aplus := v_content.aplus_draft IS NOT NULL;

  -- SCORE CONTEÚDO (60 pontos)
  -- Título (20 pts)
  IF v_content.titulo IS NOT NULL AND LENGTH(v_content.titulo) BETWEEN 50 AND 200 THEN
    v_score := v_score + 20;
  ELSIF v_content.titulo IS NOT NULL THEN
    v_score := v_score + 10;
  END IF;

  -- Bullets (20 pts)
  IF v_content.bullets IS NOT NULL AND jsonb_array_length(v_content.bullets) = 5 THEN
    v_score := v_score + 20;
  ELSIF v_content.bullets IS NOT NULL AND jsonb_array_length(v_content.bullets) >= 3 THEN
    v_score := v_score + 10;
  END IF;

  -- A+ (15 pts)
  IF v_has_aplus THEN
    v_score := v_score + 15;
  END IF;

  -- Backend keywords (5 pts)
  IF v_content.keywords_back IS NOT NULL AND LENGTH(v_content.keywords_back) > 10 THEN
    v_score := v_score + 5;
  END IF;

  -- SCORE IMAGENS (40 pontos)
  -- Quantidade (10 pts)
  IF v_image_count >= 6 THEN
    v_score := v_score + 10;
  ELSIF v_image_count >= 4 THEN
    v_score := v_score + 6;
  ELSIF v_image_count >= 1 THEN
    v_score := v_score + 2;
  END IF;

  -- Lifestyle (10 pts)
  IF v_has_lifestyle THEN v_score := v_score + 10; END IF;

  -- Infográfico (10 pts)
  IF v_has_infografico THEN v_score := v_score + 10; END IF;

  -- Escala (10 pts)
  IF v_has_escala THEN v_score := v_score + 10; END IF;

  RETURN LEAST(v_score, 100);
END;
$$;

-- =====================================================
-- Atualizar score ao salvar conteúdo ou imagem
-- =====================================================

CREATE OR REPLACE FUNCTION update_product_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'content_versions' THEN
    v_product_id := NEW.product_id;
  ELSIF TG_TABLE_NAME = 'product_images' THEN
    v_product_id := NEW.product_id;
  END IF;

  UPDATE products
  SET score_qualidade = calculate_product_score(v_product_id)
  WHERE id = v_product_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_score_on_content
  AFTER INSERT OR UPDATE ON content_versions
  FOR EACH ROW EXECUTE FUNCTION update_product_score();

CREATE TRIGGER trg_score_on_image
  AFTER INSERT OR UPDATE ON product_images
  FOR EACH ROW EXECUTE FUNCTION update_product_score();

-- =====================================================
-- Criar organização e membro admin ao registrar usuário
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
  v_slug TEXT;
BEGIN
  -- Gerar slug a partir do email
  v_slug := regexp_replace(
    lower(split_part(NEW.email, '@', 1)),
    '[^a-z0-9]', '-', 'g'
  ) || '-' || substr(gen_random_uuid()::text, 1, 6);

  -- Criar organização
  INSERT INTO organizations (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_slug
  )
  RETURNING id INTO v_org_id;

  -- Adicionar usuário como admin
  INSERT INTO members (organization_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
