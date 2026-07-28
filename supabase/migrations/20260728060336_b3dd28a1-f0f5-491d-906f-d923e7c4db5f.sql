CREATE TABLE public.avisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  mensagem text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'comunicado',
  fixado boolean NOT NULL DEFAULT false,
  autor_nome text NOT NULL DEFAULT 'Mestre Clóvis',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avisos TO authenticated;
GRANT ALL ON public.avisos TO service_role;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read avisos" ON public.avisos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mestre manages avisos" ON public.avisos FOR ALL TO authenticated USING (is_mestre(auth.uid())) WITH CHECK (is_mestre(auth.uid()));
CREATE TRIGGER avisos_updated_at BEFORE UPDATE ON public.avisos FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.destaques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL,
  mes date NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  motivo text NOT NULL DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mes)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.destaques TO authenticated;
GRANT ALL ON public.destaques TO service_role;
ALTER TABLE public.destaques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read destaques" ON public.destaques FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mestre manages destaques" ON public.destaques FOR ALL TO authenticated USING (is_mestre(auth.uid())) WITH CHECK (is_mestre(auth.uid()));
CREATE TRIGGER destaques_updated_at BEFORE UPDATE ON public.destaques FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER TABLE public.techniques ADD COLUMN IF NOT EXISTS autor_nome text NOT NULL DEFAULT 'Mestre Clóvis';

ALTER PUBLICATION supabase_realtime ADD TABLE public.avisos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.destaques;