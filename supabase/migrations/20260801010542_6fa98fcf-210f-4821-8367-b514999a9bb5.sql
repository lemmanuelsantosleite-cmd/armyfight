DO $$ BEGIN
  CREATE TYPE public.turma_tipo AS ENUM ('infantil','juvenil','adulto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS turma public.turma_tipo NOT NULL DEFAULT 'adulto';
ALTER TABLE public.presencas ADD COLUMN IF NOT EXISTS turma public.turma_tipo;
ALTER TABLE public.presencas ADD COLUMN IF NOT EXISTS tipo_aula text;

CREATE TABLE IF NOT EXISTS public.conquistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  icone text NOT NULL DEFAULT '🏅',
  descricao text,
  data date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conquistas TO authenticated;
GRANT ALL ON public.conquistas TO service_role;

ALTER TABLE public.conquistas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aluno reads own conquistas" ON public.conquistas;
CREATE POLICY "Aluno reads own conquistas" ON public.conquistas FOR SELECT TO authenticated
  USING (aluno_id = auth.uid());

DROP POLICY IF EXISTS "Mestre manages conquistas" ON public.conquistas;
CREATE POLICY "Mestre manages conquistas" ON public.conquistas TO authenticated
  USING (public.is_mestre(auth.uid())) WITH CHECK (public.is_mestre(auth.uid()));

DROP TRIGGER IF EXISTS trg_conquistas_updated_at ON public.conquistas;
CREATE TRIGGER trg_conquistas_updated_at BEFORE UPDATE ON public.conquistas
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.conquistas;