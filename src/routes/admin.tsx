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
import { Button, Eyebrow, StencilHeading, Field, inputStyle, BeltSwatch } from "@/components/afc-ui";
import { definirSenhaAluno, rejeitarCadastro } from "@/lib/alunos.functions";

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

type Tab = "dashboard" | "alunos" | "mensalidades" | "presencas" | "exames" | "evolucao";

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
              style={{ background: "linear-gradient(180deg, rgba(10,11,7,0.5), rgba(10,11,7,0.96))" }}
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
              <Dashboard alunos={alunos} mensalidades={mensalidades} exames={exames} presencas={presencas} />
            )}
            {tab === "alunos" && <AlunosTab alunos={alunos} onReload={load} />}
            {tab === "mensalidades" && (
              <MensalidadesTab alunos={alunos} mensalidades={mensalidades} onReload={load} />
            )}
            {tab === "presencas" && <PresencasTab alunos={alunos} presencas={presencas} onReload={load} />}
            {tab === "exames" && <ExamesTab alunos={alunos} exames={exames} onReload={load} />}
            {tab === "evolucao" && <EvolucaoTab alunos={alunos} />}
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
      {hint && <div className="text-xs mt-1" style={{ color: COLORS.paperDim }}>{hint}</div>}
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
  const emAtraso = mensalidades.filter((m) => m.status === "atrasado");
  const proximosExames = exames.filter(
    (e) => e.status === "agendado" && new Date(e.data_exame) >= new Date(new Date().toDateString()),
  );
  const hoje = new Date().toISOString().slice(0, 10);
  const presentesHoje = presencas.filter((p) => p.data === hoje && p.presente).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card label="Alunos ativos" value={aprovados.length} />
      <Card label="Aguardando aprovação" value={pendentes.length} hint="Requerem aprovação" />
      <Card label="Mensalidades em atraso" value={emAtraso.length} />
      <Card label="Exames agendados" value={proximosExames.length} />
      <Card label="Presentes hoje" value={presentesHoje} />
      <Card label="Total cadastrados" value={alunos.length} />
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
        <div className="p-4 text-sm text-center" style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}>
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
                      style={{ background: "#3a1810", color: "#e08070", border: "1px solid #6b2018" }}
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
                <div className="text-xs" style={{ color: COLORS.brass }}>{aviso[a.id]}</div>
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
          <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} style={inputStyle} required>
            <option value="">— selecione —</option>
            {alunos
              .filter((a) => a.status === "aprovado")
              .map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
          </select>
        </Field>
        <Field label="Valor (R$)">
          <input type="number" step="0.01" style={inputStyle} value={valor} onChange={(e) => setValor(e.target.value)} required />
        </Field>
        <Field label="Vencimento">
          <input type="date" style={inputStyle} value={vencimento} onChange={(e) => setVencimento(e.target.value)} required />
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="brass">
            <Plus size={14} /> Adicionar
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {mensalidades.length === 0 && (
          <div className="p-4 text-sm text-center" style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}>
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
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const aprovados = alunos.filter((a) => a.status === "aprovado");
  const doDia = useMemo(() => {
    const m = new Map<string, boolean>();
    presencas.filter((p) => p.data === data).forEach((p) => m.set(p.aluno_id, p.presente));
    return m;
  }, [presencas, data]);

  async function setPresenca(alunoId: string, presente: boolean) {
    await supabase
      .from("presencas")
      .upsert({ aluno_id: alunoId, data, presente }, { onConflict: "aluno_id,data" });
    onReload();
  }

  const stats = useMemo(() => {
    const map = new Map<string, { total: number; presentes: number }>();
    presencas.forEach((p) => {
      const cur = map.get(p.aluno_id) ?? { total: 0, presentes: 0 };
      cur.total++;
      if (p.presente) cur.presentes++;
      map.set(p.aluno_id, cur);
    });
    return map;
  }, [presencas]);

  return (
    <div className="space-y-4">
      <div
        className="p-3 flex flex-wrap items-center gap-3"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
      >
        <Field label="Data da aula">
          <input type="date" style={{ ...inputStyle, width: 180 }} value={data} onChange={(e) => setData(e.target.value)} />
        </Field>
      </div>

      <div className="space-y-2">
        {aprovados.length === 0 && (
          <div className="p-4 text-sm text-center" style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}>
            Nenhum aluno aprovado.
          </div>
        )}
        {aprovados.map((a) => {
          const marcada = doDia.get(a.id);
          const s = stats.get(a.id);
          const freq = s && s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0;
          return (
            <div
              key={a.id}
              className="p-3 flex flex-wrap items-center gap-3"
              style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
            >
              <div className="flex-1 min-w-[180px]">
                <div className="text-sm uppercase font-semibold" style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}>
                  {a.nome}
                </div>
                <div className="text-xs" style={{ color: COLORS.paperDim }}>
                  Frequência: {freq}% ({s?.presentes ?? 0}/{s?.total ?? 0})
                </div>
              </div>
              <Button
                variant={marcada === true ? "brass" : "ghost"}
                onClick={() => setPresenca(a.id, true)}
              >
                <CheckCircle2 size={14} /> Presente
              </Button>
              <Button
                variant={marcada === false ? "danger" : "ghost"}
                onClick={() => setPresenca(a.id, false)}
              >
                <XCircle size={14} /> Ausente
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Exames ---------- */

function ExamesTab({ alunos, exames, onReload }: { alunos: Profile[]; exames: Exame[]; onReload: () => void }) {
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
          <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} style={inputStyle} required>
            <option value="">— selecione —</option>
            {alunos
              .filter((a) => a.status === "aprovado")
              .map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
          </select>
        </Field>
        <Field label="Faixa alvo">
          <select value={faixaProxima} onChange={(e) => setFaixaProxima(e.target.value)} style={inputStyle}>
            {BELTS.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Data">
          <input type="date" style={inputStyle} value={dataExame} onChange={(e) => setDataExame(e.target.value)} required />
        </Field>
        <div className="flex items-end">
          <Button type="submit" variant="brass">
            <Save size={14} /> Agendar
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {exames.length === 0 && (
          <div className="p-4 text-sm text-center" style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}>
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
                <div className="text-sm uppercase font-semibold" style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}>
                  {aluno?.nome ?? "Aluno removido"}
                </div>
                <div className="text-xs" style={{ color: COLORS.paperDim }}>
                  {e.data_exame} · Alvo: {proxima?.name ?? e.faixa_proxima}
                </div>
              </div>
              <span
                className="text-[10px] uppercase tracking-widest px-2 py-0.5"
                style={{
                  background: e.status === "aprovado" ? "#1a2c14" : e.status === "reprovado" ? "#3a1810" : "#3a2f10",
                  color: e.status === "aprovado" ? "#8ab766" : e.status === "reprovado" ? "#e08070" : "#d1a72c",
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

type Objetivo = { id: string; aluno_id: string; texto: string; concluido: boolean; posicao: number };
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
      supabase.from("certificados").select("*").eq("aluno_id", alunoId).order("data_emissao", { ascending: false }),
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
              <option key={a.id} value={a.id}>{a.nome}</option>
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
              <div className="p-3 text-sm text-center" style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}>
                Nenhum objetivo definido.
              </div>
            )}
            {objetivos.map((o) => (
              <div
                key={o.id}
                className="p-3 flex flex-wrap items-center gap-3"
                style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
              >
                <span className="flex-1 text-sm" style={{ color: o.concluido ? COLORS.paperDim : COLORS.paper }}>
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
              <select value={certFaixa} onChange={(e) => setCertFaixa(e.target.value)} style={inputStyle}>
                {BELTS.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Data">
              <input type="date" style={inputStyle} value={certData} onChange={(e) => setCertData(e.target.value)} />
            </Field>
            <Field label="Mestre">
              <input type="text" style={inputStyle} value={certMestre} onChange={(e) => setCertMestre(e.target.value)} />
            </Field>
            <Field label="Link do arquivo (opcional)">
              <input type="url" style={inputStyle} value={certUrl} onChange={(e) => setCertUrl(e.target.value)} />
            </Field>
            <div className="flex items-end">
              <Button type="submit" variant="brass">
                <Plus size={14} /> Emitir
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {certificados.length === 0 && (
              <div className="p-3 text-sm text-center" style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}>
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
        </>
      )}
    </div>
  );
}