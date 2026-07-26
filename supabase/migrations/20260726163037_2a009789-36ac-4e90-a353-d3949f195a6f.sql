ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nome_slug text;

CREATE OR REPLACE FUNCTION public.unaccent_fallback(_t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT translate(_t,
    'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN');
$$;

CREATE OR REPLACE FUNCTION public.afc_slug(_nome text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT regexp_replace(lower(trim(public.unaccent_fallback(_nome))), '[^a-z0-9]+', '-', 'g');
$$;

UPDATE public.profiles
SET nome_slug = regexp_replace(lower(trim(public.unaccent_fallback(nome))), '[^a-z0-9]+', '-', 'g')
WHERE nome_slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_nome_slug_key ON public.profiles (nome_slug);

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_count INTEGER;
  meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  is_first BOOLEAN;
  is_super_seed BOOLEAN := (meta->>'seed_role') = 'super';
  is_mestre_seed BOOLEAN := (meta->>'seed_role') = 'mestre';
  v_nome TEXT;
BEGIN
  IF is_super_seed THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super'::public.app_role)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO user_count FROM public.profiles;
  is_first := user_count = 0 OR is_mestre_seed;
  v_nome := COALESCE(meta->>'nome', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, nome, nome_slug, email, telefone, data_nascimento, faixa_id, status)
  VALUES (
    NEW.id,
    v_nome,
    regexp_replace(lower(trim(public.unaccent_fallback(v_nome))), '[^a-z0-9]+', '-', 'g'),
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
$function$;