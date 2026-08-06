import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, Plus, Save, Megaphone, LifeBuoy, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  PLANOS,
  useAfc,
  type Academia,
  type AcademiaStatus,
  type PlanoTipo,
} from "@/lib/afc";
import { HUB } from "@/lib/hub-theme";
import {
  HCOLORS as COLORS,
  HubActionButton as Button,
  HubEyebrow as Eyebrow,
  HubField as Field,
  HubHeading as StencilHeading,
  HubPanel as Panel,
  hubInputStyle as inputStyle,
} from "@/components/hub-admin-ui";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Martial Hub — Administração da plataforma" },
      {
        name: "description",
        content:
          "Painel do Super Administrador do Martial Hub: academias, planos, estatísticas globais e comunicados.",
      },
      { property: "og:title", content: "Martial Hub — Administração da plataforma" },
      {
        property: "og:description",
        content: "Gestão de academias, planos e comunicados da plataforma Martial Hub.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HubPage,
});

type Ticket = {
  id: string;
  academia_id: string | null;
  autor_nome: string;
  tipo: string;
  assunto: string;
  mensagem: string;
  status: string;
  resposta: string;
  created_at: string;
};

type Comunicado = {
  id: string;
  titulo: string;
  mensagem: string;
  ativo: boolean;
  created_at: string;
};

type Contagem = { academia_id: string | null };

type Aba = "academias" | "estatisticas" | "comunicados" | "suporte";

const STATUS: AcademiaStatus[] = ["pendente", "teste", "ativa", "suspensa", "rejeitada"];

function HubPage() {
  const { hydrated, isSuper } = useAfc();
  const navigate = useNavigate();
  const [aba, setAba] = useState<Aba>("academias");
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [alunos, setAlunos] = useState<Contagem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);

  const load = useCallback(async () => {
    const [a, p, t, c] = await Promise.all([
      supabase.from("academias").select("*").order("created_at"),
      supabase.from("profiles").select("academia_id"),
      supabase.from("suporte_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("comunicados_plataforma").select("*").order("created_at", { ascending: false }),
    ]);
    if (a.data) setAcademias(a.data as Academia[]);
    if (p.data) setAlunos(p.data as Contagem[]);
    if (t.data) setTickets(t.data as Ticket[]);
    if (c.data) setComunicados(c.data as Comunicado[]);
  }, []);

  useEffect(() => {
    if (isSuper) void load();
  }, [isSuper, load]);

  const porAcademia = useMemo(() => {
    const m = new Map<string, number>();
    alunos.forEach((a) => {
      if (!a.academia_id) return;
      m.set(a.academia_id, (m.get(a.academia_id) ?? 0) + 1);
    });
    return m;
  }, [alunos]);

  if (!hydrated) return null;
  if (!isSuper) return <Navigate to="/" />;

  return (
    <div className="min-h-screen" style={{ background: HUB.graphite, color: HUB.text }}>
      <section className="relative border-b" style={{ borderColor: HUB.line }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(900px 320px at 15% -10%, ${HUB.navy}55, transparent 70%), radial-gradient(700px 300px at 90% 0%, ${HUB.blue}22, transparent 70%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-10">
          <div className="mb-4">
            <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
              <ArrowLeft size={14} /> Voltar ao Martial Hub
            </Button>
          </div>
          <Eyebrow>Plataforma</Eyebrow>
          <StencilHeading as="h1" className="text-3xl sm:text-4xl">
            Painel do Super Administrador
          </StencilHeading>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: HUB.textDim }}>
            Gestão de academias, planos, estatísticas e comunicados. Dados internos de cada academia
            permanecem privados.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div
          className="flex flex-wrap gap-1 p-1.5 mb-6 rounded-2xl"
          style={{ background: HUB.surface, border: `1px solid ${HUB.line}` }}
        >
          {(
            [
              { k: "academias", label: "Academias", icon: <Building2 size={14} /> },
              { k: "estatisticas", label: "Estatísticas", icon: <BarChart3 size={14} /> },
              { k: "comunicados", label: "Comunicados", icon: <Megaphone size={14} /> },
              { k: "suporte", label: "Suporte", icon: <LifeBuoy size={14} /> },
            ] as { k: Aba; label: string; icon: React.ReactNode }[]
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setAba(t.k)}
              className="flex-1 min-w-[130px] rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: aba === t.k ? `linear-gradient(135deg, ${HUB.navy}, ${HUB.blue})` : "transparent",
                color: aba === t.k ? HUB.white : HUB.textDim,
                border: aba === t.k ? `1px solid ${HUB.blue}66` : "1px solid transparent",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {aba === "academias" && (
          <AcademiasTab academias={academias} contagem={porAcademia} onReload={load} />
        )}
        {aba === "estatisticas" && (
          <EstatisticasGlobais academias={academias} contagem={porAcademia} tickets={tickets} />
        )}
        {aba === "comunicados" && <ComunicadosTab comunicados={comunicados} onReload={load} />}
        {aba === "suporte" && (
          <SuporteTab tickets={tickets} academias={academias} onReload={load} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Academias ---------------- */

function AcademiasTab({
  academias,
  contagem,
  onReload,
}: {
  academias: Academia[];
  contagem: Map<string, number>;
  onReload: () => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [modalidade, setModalidade] = useState("Artes Marciais");
  const [plano, setPlano] = useState<PlanoTipo>("basico");
  const [msg, setMsg] = useState("");

  const criar = async () => {
    if (!nome.trim()) {
      setMsg("Informe o nome da academia.");
      return;
    }
    const slug = nome
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const { error } = await supabase.from("academias").insert({
      nome: nome.trim(),
      slug,
      modalidade,
      plano,
      status: "teste",
      max_alunos: plano === "basico" ? 50 : plano === "intermediario" ? 150 : 9999,
    });
    setMsg(error ? error.message : "Academia criada.");
    if (!error) {
      setNome("");
      await onReload();
    }
  };

  return (
    <div className="space-y-4">
      <Panel>
        <Eyebrow>Nova academia</Eyebrow>
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <Field label="Nome">
            <input value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Modalidade">
            <input
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Plano">
            <select
              value={plano}
              onChange={(e) => setPlano(e.target.value as PlanoTipo)}
              style={inputStyle}
            >
              {PLANOS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label} — R$ {p.preco.toFixed(2).replace(".", ",")}
                </option>
              ))}
            </select>
          </Field>
          <Button variant="brass" onClick={() => void criar()}>
            <Plus size={14} /> Cadastrar
          </Button>
        </div>
        {msg && (
          <div className="text-xs mt-2" style={{ color: COLORS.paperDim }}>
            {msg}
          </div>
        )}
      </Panel>

      {academias.map((a) => (
        <LinhaAcademia
          key={a.id}
          academia={a}
          alunos={contagem.get(a.id) ?? 0}
          onReload={onReload}
        />
      ))}
    </div>
  );
}

function LinhaAcademia({
  academia,
  alunos,
  onReload,
}: {
  academia: Academia;
  alunos: number;
  onReload: () => Promise<void>;
}) {
  const [plano, setPlano] = useState<PlanoTipo>(academia.plano);
  const [status, setStatus] = useState<AcademiaStatus>(academia.status);
  const [max, setMax] = useState(academia.max_alunos);
  const [busy, setBusy] = useState(false);

  const salvar = async () => {
    setBusy(true);
    await supabase
      .from("academias")
      .update({ plano, status, max_alunos: max })
      .eq("id", academia.id);
    setBusy(false);
    await onReload();
  };

  return (
    <Panel>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <StencilHeading as="h3" className="text-lg">
            {academia.nome}
          </StencilHeading>
          <div className="text-xs uppercase tracking-widest" style={{ color: COLORS.paperDim }}>
            {academia.modalidade} · /{academia.slug} · {alunos} pessoas
          </div>
        </div>
        <Field label="Plano">
          <select
            value={plano}
            onChange={(e) => setPlano(e.target.value as PlanoTipo)}
            style={inputStyle}
          >
            {PLANOS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Situação">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AcademiaStatus)}
            style={inputStyle}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Limite de alunos">
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value) || 0)}
            style={inputStyle}
          />
        </Field>
        <Button onClick={() => void salvar()} disabled={busy}>
          <Save size={14} /> Salvar
        </Button>
      </div>
    </Panel>
  );
}

/* ---------------- Estatísticas globais ---------------- */

function EstatisticasGlobais({
  academias,
  contagem,
  tickets,
}: {
  academias: Academia[];
  contagem: Map<string, number>;
  tickets: Ticket[];
}) {
  const ativas = academias.filter((a) => a.status === "ativa").length;
  const totalPessoas = Array.from(contagem.values()).reduce((s, n) => s + n, 0);
  const receita = academias
    .filter((a) => a.status === "ativa")
    .reduce((s, a) => s + (PLANOS.find((p) => p.key === a.plano)?.preco ?? 0), 0);

  const cards = [
    { label: "Academias", value: String(academias.length) },
    { label: "Ativas", value: String(ativas) },
    { label: "Pessoas cadastradas", value: String(totalPessoas) },
    { label: "Receita mensal", value: `R$ ${receita.toFixed(2).replace(".", ",")}` },
    { label: "Chamados abertos", value: String(tickets.filter((t) => t.status === "aberto").length) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {cards.map((c) => (
          <Panel key={c.label}>
            <div className="text-xs uppercase tracking-widest" style={{ color: COLORS.brass }}>
              {c.label}
            </div>
            <div
              className="text-2xl"
              style={{ color: HUB.white }}
            >
              {c.value}
            </div>
          </Panel>
        ))}
      </div>
      <Panel>
        <Eyebrow>Distribuição por plano</Eyebrow>
        {PLANOS.map((p) => {
          const qtd = academias.filter((a) => a.plano === p.key).length;
          return (
            <div key={p.key} className="flex justify-between text-sm py-1" style={{ color: COLORS.paperDim }}>
              <span>
                {p.label} — R$ {p.preco.toFixed(2).replace(".", ",")}
              </span>
              <span style={{ color: COLORS.paper }}>{qtd} academia(s)</span>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

/* ---------------- Comunicados ---------------- */

function ComunicadosTab({
  comunicados,
  onReload,
}: {
  comunicados: Comunicado[];
  onReload: () => Promise<void>;
}) {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");

  const criar = async () => {
    if (!titulo.trim()) return;
    await supabase.from("comunicados_plataforma").insert({
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
    });
    setTitulo("");
    setMensagem("");
    await onReload();
  };

  const alternar = async (c: Comunicado) => {
    await supabase.from("comunicados_plataforma").update({ ativo: !c.ativo }).eq("id", c.id);
    await onReload();
  };

  return (
    <div className="space-y-4">
      <Panel>
        <Eyebrow>Novo comunicado global</Eyebrow>
        <div className="grid gap-3">
          <Field label="Título">
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Mensagem">
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={3}
              style={inputStyle}
            />
          </Field>
          <div>
            <Button variant="brass" onClick={() => void criar()}>
              <Megaphone size={14} /> Publicar
            </Button>
          </div>
        </div>
      </Panel>
      {comunicados.map((c) => (
        <Panel key={c.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <StencilHeading as="h4" className="text-base">
                {c.titulo}
              </StencilHeading>
              <div className="text-sm" style={{ color: COLORS.paperDim }}>
                {c.mensagem}
              </div>
            </div>
            <Button variant={c.ativo ? "danger" : "ghost"} onClick={() => void alternar(c)}>
              {c.ativo ? "Desativar" : "Ativar"}
            </Button>
          </div>
        </Panel>
      ))}
    </div>
  );
}

/* ---------------- Suporte ---------------- */

function SuporteTab({
  tickets,
  academias,
  onReload,
}: {
  tickets: Ticket[];
  academias: Academia[];
  onReload: () => Promise<void>;
}) {
  const nomeAcademia = (id: string | null) =>
    academias.find((a) => a.id === id)?.nome ?? "—";

  return (
    <div className="space-y-3">
      {tickets.length === 0 && <Panel>Nenhum chamado registrado.</Panel>}
      {tickets.map((t) => (
        <TicketRow key={t.id} ticket={t} academia={nomeAcademia(t.academia_id)} onReload={onReload} />
      ))}
    </div>
  );
}

function TicketRow({
  ticket,
  academia,
  onReload,
}: {
  ticket: Ticket;
  academia: string;
  onReload: () => Promise<void>;
}) {
  const [resposta, setResposta] = useState(ticket.resposta);

  const responder = async (status: string) => {
    await supabase.from("suporte_tickets").update({ resposta, status }).eq("id", ticket.id);
    await onReload();
  };

  return (
    <Panel>
      <div className="text-xs uppercase tracking-widest mb-1" style={{ color: COLORS.brass }}>
        {ticket.tipo} · {academia} · {ticket.autor_nome} · {ticket.status}
      </div>
      <StencilHeading as="h4" className="text-base">
        {ticket.assunto}
      </StencilHeading>
      <p className="text-sm mb-2" style={{ color: COLORS.paperDim }}>
        {ticket.mensagem}
      </p>
      <Field label="Resposta">
        <textarea
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
          rows={2}
          style={inputStyle}
        />
      </Field>
      <div className="flex gap-2 mt-2">
        <Button onClick={() => void responder("respondido")}>
          <Save size={14} /> Responder
        </Button>
        <Button variant="ghost" onClick={() => void responder("fechado")}>
          Fechar chamado
        </Button>
      </div>
    </Panel>
  );
}