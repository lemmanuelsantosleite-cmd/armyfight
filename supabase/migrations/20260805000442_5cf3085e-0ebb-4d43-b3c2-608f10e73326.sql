DROP INDEX IF EXISTS public.profiles_nome_slug_key;
DROP INDEX IF EXISTS public.profiles_nome_slug_idx;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_academia_nome_slug_key
  ON public.profiles (academia_id, nome_slug)
  WHERE nome_slug IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  is_super_seed BOOLEAN := (meta->>'seed_role') = 'super';
  is_mestre_seed BOOLEAN := (meta->>'seed_role') = 'mestre';
  v_academia uuid;
  v_count INTEGER;
  is_first BOOLEAN;
  v_nome TEXT;
  v_faixa TEXT;
BEGIN
  IF is_super_seed THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super'::public.app_role)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END IF;

  -- A academia vem SEMPRE do cadastro (academia selecionada no portal).
  v_academia := NULLIF(meta->>'academia_id','')::uuid;

  IF v_academia IS NULL THEN
    v_count := 0;
  ELSE
    SELECT COUNT(*) INTO v_count FROM public.profiles WHERE academia_id = v_academia;
  END IF;
  is_first := (v_academia IS NOT NULL AND v_count = 0) OR is_mestre_seed;
  v_nome := COALESCE(meta->>'nome', split_part(NEW.email, '@', 1));

  v_faixa := NULLIF(meta->>'faixa_id','');
  IF v_faixa IS NULL AND v_academia IS NOT NULL THEN
    SELECT codigo INTO v_faixa
    FROM public.academia_faixas
    WHERE academia_id = v_academia
    ORDER BY posicao
    LIMIT 1;
  END IF;
  v_faixa := COALESCE(v_faixa, 'b01');

  INSERT INTO public.profiles (id, academia_id, nome, nome_slug, email, telefone, data_nascimento, faixa_id, status)
  VALUES (
    NEW.id, v_academia, v_nome,
    regexp_replace(lower(trim(public.unaccent_fallback(v_nome))), '[^a-z0-9]+', '-', 'g'),
    NEW.email, meta->>'telefone', NULLIF(meta->>'data_nascimento','')::date,
    v_faixa,
    CASE WHEN is_first THEN 'aprovado'::public.aluno_status ELSE 'pendente'::public.aluno_status END
  );

  INSERT INTO public.user_roles (user_id, role, academia_id)
  VALUES (NEW.id, CASE WHEN is_first THEN 'mestre'::public.app_role ELSE 'aluno'::public.app_role END, v_academia);

  RETURN NEW;
END;
$function$;