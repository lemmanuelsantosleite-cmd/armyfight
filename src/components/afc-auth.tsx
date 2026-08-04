import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COLORS, camoStyle, useAfc } from "@/lib/afc";
import { Button, Field, StencilHeading, Eyebrow, inputStyle } from "@/components/afc-ui";
import { ensureFixedAccount } from "@/lib/bootstrap.functions";
import { solicitarCadastro } from "@/lib/alunos.functions";
import { alunoEmail, nomeSlug } from "@/lib/slug";

type Mode = "login" | "signup";

export function AuthScreen() {
  const { academia } = useAfc();
  const [mode, setMode] = useState<Mode>("login");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showMestre, setShowMestre] = useState(false);
  const [mestrePass, setMestrePass] = useState("");

  async function loginMestreLegacy(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      let kind: "clovis" | "lucas";
      if (mestrePass === "clovis1989!!") kind = "clovis";
      else if (mestrePass === "Lucas2011!!") kind = "lucas";
      else throw new Error("Senha do Mestre incorreta.");
      const { email: mEmail, password: mPass } = await ensureFixedAccount({
        data: { kind },
      });
      const { error } = await supabase.auth.signInWithPassword({ email: mEmail, password: mPass });
      if (error) throw error;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao entrar como Mestre.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "login") {
        if (nomeSlug(nome).length < 3) throw new Error("Nome ou senha inválidos.");
        const { error } = await supabase.auth.signInWithPassword({
          email: alunoEmail(nome),
          password,
        });
        if (error) throw new Error("Nome ou senha inválidos.");
        const { data: prof } = await supabase
          .from("profiles")
          .select("status, bloqueado_inadimplencia")
          .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
          .maybeSingle();
        if (prof?.status === "pendente") {
          setMsg("Seu cadastro está aguardando aprovação do Mestre.");
        } else if (prof?.status === "bloqueado") {
          setErr("Sua conta foi bloqueada pelo administrador. Entre em contato com a academia.");
        }
      } else {
        await solicitarCadastro({ data: { nome: nome.trim() } });
        setNome("");
        setMsg("Seu cadastro está aguardando aprovação do Mestre.");
      }
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : "Erro desconhecido";
      const pt = /Invalid login|invalid/i.test(raw) ? "Nome ou senha inválidos." : raw;
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
            <Eyebrow>{academia?.nome ?? "Academia"}</Eyebrow>
            <StencilHeading as="h1" className="text-xl">
              {academia?.modalidade ?? "Artes marciais"}
            </StencilHeading>
          </div>
        </div>

        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest hover:brightness-125"
          style={{ color: COLORS.paperDim, fontFamily: "'Oswald', sans-serif" }}
        >
          <ArrowLeft size={13} /> Voltar ao Martial Hub
        </Link>

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
          <Field label="Nome completo">
            <input
              style={inputStyle}
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </Field>
          {mode === "login" && (
            <Field label="Senha">
              <input
                type="password"
                autoComplete="current-password"
                style={inputStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
          )}
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
          Informe apenas o nome completo. O Mestre da academia aprova o cadastro e cria a sua senha.
        </p>
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => { setErr(null); setShowMestre(true); }}
            className="text-[11px] uppercase tracking-widest hover:brightness-125"
            style={{ color: COLORS.brass, fontFamily: "'Oswald', sans-serif" }}
          >
            Entrar como Mestre (senha antiga)
          </button>
        </div>
      </div>

      {/* Legacy Mestre login modal */}
      {showMestre && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setShowMestre(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={loginMestreLegacy}
            className="w-full max-w-sm p-6"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.brass}` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} color={COLORS.brass} />
              <StencilHeading as="h3" className="text-lg">Acesso do Mestre</StencilHeading>
            </div>
            <p className="text-xs mb-4" style={{ color: COLORS.paperDim }}>
              Digite a senha mestra para entrar como Mestre Clóvis.
            </p>
            <Field label="Senha mestra">
              <input
                type="password"
                style={inputStyle}
                value={mestrePass}
                onChange={(e) => setMestrePass(e.target.value)}
                autoFocus
              />
            </Field>
            {err && <div className="text-xs mt-2" style={{ color: "#e08070" }}>{err}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowMestre(false)}>Cancelar</Button>
              <Button variant="brass" type="submit" disabled={busy}>Entrar como Mestre</Button>
            </div>
          </form>
        </div>
      )}
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