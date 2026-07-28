import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  User as UserIcon,
  BookOpen,
  Award,
  CalendarCheck,
  DollarSign,
  ClipboardList,
  Target,
  FileText,
  Medal,
  Bell,
  CheckCircle2,
  XCircle,
  Download,
  Lock,
  TrendingUp,
  History,
  Megaphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BELTS,
  CATEGORIES,
  COLORS,
  camoStyle,
  findBelt,
  useAfc,
  type CategoryKey,
} from "@/lib/afc";
import { Header } from "@/components/afc-header";
import { Sidebar } from "@/components/afc-sidebar";
import { AdminSettingsModal } from "@/components/afc-modals";
import { Button, BeltSwatch, Eyebrow, StencilHeading } from "@/components/afc-ui";
import {
  DestaqueCard,
  EvolucaoAluno,
  LinhaDoTempo,
  MuralAvisos,
  useAvisos,
  useDestaque,
  type EventoTimeline,
} from "@/components/afc-extras";

export const Route = createFileRoute("/aluno")({
  head: () => ({
    meta: [
      { title: "Painel do Aluno — Army Fight Club Hapkido" },
      {
        name: "description",
        content:
          "Acompanhe sua graduação, técnicas liberadas, frequência, mensalidade, exames e conquistas no Army Fight Club Hapkido.",
      },
      { property: "og:title", content: "Painel do Aluno — Army Fight Club Hapkido" },
      {
        property: "og:description",
        content: "Sua evolução no Hapkido: faixas, presenças, exames e certificados.",
      },
    ],
  }),
  component: AlunoPage,
});

type Mensalidade = {
  id: string;
  valor: number;
  vencimento: string;
  pago_em: string | null;
  status: "pendente" | "pago" | "atrasado";
  observacao: string | null;
};
type Presenca = { id: string; data: string; presente: boolean };
type Exame = {
  id: string;
  faixa_atual: string;
  faixa_proxima: string;
  data_exame: string;
  status: "agendado" | "aprovado" | "reprovado" | "cancelado";
  nota: number | null;
  comentario: string | null;
  observacao: string | null;
};
type Graduacao = { id: string; faixa_id: string; data: string; observacao: string | null };
type Objetivo = { id: string; texto: string; concluido: boolean; posicao: number };
type Certificado = {
  id: string;
  faixa_id: string;
  data_emissao: string;
  mestre_nome: string;
  arquivo_url: string;
};
type Notificacao = {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
};

type Tab =
  | "perfil"
  | "evolucao"
  | "jornada"
  | "tecnicas"
  | "graduacao"
  | "frequencia"
  | "mensalidade"
  | "exames"
  | "objetivos"
  | "certificados"
  | "conquistas"
  | "mural"
  | "notificacoes";

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.slice(0, 10).split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
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
  parts.push(`${meses} mês${meses === 1 ? "" : "es"}`);
  return parts.join(" e ");
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`p-4 ${className}`}
      style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
    >
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-4 text-sm text-center"
      style={{ color: COLORS.paperDim, border: `1px dashed ${COLORS.line}` }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Panel>
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
    </Panel>
  );
}

function Badge({ tone, children }: { tone: "ok" | "bad" | "warn"; children: React.ReactNode }) {
  const map = {
    ok: { bg: "#1a2c14", color: "#8ab766", border: "#4b5320" },
    bad: { bg: "#3a1810", color: "#e08070", border: "#6b2018" },
    warn: { bg: "#3a2f10", color: "#d1a72c", border: "#8a721f" },
  } as const;
  const s = map[tone];
  return (
    <span
      className="text-[10px] uppercase tracking-widest px-2 py-0.5"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {children}
    </span>
  );
}

function AlunoPage() {
  const { hydrated, user, profile, isMestre, data, canAccessBelt } = useAfc();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("perfil");

  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);
  const [graduacoes, setGraduacoes] = useState<Graduacao[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const { avisos } = useAvisos();
  const { destaque } = useDestaque();

  const uid = user?.id ?? null;

  const load = useCallback(async () => {
    if (!uid) return;
    const [m, p, e, g, o, c, n] = await Promise.all([
      supabase
        .from("mensalidades")
        .select("*")
        .eq("aluno_id", uid)
        .order("vencimento", { ascending: false }),
      supabase
        .from("presencas")
        .select("*")
        .eq("aluno_id", uid)
        .order("data", { ascending: false }),
      supabase
        .from("exames")
        .select("*")
        .eq("aluno_id", uid)
        .order("data_exame", { ascending: false }),
      supabase
        .from("graduacoes")
        .select("*")
        .eq("aluno_id", uid)
        .order("data", { ascending: true }),
      supabase
        .from("objetivos")
        .select("*")
        .eq("aluno_id", uid)
        .order("posicao", { ascending: true }),
      supabase
        .from("certificados")
        .select("*")
        .eq("aluno_id", uid)
        .order("data_emissao", { ascending: false }),
      supabase
        .from("notificacoes")
        .select("*")
        .eq("aluno_id", uid)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (m.data) setMensalidades(m.data as unknown as Mensalidade[]);
    if (p.data) setPresencas(p.data as unknown as Presenca[]);
    if (e.data) setExames(e.data as unknown as Exame[]);
    if (g.data) setGraduacoes(g.data as unknown as Graduacao[]);
    if (o.data) setObjetivos(o.data as unknown as Objetivo[]);
    if (c.data) setCertificados(c.data as unknown as Certificado[]);
    if (n.data) setNotificacoes(n.data as unknown as Notificacao[]);
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  // Tempo real: qualquer alteração do Mestre reflete no painel do aluno
  useEffect(() => {
    if (!uid) return;
    const tables = [
      "mensalidades",
      "presencas",
      "exames",
      "graduacoes",
      "objetivos",
      "certificados",
      "notificacoes",
    ] as const;
    const channel = supabase.channel(`aluno-panel-${uid}`);
    tables.forEach((t) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: t, filter: `aluno_id=eq.${uid}` },
        () => void load(),
      );
    });
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, load]);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const totalPresencas = presencas.filter((p) => p.presente).length;
  const totalFaltas = presencas.filter((p) => !p.presente).length;
  const frequencia = presencas.length ? Math.round((totalPresencas / presencas.length) * 100) : 0;

  const mensalidadeAtual = useMemo(() => {
    const pendentes = mensalidades.filter((m) => m.status !== "pago");
    if (pendentes.length) return pendentes[pendentes.length - 1];
    return mensalidades[0] ?? null;
  }, [mensalidades]);
  const emDia = !mensalidadeAtual || mensalidadeAtual.status === "pago";

  if (!hydrated) return null;
  if (!user) return null;
  if (isMestre) return <Navigate to="/admin" />;
  if (!profile) return null;

  const beltAtual = findBelt(profile.faixa_id);
  const proximoExame = exames.find((e) => e.status === "agendado") ?? null;
  const ultimaGrad = graduacoes.length ? graduacoes[graduacoes.length - 1] : null;

  async function marcarLidas() {
    if (!uid) return;
    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("aluno_id", uid)
      .eq("lida", false);
    void load();
  }

  const conquistas = [
    { icon: "🥋", label: "Primeira aula", ok: presencas.length > 0 },
    { icon: "🏆", label: "Primeira faixa", ok: graduacoes.length > 1 || (beltAtual?.n ?? 1) > 1 },
    { icon: "🔥", label: "50 treinos", ok: totalPresencas >= 50 },
    { icon: "💯", label: "100 treinos", ok: totalPresencas >= 100 },
    {
      icon: "⭐",
      label: "Frequência acima de 90%",
      ok: presencas.length >= 10 && frequencia >= 90,
    },
    {
      icon: "🎓",
      label: "Primeiro exame aprovado",
      ok: exames.some((e) => e.status === "aprovado"),
    },
    { icon: "📜", label: "Primeiro certificado", ok: certificados.length > 0 },
    { icon: "💳", label: "Mensalidade em dia", ok: emDia && mensalidades.length > 0 },
    { icon: "🟦", label: "Faixa azul conquistada", ok: (beltAtual?.n ?? 1) >= 6 },
    { icon: "👑", label: "Faixa preta", ok: (beltAtual?.n ?? 1) >= 10 },
  ];

  /* ---- Evolução ---- */
  const nAtual = beltAtual?.n ?? 1;
  const tecnicasConcluidas = BELTS.filter((b) => b.n < nAtual).reduce(
    (sum, b) =>
      sum + CATEGORIES.reduce((s, c) => s + (data[b.id]?.[c.key as CategoryKey]?.length ?? 0), 0),
    0,
  );
  const tecnicasPendentes = CATEGORIES.reduce(
    (s, c) => s + (data[profile.faixa_id]?.[c.key as CategoryKey]?.length ?? 0),
    0,
  );
  const desdeGrad = ultimaGrad?.data ?? profile.data_matricula;
  const presencasDesdeGraduacao = presencas.filter(
    (p) => p.presente && p.data >= (desdeGrad ?? "0000-01-01"),
  ).length;
  const evolucaoInput = {
    faixaId: profile.faixa_id,
    presencasDesdeGraduacao,
    frequencia,
    objetivosTotal: objetivos.length,
    objetivosConcluidos: objetivos.filter((o) => o.concluido).length,
    tecnicasConcluidas,
    tecnicasPendentes,
  };

  /* ---- Linha do tempo ---- */
  const proximaFaixa = BELTS.find((b) => b.n === nAtual + 1) ?? null;
  const eventos: EventoTimeline[] = [
    {
      data: profile.data_matricula,
      tipo: "matricula" as const,
      titulo: "Primeira aula",
      detalhe: "Início da jornada no Army Fight Club Hapkido",
    },
    ...graduacoes.map((g) => ({
      data: g.data,
      tipo: "graduacao" as const,
      titulo: findBelt(g.faixa_id)?.name ?? g.faixa_id,
      detalhe: g.observacao ?? "Graduação conquistada",
      beltId: g.faixa_id,
    })),
    ...exames.map((e) => ({
      data: e.data_exame,
      tipo: "exame" as const,
      titulo: `Exame — ${findBelt(e.faixa_proxima)?.name ?? e.faixa_proxima}`,
      detalhe: `Resultado: ${e.status}${e.nota != null ? ` · Nota ${e.nota}` : ""}`,
      beltId: e.faixa_proxima,
    })),
    ...certificados.map((c) => ({
      data: c.data_emissao,
      tipo: "certificado" as const,
      titulo: `Certificado — ${findBelt(c.faixa_id)?.name ?? c.faixa_id}`,
      detalhe: c.mestre_nome,
      beltId: c.faixa_id,
    })),
    ...conquistas
      .filter((c) => c.ok)
      .map((c) => ({
        data: profile.data_matricula,
        tipo: "conquista" as const,
        titulo: `${c.icon} ${c.label}`,
        detalhe: "Conquista desbloqueada",
      })),
    ...(proximaFaixa
      ? [
          {
            data: `${new Date().getFullYear()}-12-31`,
            tipo: "futuro" as const,
            titulo: proximaFaixa.name,
            detalhe: "Próximo objetivo",
            beltId: proximaFaixa.id,
          },
        ]
      : []),
  ];

  const tabs: { k: Tab; label: string; icon: React.ReactNode }[] = [
    { k: "perfil", label: "Perfil", icon: <UserIcon size={14} /> },
    { k: "evolucao", label: "Evolução", icon: <TrendingUp size={14} /> },
    { k: "jornada", label: "Minha jornada", icon: <History size={14} /> },
    { k: "tecnicas", label: "Minhas técnicas", icon: <BookOpen size={14} /> },
    { k: "graduacao", label: "Graduação", icon: <Award size={14} /> },
    { k: "frequencia", label: "Frequência", icon: <CalendarCheck size={14} /> },
    { k: "mensalidade", label: "Mensalidade", icon: <DollarSign size={14} /> },
    { k: "exames", label: "Exames", icon: <ClipboardList size={14} /> },
    { k: "objetivos", label: "Objetivos", icon: <Target size={14} /> },
    { k: "certificados", label: "Certificados", icon: <FileText size={14} /> },
    { k: "conquistas", label: "Conquistas", icon: <Medal size={14} /> },
    { k: "mural", label: "Mural", icon: <Megaphone size={14} /> },
    {
      k: "notificacoes",
      label: `Avisos${naoLidas ? ` (${naoLidas})` : ""}`,
      icon: <Bell size={14} />,
    },
  ];

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
              <Eyebrow>Tropa</Eyebrow>
              <StencilHeading as="h1" className="text-3xl">
                Painel do Aluno
              </StencilHeading>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 py-4">
            {/* Cabeçalho do perfil */}
            <Panel className="mb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className="w-16 h-16 rounded-sm overflow-hidden flex items-center justify-center shrink-0"
                  style={{ background: COLORS.oliveDim, border: `1px solid ${COLORS.line}` }}
                >
                  {profile.foto_url ? (
                    <img
                      src={profile.foto_url}
                      alt={`Foto de ${profile.nome}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={26} color={COLORS.brass} />
                  )}
                </div>
                <div className="min-w-[200px] flex-1">
                  <div
                    className="text-xl uppercase font-bold"
                    style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                  >
                    {profile.nome}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {beltAtual && <BeltSwatch belt={beltAtual} size="md" />}
                    <span className="text-xs" style={{ color: COLORS.paperDim }}>
                      {beltAtual?.name ?? profile.faixa_id}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: COLORS.paperDim }}>
                    Ingresso: {fmtDate(profile.data_matricula)} · Treinando há{" "}
                    {tempoTreino(profile.data_matricula)}
                  </div>
                </div>
                <div>
                  {emDia ? (
                    <Badge tone="ok">🟢 Mensalidade em dia</Badge>
                  ) : (
                    <Badge tone="bad">🔴 Mensalidade pendente</Badge>
                  )}
                </div>
              </div>
            </Panel>

            <div
              className="flex flex-wrap gap-1 p-1 rounded-sm mb-6"
              style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
            >
              {tabs.map((t) => {
                const active = tab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className="flex-1 min-w-[128px] px-3 py-2 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
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

            {tab === "perfil" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Presenças" value={totalPresencas} />
                <Stat label="Faltas" value={totalFaltas} />
                <Stat label="Frequência" value={`${frequencia}%`} />
                <Stat label="Certificados" value={certificados.length} />
                <Stat
                  label="Faixa atual"
                  value={String(beltAtual?.n ?? 1).padStart(2, "0")}
                  hint={beltAtual?.name}
                />
                <Stat
                  label="Próximo exame"
                  value={proximoExame ? fmtDate(proximoExame.data_exame) : "—"}
                  hint={
                    proximoExame
                      ? (findBelt(proximoExame.faixa_proxima)?.name ?? "")
                      : "Nenhum agendado"
                  }
                />
                <Stat label="Avisos novos" value={naoLidas} />
                <Stat
                  label="Objetivos"
                  value={objetivos.filter((o) => !o.concluido).length}
                  hint="Em aberto"
                />
              </div>
            )}

            {tab === "evolucao" && (
              <div className="animate-fade-in space-y-4">
                <EvolucaoAluno input={evolucaoInput} objetivos={objetivos} />
              </div>
            )}
            {tab === "jornada" && (
              <div className="animate-fade-in">
                <LinhaDoTempo eventos={eventos} />
              </div>
            )}
            {tab === "mural" && (
              <div className="animate-fade-in space-y-4">
                {destaque && <DestaqueCard destaque={destaque} />}
                <MuralAvisos avisos={avisos} />
              </div>
            )}
            {tab === "tecnicas" && (
              <div className="space-y-6">
                {BELTS.filter((b) => canAccessBelt(b.id)).map((b) => (
                  <div key={b.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <BeltSwatch belt={b} size="md" />
                      <StencilHeading as="h2" className="text-lg">
                        {b.name}
                      </StencilHeading>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {CATEGORIES.map((c) => {
                        const list = data[b.id]?.[c.key as CategoryKey] ?? [];
                        return (
                          <Panel key={c.key}>
                            <div
                              className="text-xs uppercase tracking-widest mb-2"
                              style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
                            >
                              {c.icon} {c.label}
                            </div>
                            {list.length === 0 ? (
                              <div className="text-xs" style={{ color: COLORS.paperDim }}>
                                Nenhuma técnica cadastrada.
                              </div>
                            ) : (
                              <ul className="space-y-1">
                                {list.map((t) => (
                                  <li
                                    key={t.id}
                                    className="text-sm"
                                    style={{ color: COLORS.paper }}
                                  >
                                    • {t.title}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </Panel>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <Panel>
                  <div
                    className="flex items-center gap-2 text-sm"
                    style={{ color: COLORS.paperDim }}
                  >
                    <Lock size={14} color={COLORS.brass} />
                    Faixas superiores permanecem bloqueadas até liberação do Mestre.
                  </div>
                </Panel>
              </div>
            )}

            {tab === "graduacao" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Stat label="Faixa atual" value={beltAtual?.name ?? profile.faixa_id} />
                  <Stat label="Última graduação" value={fmtDate(ultimaGrad?.data)} />
                  <Stat
                    label="Próxima graduação"
                    value={
                      proximoExame
                        ? (findBelt(proximoExame.faixa_proxima)?.name ?? proximoExame.faixa_proxima)
                        : "A definir"
                    }
                    hint={proximoExame ? `Exame em ${fmtDate(proximoExame.data_exame)}` : undefined}
                  />
                </div>
                <StencilHeading as="h2" className="text-lg mt-2">
                  Histórico de faixas
                </StencilHeading>
                {graduacoes.length === 0 ? (
                  <Empty>Nenhuma graduação registrada ainda.</Empty>
                ) : (
                  <div className="space-y-2">
                    {graduacoes
                      .slice()
                      .reverse()
                      .map((g) => {
                        const b = findBelt(g.faixa_id);
                        return (
                          <Panel key={g.id}>
                            <div className="flex flex-wrap items-center gap-3">
                              {b && <BeltSwatch belt={b} size="md" />}
                              <div
                                className="text-sm uppercase font-semibold flex-1 min-w-[160px]"
                                style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                              >
                                {b?.name ?? g.faixa_id}
                              </div>
                              <div className="text-xs" style={{ color: COLORS.paperDim }}>
                                {fmtDate(g.data)}
                                {g.observacao ? ` · ${g.observacao}` : ""}
                              </div>
                            </div>
                          </Panel>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {tab === "frequencia" && (
              <FrequenciaTab
                presencas={presencas}
                totalPresencas={totalPresencas}
                totalFaltas={totalFaltas}
                frequencia={frequencia}
              />
            )}

            {tab === "mensalidade" && (
              <div className="space-y-3">
                <Panel>
                  <div className="flex flex-wrap items-center gap-3">
                    {emDia ? (
                      <Badge tone="ok">🟢 Mensalidade em dia</Badge>
                    ) : (
                      <Badge tone="bad">🔴 Mensalidade pendente</Badge>
                    )}
                    {mensalidadeAtual && (
                      <div className="text-xs" style={{ color: COLORS.paperDim }}>
                        Valor: R$ {Number(mensalidadeAtual.valor).toFixed(2)} · Vencimento:{" "}
                        {fmtDate(mensalidadeAtual.vencimento)}
                      </div>
                    )}
                  </div>
                </Panel>
                <StencilHeading as="h2" className="text-lg">
                  Histórico de pagamentos
                </StencilHeading>
                {mensalidades.length === 0 ? (
                  <Empty>Nenhuma mensalidade registrada.</Empty>
                ) : (
                  <div className="space-y-2">
                    {mensalidades.map((m) => (
                      <Panel key={m.id}>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex-1 min-w-[180px]">
                            <div
                              className="text-sm uppercase font-semibold"
                              style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                            >
                              R$ {Number(m.valor).toFixed(2)}
                            </div>
                            <div className="text-xs" style={{ color: COLORS.paperDim }}>
                              Venc: {fmtDate(m.vencimento)}
                              {m.pago_em && ` · Pago em ${fmtDate(m.pago_em)}`}
                            </div>
                          </div>
                          <Badge
                            tone={
                              m.status === "pago" ? "ok" : m.status === "atrasado" ? "bad" : "warn"
                            }
                          >
                            {m.status}
                          </Badge>
                        </div>
                      </Panel>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "exames" && (
              <div className="space-y-2">
                {exames.length === 0 ? (
                  <Empty>Nenhum exame registrado.</Empty>
                ) : (
                  exames.map((e) => {
                    const alvo = findBelt(e.faixa_proxima);
                    const comentario = e.comentario ?? e.observacao ?? "";
                    return (
                      <Panel key={e.id}>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex-1 min-w-[200px]">
                            <div
                              className="text-sm uppercase font-semibold"
                              style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                            >
                              {alvo?.name ?? e.faixa_proxima}
                            </div>
                            <div className="text-xs" style={{ color: COLORS.paperDim }}>
                              {fmtDate(e.data_exame)}
                              {e.nota !== null && e.nota !== undefined && ` · Nota: ${e.nota}`}
                            </div>
                          </div>
                          {e.status === "aprovado" ? (
                            <Badge tone="ok">🟢 Aprovado</Badge>
                          ) : e.status === "reprovado" ? (
                            <Badge tone="bad">🔴 Reprovado</Badge>
                          ) : (
                            <Badge tone="warn">{e.status}</Badge>
                          )}
                        </div>
                        {comentario && (
                          <div
                            className="mt-3 p-3 text-sm italic"
                            style={{
                              background: COLORS.panel2,
                              borderLeft: `3px solid ${COLORS.brass}`,
                              color: COLORS.paper,
                            }}
                          >
                            <div
                              className="text-[10px] uppercase tracking-widest mb-1 not-italic"
                              style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
                            >
                              Comentário do Mestre
                            </div>
                            «{comentario}»
                          </div>
                        )}
                      </Panel>
                    );
                  })
                )}
              </div>
            )}

            {tab === "objetivos" && (
              <div className="space-y-2">
                {objetivos.length === 0 ? (
                  <Empty>O Mestre ainda não definiu objetivos para sua próxima graduação.</Empty>
                ) : (
                  objetivos.map((o) => (
                    <Panel key={o.id}>
                      <div className="flex items-center gap-3">
                        {o.concluido ? (
                          <CheckCircle2 size={16} color="#8ab766" />
                        ) : (
                          <XCircle size={16} color={COLORS.paperDim} />
                        )}
                        <span
                          className="text-sm"
                          style={{
                            color: o.concluido ? COLORS.paperDim : COLORS.paper,
                            textDecoration: o.concluido ? "line-through" : "none",
                          }}
                        >
                          {o.texto}
                        </span>
                      </div>
                    </Panel>
                  ))
                )}
              </div>
            )}

            {tab === "certificados" && (
              <div className="space-y-2">
                {certificados.length === 0 ? (
                  <Empty>Nenhum certificado emitido ainda.</Empty>
                ) : (
                  certificados.map((c) => {
                    const b = findBelt(c.faixa_id);
                    return (
                      <Panel key={c.id}>
                        <div className="flex flex-wrap items-center gap-3">
                          {b && <BeltSwatch belt={b} size="md" />}
                          <div className="flex-1 min-w-[180px]">
                            <div
                              className="text-sm uppercase font-semibold"
                              style={{ color: COLORS.paper, fontFamily: "'Oswald', sans-serif" }}
                            >
                              {b?.name ?? c.faixa_id}
                            </div>
                            <div className="text-xs" style={{ color: COLORS.paperDim }}>
                              {fmtDate(c.data_emissao)} · {c.mestre_nome}
                            </div>
                          </div>
                          {c.arquivo_url ? (
                            <a href={c.arquivo_url} target="_blank" rel="noreferrer">
                              <Button variant="brass">
                                <Download size={14} /> Ver / baixar
                              </Button>
                            </a>
                          ) : (
                            <span className="text-xs" style={{ color: COLORS.paperDim }}>
                              Arquivo indisponível
                            </span>
                          )}
                        </div>
                      </Panel>
                    );
                  })
                )}
              </div>
            )}

            {tab === "conquistas" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {conquistas.map((c) => (
                  <Panel key={c.label} className={c.ok ? "" : "opacity-50"}>
                    <div className="text-2xl">{c.ok ? c.icon : "🔒"}</div>
                    <div
                      className="text-xs uppercase tracking-wider mt-2"
                      style={{
                        color: c.ok ? COLORS.brass : COLORS.paperDim,
                        fontFamily: "'Oswald', sans-serif",
                      }}
                    >
                      {c.label}
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: COLORS.paperDim }}>
                      {c.ok ? "Conquistada" : "Bloqueada"}
                    </div>
                  </Panel>
                ))}
              </div>
            )}

            {tab === "notificacoes" && (
              <div className="space-y-2">
                {naoLidas > 0 && (
                  <Button variant="ghost" onClick={() => void marcarLidas()}>
                    <CheckCircle2 size={14} /> Marcar tudo como lido
                  </Button>
                )}
                {notificacoes.length === 0 ? (
                  <Empty>Nenhuma notificação.</Empty>
                ) : (
                  notificacoes.map((n) => (
                    <Panel key={n.id}>
                      <div className="flex items-start gap-3">
                        <Bell size={16} color={n.lida ? COLORS.paperDim : COLORS.brass} />
                        <div className="flex-1">
                          <div
                            className="text-sm uppercase font-semibold"
                            style={{
                              color: n.lida ? COLORS.paperDim : COLORS.paper,
                              fontFamily: "'Oswald', sans-serif",
                            }}
                          >
                            {n.titulo}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: COLORS.paperDim }}>
                            {n.mensagem}
                          </div>
                          <div className="text-[10px] mt-1" style={{ color: COLORS.paperDim }}>
                            {new Date(n.created_at).toLocaleString("pt-BR")}
                          </div>
                        </div>
                      </div>
                    </Panel>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      {settingsOpen && <AdminSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

/* ---------- Frequência ---------- */

function FrequenciaTab({
  presencas,
  totalPresencas,
  totalFaltas,
  frequencia,
}: {
  presencas: Presenca[];
  totalPresencas: number;
  totalFaltas: number;
  frequencia: number;
}) {
  const [ref, setRef] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const byDate = useMemo(() => {
    const map = new Map<string, boolean>();
    presencas.forEach((p) => map.set(p.data.slice(0, 10), p.presente));
    return map;
  }, [presencas]);

  const first = new Date(ref.y, ref.m, 1);
  const daysInMonth = new Date(ref.y, ref.m + 1, 0).getDate();
  const startWeekday = first.getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const monthLabel = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  function shift(delta: number) {
    setRef((r) => {
      const d = new Date(r.y, r.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Presenças" value={totalPresencas} />
        <Stat label="Faltas" value={totalFaltas} />
        <Stat label="Frequência" value={`${frequencia}%`} />
      </div>
      <Panel>
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" onClick={() => shift(-1)}>
            ‹
          </Button>
          <div
            className="text-sm uppercase tracking-widest"
            style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
          >
            {monthLabel}
          </div>
          <Button variant="ghost" onClick={() => shift(1)}>
            ›
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <div
              key={i}
              className="text-[10px] uppercase"
              style={{ color: COLORS.paperDim, fontFamily: "'Oswald', sans-serif" }}
            >
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const iso = `${ref.y}-${String(ref.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const rec = byDate.get(iso);
            const bg = rec === true ? "#1a2c14" : rec === false ? "#3a1810" : "transparent";
            const color = rec === true ? "#8ab766" : rec === false ? "#e08070" : COLORS.paperDim;
            const border = rec === true ? "#4b5320" : rec === false ? "#6b2018" : COLORS.line;
            return (
              <div
                key={iso}
                className="text-xs py-2"
                style={{ background: bg, color, border: `1px solid ${border}` }}
                title={rec === true ? "Presente" : rec === false ? "Ausente" : "Sem registro"}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-3 text-[10px]" style={{ color: COLORS.paperDim }}>
          <span>🟩 Presente</span>
          <span>🟥 Ausente</span>
        </div>
      </Panel>
    </div>
  );
}
