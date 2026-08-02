import { useEffect, useState } from "react";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  COLORS,
  PLANOS,
  useAfc,
  type Academia,
  type AcademiaFaixa,
} from "@/lib/afc";
import { Button, Eyebrow, Field, StencilHeading, inputStyle } from "@/components/afc-ui";

export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-4"
      style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
    >
      {children}
    </div>
  );
}

/* ---------------- Identidade da academia ---------------- */

export function AcademiaTab() {
  const { academia, reloadAcademia } = useAfc();
  const [form, setForm] = useState<Academia | null>(academia);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => setForm(academia), [academia]);

  if (!form) return <Panel>Carregando dados da academia...</Panel>;

  const set = <K extends keyof Academia>(k: K, v: Academia[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const salvar = async () => {
    setBusy(true);
    setMsg("");
    const { error } = await supabase
      .from("academias")
      .update({
        nome: form.nome,
        modalidade: form.modalidade,
        logo_url: form.logo_url,
        banner_url: form.banner_url,
        cor_primaria: form.cor_primaria,
        cor_secundaria: form.cor_secundaria,
        endereco: form.endereco,
        telefone: form.telefone,
        email: form.email,
        instagram: form.instagram,
        whatsapp: form.whatsapp,
        horarios: form.horarios,
        assinatura_url: form.assinatura_url,
      })
      .eq("id", form.id);
    setBusy(false);
    setMsg(error ? error.message : "Dados salvos.");
    if (!error) await reloadAcademia();
  };

  const plano = PLANOS.find((p) => p.key === form.plano);

  return (
    <div className="space-y-4">
      <Panel>
        <Eyebrow>Plano contratado</Eyebrow>
        <div className="flex flex-wrap items-baseline gap-3">
          <StencilHeading as="h3" className="text-xl">
            {plano?.label ?? form.plano}
          </StencilHeading>
          <span style={{ color: COLORS.brass }}>
            R$ {(plano?.preco ?? 0).toFixed(2).replace(".", ",")}/mês
          </span>
          <span className="text-xs uppercase tracking-widest" style={{ color: COLORS.paperDim }}>
            Situação: {form.status} · Limite de alunos: {form.max_alunos}
          </span>
        </div>
        <div className="text-sm mt-1" style={{ color: COLORS.paperDim }}>
          {plano?.recursos.join(" · ")}
        </div>
      </Panel>

      <Panel>
        <Eyebrow>Identidade visual</Eyebrow>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nome da academia">
            <input value={form.nome} onChange={(e) => set("nome", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Modalidade">
            <input
              value={form.modalidade}
              onChange={(e) => set("modalidade", e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="URL do logo / brasão">
            <input
              value={form.logo_url}
              onChange={(e) => set("logo_url", e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="URL do banner">
            <input
              value={form.banner_url}
              onChange={(e) => set("banner_url", e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Cor primária">
            <input
              value={form.cor_primaria}
              onChange={(e) => set("cor_primaria", e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Cor secundária">
            <input
              value={form.cor_secundaria}
              onChange={(e) => set("cor_secundaria", e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Assinatura digital (URL da imagem)">
            <input
              value={form.assinatura_url}
              onChange={(e) => set("assinatura_url", e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>
      </Panel>

      <Panel>
        <Eyebrow>Contato e localização</Eyebrow>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Endereço">
            <input
              value={form.endereco}
              onChange={(e) => set("endereco", e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Telefone">
            <input
              value={form.telefone}
              onChange={(e) => set("telefone", e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="E-mail">
            <input value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="WhatsApp">
            <input
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Instagram">
            <input
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Horários de treino">
            <input
              value={form.horarios}
              onChange={(e) => set("horarios", e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Button variant="brass" onClick={() => void salvar()} disabled={busy}>
            <Save size={14} /> {busy ? "Salvando..." : "Salvar"}
          </Button>
          {msg && (
            <span className="text-xs" style={{ color: COLORS.paperDim }}>
              {msg}
            </span>
          )}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- Faixas configuráveis ---------------- */

export function FaixasTab() {
  const { faixas, academiaId, reloadAcademia } = useAfc();
  const [lista, setLista] = useState<AcademiaFaixa[]>(faixas);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => setLista(faixas), [faixas]);

  const set = (id: string, patch: Partial<AcademiaFaixa>) =>
    setLista((l) => l.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const mover = (id: string, dir: -1 | 1) => {
    setLista((l) => {
      const arr = l.slice().sort((a, b) => a.posicao - b.posicao);
      const i = arr.findIndex((f) => f.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return l;
      const pi = arr[i].posicao;
      arr[i] = { ...arr[i], posicao: arr[j].posicao };
      arr[j] = { ...arr[j], posicao: pi };
      return arr;
    });
  };

  const adicionar = async () => {
    if (!academiaId) return;
    const pos = lista.reduce((m, f) => Math.max(m, f.posicao), 0) + 1;
    const { error } = await supabase.from("academia_faixas").insert({
      academia_id: academiaId,
      codigo: `f${String(Date.now()).slice(-6)}`,
      nome: `Nova faixa ${pos}`,
      posicao: pos,
    });
    setMsg(error ? error.message : "");
    await reloadAcademia();
  };

  const remover = async (id: string) => {
    const { error } = await supabase.from("academia_faixas").delete().eq("id", id);
    setMsg(error ? error.message : "");
    await reloadAcademia();
  };

  const salvar = async () => {
    setBusy(true);
    setMsg("");
    const results = await Promise.all(
      lista.map((f) =>
        supabase
          .from("academia_faixas")
          .update({
            nome: f.nome,
            cor1: f.cor1,
            cor2: f.cor2,
            cor_texto: f.cor_texto,
            dan: f.dan,
            posicao: f.posicao,
            requisitos: f.requisitos,
          })
          .eq("id", f.id),
      ),
    );
    setBusy(false);
    const err = results.find((r) => r.error);
    setMsg(err?.error?.message ?? "Faixas atualizadas.");
    await reloadAcademia();
  };

  const ordenadas = lista.slice().sort((a, b) => a.posicao - b.posicao);

  return (
    <div className="space-y-4">
      <Panel>
        <Eyebrow>Sistema de graduação</Eyebrow>
        <p className="text-sm mb-3" style={{ color: COLORS.paperDim }}>
          Configure livremente a ordem, os nomes, as cores e os requisitos das graduações da sua
          modalidade. Vale para Hapkido, Karatê, Jiu-Jitsu, Muay Thai, Taekwondo ou qualquer arte
          marcial.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void adicionar()}>
            <Plus size={14} /> Nova faixa
          </Button>
          <Button variant="brass" onClick={() => void salvar()} disabled={busy}>
            <Save size={14} /> {busy ? "Salvando..." : "Salvar alterações"}
          </Button>
          {msg && (
            <span className="text-xs self-center" style={{ color: COLORS.paperDim }}>
              {msg}
            </span>
          )}
        </div>
      </Panel>

      <div className="space-y-2">
        {ordenadas.map((f, i) => (
          <div
            key={f.id}
            className="p-3 grid gap-2 sm:grid-cols-[auto_minmax(0,2fr)_repeat(3,minmax(0,90px))_auto_auto]"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
          >
            <div
              className="flex flex-col items-center justify-center gap-1"
              style={{ color: COLORS.paperDim }}
            >
              <button onClick={() => mover(f.id, -1)} disabled={i === 0} title="Subir">
                <ArrowUp size={14} />
              </button>
              <span className="text-xs">{i + 1}</span>
              <button
                onClick={() => mover(f.id, 1)}
                disabled={i === ordenadas.length - 1}
                title="Descer"
              >
                <ArrowDown size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <input
                value={f.nome}
                onChange={(e) => set(f.id, { nome: e.target.value })}
                style={inputStyle}
              />
              <input
                value={f.requisitos}
                onChange={(e) => set(f.id, { requisitos: e.target.value })}
                placeholder="Requisitos para graduar"
                style={inputStyle}
              />
            </div>
            <input
              value={f.cor1}
              onChange={(e) => set(f.id, { cor1: e.target.value })}
              title="Cor inicial"
              style={inputStyle}
            />
            <input
              value={f.cor2}
              onChange={(e) => set(f.id, { cor2: e.target.value })}
              title="Cor final"
              style={inputStyle}
            />
            <input
              type="number"
              value={f.dan}
              onChange={(e) => set(f.id, { dan: Number(e.target.value) || 0 })}
              title="Dan (0 = nenhum)"
              style={inputStyle}
            />
            <div
              className="self-center rounded-sm"
              style={{
                height: 14,
                width: 50,
                background: f.cor1 === f.cor2 ? f.cor1 : `linear-gradient(90deg, ${f.cor1} 60%, ${f.cor2} 100%)`,
                border: `1px solid ${COLORS.line}`,
              }}
            />
            <button
              onClick={() => void remover(f.id)}
              title="Excluir faixa"
              className="self-center"
              style={{ color: "#e08070" }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {ordenadas.length === 0 && (
          <Panel>
            <div className="flex items-center gap-2" style={{ color: COLORS.paperDim }}>
              <Building2 size={16} /> Nenhuma faixa configurada ainda.
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}