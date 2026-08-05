import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ChevronLeft, Building2 } from "lucide-react";
import { HUB } from "@/lib/hub-theme";
import { solicitarAcademia } from "@/lib/academias.functions";
import { HubCard, HubShell, hubBtnClass, hubBtnStyle } from "@/components/hub-ui";

export const Route = createFileRoute("/criar-academia")({
  component: CriarAcademia,
  head: () => ({
    meta: [
      { title: "Criar academia — Martial Hub" },
      {
        name: "description",
        content:
          "Cadastre sua academia no Martial Hub e receba um ambiente completo e independente para gerir alunos, faixas, técnicas e financeiro.",
      },
      { property: "og:title", content: "Criar academia no Martial Hub" },
      {
        property: "og:description",
        content: "Sua academia com painel próprio, do zero, pronta para personalizar.",
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

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest" style={{ color: HUB.textDim }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function CriarAcademia() {
  const criar = useServerFn(solicitarAcademia);
  const [form, setForm] = useState({
    nome: "",
    modalidade: "",
    cidade: "",
    responsavel: "",
    email: "",
    telefone: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setBusy(true);
    try {
      await criar({ data: form });
      setOk(true);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar sua solicitação.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <HubShell>
      <section className="mx-auto max-w-xl px-4 py-16">
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
              <Building2 size={22} color={HUB.gold} />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: HUB.gold }}>
                Nova academia
              </div>
              <h1 className="text-xl font-bold" style={{ color: HUB.white }}>
                Criar academia
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm" style={{ color: HUB.textDim }}>
            Sua academia recebe todos os recursos da plataforma — faixas, técnicas, turmas,
            presença, mensalidades, exames e certificados — começando completamente vazia, pronta
            para você definir sua própria identidade.
          </p>

          {ok ? (
            <div className="mt-6 text-sm" style={{ color: HUB.gold }}>
              Solicitação enviada. Assim que for liberada pelo Martial Hub, sua academia aparecerá
              na lista de acesso.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Campo label="Nome da academia">
                <input style={inputStyle} value={form.nome} onChange={set("nome")} required />
              </Campo>
              <Campo label="Modalidade principal">
                <input
                  style={inputStyle}
                  value={form.modalidade}
                  onChange={set("modalidade")}
                  required
                />
              </Campo>
              <Campo label="Cidade (opcional)">
                <input style={inputStyle} value={form.cidade} onChange={set("cidade")} />
              </Campo>
              <Campo label="Responsável (Mestre)">
                <input
                  style={inputStyle}
                  value={form.responsavel}
                  onChange={set("responsavel")}
                  required
                />
              </Campo>
              <Campo label="E-mail de contato">
                <input
                  style={inputStyle}
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </Campo>
              <Campo label="Telefone / WhatsApp (opcional)">
                <input style={inputStyle} value={form.telefone} onChange={set("telefone")} />
              </Campo>
              {erro && (
                <div className="text-xs" style={{ color: "#F87171" }}>
                  {erro}
                </div>
              )}
              <button type="submit" disabled={busy} className={`${hubBtnClass} w-full`} style={hubBtnStyle()}>
                {busy ? "Enviando..." : "Enviar solicitação"}
              </button>
            </form>
          )}
        </HubCard>
      </section>
    </HubShell>
  );
}
