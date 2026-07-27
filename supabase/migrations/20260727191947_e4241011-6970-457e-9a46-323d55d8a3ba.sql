
ALTER TABLE public.exames ADD COLUMN IF NOT EXISTS nota numeric;
ALTER TABLE public.exames ADD COLUMN IF NOT EXISTS comentario text;

CREATE TABLE IF NOT EXISTS public.graduacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL,
  faixa_id text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.graduacoes TO authenticated;
GRANT ALL ON public.graduacoes TO service_role;
ALTER TABLE public.graduacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aluno reads own graduacoes" ON public.graduacoes FOR SELECT TO authenticated USING (aluno_id = auth.uid());
CREATE POLICY "Mestre manages graduacoes" ON public.graduacoes FOR ALL TO authenticated USING (is_mestre(auth.uid())) WITH CHECK (is_mestre(auth.uid()));

CREATE TABLE IF NOT EXISTS public.objetivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL,
  texto text NOT NULL,
  concluido boolean NOT NULL DEFAULT false,
  posicao integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.objetivos TO authenticated;
GRANT ALL ON public.objetivos TO service_role;
ALTER TABLE public.objetivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aluno reads own objetivos" ON public.objetivos FOR SELECT TO authenticated USING (aluno_id = auth.uid());
CREATE POLICY "Mestre manages objetivos" ON public.objetivos FOR ALL TO authenticated USING (is_mestre(auth.uid())) WITH CHECK (is_mestre(auth.uid()));
CREATE TRIGGER objetivos_updated_at BEFORE UPDATE ON public.objetivos FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.certificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL,
  faixa_id text NOT NULL,
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  mestre_nome text NOT NULL DEFAULT 'Mestre Clóvis',
  arquivo_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificados TO authenticated;
GRANT ALL ON public.certificados TO service_role;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aluno reads own certificados" ON public.certificados FOR SELECT TO authenticated USING (aluno_id = auth.uid());
CREATE POLICY "Mestre manages certificados" ON public.certificados FOR ALL TO authenticated USING (is_mestre(auth.uid())) WITH CHECK (is_mestre(auth.uid()));

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL,
  titulo text NOT NULL,
  mensagem text NOT NULL DEFAULT '',
  lida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aluno reads own notificacoes" ON public.notificacoes FOR SELECT TO authenticated USING (aluno_id = auth.uid());
CREATE POLICY "Aluno updates own notificacoes" ON public.notificacoes FOR UPDATE TO authenticated USING (aluno_id = auth.uid()) WITH CHECK (aluno_id = auth.uid());
CREATE POLICY "Mestre manages notificacoes" ON public.notificacoes FOR ALL TO authenticated USING (is_mestre(auth.uid())) WITH CHECK (is_mestre(auth.uid()));

-- Histórico de graduação + notificações automáticas
CREATE OR REPLACE FUNCTION public.tg_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.graduacoes (aluno_id, faixa_id, data, observacao)
    VALUES (NEW.id, NEW.faixa_id, COALESCE(NEW.data_matricula, CURRENT_DATE), 'Faixa inicial');
    RETURN NEW;
  END IF;

  IF NEW.faixa_id IS DISTINCT FROM OLD.faixa_id THEN
    INSERT INTO public.graduacoes (aluno_id, faixa_id) VALUES (NEW.id, NEW.faixa_id);
    INSERT INTO public.notificacoes (aluno_id, titulo, mensagem)
    VALUES (NEW.id, 'Nova graduação', 'Sua faixa foi atualizada pelo Mestre.');
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'aprovado' THEN
    INSERT INTO public.notificacoes (aluno_id, titulo, mensagem)
    VALUES (NEW.id, 'Cadastro aprovado', 'Seu cadastro foi aprovado pelo Mestre. Bons treinos!');
  END IF;

  IF NEW.bloqueado_inadimplencia IS DISTINCT FROM OLD.bloqueado_inadimplencia THEN
    INSERT INTO public.notificacoes (aluno_id, titulo, mensagem)
    VALUES (NEW.id, 'Situação financeira',
      CASE WHEN NEW.bloqueado_inadimplencia THEN 'Sua mensalidade está pendente.' ELSE 'Sua mensalidade foi regularizada.' END);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_changes ON public.profiles;
CREATE TRIGGER profiles_changes AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_profile_changes();

CREATE OR REPLACE FUNCTION public.tg_exame_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notificacoes (aluno_id, titulo, mensagem)
    VALUES (NEW.aluno_id, 'Exame agendado', 'Um exame foi marcado para ' || NEW.data_exame || '.');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notificacoes (aluno_id, titulo, mensagem)
    VALUES (NEW.aluno_id, 'Resultado do exame', 'Seu exame de ' || NEW.data_exame || ' foi marcado como ' || NEW.status || '.');
  ELSIF NEW.comentario IS DISTINCT FROM OLD.comentario AND COALESCE(NEW.comentario,'') <> '' THEN
    INSERT INTO public.notificacoes (aluno_id, titulo, mensagem)
    VALUES (NEW.aluno_id, 'Nova avaliação do Mestre', 'O Mestre deixou um comentário sobre seu exame.');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS exames_changes ON public.exames;
CREATE TRIGGER exames_changes AFTER INSERT OR UPDATE ON public.exames
FOR EACH ROW EXECUTE FUNCTION public.tg_exame_changes();

CREATE OR REPLACE FUNCTION public.tg_certificado_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notificacoes (aluno_id, titulo, mensagem)
  VALUES (NEW.aluno_id, 'Certificado emitido', 'Um novo certificado está disponível no seu painel.');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS certificados_notify ON public.certificados;
CREATE TRIGGER certificados_notify AFTER INSERT ON public.certificados
FOR EACH ROW EXECUTE FUNCTION public.tg_certificado_notify();

CREATE OR REPLACE FUNCTION public.tg_mensalidade_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.notificacoes (aluno_id, titulo, mensagem)
  VALUES (NEW.aluno_id, 'Mensalidade', 'Situação da mensalidade: ' || NEW.status || '.');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mensalidades_notify ON public.mensalidades;
CREATE TRIGGER mensalidades_notify AFTER INSERT OR UPDATE ON public.mensalidades
FOR EACH ROW EXECUTE FUNCTION public.tg_mensalidade_notify();

-- garantir triggers de status/updated_at existentes
DROP TRIGGER IF EXISTS mensalidades_status ON public.mensalidades;
CREATE TRIGGER mensalidades_status BEFORE INSERT OR UPDATE ON public.mensalidades
FOR EACH ROW EXECUTE FUNCTION public.tg_mensalidade_status();

ALTER TABLE public.graduacoes REPLICA IDENTITY FULL;
ALTER TABLE public.objetivos REPLICA IDENTITY FULL;
ALTER TABLE public.certificados REPLICA IDENTITY FULL;
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;
ALTER TABLE public.mensalidades REPLICA IDENTITY FULL;
ALTER TABLE public.presencas REPLICA IDENTITY FULL;
ALTER TABLE public.exames REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.graduacoes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.objetivos; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.certificados; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.mensalidades; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.presencas; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.exames; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
