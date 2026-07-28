import { useCallback, useEffect, useMemo, useState } from "react";
import { Megaphone, Trophy, Sparkles, Flag, Award, FileText, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BELTS, CATEGORIES, COLORS, findBelt } from "@/lib/afc";
import { Eyebrow, StencilHeading, BeltSwatch } from "@/components/afc-ui";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export type Aviso = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  fixado: boolean;
  autor_nome: string;
  created_at: string;
};

export type Destaque = {
  id: string;
  aluno_id: string;
  aluno_nome: string;
  mes: string;
  motivo: string;
  ativo: boolean;
};

export type TecnicaRecente = {
  id: string;
  belt_id: string;
  categoria: string;
  titulo: string;
  descricao: string;
  video_url: string;
  imagem_url: string;
  autor_nome: string;
  created_at: string;
};

export const TIPOS_AVISO = [
  { key: "treino", label: "Aviso de treino" },
  { key: "comunicado", label: "Comunicado" },
  { key: "exame", label: "Exame" },
  { key: "motivacional", label: "Mensagem motivacional" },
  { key: "academia", label: "Atualização da academia" },
];

export function fmtData(d?: string | null) {
  if (!d) return "—";
  const iso = d.slice(0, 10);
  const [y, m, day] = iso.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

/* ------------------------------------------------------------------ */
/* Hooks de dados                                                      */
/* ------------------------------------------------------------------ */

export function useAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("avisos")
      .select("*")
      .order("fixado", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);
    setAvisos((data ?? []) as unknown as Aviso[]);
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("avisos-mural")
      .on("postgres_changes", { event: "*", schema: "public", table: "avisos" }, () => void load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { avisos, reloadAvisos: load };
}

export function useDestaque() {
  const [destaque, setDestaque] = useState<Destaque | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("destaques")
      .select("*")
      .eq("ativo", true)
      .order("mes", { ascending: false })
      .limit(1);
    const row = (data ?? [])[0] as unknown as Destaque | undefined;
    setDestaque(row ?? null);
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("destaques-mes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "destaques" },
        () => void load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { destaque, reloadDestaque: load };
}

export function useTecnicasRecentes(limit = 6) {
  const [tecnicas, setTecnicas] = useState<TecnicaRecente[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("techniques")
      .select("id,belt_id,categoria,titulo,descricao,video_url,imagem_url,autor_nome,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    setTecnicas((data ?? []) as unknown as TecnicaRecente[]);
  }, [limit]);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("tecnicas-recentes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "techniques" },
        () => void load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return tecnicas;
}

/* ------------------------------------------------------------------ */
/* Mural de avisos (somente leitura)                                   */
/* ------------------------------------------------------------------ */

export function MuralAvisos({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) {
    return (
      <div
        className="p-4 text-sm text-center"
        style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
      >
        Nenhum aviso publicado pelo Mestre.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {avisos.map((a, i) => (
        <article
          key={a.id}
          className="p-4 animate-fade-in"
          style={{
            background: COLORS.panel,
            border: `1px solid ${a.fixado ? COLORS.brassDim : COLORS.line}`,
            borderLeft: `3px solid ${a.fixado ? COLORS.brass : COLORS.olive}`,
            animationDelay: `${Math.min(i, 6) * 40}ms`,
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Megaphone size={14} color={COLORS.brass} />
            <span
              className="text-sm uppercase font-semibold"
              style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
            >
              {a.titulo}
            </span>
            <span
              className="text-[10px] uppercase tracking-widest px-2 py-0.5"
              style={{ color: COLORS.brass, border: `1px solid ${COLORS.brassDim}` }}
            >
              {TIPOS_AVISO.find((t) => t.key === a.tipo)?.label ?? a.tipo}
            </span>
            {a.fixado && (
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: COLORS.brass }}
              >
                fixado
              </span>
            )}
          </div>
          {a.mensagem && (
            <p className="text-sm mt-2 whitespace-pre-line" style={{ color: COLORS.paperDim }}>
              {a.mensagem}
            </p>
          )}
          <div className="text-[11px] mt-2" style={{ color: COLORS.paperDim }}>
            {a.autor_nome} · {fmtData(a.created_at)}
          </div>
        </article>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Aluno destaque do mês                                               */
/* ------------------------------------------------------------------ */

export function DestaqueCard({ destaque }: { destaque: Destaque | null }) {
  if (!destaque) return null;
  return (
    <div
      className="p-5 animate-scale-in"
      style={{
        background: `linear-gradient(135deg, ${COLORS.panel2}, ${COLORS.panel})`,
        border: `1px solid ${COLORS.brassDim}`,
        clipPath:
          "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
      }}
    >
      <Eyebrow>🏆 Aluno destaque do mês</Eyebrow>
      <div className="flex items-center gap-3">
        <Trophy size={28} color={COLORS.brass} />
        <div>
          <div
            className="text-2xl uppercase font-bold"
            style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
          >
            {destaque.aluno_nome}
          </div>
          <div className="text-xs" style={{ color: COLORS.paperDim }}>
            {destaque.motivo || "Reconhecimento do Mestre"} ·{" "}
            {new Date(`${destaque.mes.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Últimas técnicas adicionadas                                        */
/* ------------------------------------------------------------------ */

export function UltimasTecnicas({
  tecnicas,
  canAccessBelt,
}: {
  tecnicas: TecnicaRecente[];
  canAccessBelt: (beltId: string) => boolean;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} color={COLORS.brass} />
        <StencilHeading as="h2" className="text-xl font-bold">
          Últimas técnicas adicionadas
        </StencilHeading>
      </div>
      {tecnicas.length === 0 ? (
        <div
          className="p-4 text-sm text-center"
          style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
        >
          Nenhuma técnica publicada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tecnicas.map((t, i) => {
            const belt = findBelt(t.belt_id);
            const cat = CATEGORIES.find((c) => c.key === t.categoria);
            const liberada = canAccessBelt(t.belt_id);
            return (
              <article
                key={t.id}
                className="p-4 animate-fade-in"
                style={{
                  background: COLORS.panel,
                  border: `1px solid ${COLORS.line}`,
                  animationDelay: `${Math.min(i, 6) * 50}ms`,
                  clipPath:
                    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                }}
              >
                {t.imagem_url ? (
                  <img
                    src={t.imagem_url}
                    alt={`Técnica ${t.titulo}`}
                    loading="lazy"
                    className="w-full h-32 object-cover mb-3"
                    style={{
                      border: `1px solid ${COLORS.line}`,
                      filter: liberada ? "none" : "grayscale(1) blur(2px)",
                    }}
                  />
                ) : t.video_url ? (
                  <div
                    className="w-full h-32 mb-3 flex items-center justify-center text-xs uppercase tracking-widest"
                    style={{
                      background: COLORS.panel2,
                      border: `1px solid ${COLORS.line}`,
                      color: COLORS.paperDim,
                    }}
                  >
                    ▶ Vídeo disponível
                  </div>
                ) : null}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px]">{cat?.icon}</span>
                  <span
                    className="text-[10px] uppercase tracking-widest px-2 py-0.5"
                    style={{ color: COLORS.brass, border: `1px solid ${COLORS.brassDim}` }}
                  >
                    {cat?.label ?? t.categoria}
                  </span>
                </div>
                <div
                  className="text-base uppercase font-semibold"
                  style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                >
                  {t.titulo}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {belt && <BeltSwatch belt={belt} size="sm" />}
                  <span className="text-xs" style={{ color: COLORS.paperDim }}>
                    {belt?.name ?? t.belt_id}
                    {!liberada && " · bloqueada"}
                  </span>
                </div>
                <div className="text-[11px] mt-2" style={{ color: COLORS.paperDim }}>
                  Publicada em {fmtData(t.created_at)} por {t.autor_nome}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Evolução do aluno                                                   */
/* ------------------------------------------------------------------ */

export const AULAS_POR_GRADUACAO = 40;

export type EvolucaoInput = {
  faixaId: string;
  presencasDesdeGraduacao: number;
  frequencia: number;
  objetivosTotal: number;
  objetivosConcluidos: number;
  tecnicasConcluidas: number;
  tecnicasPendentes: number;
};

export function calcularProgresso(i: EvolucaoInput) {
  const aulas = Math.min(1, i.presencasDesdeGraduacao / AULAS_POR_GRADUACAO);
  const objetivos = i.objetivosTotal ? i.objetivosConcluidos / i.objetivosTotal : aulas;
  const freq = Math.min(1, i.frequencia / 75);
  return Math.round(((aulas * 0.4 + objetivos * 0.35 + freq * 0.25) as number) * 100);
}

export function BarraProgresso({ pct }: { pct: number }) {
  const blocos = 10;
  const cheios = Math.round((pct / 100) * blocos);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: blocos }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 18,
              height: 12,
              background: i < cheios ? COLORS.brass : COLORS.steel,
              border: `1px solid ${COLORS.line}`,
              transition: "background 300ms ease",
            }}
          />
        ))}
      </div>
      <span
        className="text-sm font-bold"
        style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
      >
        {pct}%
      </span>
    </div>
  );
}

export function EvolucaoAluno({
  input,
  objetivos,
}: {
  input: EvolucaoInput;
  objetivos: { id: string; texto: string; concluido: boolean }[];
}) {
  const belt = findBelt(input.faixaId);
  const proxima = useMemo(() => {
    const n = belt?.n ?? 1;
    return BELTS.find((b) => b.n === n + 1) ?? null;
  }, [belt]);
  const pct = calcularProgresso(input);
  const faltamAulas = Math.max(0, AULAS_POR_GRADUACAO - input.presencasDesdeGraduacao);

  return (
    <div className="space-y-3">
      <div className="p-4" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <Eyebrow>Minha evolução</Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          {belt && <BeltSwatch belt={belt} size="lg" />}
          <div
            className="text-xl uppercase font-bold"
            style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
          >
            🥋 Faixa atual: {belt?.name ?? input.faixaId}
          </div>
        </div>
        <div className="mt-4">
          <div
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: COLORS.paperDim }}
          >
            Progresso para a próxima graduação
          </div>
          <BarraProgresso pct={pct} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Flag size={14} color={COLORS.brass} />
          <span className="text-sm" style={{ color: COLORS.paper }}>
            Próximo objetivo: <strong>{proxima?.name ?? "Graduação máxima alcançada"}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Técnicas concluídas" value={input.tecnicasConcluidas} />
        <MiniStat label="Técnicas pendentes" value={input.tecnicasPendentes} />
        <MiniStat
          label="Frequência necessária"
          value={`${input.frequencia}% / 75%`}
          hint={input.frequencia >= 75 ? "Meta atingida" : "Continue treinando"}
        />
        <MiniStat
          label="Aulas para o exame"
          value={faltamAulas === 0 ? "Pronto" : faltamAulas}
          hint={`${input.presencasDesdeGraduacao}/${AULAS_POR_GRADUACAO} desde a última faixa`}
        />
      </div>

      <div className="p-4" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <Eyebrow>Objetivos definidos pelo Mestre</Eyebrow>
        {objetivos.length === 0 ? (
          <div className="text-sm" style={{ color: COLORS.paperDim }}>
            Nenhum objetivo definido no momento.
          </div>
        ) : (
          <ul className="space-y-1">
            {objetivos.map((o) => (
              <li
                key={o.id}
                className="text-sm"
                style={{ color: o.concluido ? COLORS.paperDim : COLORS.paper }}
              >
                {o.concluido ? "✅" : "⬜"} {o.texto}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="p-4" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
      <div
        className="text-xs uppercase tracking-widest"
        style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
      >
        {label}
      </div>
      <div
        className="text-2xl mt-1 font-bold"
        style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
      >
        {value}
      </div>
      {hint && (
        <div className="text-xs mt-1" style={{ color: COLORS.paperDim }}>
          {hint}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Linha do tempo                                                      */
/* ------------------------------------------------------------------ */

export type EventoTimeline = {
  data: string;
  tipo: "matricula" | "graduacao" | "exame" | "certificado" | "conquista" | "futuro";
  titulo: string;
  detalhe?: string;
  beltId?: string;
};

export function LinhaDoTempo({ eventos }: { eventos: EventoTimeline[] }) {
  const porAno = useMemo(() => {
    const map = new Map<string, EventoTimeline[]>();
    eventos
      .slice()
      .sort((a, b) => a.data.localeCompare(b.data))
      .forEach((e) => {
        const ano = e.data.slice(0, 4);
        const arr = map.get(ano) ?? [];
        arr.push(e);
        map.set(ano, arr);
      });
    return Array.from(map.entries());
  }, [eventos]);

  const icone: Record<EventoTimeline["tipo"], React.ReactNode> = {
    matricula: <Flag size={14} color={COLORS.brass} />,
    graduacao: <Award size={14} color={COLORS.brass} />,
    exame: <Medal size={14} color={COLORS.brass} />,
    certificado: <FileText size={14} color={COLORS.brass} />,
    conquista: <Trophy size={14} color={COLORS.brass} />,
    futuro: <Sparkles size={14} color={COLORS.oliveBright} />,
  };

  if (eventos.length === 0) {
    return (
      <div
        className="p-4 text-sm text-center"
        style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
      >
        Sua jornada começa no primeiro treino.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {porAno.map(([ano, lista]) => (
        <div key={ano}>
          <div
            className="text-lg uppercase font-bold mb-2"
            style={{
              color: COLORS.brass,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: "0.2em",
            }}
          >
            {ano}
          </div>
          <div className="space-y-2 pl-3" style={{ borderLeft: `2px dashed ${COLORS.olive}` }}>
            {lista.map((e, i) => {
              const belt = e.beltId ? findBelt(e.beltId) : null;
              return (
                <div
                  key={`${ano}-${i}`}
                  className="p-3 ml-2 animate-fade-in"
                  style={{
                    background: COLORS.panel,
                    border: `1px solid ${e.tipo === "futuro" ? COLORS.oliveDim : COLORS.line}`,
                    animationDelay: `${Math.min(i, 8) * 40}ms`,
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {icone[e.tipo]}
                    {belt && <BeltSwatch belt={belt} size="sm" />}
                    <span
                      className="text-sm uppercase font-semibold"
                      style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                    >
                      {e.titulo}
                    </span>
                    <span className="text-[11px]" style={{ color: COLORS.paperDim }}>
                      {e.tipo === "futuro" ? "próximo objetivo" : fmtData(e.data)}
                    </span>
                  </div>
                  {e.detalhe && (
                    <div className="text-xs mt-1" style={{ color: COLORS.paperDim }}>
                      {e.detalhe}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
