import { useState, type ReactNode } from "react";
import { X, Lock, Save, KeyRound } from "lucide-react";
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

export function LoginModal({ onClose }: { onClose: () => void }) {
  const { login } = useAfc();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (login(password)) {
      onClose();
    } else {
      setError("Senha incorreta.");
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-2 mb-4">
        <Lock size={18} color={COLORS.brass} />
        <StencilHeading as="h2" className="text-lg" style={{ color: COLORS.brass }}>
          Acesso Administrador
        </StencilHeading>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Senha">
          <input
            type="password"
            autoFocus
            style={inputStyle}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </Field>
        {error && (
          <div className="text-xs" style={{ color: "#e08070" }}>
            {error}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="brass">
            <Lock size={14} /> Entrar
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminSettingsModal({ onClose }: { onClose: () => void }) {
  const { admin, setAdmin } = useAfc();
  const [name, setName] = useState(admin.name);
  const [password, setPassword] = useState(admin.password);
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setAdmin({ name: name.trim() || admin.name, password: password || admin.password });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-2 mb-4">
        <KeyRound size={18} color={COLORS.brass} />
        <StencilHeading as="h2" className="text-lg" style={{ color: COLORS.brass }}>
          Configurações
        </StencilHeading>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome do administrador">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Nova senha">
          <input
            type="text"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {saved && (
          <div className="text-xs" style={{ color: COLORS.brass }}>
            Alterações salvas.
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="brass">
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