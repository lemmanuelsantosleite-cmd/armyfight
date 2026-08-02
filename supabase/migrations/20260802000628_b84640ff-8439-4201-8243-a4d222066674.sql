-- =========================================================
-- MARTIAL HUB: multi-tenant foundation
-- =========================================================

CREATE TYPE public.academia_status AS ENUM ('pendente','teste','ativa','suspensa','rejeitada');
CREATE TYPE public.plano_tipo AS ENUM ('basico','intermediario','completo');

CREATE TABLE public.academias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  modalidade text NOT NULL DEFAULT 'Artes Marciais',
  logo_url text NOT NULL DEFAULT '',
  banner_url text NOT NULL DEFAULT '',
  cor_primaria text NOT NULL DEFAULT '#4b5320',
  cor_secundaria text NOT NULL DEFAULT '#d1a72c',
  endereco text NOT NULL DEFAULT '',
  telefone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  horarios text NOT NULL DEFAULT '',
  assinatura_url text NOT NULL DEFAULT '',
  plano public.plano_tipo NOT NULL DEFAULT 'basico',
  status public.academia_status NOT NULL DEFAULT 'teste',
  max_alunos integer NOT NULL DEFAULT 50,
  observacao text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.academias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academias TO authenticated;
GRANT ALL ON public.academias TO service_role;
ALTER TABLE public.academias ENABLE ROW LEVEL SECURITY;

-- seed the first academy
INSERT INTO public.academias (nome, slug, modalidade, status, plano, max_alunos, cor_primaria, cor_secundaria)
VALUES ('Army Fight Club Hapkido','army-fight-club','Hapkido','ativa','completo',9999,'#4b5320','#d1a72c');

-- ---------------------------------------------------------
-- add academia_id everywhere
-- ---------------------------------------------------------
ALTER TABLE public.profiles          ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.techniques        ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.mensalidades      ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.presencas         ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.exames            ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.graduacoes        ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.certificados      ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.notificacoes      ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.objetivos         ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.conquistas        ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.avisos            ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.destaques         ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.admin_permissoes  ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.app_settings      ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;
ALTER TABLE public.user_roles        ADD COLUMN academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE;

-- backfill everything to Army Fight Club
UPDATE public.profiles         SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.techniques       SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.mensalidades     SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.presencas        SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.exames           SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.graduacoes       SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.certificados     SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.notificacoes     SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.objetivos        SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.conquistas       SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.avisos           SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.destaques        SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.admin_permissoes SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.app_settings     SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club');
UPDATE public.user_roles       SET academia_id = (SELECT id FROM public.academias WHERE slug='army-fight-club')
  WHERE role::text <> 'super';

-- ---------------------------------------------------------
-- helper: which academy does a user belong to
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_academia(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT academia_id FROM public.profiles WHERE id = _user_id;
$$;

-- app_settings key must now be unique per academy
ALTER TABLE public.app_settings DROP CONSTRAINT IF EXISTS app_settings_pkey;
ALTER TABLE public.app_settings ALTER COLUMN academia_id SET NOT NULL;
ALTER TABLE public.app_settings ADD PRIMARY KEY (academia_id, key);

-- nome_slug must be unique per academy, not globally
DROP INDEX IF EXISTS profiles_nome_slug_key;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_nome_slug_key;
CREATE UNIQUE INDEX profiles_academia_nome_slug_key ON public.profiles (academia_id, nome_slug);

CREATE INDEX idx_profiles_academia ON public.profiles(academia_id);
CREATE INDEX idx_techniques_academia ON public.techniques(academia_id);
CREATE INDEX idx_presencas_academia ON public.presencas(academia_id);
CREATE INDEX idx_mensalidades_academia ON public.mensalidades(academia_id);

-- ---------------------------------------------------------
-- per-academy belt system
-- ---------------------------------------------------------
CREATE TABLE public.academia_faixas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academia_id uuid NOT NULL REFERENCES public.academias(id) ON DELETE CASCADE,
  codigo text NOT NULL,
  nome text NOT NULL,
  cor1 text NOT NULL DEFAULT '#f5f3ea',
  cor2 text NOT NULL DEFAULT '#f5f3ea',
  cor_texto text NOT NULL DEFAULT '#0a0b07',
  dan integer NOT NULL DEFAULT 0,
  posicao integer NOT NULL DEFAULT 0,
  requisitos text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academia_id, codigo)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.academia_faixas TO authenticated;
GRANT ALL ON public.academia_faixas TO service_role;
ALTER TABLE public.academia_faixas ENABLE ROW LEVEL SECURITY;

INSERT INTO public.academia_faixas (academia_id, codigo, nome, cor1, cor2, cor_texto, dan, posicao)
SELECT a.id, v.codigo, v.nome, v.cor1, v.cor2, v.cor_texto, v.dan, v.posicao
FROM public.academias a,
(VALUES
 ('b01','Faixa Branca','#f5f3ea','#f5f3ea','#0a0b07',0,1),
 ('b02','Faixa Amarela','#e8c530','#e8c530','#0a0b07',0,2),
 ('b03','Faixa Amarela Ponta Verde','#e8c530','#4b7a3a','#0a0b07',0,3),
 ('b04','Faixa Verde','#3f7a35','#3f7a35','#f2f0e6',0,4),
 ('b05','Faixa Verde Ponta Azul','#3f7a35','#2f5f9e','#f2f0e6',0,5),
 ('b06','Faixa Azul','#2f5f9e','#2f5f9e','#f2f0e6',0,6),
 ('b07','Faixa Azul Ponta Vermelha','#2f5f9e','#a8321f','#f2f0e6',0,7),
 ('b08','Faixa Vermelha','#a8321f','#a8321f','#f2f0e6',0,8),
 ('b09','Faixa Vermelha Ponta Preta','#a8321f','#161610','#f2f0e6',0,9),
 ('b10','Faixa Preta 1º Dan','#161610','#161610','#d1a72c',1,10),
 ('b11','Faixa Preta 2º Dan','#161610','#161610','#d1a72c',2,11),
 ('b12','Faixa Preta','#161610','#161610','#d1a72c',3,12)
) AS v(codigo,nome,cor1,cor2,cor_texto,dan,posicao)
WHERE a.slug = 'army-fight-club';

-- ---------------------------------------------------------
-- platform-wide announcements + support
-- ---------------------------------------------------------
CREATE TABLE public.comunicados_plataforma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  mensagem text NOT NULL DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.comunicados_plataforma TO authenticated;
GRANT ALL ON public.comunicados_plataforma TO service_role;
ALTER TABLE public.comunicados_plataforma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos leem comunicados ativos" ON public.comunicados_plataforma
  FOR SELECT TO authenticated USING (ativo OR public.is_super(auth.uid()));
CREATE POLICY "super gerencia comunicados" ON public.comunicados_plataforma
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE TABLE public.suporte_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academia_id uuid REFERENCES public.academias(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  autor_nome text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'duvida',
  assunto text NOT NULL,
  mensagem text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'aberto',
  resposta text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.suporte_tickets TO authenticated;
GRANT ALL ON public.suporte_tickets TO service_role;
ALTER TABLE public.suporte_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario cria ticket" ON public.suporte_tickets
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "usuario le proprios tickets" ON public.suporte_tickets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super(auth.uid())
         OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));
CREATE POLICY "super responde tickets" ON public.suporte_tickets
  FOR UPDATE TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

-- ---------------------------------------------------------
-- academias RLS
-- ---------------------------------------------------------
CREATE POLICY "publico ve academias ativas" ON public.academias
  FOR SELECT TO anon USING (status IN ('ativa','teste'));
CREATE POLICY "usuario ve sua academia" ON public.academias
  FOR SELECT TO authenticated
  USING (public.is_super(auth.uid()) OR id = public.user_academia(auth.uid()) OR status IN ('ativa','teste'));
CREATE POLICY "super gerencia academias" ON public.academias
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));
CREATE POLICY "mestre edita sua academia" ON public.academias
  FOR UPDATE TO authenticated
  USING (public.is_mestre(auth.uid()) AND id = public.user_academia(auth.uid()))
  WITH CHECK (public.is_mestre(auth.uid()) AND id = public.user_academia(auth.uid()));

CREATE POLICY "academia le suas faixas" ON public.academia_faixas
  FOR SELECT TO authenticated
  USING (public.is_super(auth.uid()) OR academia_id = public.user_academia(auth.uid()));
CREATE POLICY "mestre gerencia faixas" ON public.academia_faixas
  FOR ALL TO authenticated
  USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())))
  WITH CHECK (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));

-- ---------------------------------------------------------
-- rewrite tenant policies with academia scoping
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Mestre reads all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Mestre updates any profile" ON public.profiles;
DROP POLICY IF EXISTS "Mestre deletes profiles" ON public.profiles;
CREATE POLICY "Mestre reads academy profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));
CREATE POLICY "Mestre updates academy profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())))
  WITH CHECK (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));
CREATE POLICY "Mestre deletes academy profiles" ON public.profiles FOR DELETE TO authenticated
  USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));

DROP POLICY IF EXISTS "Approved users read techniques" ON public.techniques;
DROP POLICY IF EXISTS "Mestre manages techniques" ON public.techniques;
CREATE POLICY "Academy reads techniques" ON public.techniques FOR SELECT TO authenticated
  USING (public.is_super(auth.uid())
    OR (academia_id = public.user_academia(auth.uid())
        AND (public.is_mestre(auth.uid()) OR EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.status = 'aprovado'))));
CREATE POLICY "Mestre manages academy techniques" ON public.techniques FOR ALL TO authenticated
  USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())))
  WITH CHECK (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['mensalidades','presencas','exames','graduacoes','certificados','notificacoes','objetivos','conquistas'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Mestre manages %1$s" ON public.%1$s', t);
    EXECUTE format($f$CREATE POLICY "Mestre manages academy %1$s" ON public.%1$s FOR ALL TO authenticated
      USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())))
      WITH CHECK (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())))$f$, t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Authenticated read avisos" ON public.avisos;
DROP POLICY IF EXISTS "Mestre manages avisos" ON public.avisos;
CREATE POLICY "Academy reads avisos" ON public.avisos FOR SELECT TO authenticated
  USING (public.is_super(auth.uid()) OR academia_id = public.user_academia(auth.uid()));
CREATE POLICY "Mestre manages academy avisos" ON public.avisos FOR ALL TO authenticated
  USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())))
  WITH CHECK (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));

DROP POLICY IF EXISTS "Authenticated read destaques" ON public.destaques;
DROP POLICY IF EXISTS "Mestre manages destaques" ON public.destaques;
CREATE POLICY "Academy reads destaques" ON public.destaques FOR SELECT TO authenticated
  USING (public.is_super(auth.uid()) OR academia_id = public.user_academia(auth.uid()));
CREATE POLICY "Mestre manages academy destaques" ON public.destaques FOR ALL TO authenticated
  USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())))
  WITH CHECK (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));

DROP POLICY IF EXISTS "Authenticated read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Mestre manages settings" ON public.app_settings;
CREATE POLICY "Academy reads settings" ON public.app_settings FOR SELECT TO authenticated
  USING (public.is_super(auth.uid()) OR academia_id = public.user_academia(auth.uid()));
CREATE POLICY "Mestre manages academy settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())))
  WITH CHECK (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));

DROP POLICY IF EXISTS "Mestre gerencia permissoes" ON public.admin_permissoes;
DROP POLICY IF EXISTS "Mestre ve todas permissoes" ON public.admin_permissoes;
CREATE POLICY "Mestre gerencia permissoes academia" ON public.admin_permissoes FOR ALL TO authenticated
  USING (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())))
  WITH CHECK (public.is_super(auth.uid()) OR (public.is_mestre(auth.uid()) AND academia_id = public.user_academia(auth.uid())));
CREATE POLICY "Ve permissoes proprias" ON public.admin_permissoes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------
-- signup trigger: attach new users to an academy
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  is_super_seed BOOLEAN := (meta->>'seed_role') = 'super';
  is_mestre_seed BOOLEAN := (meta->>'seed_role') = 'mestre';
  v_academia uuid;
  v_count INTEGER;
  is_first BOOLEAN;
  v_nome TEXT;
BEGIN
  IF is_super_seed THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super'::public.app_role)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END IF;

  v_academia := COALESCE(
    NULLIF(meta->>'academia_id','')::uuid,
    (SELECT id FROM public.academias WHERE slug = 'army-fight-club')
  );

  SELECT COUNT(*) INTO v_count FROM public.profiles WHERE academia_id = v_academia;
  is_first := v_count = 0 OR is_mestre_seed;
  v_nome := COALESCE(meta->>'nome', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, academia_id, nome, nome_slug, email, telefone, data_nascimento, faixa_id, status)
  VALUES (
    NEW.id, v_academia, v_nome,
    regexp_replace(lower(trim(public.unaccent_fallback(v_nome))), '[^a-z0-9]+', '-', 'g'),
    NEW.email, meta->>'telefone', NULLIF(meta->>'data_nascimento','')::date,
    COALESCE(meta->>'faixa_id', CASE WHEN is_first THEN 'b12' ELSE 'b01' END),
    CASE WHEN is_first THEN 'aprovado'::public.aluno_status ELSE 'pendente'::public.aluno_status END
  );

  INSERT INTO public.user_roles (user_id, role, academia_id)
  VALUES (NEW.id, CASE WHEN is_first THEN 'mestre'::public.app_role ELSE 'aluno'::public.app_role END, v_academia);

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------
-- default academia_id on inserts made by a mestre
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tg_set_academia()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.academia_id IS NULL THEN
    NEW.academia_id := public.user_academia(auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['techniques','mensalidades','presencas','exames','graduacoes','certificados','notificacoes','objetivos','conquistas','avisos','destaques','admin_permissoes'] LOOP
    EXECUTE format('CREATE TRIGGER set_academia_%1$s BEFORE INSERT ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.tg_set_academia()', t);
  END LOOP;
END $$;

CREATE TRIGGER tg_academias_updated BEFORE UPDATE ON public.academias
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_faixas_updated BEFORE UPDATE ON public.academia_faixas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER tg_tickets_updated BEFORE UPDATE ON public.suporte_tickets
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.academias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.academia_faixas;