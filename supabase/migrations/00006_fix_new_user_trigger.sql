-- =====================================================
-- Fix: trigger handle_new_user com search_path e tratamento de erro
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_slug   TEXT;
  v_name   TEXT;
BEGIN
  -- Nome da organização
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Slug único
  v_slug := regexp_replace(
    lower(split_part(NEW.email, '@', 1)),
    '[^a-z0-9]', '-', 'g'
  ) || '-' || substr(gen_random_uuid()::text, 1, 8);

  -- Criar organização
  INSERT INTO public.organizations (name, slug)
  VALUES (v_name, v_slug)
  RETURNING id INTO v_org_id;

  -- Adicionar usuário como admin
  INSERT INTO public.members (organization_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'admin');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro sem bloquear o cadastro
  RAISE WARNING 'handle_new_user error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- Garantir que o trigger existe corretamente
DROP TRIGGER IF EXISTS trg_new_user ON auth.users;

CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
