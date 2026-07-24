import { useState } from "react";
import { ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COLORS, camoStyle } from "@/lib/afc";
import { Button, Field, StencilHeading, Eyebrow, inputStyle } from "@/components/afc-ui";

type Mode = "login" | "signup";

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              nome: nome.trim(),
              telefone: telefone.trim(),
              data_nascimento: nascimento || null,
            },
          },
        });
        if (error) throw error;
        setMsg("Cadastro enviado! Aguarde a aprovação do Mestre Clóvis para acessar o sistema.");
      }
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : "Erro desconhecido";
      const pt = raw.includes("Invalid login")
        ? "E-mail ou senha incorretos."
        : raw.includes("already registered")
          ? "Este e-mail já está cadastrado."
          : raw.includes("Password should be")
            ? "A senha precisa ter pelo menos 6 caracteres."
            : raw;
      setErr(pt);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10" style={{ background: COLORS.ink }}>
      <div className="absolute inset-0" style={camoStyle(0.35)} />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(10,11,7,0.4) 0%, rgba(10,11,7,0.96) 100%)" }}
      />
      <div
        className="relative w-full max-w-md p-6"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.brassDim}` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 flex items-center justify-center rounded-sm"
            style={{ background: COLORS.olive, border: `1px solid ${COLORS.oliveBright}` }}
          >
            <ShieldCheck size={22} color="#f2f0e6" />
          </div>
          <div>
            <Eyebrow>Army Fight Club</Eyebrow>
            <StencilHeading as="h1" className="text-xl">
              Hapkido
            </StencilHeading>
          </div>
        </div>

        <div className="flex gap-1 mb-5 p-1 rounded-sm" style={{ background: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="flex-1 py-2 text-xs uppercase tracking-widest"
              style={{
                background: mode === m ? COLORS.olive : "transparent",
                color: mode === m ? "#f2f0e6" : COLORS.paperDim,
                fontFamily: "'Oswald', sans-serif",
                border: mode === m ? `1px solid ${COLORS.oliveBright}` : "1px solid transparent",
              }}
            >
              {m === "login" ? "Entrar" : "Cadastro de aluno"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <Field label="Nome completo">
                <input style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} required />
              </Field>
              <Field label="Telefone">
                <input style={inputStyle} value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </Field>
              <Field label="Data de nascimento">
                <input type="date" style={inputStyle} value={nascimento} onChange={(e) => setNascimento(e.target.value)} />
              </Field>
            </>
          )}
          <Field label="E-mail">
            <input type="email" autoComplete="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </Field>
          {err && <div className="text-xs" style={{ color: "#e08070" }}>{err}</div>}
          {msg && <div className="text-xs" style={{ color: COLORS.brass }}>{msg}</div>}
          <div className="pt-2">
            <Button type="submit" variant="brass" disabled={busy}>
              {mode === "login" ? <LogIn size={14} /> : <UserPlus size={14} />}{" "}
              {mode === "login" ? "Entrar" : "Solicitar cadastro"}
            </Button>
          </div>
        </form>

        <p className="mt-5 text-[11px] text-center" style={{ color: COLORS.paperDim }}>
          Novos alunos passam por aprovação do Mestre Clóvis antes de acessar o conteúdo.
        </p>
      </div>
    </div>
  );
}

export function StatusScreen({ variant }: { variant: "pendente" | "bloqueado" | "inadimplente" }) {
  const messages = {
    pendente: {
      title: "Cadastro em análise",
      body: "Seu cadastro foi enviado. Aguarde a aprovação do Mestre Clóvis para acessar o conteúdo.",
    },
    bloqueado: {
      title: "Acesso bloqueado",
      body: "Seu acesso foi bloqueado. Entre em contato com a academia para regularizar sua situação.",
    },
    inadimplente: {
      title: "Mensalidade em atraso",
      body: "Sua mensalidade está em atraso. Entre em contato com a academia para regularizar seu acesso.",
    },
  }[variant];

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10" style={{ background: COLORS.ink }}>
      <div className="absolute inset-0" style={camoStyle(0.3)} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,11,7,0.5) 0%, rgba(10,11,7,0.97) 100%)" }} />
      <div
        className="relative w-full max-w-md p-6 text-center"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.brassDim}` }}
      >
        <Eyebrow>Army Fight Club Hapkido</Eyebrow>
        <StencilHeading as="h1" className="text-2xl mb-3" style={{ color: COLORS.brass }}>
          {messages.title}
        </StencilHeading>
        <p className="text-sm mb-5" style={{ color: COLORS.paperDim }}>{messages.body}</p>
        <Button
          variant="ghost"
          onClick={async () => {
            const { supabase } = await import("@/integrations/supabase/client");
            await supabase.auth.signOut();
          }}
        >
          Sair
        </Button>
      </div>
    </div>
  );
}