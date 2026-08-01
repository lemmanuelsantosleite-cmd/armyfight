import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Save, AlertTriangle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COLORS, findBelt, type Profile } from "@/lib/afc";
import { Button, Field, inputStyle, StencilHeading, BeltSwatch } from "@/components/afc-ui";

export type TurmaKey = "infantil" | "juvenil" | "adulto";

export const TURMAS: { k: TurmaKey; label: string; icon: string }[] = [
  { k: "infantil", label: "Turma Infantil", icon: "🧒" },
  { k: "juvenil", label: "Turma Juvenil", icon: "🧑" },
  { k: "adulto", label: "Turma Adulto", icon: "🥋" },
];

export const TIPOS_AULA = [
  "Técnicas de queda",
  "Defesas pessoais",
  "Socos",
  "Chutes",
  "Condicionamento",
  "Treino livre",
  "Preparação para exame",
];

export type PresencaRow = {
  id: string;
  aluno_id: string;
  data: string;
  presente: boolean;
  turma?: TurmaKey | null;
  tipo_aula?: string | null;
};

export function turmaOf(p: Pick<Profile, "turma">): TurmaKey {
  return (p.turma as TurmaKey) ?? "adulto";
}

export function statsPorAluno(presencas: PresencaRow[]) {
  const map = new Map<string, { total: number; presentes: number; faltas: number; freq: number }>();
  presencas.forEach((p) => {
    const cur = map.get(p.aluno_id) ?? { total: 0, presentes: 0, faltas: 0, freq: 0 };
    cur.total++;
    if (p.presente) cur.presentes++;
    else cur.faltas++;
    map.set(p.aluno_id, cur);
  });
  map.forEach((v) => {
    v.freq = v.total ? Math.round((v.presentes / v.total) * 100) : 0;
  });
  return map;
}

export function BarraFrequencia({ pct, width = 120 }: { pct: number; width?: number }) {
  const blocos = 10;
  const cheios = Math.round((pct / 100) * blocos);
  const cor = pct >= 80 ? COLORS.oliveBright : pct >= 70 ? COLORS.brass : "#c1503a";
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[2px]" style={{ width }}>
        {Array.from({ length: blocos }).map((_, i) => (
          <span
            key={i}
            className="flex-1 h-2 transition-all duration-300"
            style={{ background: i < cheios ? cor : COLORS.steel, opacity: i < cheios ? 1 : 0.5 }}
          />
        ))}
      </div>
      <span className="text-xs tabular-nums" style={{ color: cor, fontFamily: "'Oswald', sans-serif" }}>
        {pct}%
      </span>
    </div>
  );
}

function tempoTreino(desde?: string | null) {
  if (!desde) return "—";
  const start = new Date(desde);
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) months = 0;
  const anos = Math.floor(months / 12);
  const meses = months % 12;
  const parts: string[] = [];
  if (anos) parts.push(`${anos} ano${anos > 1 ? "s" : ""}`);
  parts.push(`${meses} ${meses === 1 ? "mês" : "meses"}`);
  return parts.join(" e ");
}

/* ---------- Resumo das turmas ---------- */

export function ResumoTurmas({
  alunos,
  presencas,
}: {
  alunos: Profile[];
  presencas: PresencaRow[];
}) {
  const aprovados = alunos.filter((a) => a.status === "aprovado");
  const stats = useMemo(() => statsPorAluno(presencas), [presencas]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {TURMAS.map((t) => {
        const doGrupo = aprovados.filter((a) => turmaOf(a) === t.k);
        const freqs = doGrupo.map((a) => stats.get(a.id)?.freq ?? 0).filter((_, i) => doGrupo[i]);
        const media = freqs.length ? Math.round(freqs.reduce((s, v) => s + v, 0) / freqs.length) : 0;
        return (
          <div
            key={t.k}
            className="p-4 animate-fade-in"
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.line}`,
              clipPath:
                "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
              >
                {t.icon} {t.label}
              </span>
              <Users size={14} color={COLORS.paperDim} />
            </div>
            <div
              className="text-3xl mt-2"
              style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
            >
              {doGrupo.length}
            </div>
            <div className="text-[11px] mb-2" style={{ color: COLORS.paperDim }}>
              alunos ativos
            </div>
            <BarraFrequencia pct={media} width={110} />
            <div className="text-[10px] mt-1" style={{ color: COLORS.paperDim }}>
              Presença média da turma
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Chamada rápida ---------- */

export function ChamadaRapida({
  alunos,
  presencas,
  onReload,
}: {
  alunos: Profile[];
  presencas: PresencaRow[];
  onReload: () => void;
}) {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [turma, setTurma] = useState<TurmaKey>("infantil");
  const [tipoAula, setTipoAula] = useState(TIPOS_AULA[0]);
  const [rascunho, setRascunho] = useState<Record<string, boolean>>({});
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");

  const doDia = useMemo(() => {
    const m = new Map<string, boolean>();
    presencas.filter((p) => p.data === data).forEach((p) => m.set(p.aluno_id, p.presente));
    return m;
  }, [presencas, data]);

  const lista = alunos.filter((a) => a.status === "aprovado" && turmaOf(a) === turma);

  function marcar(id: string, presente: boolean) {
    setRascunho((s) => ({ ...s, [id]: presente }));
    setMsg("");
  }

  async function finalizar() {
    if (!lista.length) return;
    setSalvando(true);
    const linhas = lista.map((a) => ({
      aluno_id: a.id,
      data,
      presente: rascunho[a.id] ?? doDia.get(a.id) ?? false,
      turma,
      tipo_aula: tipoAula,
    }));
    const { error } = await supabase
      .from("presencas")
      .upsert(linhas, { onConflict: "aluno_id,data" });
    setSalvando(false);
    setMsg(error ? error.message : "Chamada salva no histórico.");
    if (!error) setRascunho({});
    onReload();
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div
        className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
      >
        <Field label="Data">
          <input
            type="date"
            style={inputStyle}
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </Field>
        <Field label="Turma">
          <select
            style={inputStyle}
            value={turma}
            onChange={(e) => setTurma(e.target.value as TurmaKey)}
          >
            {TURMAS.map((t) => (
              <option key={t.k} value={t.k}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tipo de aula">
          <select style={inputStyle} value={tipoAula} onChange={(e) => setTipoAula(e.target.value)}>
            {TIPOS_AULA.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="space-y-2">
        {lista.length === 0 && (
          <div
            className="p-4 text-sm text-center"
            style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
          >
            Nenhum aluno aprovado nesta turma.
          </div>
        )}
        {lista.map((a) => {
          const belt = findBelt(a.faixa_id);
          const marcada = rascunho[a.id] ?? doDia.get(a.id);
          return (
            <div
              key={a.id}
              className="p-3 flex flex-wrap items-center gap-3 animate-fade-in"
              style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
            >
              <div className="flex-1 min-w-[180px]">
                <div
                  className="text-sm uppercase font-semibold"
                  style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                >
                  {a.nome} {marcada === true ? "✅" : marcada === false ? "❌" : ""}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {belt && <BeltSwatch belt={belt} size="sm" />}
                  <span className="text-xs" style={{ color: COLORS.paperDim }}>
                    {belt?.name}
                  </span>
                </div>
              </div>
              <Button variant={marcada === true ? "brass" : "ghost"} onClick={() => marcar(a.id, true)}>
                <CheckCircle2 size={14} /> Presente
              </Button>
              <Button
                variant={marcada === false ? "danger" : "ghost"}
                onClick={() => marcar(a.id, false)}
              >
                <XCircle size={14} /> Falta
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="brass" onClick={finalizar} disabled={salvando || !lista.length}>
          <Save size={14} /> {salvando ? "Salvando..." : "Finalizar chamada"}
        </Button>
        {msg && (
          <span className="text-xs" style={{ color: COLORS.brass }}>
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Painel por turma ---------- */

export function PainelTurma({
  turma,
  alunos,
  presencas,
  proximosExames,
  ultimasGraduacoes,
}: {
  turma: TurmaKey;
  alunos: Profile[];
  presencas: PresencaRow[];
  proximosExames?: Map<string, string>;
  ultimasGraduacoes?: Map<string, string>;
}) {
  const stats = useMemo(() => statsPorAluno(presencas), [presencas]);
  const hoje = new Date().toISOString().slice(0, 10);
  const doDia = useMemo(() => {
    const m = new Map<string, boolean>();
    presencas.filter((p) => p.data === hoje).forEach((p) => m.set(p.aluno_id, p.presente));
    return m;
  }, [presencas, hoje]);
  const mesAtual = hoje.slice(0, 7);

  const lista = alunos.filter((a) => a.status === "aprovado" && turmaOf(a) === turma);

  return (
    <div className="space-y-2">
      {lista.length === 0 && (
        <div
          className="p-4 text-sm text-center"
          style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
        >
          Nenhum aluno nesta turma.
        </div>
      )}
      {lista.map((a) => {
        const belt = findBelt(a.faixa_id);
        const s = stats.get(a.id);
        const doMes = presencas.filter((p) => p.aluno_id === a.id && p.data.startsWith(mesAtual));
        const presMes = doMes.filter((p) => p.presente).length;
        const freqMes = doMes.length ? Math.round((presMes / doMes.length) * 100) : 0;
        const marcada = doDia.get(a.id);
        return (
          <div
            key={a.id}
            className="p-3 animate-fade-in"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[180px]">
                <div
                  className="text-sm uppercase font-semibold"
                  style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                >
                  {a.nome}{" "}
                  <span title="Presença de hoje">
                    {marcada === true ? "✅" : marcada === false ? "❌" : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {belt && <BeltSwatch belt={belt} size="sm" />}
                  <span className="text-xs" style={{ color: COLORS.paperDim }}>
                    {belt?.name}
                  </span>
                </div>
              </div>
              <div className="min-w-[160px]">
                <div className="text-[10px] uppercase" style={{ color: COLORS.paperDim }}>
                  Frequência {turma === "juvenil" ? "mensal" : "geral"}
                </div>
                <BarraFrequencia pct={turma === "juvenil" ? freqMes : (s?.freq ?? 0)} />
              </div>
              <div className="text-xs min-w-[150px]" style={{ color: COLORS.paperDim }}>
                Presenças: {s?.presentes ?? 0} · Faltas: {s?.faltas ?? 0}
              </div>
              {turma === "adulto" && (
                <div className="text-xs min-w-[200px]" style={{ color: COLORS.paperDim }}>
                  Tempo de treino: {tempoTreino(a.data_matricula)}
                  <br />
                  Última graduação: {ultimasGraduacoes?.get(a.id) ?? "—"}
                  <br />
                  Próximo exame: {proximosExames?.get(a.id) ?? "Nenhum agendado"}
                </div>
              )}
              {turma === "juvenil" && (
                <div className="text-xs min-w-[150px]" style={{ color: COLORS.paperDim }}>
                  Evolução: {presMes} aula{presMes === 1 ? "" : "s"} no mês
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Histórico de frequência ---------- */

export function HistoricoFrequencia({
  alunos,
  presencas,
}: {
  alunos: Profile[];
  presencas: PresencaRow[];
}) {
  const [alunoId, setAlunoId] = useState("");
  const aprovados = alunos.filter((a) => a.status === "aprovado");
  const doAluno = presencas.filter((p) => p.aluno_id === alunoId);

  const meses = useMemo(() => {
    const m = new Map<string, { presencas: number; faltas: number }>();
    doAluno.forEach((p) => {
      const key = p.data.slice(0, 7);
      const cur = m.get(key) ?? { presencas: 0, faltas: 0 };
      if (p.presente) cur.presencas++;
      else cur.faltas++;
      m.set(key, cur);
    });
    return Array.from(m.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [doAluno]);

  const total = doAluno.length;
  const presentes = doAluno.filter((p) => p.presente).length;
  const freq = total ? Math.round((presentes / total) * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-3" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <Field label="Aluno">
          <select style={inputStyle} value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
            <option value="">Selecione um aluno</option>
            {aprovados.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {alunoId && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Total de aulas", total],
              ["Presenças", presentes],
              ["Faltas", total - presentes],
              ["Frequência", `${freq}%`],
            ].map(([l, v]) => (
              <div
                key={String(l)}
                className="p-3"
                style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
              >
                <div
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
                >
                  {l}
                </div>
                <div
                  className="text-2xl"
                  style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          <div>
            <StencilHeading as="h3" className="text-base mb-2">
              Evolução mensal
            </StencilHeading>
            <div className="space-y-2">
              {meses.length === 0 && (
                <div
                  className="p-4 text-sm text-center"
                  style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
                >
                  Sem registros de presença.
                </div>
              )}
              {meses.map(([mes, v]) => {
                const t = v.presencas + v.faltas;
                const pct = t ? Math.round((v.presencas / t) * 100) : 0;
                const [y, m] = mes.split("-");
                return (
                  <div
                    key={mes}
                    className="p-3 flex flex-wrap items-center gap-3"
                    style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
                  >
                    <div
                      className="text-sm uppercase min-w-[110px]"
                      style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                    >
                      {m}/{y}
                    </div>
                    <div className="text-xs flex-1" style={{ color: COLORS.paperDim }}>
                      {v.presencas} presença{v.presencas === 1 ? "" : "s"} · {v.faltas} falta
                      {v.faltas === 1 ? "" : "s"}
                    </div>
                    <BarraFrequencia pct={pct} />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Alertas de frequência ---------- */

export function AlertasFrequencia({
  alunos,
  presencas,
  minimoAulas = 4,
}: {
  alunos: Profile[];
  presencas: PresencaRow[];
  minimoAulas?: number;
}) {
  const stats = useMemo(() => statsPorAluno(presencas), [presencas]);
  const alertas = alunos
    .filter((a) => a.status === "aprovado")
    .map((a) => ({ aluno: a, s: stats.get(a.id) }))
    .filter((x) => x.s && x.s.total >= minimoAulas && x.s.freq < 70)
    .sort((a, b) => (a.s!.freq ?? 0) - (b.s!.freq ?? 0));

  if (alertas.length === 0) return null;

  return (
    <div className="space-y-2">
      {alertas.map(({ aluno, s }) => {
        const critico = (s?.freq ?? 0) < 50;
        return (
          <div
            key={aluno.id}
            className="p-3 flex items-center gap-3 animate-fade-in"
            style={{
              background: COLORS.panel,
              border: `1px solid ${critico ? "#6b2018" : COLORS.brassDim}`,
            }}
          >
            <AlertTriangle size={16} color={critico ? "#e08070" : COLORS.brass} />
            <div className="flex-1 text-xs" style={{ color: COLORS.paper }}>
              {critico
                ? `🔴 ${aluno.nome} está com muitas faltas e precisa de acompanhamento.`
                : `🟡 Aluno ${aluno.nome} está com frequência abaixo de 70%.`}
            </div>
            <BarraFrequencia pct={s?.freq ?? 0} width={90} />
          </div>
        );
      })}
    </div>
  );
}
