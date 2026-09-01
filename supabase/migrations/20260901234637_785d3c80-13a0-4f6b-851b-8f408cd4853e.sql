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
    NEW.email := OLD.email;
    IF NEW.nome IS DISTINCT FROM OLD.nome THEN
      NEW.nome_slug := public.afc_slug(NEW.nome);
    ELSE
      NEW.nome_slug := OLD.nome_slug;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.tg_profiles_guard_privileged() FROM PUBLIC, anon, authenticated;