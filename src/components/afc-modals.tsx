import { useState, type ReactNode } from "react";
import { X, Save, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COLORS, useAfc } from "@/lib/afc";
import { Button, Field, StencilHeading, inputStyle } from "@/components/afc-ui";

function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.brassDim}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:brightness-125"
          style={{ color: COLORS.paperDim }}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function AdminSettingsModal({ onClose }: { onClose: () => void }) {
  const { profile, refreshProfile } = useAfc();
  const [nome, setNome] = useState(profile?.nome ?? "");
  const [telefone, setTelefone] = useState(profile?.telefone ?? "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ nome: nome.trim() || profile.nome, telefone: telefone || null })
        .eq("id", profile.id);
      if (pErr) throw pErr;
      if (password.trim()) {
        const { error: aErr } = await supabase.auth.updateUser({ password });
        if (aErr) throw aErr;
      }
      await refreshProfile();
      setMsg("Alterações salvas.");
      setPassword("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-2 mb-4">
        <KeyRound size={18} color={COLORS.brass} />
        <StencilHeading as="h2" className="text-lg" style={{ color: COLORS.brass }}>
          Minhas informações
        </StencilHeading>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome">
          <input style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field label="Telefone">
          <input style={inputStyle} value={telefone ?? ""} onChange={(e) => setTelefone(e.target.value)} />
        </Field>
        <Field label="Nova senha (opcional)">
          <input
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Deixe em branco para manter"
          />
        </Field>
        {msg && <div className="text-xs" style={{ color: COLORS.brass }}>{msg}</div>}
        {err && <div className="text-xs" style={{ color: "#e08070" }}>{err}</div>}
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="brass" disabled={busy}>
            <Save size={14} /> Salvar
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </form>
    </Modal>
  );
}