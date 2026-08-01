import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  DollarSign,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Ban,
  Unlock,
  Trash2,
  Save,
  Plus,
  Megaphone,
  Trophy,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BELTS,
  COLORS,
  camoStyle,
  useAfc,
  findBelt,
  type AlunoStatus,
  type Profile,
} from "@/lib/afc";
import { Header } from "@/components/afc-header";
import { Sidebar } from "@/components/afc-sidebar";
import { AdminSettingsModal } from "@/components/afc-modals";
import {
  Button,
  Eyebrow,
  StencilHeading,
  Field,
  inputStyle,
  BeltSwatch,
} from "@/components/afc-ui";
import { definirSenhaAluno, rejeitarCadastro } from "@/lib/alunos.functions";
import {
  AlertasFrequencia,
  ChamadaRapida,
  HistoricoFrequencia,
  PainelTurma,
  ResumoTurmas,
  TURMAS,
  turmaOf,
  BarraFrequencia,
  statsPorAluno,
  type TurmaKey,
} from "@/components/afc-turmas";
import { GestorConquistas } from "@/components/afc-carteira";
import {
  DestaqueCard,
  MuralAvisos,
  TIPOS_AVISO,
  fmtData,
  useAvisos,
  useDestaque,
  type Aviso,
} from "@/components/afc-extras";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel do Mestre — Army Fight Club Hapkido" },
      { name: "description", content: "Painel administrativo da academia." },
    ],
  }),
  component: AdminPage,
});

type Mensalidade = {
  id: string;
  aluno_id: string;
  valor: number;
  vencimento: string;
  pago_em: string | null;
  status: "pendente" | "pago" | "atrasado";
  observacao: string | null;
};

type Presenca = {
  id: string;
  aluno_id: string;
  data: string;
  presente: boolean;
  turma?: TurmaKey | null;
  tipo_aula?: string | null;
};

type Exame = {
  id: string;
  aluno_id: string;
  faixa_atual: string;
  faixa_proxima: string;
  data_exame: string;
  status: "agendado" | "aprovado" | "reprovado";
  nota: number | null;
  comentario: string | null;
};

type Tab =
  | "dashboard"
  | "alunos"
  | "mensalidades"
  | "presencas"
  | "exames"
  | "evolucao"
  | "avisos"
  | "estatisticas";

function AdminPage() {
  const { isMestre, hydrated } = useAfc();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");

  const [alunos, setAlunos] = useState<Profile[]>([]);
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);

  const load = useCallback(async () => {
    const [a, m, p, e] = await Promise.all([
      supabase.from("profiles").select("*").order("nome"),
      supabase.from("mensalidades").select("*").order("vencimento", { ascending: false }),
      supabase.from("presencas").select("*").order("data", { ascending: false }).limit(500),
      supabase.from("exames").select("*").order("data_exame", { ascending: false }),
    ]);
    if (a.data) setAlunos(a.data as Profile[]);
    if (m.data) setMensalidades(m.data as Mensalidade[]);
    if (p.data) setPresencas(p.data as Presenca[]);
    if (e.data) setExames(e.data as Exame[]);
  }, []);

  useEffect(() => {
    if (isMestre) void load();
  }, [isMestre, load]);

  if (!hydrated) return null;
  if (!isMestre) return <Navigate to="/" />;

  return (
    <div className="min-h-screen" style={{ background: COLORS.ink }}>
      <Header
        onMenu={() => setMenuOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        search={search}
        setSearch={setSearch}
      />
      <div className="flex">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="flex-1 min-w-0">
          <section className="relative border-b" style={{ borderColor: COLORS.line }}>
            <div className="absolute inset-0" style={camoStyle(0.35)} />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(10,11,7,0.5), rgba(10,11,7,0.96))",
              }}
            />
            <div className="relative max-w-6xl mx-auto px-4 py-8">
              <Eyebrow>Comando</Eyebrow>
              <StencilHeading as="h1" className="text-3xl">
                Painel do Mestre
              </StencilHeading>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 py-4">
            <div
              className="flex flex-wrap gap-1 p-1 rounded-sm mb-6"
              style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
            >
              {(
                [
                  { k: "dashboard", label: "Visão geral", icon: <CalendarCheck size={14} /> },
                  { k: "alunos", label: "Alunos", icon: <Users size={14} /> },
                  { k: "mensalidades", label: "Mensalidades", icon: <DollarSign size={14} /> },
                  { k: "presencas", label: "Presença", icon: <UserCheck size={14} /> },
                  { k: "exames", label: "Exames", icon: <CalendarCheck size={14} /> },
                  { k: "evolucao", label: "Evolução", icon: <Save size={14} /> },
                  { k: "avisos", label: "Mural & Destaque", icon: <Megaphone size={14} /> },
                  { k: "estatisticas", label: "Estatísticas", icon: <BarChart3 size={14} /> },
                ] as { k: Tab; label: string; icon: React.ReactNode }[]
              ).map((t) => {
                const active = tab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className="flex-1 min-w-[130px] px-3 py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    style={{
                      background: active ? COLORS.olive : "transparent",
                      color: active ? "#f2f0e6" : COLORS.paperDim,
                      fontFamily: "'Oswald', sans-serif",
                      border: active ? `1px solid ${COLORS.oliveBright}` : "1px solid transparent",
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                );
              })}
            </div>

            {tab === "dashboard" && (
              <Dashboard
                alunos={alunos}
                mensalidades={mensalidades}
                exames={exames}
                presencas={presencas}
              />
            )}
            {tab === "alunos" && <AlunosTab alunos={alunos} onReload={load} />}
            {tab === "mensalidades" && (
              <MensalidadesTab alunos={alunos} mensalidades={mensalidades} onReload={load} />
            )}
            {tab === "presencas" && (
              <PresencasTab alunos={alunos} presencas={presencas} onReload={load} />
            )}
            {tab === "exames" && <ExamesTab alunos={alunos} exames={exames} onReload={load} />}
            {tab === "evolucao" && <EvolucaoTab alunos={alunos} />}
            {tab === "avisos" && <AvisosTab alunos={alunos} />}
            {tab === "estatisticas" && (
              <EstatisticasTab alunos={alunos} presencas={presencas} exames={exames} />
            )}
          </div>
        </main>
      </div>
      {settingsOpen && <AdminSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

/* ---------- Dashboard ---------- */

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="p-4" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
      <div
        className="text-xs uppercase tracking-widest"
        style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
      >
        {label}
      </div>
      <div
        className="text-3xl mt-1 font-bold"
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

function Dashboard({
  alunos,
  mensalidades,
  exames,
  presencas,
}: {
  alunos: Profile[];
  mensalidades: Mensalidade[];
  exames: Exame[];
  presencas: Presenca[];
}) {
  const aprovados = alunos.filter((a) => a.status === "aprovado");
  const pendentes = alunos.filter((a) => a.status === "pendente");
  const bloqueados = alunos.filter((a) => a.status === "bloqueado");
  const emAtraso = mensalidades.filter((m) => m.status === "atrasado");
  const emDia = mensalidades.filter((m) => m.status === "pago");
  const proximosExames = exames.filter(
    (e) => e.status === "agendado" && new Date(e.data_exame) >= new Date(new Date().toDateString()),
  );
  const hoje = new Date().toISOString().slice(0, 10);
  const presentesHoje = presencas.filter((p) => p.data === hoje && p.presente).length;

  const alunosMap = new Map(alunos.map((a) => [a.id, a]));
  const em7dias = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const proximosVencimentos = mensalidades
    .filter((m) => m.status !== "pago" && m.vencimento >= hoje && m.vencimento <= em7dias)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  const freqPorAluno = new Map<string, { total: number; presentes: number }>();
  presencas.forEach((p) => {
    const cur = freqPorAluno.get(p.aluno_id) ?? { total: 0, presentes: 0 };
    cur.total++;
    if (p.presente) cur.presentes++;
    freqPorAluno.set(p.aluno_id, cur);
  });
  const mediaAcademia = (() => {
    const vals = Array.from(freqPorAluno.values()).filter((v) => v.total > 0);
    if (!vals.length) return 0;
    return Math.round((vals.reduce((s, v) => s + v.presentes / v.total, 0) / vals.length) * 100);
  })();
  const muitasFaltas = aprovados.filter((a) => {
    const f = freqPorAluno.get(a.id);
    return f && f.total >= 4 && f.presentes / f.total < 0.6;
  });
  const presentesRecentes = presencas
    .filter((p) => p.presente)
    .slice(0, 8)
    .map((p) => ({ nome: alunosMap.get(p.aluno_id)?.nome ?? "—", data: p.data }));

  const avaliacoesPendentes = exames.filter((e) => e.status !== "agendado" && e.nota == null);
  const prontosGraduacao = aprovados.filter((a) => {
    const f = freqPorAluno.get(a.id);
    return f && f.presentes >= 40;
  });

  const mesAtual = new Date().getMonth();
  const aniversariantes = alunos.filter(
    (a) => a.data_nascimento && new Date(`${a.data_nascimento}T12:00:00`).getMonth() === mesAtual,
  );
  const recentes = alunos
    .slice()
    .sort((a, b) => (b.data_matricula ?? "").localeCompare(a.data_matricula ?? ""))
    .slice(0, 5);

  const alertas: { cor: string; texto: string }[] = [];
  if (emAtraso.length)
    alertas.push({ cor: "#e08070", texto: `🔴 ${emAtraso.length} mensalidade(s) em atraso.` });
  if (pendentes.length)
    alertas.push({
      cor: "#d1a72c",
      texto: `🟡 ${pendentes.length} aluno(s) aguardando aprovação.`,
    });
  if (proximosExames.length)
    alertas.push({ cor: "#7fa8d8", texto: `🔵 ${proximosExames.length} exame(s) próximo(s).` });
  if (avaliacoesPendentes.length)
    alertas.push({
      cor: "#c79ad8",
      texto: `🟣 ${avaliacoesPendentes.length} avaliação(ões) de exame pendente(s).`,
    });
  if (muitasFaltas.length)
    alertas.push({
      cor: "#e08070",
      texto: `🔴 ${muitasFaltas.length} aluno(s) com muitas faltas.`,
    });

  return (
    <div className="space-y-5 animate-fade-in">
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((a, i) => (
            <div
              key={i}
              className="p-3 text-sm flex items-center gap-2"
              style={{
                background: COLORS.panel,
                border: `1px solid ${COLORS.line}`,
                borderLeft: `3px solid ${a.cor}`,
                color: COLORS.paper,
              }}
            >
              <AlertTriangle size={14} color={a.cor} /> {a.texto}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="Alunos ativos" value={aprovados.length} />
        <Card label="Aguardando aprovação" value={pendentes.length} hint="Requerem aprovação" />
        <Card label="Alunos bloqueados" value={bloqueados.length} />
        <Card label="Total cadastrados" value={alunos.length} />
        <Card label="Mensalidades em dia" value={emDia.length} />
        <Card label="Mensalidades em atraso" value={emAtraso.length} />
        <Card label="Presentes hoje" value={presentesHoje} />
        <Card label="Média de frequência" value={`${mediaAcademia}%`} />
      </div>

      <ResumoTurmas alunos={alunos} presencas={presencas} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Bloco titulo="Próximos vencimentos">
          {proximosVencimentos.length === 0 ? (
            <Vazio>Nenhum vencimento nos próximos 7 dias.</Vazio>
          ) : (
            proximosVencimentos.map((m) => (
              <Linha
                key={m.id}
                titulo={alunosMap.get(m.aluno_id)?.nome ?? "—"}
                detalhe={`Vence em ${fmtData(m.vencimento)} · R$ ${Number(m.valor).toFixed(2)}`}
              />
            ))
          )}
        </Bloco>

        <Bloco titulo="Alunos com muitas faltas">
          {muitasFaltas.length === 0 ? (
            <Vazio>Frequência da turma está saudável.</Vazio>
          ) : (
            muitasFaltas.map((a) => {
              const f = freqPorAluno.get(a.id)!;
              return (
                <Linha
                  key={a.id}
                  titulo={a.nome}
                  detalhe={`${Math.round((f.presentes / f.total) * 100)}% de presença (${f.presentes}/${f.total})`}
                />
              );
            })
          )}
        </Bloco>

        <Bloco titulo="Presenças recentes">
          {presentesRecentes.length === 0 ? (
            <Vazio>Nenhuma presença registrada.</Vazio>
          ) : (
            presentesRecentes.map((p, i) => (
              <Linha key={i} titulo={p.nome} detalhe={fmtData(p.data)} />
            ))
          )}
        </Bloco>

        <Bloco titulo="Próximos exames">
          {proximosExames.length === 0 ? (
            <Vazio>Nenhum exame agendado.</Vazio>
          ) : (
            proximosExames.map((e) => (
              <Linha
                key={e.id}
                titulo={alunosMap.get(e.aluno_id)?.nome ?? "—"}
                detalhe={`${fmtData(e.data_exame)} · Alvo: ${findBelt(e.faixa_proxima)?.name ?? e.faixa_proxima}`}
              />
            ))
          )}
        </Bloco>

        <Bloco titulo="Prontos para graduação">
          {prontosGraduacao.length === 0 ? (
            <Vazio>Nenhum aluno atingiu 40 presenças.</Vazio>
          ) : (
            prontosGraduacao.map((a) => (
              <Linha
                key={a.id}
                titulo={a.nome}
                detalhe={`${freqPorAluno.get(a.id)?.presentes ?? 0} presenças · ${findBelt(a.faixa_id)?.name ?? a.faixa_id}`}
              />
            ))
          )}
        </Bloco>

        <Bloco titulo="Novos alunos">
          {recentes.length === 0 ? (
            <Vazio>Nenhum cadastro ainda.</Vazio>
          ) : (
            recentes.map((a) => (
              <Linha
                key={a.id}
                titulo={a.nome}
                detalhe={`Cadastro em ${fmtData(a.data_matricula)} · ${a.status}`}
              />
            ))
          )}
        </Bloco>

        <Bloco titulo="Aniversariantes do mês">
          {aniversariantes.length === 0 ? (
            <Vazio>Nenhum aniversariante neste mês.</Vazio>
          ) : (
            aniversariantes.map((a) => (
              <Linha key={a.id} titulo={`🎂 ${a.nome}`} detalhe={fmtData(a.data_nascimento)} />
            ))
          )}
        </Bloco>

        <Bloco titulo="Tempo de academia">
          {aprovados.length === 0 ? (
            <Vazio>Nenhum aluno ativo.</Vazio>
          ) : (
            aprovados.slice(0, 8).map((a) => {
              const inicio = new Date(`${a.data_matricula}T12:00:00`);
              const meses = Math.max(
                0,
                (new Date().getFullYear() - inicio.getFullYear()) * 12 +
                  (new Date().getMonth() - inicio.getMonth()),
              );
              return (
                <Linha
                  key={a.id}
                  titulo={a.nome}
                  detalhe={`${Math.floor(meses / 12)} ano(s) e ${meses % 12} mês(es)`}
                />
              );
            })
          )}
        </Bloco>
      </div>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="p-4" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
      <div
        className="text-xs uppercase tracking-widest mb-2"
        style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
      >
        {titulo}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Linha({ titulo, detalhe }: { titulo: string; detalhe: string }) {
  return (
    <div
      className="flex flex-wrap items-baseline justify-between gap-2 py-1"
      style={{ borderBottom: `1px dashed ${COLORS.line}` }}
    >
      <span
        className="text-sm uppercase"
        style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
      >
        {titulo}
      </span>
      <span className="text-xs" style={{ color: COLORS.paperDim }}>
        {detalhe}
      </span>
    </div>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs" style={{ color: COLORS.paperDim }}>
      {children}
    </div>
  );
}

/* ---------- Estatísticas ---------- */

function EstatisticasTab({
  alunos,
  presencas,
  exames,
}: {
  alunos: Profile[];
  presencas: Presenca[];
  exames: Exame[];
}) {
  const aprovados = alunos.filter((a) => a.status === "aprovado");
  const porFaixa = BELTS.map((b) => ({
    belt: b,
    total: aprovados.filter((a) => a.faixa_id === b.id).length,
  }));
  const maxFaixa = Math.max(1, ...porFaixa.map((p) => p.total));
  const mediaPresenca = presencas.length
    ? Math.round((presencas.filter((p) => p.presente).length / presencas.length) * 100)
    : 0;
  const examesRealizados = exames.filter((e) => e.status !== "agendado").length;
  const aprovadosExame = exames.filter((e) => e.status === "aprovado").length;

  const crescimento = (() => {
    const map = new Map<string, number>();
    alunos.forEach((a) => {
      const mes = (a.data_matricula ?? "").slice(0, 7);
      if (!mes) return;
      map.set(mes, (map.get(mes) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
  })();
  const maxCresc = Math.max(1, ...crescimento.map((c) => c[1]));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="Média de presença" value={`${mediaPresenca}%`} />
        <Card label="Exames realizados" value={examesRealizados} />
        <Card label="Aprovações em exame" value={aprovadosExame} />
        <Card label="Graduações ativas" value={porFaixa.filter((p) => p.total > 0).length} />
      </div>

      <Bloco titulo="Alunos por faixa">
        {porFaixa.map(({ belt, total }) => (
          <div key={belt.id} className="flex items-center gap-3 py-1">
            <div style={{ width: 150 }} className="flex items-center gap-2">
              <BeltSwatch belt={belt} size="sm" />
              <span className="text-xs" style={{ color: COLORS.paperDim }}>
                {belt.name}
              </span>
            </div>
            <div className="flex-1 h-3" style={{ background: COLORS.steel }}>
              <div
                style={{
                  width: `${(total / maxFaixa) * 100}%`,
                  height: "100%",
                  background: COLORS.brass,
                  transition: "width 400ms ease",
                }}
              />
            </div>
            <span className="text-xs w-6 text-right" style={{ color: COLORS.paper }}>
              {total}
            </span>
          </div>
        ))}
      </Bloco>

      <Bloco titulo="Crescimento da academia (novos cadastros por mês)">
        {crescimento.length === 0 ? (
          <Vazio>Sem dados suficientes.</Vazio>
        ) : (
          crescimento.map(([mes, qtd]) => (
            <div key={mes} className="flex items-center gap-3 py-1">
              <span className="text-xs" style={{ color: COLORS.paperDim, width: 70 }}>
                {mes}
              </span>
              <div className="flex-1 h-3" style={{ background: COLORS.steel }}>
                <div
                  style={{
                    width: `${(qtd / maxCresc) * 100}%`,
                    height: "100%",
                    background: COLORS.oliveBright,
                  }}
                />
              </div>
              <span className="text-xs w-6 text-right" style={{ color: COLORS.paper }}>
                {qtd}
              </span>
            </div>
          ))
        )}
      </Bloco>
    </div>
  );
}

/* ---------- Mural de avisos & aluno destaque ---------- */

function AvisosTab({ alunos }: { alunos: Profile[] }) {
  const { avisos, reloadAvisos } = useAvisos();
  const { destaque, reloadDestaque } = useDestaque();
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("comunicado");
  const [fixado, setFixado] = useState(false);
  const [editando, setEditando] = useState<Aviso | null>(null);

  const [destaqueAluno, setDestaqueAluno] = useState("");
  const [motivo, setMotivo] = useState("");

  async function salvarAviso(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    if (editando) {
      await supabase
        .from("avisos")
        .update({ titulo: titulo.trim(), mensagem, tipo, fixado })
        .eq("id", editando.id);
      setEditando(null);
    } else {
      await supabase.from("avisos").insert({ titulo: titulo.trim(), mensagem, tipo, fixado });
    }
    setTitulo("");
    setMensagem("");
    setFixado(false);
    void reloadAvisos();
  }

  async function excluirAviso(id: string) {
    if (!confirm("Excluir aviso?")) return;
    await supabase.from("avisos").delete().eq("id", id);
    void reloadAvisos();
  }

  function editar(a: Aviso) {
    setEditando(a);
    setTitulo(a.titulo);
    setMensagem(a.mensagem);
    setTipo(a.tipo);
    setFixado(a.fixado);
  }

  async function salvarDestaque(e: React.FormEvent) {
    e.preventDefault();
    const aluno = alunos.find((a) => a.id === destaqueAluno);
    if (!aluno) return;
    const mes = `${new Date().toISOString().slice(0, 7)}-01`;
    await supabase
      .from("destaques")
      .upsert(
        { mes, aluno_id: aluno.id, aluno_nome: aluno.nome, motivo, ativo: true },
        { onConflict: "mes" },
      );
    setMotivo("");
    void reloadDestaque();
  }

  async function toggleDestaque() {
    if (!destaque) return;
    await supabase.from("destaques").update({ ativo: !destaque.ativo }).eq("id", destaque.id);
    void reloadDestaque();
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <form
        onSubmit={salvarAviso}
        className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
      >
        <Field label="Título do aviso">
          <input
            type="text"
            style={inputStyle}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </Field>
        <Field label="Tipo">
          <select style={inputStyle} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_AVISO.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Mensagem">
            <textarea
              style={{ ...inputStyle, minHeight: 90 }}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Ex.: Treino especial neste sábado às 09:00."
            />
          </Field>
        </div>
        <label
          className="flex items-center gap-2 text-xs uppercase"
          style={{ color: COLORS.paperDim }}
        >
          <input type="checkbox" checked={fixado} onChange={(e) => setFixado(e.target.checked)} />
          Fixar no topo do mural
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit" variant="brass">
            <Megaphone size={14} /> {editando ? "Salvar alterações" : "Publicar aviso"}
          </Button>
          {editando && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditando(null);
                setTitulo("");
                setMensagem("");
                setFixado(false);
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {avisos.map((a) => (
          <div key={a.id} className="space-y-1">
            <MuralAvisos avisos={[a]} />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => editar(a)}>
                <Save size={14} /> Editar
              </Button>
              <Button variant="danger" onClick={() => void excluirAviso(a.id)}>
                <Trash2 size={14} /> Excluir
              </Button>
            </div>
          </div>
        ))}
        {avisos.length === 0 && (
          <div
            className="p-4 text-sm text-center"
            style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
          >
            Nenhum aviso publicado.
          </div>
        )}
      </div>

      <form
        onSubmit={salvarDestaque}
        className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
      >
        <Field label="🏆 Aluno destaque do mês">
          <select
            style={inputStyle}
            value={destaqueAluno}
            onChange={(e) => setDestaqueAluno(e.target.value)}
          >
            <option value="">— selecione —</option>
            {alunos
              .filter((a) => a.status === "aprovado")
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Motivo (frequência, evolução, disciplina…)">
          <input
            type="text"
            style={inputStyle}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" variant="brass">
            <Trophy size={14} /> Definir destaque
          </Button>
          {destaque && (
            <Button variant="ghost" onClick={() => void toggleDestaque()}>
              {destaque.ativo ? "Desativar" : "Ativar"}
            </Button>
          )}
        </div>
      </form>

      {destaque && <DestaqueCard destaque={destaque} />}
    </div>
  );
}

/* ---------- Alunos ---------- */

function AlunosTab({ alunos, onReload }: { alunos: Profile[]; onReload: () => void }) {
  const [senhas, setSenhas] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<Record<string, string>>({});

  async function setStatus(id: string, status: AlunoStatus) {
    await supabase.from("profiles").update({ status }).eq("id", id);
    onReload();
  }
  async function salvarSenha(id: string) {
    const senha = (senhas[id] ?? "").trim();
    if (senha.length < 6) {
      setAviso((s) => ({ ...s, [id]: "A senha precisa ter ao menos 6 caracteres." }));
      return;
    }
    try {
      await definirSenhaAluno({ data: { alunoId: id, senha } });
      setSenhas((s) => ({ ...s, [id]: "" }));
      setAviso((s) => ({ ...s, [id]: "Senha salva." }));
    } catch (e: unknown) {
      setAviso((s) => ({ ...s, [id]: e instanceof Error ? e.message : "Erro ao salvar senha." }));
    }
  }
  async function rejeitar(id: string, nome: string) {
    if (!confirm(`Rejeitar e remover a solicitação de "${nome}"?`)) return;
    try {
      await rejeitarCadastro({ data: { alunoId: id } });
    } catch {
      /* ignore */
    }
    onReload();
  }
  async function setFaixa(id: string, faixa_id: string) {
    await supabase.from("profiles").update({ faixa_id }).eq("id", id);
    onReload();
  }
  async function setTurma(id: string, turma: TurmaKey) {
    await supabase
      .from("profiles")
      .update({ turma } as never)
      .eq("id", id);
    onReload();
  }
  async function setBloqueio(id: string, bloqueado_inadimplencia: boolean) {
    await supabase.from("profiles").update({ bloqueado_inadimplencia }).eq("id", id);
    onReload();
  }
  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir aluno "${nome}"? Esta ação remove o perfil e histórico.`)) return;
    await supabase.from("profiles").delete().eq("id", id);
    onReload();
  }

  return (
    <div className="space-y-3">
      {alunos.length === 0 && (
        <div
          className="p-4 text-sm text-center"
          style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
        >
          Nenhum aluno cadastrado ainda.
        </div>
      )}
      {alunos.map((a) => {
        const belt = findBelt(a.faixa_id);
        return (
          <div
            key={a.id}
            className="p-4"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
          >
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-[220px]">
                <div
                  className="text-base font-semibold uppercase"
                  style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                >
                  {a.nome}
                </div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.paperDim }}>
                  {a.email} {a.telefone && `· ${a.telefone}`}
                </div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.paperDim }}>
                  Matrícula: {a.data_matricula}
                  {a.data_nascimento && ` · Nasc.: ${a.data_nascimento}`}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  {a.bloqueado_inadimplencia && (
                    <span
                      className="text-[10px] uppercase px-2 py-0.5"
                      style={{
                        background: "#3a1810",
                        color: "#e08070",
                        border: "1px solid #6b2018",
                      }}
                    >
                      Inadimplente
                    </span>
                  )}
                </div>
              </div>
              <div className="min-w-[200px]">
                <Field label="Faixa">
                  <select
                    value={a.faixa_id}
                    onChange={(e) => setFaixa(a.id, e.target.value)}
                    style={inputStyle}
                  >
                    {BELTS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {String(b.n).padStart(2, "0")} — {b.name}
                      </option>
                    ))}
                  </select>
                </Field>
                {belt && (
                  <div className="mt-2">
                    <BeltSwatch belt={belt} size="md" />
                  </div>
                )}
                <div className="mt-2">
                  <Field label="Turma">
                    <select
                      value={turmaOf(a)}
                      onChange={(e) => setTurma(a.id, e.target.value as TurmaKey)}
                      style={inputStyle}
                    >
                      {TURMAS.map((t) => (
                        <option key={t.k} value={t.k}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {a.status !== "aprovado" && (
                <Button variant="brass" onClick={() => setStatus(a.id, "aprovado")}>
                  <CheckCircle2 size={14} /> Aprovar
                </Button>
              )}
              {a.status === "pendente" && (
                <Button variant="ghost" onClick={() => rejeitar(a.id, a.nome)}>
                  <XCircle size={14} /> Rejeitar
                </Button>
              )}
              {a.status !== "bloqueado" && (
                <Button variant="ghost" onClick={() => setStatus(a.id, "bloqueado")}>
                  <Ban size={14} /> Bloquear
                </Button>
              )}
              {a.bloqueado_inadimplencia ? (
                <Button variant="ghost" onClick={() => setBloqueio(a.id, false)}>
                  <Unlock size={14} /> Liberar acesso
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setBloqueio(a.id, true)}>
                  <Ban size={14} /> Marcar inadimplente
                </Button>
              )}
              <Button variant="danger" onClick={() => excluir(a.id, a.nome)}>
                <Trash2 size={14} /> Excluir
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="min-w-[220px] flex-1">
                <Field label="Senha do aluno (criar / redefinir)">
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="mínimo 6 caracteres"
                    value={senhas[a.id] ?? ""}
                    onChange={(e) => setSenhas((s) => ({ ...s, [a.id]: e.target.value }))}
                  />
                </Field>
              </div>
              <Button variant="brass" onClick={() => salvarSenha(a.id)}>
                <Save size={14} /> Salvar senha
              </Button>
              {aviso[a.id] && (
                <div className="text-xs" style={{ color: COLORS.brass }}>
                  {aviso[a.id]}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: AlunoStatus }) {
  const map: Record<AlunoStatus, { bg: string; color: string; label: string; border: string }> = {
    pendente: { bg: "#3a2f10", color: "#d1a72c", label: "Pendente", border: "#8a721f" },
    aprovado: { bg: "#1a2c14", color: "#8ab766", label: "Aprovado", border: "#4b5320" },
    bloqueado: { bg: "#3a1810", color: "#e08070", label: "Bloqueado", border: "#6b2018" },
  };
  const s = map[status];
  return (
    <span
      className="text-[10px] uppercase tracking-widest px-2 py-0.5"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

/* ---------- Mensalidades ---------- */

function MensalidadesTab({
  alunos,
  mensalidades,
  onReload,
}: {
  alunos: Profile[];
  mensalidades: Mensalidade[];
  onReload: () => void;
}) {
  const [alunoId, setAlunoId] = useState("");
  const [valor, setValor] = useState("100.00");
  const [vencimento, setVencimento] = useState(new Date().toISOString().slice(0, 10));
  const alunosMap = useMemo(() => new Map(alunos.map((a) => [a.id, a.nome])), [alunos]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoId) return;
    await supabase.from("mensalidades").insert({
      aluno_id: alunoId,
      valor: Number(valor),
      vencimento,
    });
    onReload();
  }
  async function marcarPago(id: string) {
    await supabase
      .from("mensalidades")
      .update({ pago_em: new Date().toISOString().slice(0, 10), status: "pago" })
      .eq("id", id);
    onReload();
  }
  async function excluir(id: string) {
    if (!confirm("Excluir mensalidade?")) return;
    await supabase.from("mensalidades").delete().eq("id", id);
    onReload();
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={add}
        className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
      >
        <Field label="Aluno">
          <select
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">— selecione —</option>
            {alunos
              .filter((a) => a.status === "aprovado")
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Valor (R$)">
          <input
            type="number"
            step="0.01"
            style={inputStyle}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />
        </Field>
        <Field label="Vencimento">
          <input
            type="date"
            style={inputStyle}
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
            required
          />
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="brass">
            <Plus size={14} /> Adicionar
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {mensalidades.length === 0 && (
          <div
            className="p-4 text-sm text-center"
            style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
          >
            Nenhuma mensalidade cadastrada.
          </div>
        )}
        {mensalidades.map((m) => (
          <div
            key={m.id}
            className="p-3 flex flex-wrap items-center gap-3"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
          >
            <div className="flex-1 min-w-[200px]">
              <div
                className="text-sm font-semibold uppercase"
                style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
              >
                {alunosMap.get(m.aluno_id) ?? "Aluno removido"}
              </div>
              <div className="text-xs" style={{ color: COLORS.paperDim }}>
                Venc: {m.vencimento} · R$ {Number(m.valor).toFixed(2)}
                {m.pago_em && ` · Pago em ${m.pago_em}`}
              </div>
            </div>
            <MensalidadeBadge status={m.status} />
            {m.status !== "pago" && (
              <Button variant="brass" onClick={() => marcarPago(m.id)}>
                <CheckCircle2 size={14} /> Marcar pago
              </Button>
            )}
            <Button variant="danger" onClick={() => excluir(m.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MensalidadeBadge({ status }: { status: Mensalidade["status"] }) {
  const map = {
    pendente: { bg: "#3a2f10", color: "#d1a72c", border: "#8a721f", label: "Pendente" },
    pago: { bg: "#1a2c14", color: "#8ab766", border: "#4b5320", label: "Pago" },
    atrasado: { bg: "#3a1810", color: "#e08070", border: "#6b2018", label: "Em atraso" },
  } as const;
  const s = map[status];
  return (
    <span
      className="text-[10px] uppercase tracking-widest px-2 py-0.5"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

/* ---------- Presenças ---------- */

function PresencasTab({
  alunos,
  presencas,
  onReload,
}: {
  alunos: Profile[];
  presencas: Presenca[];
  onReload: () => void;
}) {
  const [sub, setSub] = useState<"chamada" | TurmaKey | "historico" | "alertas">("chamada");
  const [exames, setExames] = useState<
    { aluno_id: string; data_exame: string; status: string }[]
  >([]);
  const [graduacoes, setGraduacoes] = useState<{ aluno_id: string; data: string; faixa_id: string }[]>(
    [],
  );

  useEffect(() => {
    void (async () => {
      const [e, g] = await Promise.all([
        supabase.from("exames").select("aluno_id,data_exame,status").eq("status", "agendado"),
        supabase.from("graduacoes").select("aluno_id,data,faixa_id").order("data"),
      ]);
      setExames((e.data ?? []) as unknown as typeof exames);
      setGraduacoes((g.data ?? []) as unknown as typeof graduacoes);
    })();
  }, []);

  const proximosExames = useMemo(() => {
    const m = new Map<string, string>();
    exames.forEach((e) => {
      const cur = m.get(e.aluno_id);
      if (!cur || e.data_exame < cur) m.set(e.aluno_id, e.data_exame);
    });
    return m;
  }, [exames]);

  const ultimasGraduacoes = useMemo(() => {
    const m = new Map<string, string>();
    graduacoes.forEach((g) => {
      m.set(g.aluno_id, `${findBelt(g.faixa_id)?.name ?? g.faixa_id} (${g.data})`);
    });
    return m;
  }, [graduacoes]);

  const subs: { k: typeof sub; label: string }[] = [
    { k: "chamada", label: "Chamada rápida" },
    ...TURMAS.map((t) => ({ k: t.k as typeof sub, label: `${t.icon} ${t.label}` })),
    { k: "historico", label: "Histórico" },
    { k: "alertas", label: "Alertas" },
  ];

  return (
    <div className="space-y-4">
      <ResumoTurmas alunos={alunos} presencas={presencas} />

      <div className="flex flex-wrap gap-1">
        {subs.map((s) => {
          const active = sub === s.k;
          return (
            <button
              key={String(s.k)}
              onClick={() => setSub(s.k)}
              className="px-3 py-1.5 text-[11px] uppercase tracking-wider"
              style={{
                background: active ? COLORS.oliveDim : "transparent",
                color: active ? COLORS.paper : COLORS.paperDim,
                border: `1px solid ${active ? COLORS.oliveBright : COLORS.line}`,
                fontFamily: "'Oswald', sans-serif",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {sub === "chamada" && (
        <ChamadaRapida alunos={alunos} presencas={presencas} onReload={onReload} />
      )}
      {(sub === "infantil" || sub === "juvenil" || sub === "adulto") && (
        <PainelTurma
          turma={sub}
          alunos={alunos}
          presencas={presencas}
          proximosExames={proximosExames}
          ultimasGraduacoes={ultimasGraduacoes}
        />
      )}
      {sub === "historico" && <HistoricoFrequencia alunos={alunos} presencas={presencas} />}
      {sub === "alertas" && (
        <div className="space-y-2">
          <AlertasFrequencia alunos={alunos} presencas={presencas} />
          <div className="text-xs" style={{ color: COLORS.paperDim }}>
            Alertas aparecem para alunos com 4 ou mais aulas registradas e frequência abaixo de 70%.
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Exames ---------- */

function ExamesTab({
  alunos,
  exames,
  onReload,
}: {
  alunos: Profile[];
  exames: Exame[];
  onReload: () => void;
}) {
  const [alunoId, setAlunoId] = useState("");
  const [dataExame, setDataExame] = useState(new Date().toISOString().slice(0, 10));
  const [faixaProxima, setFaixaProxima] = useState("b02");

  const alunosMap = useMemo(() => new Map(alunos.map((a) => [a.id, a])), [alunos]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const aluno = alunosMap.get(alunoId);
    if (!aluno) return;
    await supabase.from("exames").insert({
      aluno_id: alunoId,
      faixa_atual: aluno.faixa_id,
      faixa_proxima: faixaProxima,
      data_exame: dataExame,
    });
    onReload();
  }
  async function setStatus(id: string, status: Exame["status"]) {
    const ex = exames.find((e) => e.id === id);
    await supabase.from("exames").update({ status }).eq("id", id);
    if (status === "aprovado" && ex) {
      await supabase.from("profiles").update({ faixa_id: ex.faixa_proxima }).eq("id", ex.aluno_id);
    }
    onReload();
  }
  async function excluir(id: string) {
    if (!confirm("Excluir exame?")) return;
    await supabase.from("exames").delete().eq("id", id);
    onReload();
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={add}
        className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
      >
        <Field label="Aluno">
          <select
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">— selecione —</option>
            {alunos
              .filter((a) => a.status === "aprovado")
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Faixa alvo">
          <select
            value={faixaProxima}
            onChange={(e) => setFaixaProxima(e.target.value)}
            style={inputStyle}
          >
            {BELTS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data">
          <input
            type="date"
            style={inputStyle}
            value={dataExame}
            onChange={(e) => setDataExame(e.target.value)}
            required
          />
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="brass">
            <Save size={14} /> Agendar
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {exames.length === 0 && (
          <div
            className="p-4 text-sm text-center"
            style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
          >
            Nenhum exame cadastrado.
          </div>
        )}
        {exames.map((e) => {
          const aluno = alunosMap.get(e.aluno_id);
          const proxima = findBelt(e.faixa_proxima);
          return (
            <div
              key={e.id}
              className="p-3 flex flex-wrap items-center gap-3"
              style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
            >
              <div className="flex-1 min-w-[220px]">
                <div
                  className="text-sm uppercase font-semibold"
                  style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                >
                  {aluno?.nome ?? "Aluno removido"}
                </div>
                <div className="text-xs" style={{ color: COLORS.paperDim }}>
                  {e.data_exame} · Alvo: {proxima?.name ?? e.faixa_proxima}
                </div>
              </div>
              <span
                className="text-[10px] uppercase tracking-widest px-2 py-0.5"
                style={{
                  background:
                    e.status === "aprovado"
                      ? "#1a2c14"
                      : e.status === "reprovado"
                        ? "#3a1810"
                        : "#3a2f10",
                  color:
                    e.status === "aprovado"
                      ? "#8ab766"
                      : e.status === "reprovado"
                        ? "#e08070"
                        : "#d1a72c",
                  border: `1px solid ${e.status === "aprovado" ? "#4b5320" : e.status === "reprovado" ? "#6b2018" : "#8a721f"}`,
                }}
              >
                {e.status}
              </span>
              {e.status === "agendado" && (
                <>
                  <Button variant="brass" onClick={() => setStatus(e.id, "aprovado")}>
                    <CheckCircle2 size={14} /> Aprovar (graduar)
                  </Button>
                  <Button variant="ghost" onClick={() => setStatus(e.id, "reprovado")}>
                    <XCircle size={14} /> Reprovar
                  </Button>
                </>
              )}
              <Button variant="danger" onClick={() => excluir(e.id)}>
                <Trash2 size={14} />
              </Button>
              <AvaliacaoExame exame={e} onReload={onReload} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvaliacaoExame({ exame, onReload }: { exame: Exame; onReload: () => void }) {
  const [nota, setNota] = useState(exame.nota != null ? String(exame.nota) : "");
  const [comentario, setComentario] = useState(exame.comentario ?? "");

  async function salvar() {
    await supabase
      .from("exames")
      .update({ nota: nota === "" ? null : Number(nota), comentario })
      .eq("id", exame.id);
    onReload();
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-2 items-end mt-2">
      <Field label="Nota">
        <input
          type="number"
          step="0.1"
          style={inputStyle}
          value={nota}
          onChange={(ev) => setNota(ev.target.value)}
        />
      </Field>
      <Field label="Comentário do Mestre">
        <input
          type="text"
          style={inputStyle}
          value={comentario}
          onChange={(ev) => setComentario(ev.target.value)}
          placeholder="Pontos fortes e o que melhorar..."
        />
      </Field>
      <Button variant="brass" onClick={() => void salvar()}>
        <Save size={14} /> Salvar avaliação
      </Button>
    </div>
  );
}

/* ---------- Evolução: objetivos e certificados ---------- */

type Objetivo = {
  id: string;
  aluno_id: string;
  texto: string;
  concluido: boolean;
  posicao: number;
};
type Certificado = {
  id: string;
  aluno_id: string;
  faixa_id: string;
  data_emissao: string;
  mestre_nome: string;
  arquivo_url: string;
};

function EvolucaoTab({ alunos }: { alunos: Profile[] }) {
  const [alunoId, setAlunoId] = useState("");
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [novoObjetivo, setNovoObjetivo] = useState("");
  const [certFaixa, setCertFaixa] = useState("b01");
  const [certData, setCertData] = useState(new Date().toISOString().slice(0, 10));
  const [certMestre, setCertMestre] = useState("Mestre Clóvis");
  const [certUrl, setCertUrl] = useState("");

  const load = useCallback(async () => {
    if (!alunoId) {
      setObjetivos([]);
      setCertificados([]);
      return;
    }
    const [o, c] = await Promise.all([
      supabase.from("objetivos").select("*").eq("aluno_id", alunoId).order("posicao"),
      supabase
        .from("certificados")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("data_emissao", { ascending: false }),
    ]);
    setObjetivos((o.data ?? []) as unknown as Objetivo[]);
    setCertificados((c.data ?? []) as unknown as Certificado[]);
  }, [alunoId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addObjetivo(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoId || !novoObjetivo.trim()) return;
    await supabase.from("objetivos").insert({
      aluno_id: alunoId,
      texto: novoObjetivo.trim(),
      posicao: objetivos.length,
    });
    setNovoObjetivo("");
    void load();
  }
  async function toggleObjetivo(o: Objetivo) {
    await supabase.from("objetivos").update({ concluido: !o.concluido }).eq("id", o.id);
    void load();
  }
  async function delObjetivo(id: string) {
    await supabase.from("objetivos").delete().eq("id", id);
    void load();
  }
  async function addCertificado(e: React.FormEvent) {
    e.preventDefault();
    if (!alunoId) return;
    await supabase.from("certificados").insert({
      aluno_id: alunoId,
      faixa_id: certFaixa,
      data_emissao: certData,
      mestre_nome: certMestre,
      arquivo_url: certUrl,
    });
    setCertUrl("");
    void load();
  }
  async function delCertificado(id: string) {
    await supabase.from("certificados").delete().eq("id", id);
    void load();
  }

  return (
    <div className="space-y-4">
      <div className="p-4" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <Field label="Aluno">
          <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} style={inputStyle}>
            <option value="">— selecione —</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {alunoId && (
        <>
          <form
            onSubmit={addObjetivo}
            className="p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
          >
            <Field label="Novo objetivo da próxima graduação">
              <input
                type="text"
                style={inputStyle}
                value={novoObjetivo}
                onChange={(e) => setNovoObjetivo(e.target.value)}
                placeholder="Ex.: Melhorar equilíbrio"
              />
            </Field>
            <Button type="submit" variant="brass">
              <Plus size={14} /> Adicionar
            </Button>
          </form>

          <div className="space-y-2">
            {objetivos.length === 0 && (
              <div
                className="p-3 text-sm text-center"
                style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
              >
                Nenhum objetivo definido.
              </div>
            )}
            {objetivos.map((o) => (
              <div
                key={o.id}
                className="p-3 flex flex-wrap items-center gap-3"
                style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
              >
                <span
                  className="flex-1 text-sm"
                  style={{ color: o.concluido ? COLORS.paperDim : COLORS.paper }}
                >
                  {o.texto}
                </span>
                <Button variant="ghost" onClick={() => void toggleObjetivo(o)}>
                  <CheckCircle2 size={14} /> {o.concluido ? "Reabrir" : "Concluir"}
                </Button>
                <Button variant="danger" onClick={() => void delObjetivo(o.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>

          <form
            onSubmit={addCertificado}
            className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
          >
            <Field label="Faixa do certificado">
              <select
                value={certFaixa}
                onChange={(e) => setCertFaixa(e.target.value)}
                style={inputStyle}
              >
                {BELTS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Data">
              <input
                type="date"
                style={inputStyle}
                value={certData}
                onChange={(e) => setCertData(e.target.value)}
              />
            </Field>
            <Field label="Mestre">
              <input
                type="text"
                style={inputStyle}
                value={certMestre}
                onChange={(e) => setCertMestre(e.target.value)}
              />
            </Field>
            <Field label="Link do arquivo (opcional)">
              <input
                type="url"
                style={inputStyle}
                value={certUrl}
                onChange={(e) => setCertUrl(e.target.value)}
              />
            </Field>
            <div className="flex items-end">
              <Button type="submit" variant="brass">
                <Plus size={14} /> Emitir
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {certificados.length === 0 && (
              <div
                className="p-3 text-sm text-center"
                style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
              >
                Nenhum certificado emitido.
              </div>
            )}
            {certificados.map((c) => (
              <div
                key={c.id}
                className="p-3 flex flex-wrap items-center gap-3"
                style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
              >
                <div className="flex-1 text-sm" style={{ color: COLORS.paper }}>
                  {findBelt(c.faixa_id)?.name ?? c.faixa_id} · {c.data_emissao} · {c.mestre_nome}
                </div>
                <Button variant="danger" onClick={() => void delCertificado(c.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>

          <GestorConquistas alunoId={alunoId} />
        </>
      )}
    </div>
  );
}
