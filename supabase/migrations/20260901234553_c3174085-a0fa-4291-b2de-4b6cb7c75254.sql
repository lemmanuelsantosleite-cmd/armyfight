-- 1) Impede que o próprio aluno altere campos privilegiados do seu perfil
CREATE OR REPLACE FUNCTION public.tg_profiles_guard_privileged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.is_super(auth.uid()) OR public.is_mestre(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF auth.uid() = NEW.id THEN
    NEW.id := OLD.id;
    NEW.academia_id := OLD.academia_id;
    NEW.status := OLD.status;
    NEW.faixa_id := OLD.faixa_id;
    NEW.bloqueado_inadimplencia := OLD.bloqueado_inadimplencia;
    NEW.turma := OLD.turma;
    NEW.data_matricula := OLD.data_matricula;
    NEW.nome := OLD.nome;
    NEW.nome_slug := OLD.nome_slug;
    NEW.email := OLD.email;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_profiles_guard_privileged ON public.profiles;
CREATE TRIGGER tg_profiles_guard_privileged
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_profiles_guard_privileged();

-- 2) Cargos: Mestre gerencia apenas cargos da própria academia
DROP POLICY IF EXISTS user_roles_select_self_or_mestre_non_super ON public.user_roles;
DROP POLICY IF EXISTS user_roles_insert_mestre_non_super ON public.user_roles;
DROP POLICY IF EXISTS user_roles_update_mestre_non_super ON public.user_roles;
DROP POLICY IF EXISTS user_roles_delete_mestre_non_super ON public.user_roles;

CREATE POLICY user_roles_select_scoped ON public.user_roles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_super(auth.uid())
  OR (public.is_mestre(auth.uid()) AND role::text <> 'super' AND academia_id = public.user_academia(auth.uid()))
);

CREATE POLICY user_roles_insert_scoped ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  public.is_super(auth.uid())
  OR (public.is_mestre(auth.uid()) AND role::text <> 'super' AND academia_id = public.user_academia(auth.uid()))
);

CREATE POLICY user_roles_update_scoped ON public.user_roles
FOR UPDATE TO authenticated
USING (
  public.is_super(auth.uid())
  OR (public.is_mestre(auth.uid()) AND role::text <> 'super' AND academia_id = public.user_academia(auth.uid()))
)
WITH CHECK (
  public.is_super(auth.uid())
  OR (public.is_mestre(auth.uid()) AND role::text <> 'super' AND academia_id = public.user_academia(auth.uid()))
);

CREATE POLICY user_roles_delete_scoped ON public.user_roles
FOR DELETE TO authenticated
USING (
  public.is_super(auth.uid())
  OR (public.is_mestre(auth.uid()) AND role::text <> 'super' AND academia_id = public.user_academia(auth.uid()))
);
