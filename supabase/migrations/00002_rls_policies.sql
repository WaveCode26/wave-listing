-- =====================================================
-- WAVE LISTING — Row Level Security
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE members             ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images      ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNÇÃO AUXILIAR: organização do usuário logado
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_org()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM members WHERE user_id = auth.uid() LIMIT 1;
$$;

-- =====================================================
-- ORGANIZATIONS
-- =====================================================

CREATE POLICY "members_see_own_org" ON organizations
  FOR SELECT USING (id = get_user_org());

CREATE POLICY "admins_update_org" ON organizations
  FOR UPDATE USING (
    id = get_user_org() AND
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- MEMBERS
-- =====================================================

CREATE POLICY "members_see_org_members" ON members
  FOR SELECT USING (organization_id = get_user_org());

CREATE POLICY "admins_manage_members" ON members
  FOR ALL USING (
    organization_id = get_user_org() AND
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- PRODUCTS
-- =====================================================

CREATE POLICY "members_see_org_products" ON products
  FOR SELECT USING (organization_id = get_user_org());

CREATE POLICY "members_insert_products" ON products
  FOR INSERT WITH CHECK (organization_id = get_user_org());

CREATE POLICY "members_update_products" ON products
  FOR UPDATE USING (organization_id = get_user_org());

CREATE POLICY "admins_delete_products" ON products
  FOR DELETE USING (
    organization_id = get_user_org() AND
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role IN ('admin'))
  );

-- =====================================================
-- CONTENT VERSIONS
-- =====================================================

CREATE POLICY "members_see_content_versions" ON content_versions
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE organization_id = get_user_org())
  );

CREATE POLICY "members_insert_content_versions" ON content_versions
  FOR INSERT WITH CHECK (
    product_id IN (SELECT id FROM products WHERE organization_id = get_user_org())
  );

-- =====================================================
-- PRODUCT IMAGES
-- =====================================================

CREATE POLICY "members_see_product_images" ON product_images
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE organization_id = get_user_org())
  );

CREATE POLICY "members_manage_product_images" ON product_images
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE organization_id = get_user_org())
  );

-- =====================================================
-- PROCESSING JOBS
-- =====================================================

CREATE POLICY "members_see_processing_jobs" ON processing_jobs
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE organization_id = get_user_org())
  );

-- =====================================================
-- PRODUCT ALERTS
-- =====================================================

CREATE POLICY "members_see_alerts" ON product_alerts
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE organization_id = get_user_org())
  );

CREATE POLICY "members_resolve_alerts" ON product_alerts
  FOR UPDATE USING (
    product_id IN (SELECT id FROM products WHERE organization_id = get_user_org())
  );

-- =====================================================
-- WORKFLOW TASKS
-- =====================================================

CREATE POLICY "members_see_workflow" ON workflow_tasks
  FOR SELECT USING (organization_id = get_user_org());

CREATE POLICY "members_manage_workflow" ON workflow_tasks
  FOR ALL USING (organization_id = get_user_org());

-- =====================================================
-- COMPETITORS
-- =====================================================

CREATE POLICY "members_see_competitors" ON competitors
  FOR SELECT USING (organization_id = get_user_org());

CREATE POLICY "members_manage_competitors" ON competitors
  FOR ALL USING (organization_id = get_user_org());

CREATE POLICY "members_see_competitor_snapshots" ON competitor_snapshots
  FOR SELECT USING (
    competitor_id IN (SELECT id FROM competitors WHERE organization_id = get_user_org())
  );

-- =====================================================
-- EXPERIMENTS
-- =====================================================

CREATE POLICY "members_see_experiments" ON experiments
  FOR SELECT USING (organization_id = get_user_org());

CREATE POLICY "members_manage_experiments" ON experiments
  FOR ALL USING (organization_id = get_user_org());

-- =====================================================
-- SEASONAL EVENTS
-- =====================================================

CREATE POLICY "members_see_seasonal_events" ON seasonal_events
  FOR SELECT USING (
    organization_id IS NULL OR organization_id = get_user_org()
  );

CREATE POLICY "admins_manage_seasonal_events" ON seasonal_events
  FOR ALL USING (
    organization_id = get_user_org() AND
    EXISTS (SELECT 1 FROM members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE POLICY "users_see_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
