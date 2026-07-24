
-- =========================================================================
-- ENUMS
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('mestre', 'aluno');
CREATE TYPE public.aluno_status AS ENUM ('pendente', 'aprovado', 'bloqueado');
CREATE TYPE public.tecnica_categoria AS ENUM ('defesas', 'socos', 'chutes', 'quedas');
CREATE TYPE public.mensalidade_status AS ENUM ('pendente', 'pago', 'atrasado');
CREATE TYPE public.exame_status AS ENUM ('agendado', 'aprovado', 'reprovado', 'cancelado');

-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  foto_url TEXT,
  data_nascimento DATE,
  data_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
  faixa_id TEXT NOT NULL DEFAULT 'b01',
  status public.aluno_status NOT NULL DEFAULT 'pendente',
  bloqueado_inadimplencia BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- USER ROLES (separated table for security)
-- =========================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer helper (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_mestre(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'mestre');
$$;

-- =========================================================================
-- PROFILES RLS
-- =========================================================================
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Mestre reads all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_mestre(auth.uid()));
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own basic fields" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Mestre updates any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_mestre(auth.uid())) WITH CHECK (public.is_mestre(auth.uid()));
CREATE POLICY "Mestre deletes profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_mestre(auth.uid()));

-- =========================================================================
-- USER_ROLES RLS
-- =========================================================================
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Mestre reads all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_mestre(auth.uid()));

-- =========================================================================
-- TECHNIQUES
-- =========================================================================
CREATE TABLE public.techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  belt_id TEXT NOT NULL,
  categoria public.tecnica_categoria NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  imagem_url TEXT NOT NULL DEFAULT '',
  posicao INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_techniques_belt_cat ON public.techniques(belt_id, categoria, posicao);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.techniques TO authenticated;
GRANT ALL ON public.techniques TO service_role;
ALTER TABLE public.techniques ENABLE ROW LEVEL SECURITY;

-- Any approved user reads techniques (client filters by faixa)
CREATE POLICY "Approved users read techniques" ON public.techniques
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.status = 'aprovado')
    OR public.is_mestre(auth.uid())
  );
CREATE POLICY "Mestre manages techniques" ON public.techniques
  FOR ALL TO authenticated USING (public.is_mestre(auth.uid())) WITH CHECK (public.is_mestre(auth.uid()));

-- =========================================================================
-- MENSALIDADES
-- =========================================================================
CREATE TABLE public.mensalidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  valor NUMERIC(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  pago_em DATE,
  status public.mensalidade_status NOT NULL DEFAULT 'pendente',
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mensalidades_aluno ON public.mensalidades(aluno_id, vencimento DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensalidades TO authenticated;
GRANT ALL ON public.mensalidades TO service_role;
ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aluno reads own mensalidades" ON public.mensalidades
  FOR SELECT TO authenticated USING (aluno_id = auth.uid());
CREATE POLICY "Mestre manages mensalidades" ON public.mensalidades
  FOR ALL TO authenticated USING (public.is_mestre(auth.uid())) WITH CHECK (public.is_mestre(auth.uid()));

-- =========================================================================
-- PRESENCAS
-- =========================================================================
CREATE TABLE public.presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT true,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, data)
);

CREATE INDEX idx_presencas_data ON public.presencas(data DESC);
CREATE INDEX idx_presencas_aluno ON public.presencas(aluno_id, data DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.presencas TO authenticated;
GRANT ALL ON public.presencas TO service_role;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aluno reads own presenca" ON public.presencas
  FOR SELECT TO authenticated USING (aluno_id = auth.uid());
CREATE POLICY "Mestre manages presencas" ON public.presencas
  FOR ALL TO authenticated USING (public.is_mestre(auth.uid())) WITH CHECK (public.is_mestre(auth.uid()));

-- =========================================================================
-- EXAMES
-- =========================================================================
CREATE TABLE public.exames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  faixa_atual TEXT NOT NULL,
  faixa_proxima TEXT NOT NULL,
  data_exame DATE NOT NULL,
  status public.exame_status NOT NULL DEFAULT 'agendado',
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exames TO authenticated;
GRANT ALL ON public.exames TO service_role;
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aluno reads own exames" ON public.exames
  FOR SELECT TO authenticated USING (aluno_id = auth.uid());
CREATE POLICY "Mestre manages exames" ON public.exames
  FOR ALL TO authenticated USING (public.is_mestre(auth.uid())) WITH CHECK (public.is_mestre(auth.uid()));

-- =========================================================================
-- APP SETTINGS (mensalidade default, etc.)
-- =========================================================================
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mestre manages settings" ON public.app_settings
  FOR ALL TO authenticated USING (public.is_mestre(auth.uid())) WITH CHECK (public.is_mestre(auth.uid()));

INSERT INTO public.app_settings(key, value) VALUES ('mensalidade_padrao', '{"valor": 150.00}'::jsonb);

-- =========================================================================
-- TRIGGERS
-- =========================================================================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_techniques_updated_at BEFORE UPDATE ON public.techniques
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_mensalidades_updated_at BEFORE UPDATE ON public.mensalidades
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_exames_updated_at BEFORE UPDATE ON public.exames
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile + role on signup.
-- Bootstrap: the first user to sign up is auto-promoted to mestre + aprovado.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INTEGER;
  meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  is_first BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  is_first := user_count = 0;

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update mensalidade status based on due date + payment
CREATE OR REPLACE FUNCTION public.tg_mensalidade_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.pago_em IS NOT NULL THEN NEW.status := 'pago';
  ELSIF NEW.vencimento < CURRENT_DATE THEN NEW.status := 'atrasado';
  ELSE NEW.status := 'pendente';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_mensalidade_status BEFORE INSERT OR UPDATE ON public.mensalidades
  FOR EACH ROW EXECUTE FUNCTION public.tg_mensalidade_status();

-- =========================================================================
-- REALTIME
-- =========================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.techniques;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensalidades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.presencas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exames;
