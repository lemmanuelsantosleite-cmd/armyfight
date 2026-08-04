import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HUB } from "@/lib/hub-theme";
import { resolveSuperEmail } from "@/lib/super.functions";
import { HubCard, HubShell, hubBtnClass, hubBtnStyle } from "@/components/hub-ui";

export const Route = createFileRoute("/super")({
  component: SuperLogin,
  head: () => ({
    meta: [
      { title: "Super Administrador — Martial Hub" },
      {
        name: "description",
        content:
          "Acesso restrito ao Super Administrador da plataforma Martial Hub. Autenticação exigida.",
      },
      { property: "og:title", content: "Super Administrador — Martial Hub" },
      {
        property: "og:description",
        content: "Área restrita de administração da plataforma Martial Hub.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const inputStyle = {
  width: "100%",
  background: "#0E1015",
  border: `1px solid ${HUB.line}`,
  borderRadius: 12,
  padding: "10px 12px",
  color: HUB.white,
  outline: "none",
} as const;

function SuperLogin() {
  const resolve = useServerFn(resolveSuperEmail);
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: role } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", data.user.id)
        .eq("role", "super")
        .maybeSingle();
      if (role) void navigate({ to: "/hub" });
    })();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setBusy(true);
    const invalido = "Usuário ou senha inválidos.";
    try {
      const { email } = await resolve({ data: { usuario } });
      if (!email) throw new Error(invalido);

      const { data: signed, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error || !signed.user) throw new Error(invalido);

      const { data: role } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", signed.user.id)
        .eq("role", "super")
        .maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        throw new Error(invalido);
      }
      void navigate({ to: "/hub" });
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : invalido);
    } finally {
      setBusy(false);
    }
  }

  return (
    <HubShell>
      <section className="mx-auto max-w-md px-4 py-16">
        <Link to="/" className={`${hubBtnClass} mb-8`} style={hubBtnStyle("ghost")}>
          <ChevronLeft size={16} /> Voltar ao Martial Hub
        </Link>
        <HubCard glow>
          <div className="flex items-center gap-3">
            <span
              className="grid h-12 w-12 place-items-center rounded-xl"
              style={{
                background: `linear-gradient(145deg, ${HUB.navy}, ${HUB.navyDeep})`,
                border: `1px solid ${HUB.gold}55`,
              }}
            >
              <ShieldCheck size={22} color={HUB.gold} />
            </span>
            <div>
              <div
                className="text-[10px] uppercase tracking-[0.28em]"
                style={{ color: HUB.gold }}
              >
                Acesso restrito
              </div>
              <h1 className="text-xl font-bold" style={{ color: HUB.white }}>
                Super Administrador
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm" style={{ color: HUB.textDim }}>
            Esta área pertence à plataforma Martial Hub e não a uma academia. Informe suas
            credenciais para continuar.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest" style={{ color: HUB.textDim }}>
                Usuário
              </span>
              <input
                style={inputStyle}
                value={usuario}
                autoComplete="username"
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-widest" style={{ color: HUB.textDim }}>
                Senha
              </span>
              <input
                style={inputStyle}
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </label>
            {erro && (
              <div className="text-xs" style={{ color: "#F87171" }}>
                {erro}
              </div>
            )}
            <button type="submit" disabled={busy} className={`${hubBtnClass} w-full`} style={hubBtnStyle()}>
              {busy ? "Verificando..." : "Entrar no painel"}
            </button>
          </form>
        </HubCard>
      </section>
    </HubShell>
  );
}
